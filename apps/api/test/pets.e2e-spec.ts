import type { INestApplication } from '@nestjs/common';
import {
  PET_ERROR_CODES,
  type AuthResponse,
  type PetDto,
  type PhotoUploadTicket,
} from '@petwatch/shared';
import type { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { StorageService } from '../src/storage/storage.service';
import { api, createTestApp } from './utils/app';
import { bearer, registerUser } from './utils/auth';
import { resetDb } from './utils/db';

const REX = { name: 'Rex', species: 'DOG', breed: 'Labrador', ageYears: 4, notes: 'Loves ears' };
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0xff, 0xd9]);

describe('Pets (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let owner: AuthResponse;
  let stranger: AuthResponse;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });
  beforeEach(async () => {
    await resetDb(prisma);
    owner = await registerUser(app, 'ana@petwatch.test');
    stranger = await registerUser(app, 'eve@petwatch.test');
  });
  afterAll(() => app.close());

  async function createPet(auth = owner, body: object = REX): Promise<PetDto> {
    const res = await api(app).post('/pets').set(bearer(auth)).send(body).expect(201);
    return res.body as PetDto;
  }

  /** Watching is created by accepting an invite (Phase 6); insert the row directly for now. */
  async function addWatcher(pet: PetDto, watcher: AuthResponse): Promise<void> {
    await prisma.petWatcher.create({ data: { petId: pet.id, userId: watcher.user.id } });
  }

  async function uploadPhoto(pet: PetDto): Promise<PhotoUploadTicket> {
    const ticket = (
      await api(app)
        .post(`/pets/${pet.id}/photo-upload-url`)
        .set(bearer(owner))
        .send({ contentType: 'image/jpeg' })
        .expect(201)
    ).body as PhotoUploadTicket;
    const put = await fetch(ticket.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/jpeg' },
      body: JPEG,
    });
    expect(put.status).toBe(200);
    return ticket;
  }

  const confirm = (pet: PetDto, key: string) =>
    api(app).put(`/pets/${pet.id}/photo`).set(bearer(owner)).send({ key });

  describe('CRUD (PET-1, PET-3)', () => {
    it('creates a pet owned by the caller and lists, reads, updates and deletes it', async () => {
      const pet = await createPet();
      expect(pet).toMatchObject({
        ...REX,
        role: 'OWNER',
        owner: owner.user,
        watcherCount: 0,
        photoUrl: null,
      });

      const list = await api(app).get('/pets').set(bearer(owner)).expect(200);
      expect(list.body).toEqual([pet]);
      await api(app).get(`/pets/${pet.id}`).set(bearer(owner)).expect(200, pet);

      // Omitted = unchanged; null or blank = cleared.
      const updated = await api(app)
        .patch(`/pets/${pet.id}`)
        .set(bearer(owner))
        .send({ name: 'Rexy', breed: null, notes: '  ' })
        .expect(200);
      expect(updated.body).toMatchObject({ name: 'Rexy', breed: null, notes: null, ageYears: 4 });

      await api(app).delete(`/pets/${pet.id}`).set(bearer(owner)).expect(204);
      await api(app).get(`/pets/${pet.id}`).set(bearer(owner)).expect(404);
    });

    it('validates the body and the id', async () => {
      const res = await api(app)
        .post('/pets')
        .set(bearer(owner))
        .send({ ...REX, ageYears: 51, species: 'DRAGON' })
        .expect(400);
      const body = res.body as { fieldErrors: Record<string, string> };
      expect(Object.keys(body.fieldErrors).sort()).toEqual(['ageYears', 'species']);

      await api(app).get('/pets/not-a-uuid').set(bearer(owner)).expect(400);
    });

    it('deleting a pet removes its watchers', async () => {
      const pet = await createPet();
      await addWatcher(pet, stranger);

      await api(app).delete(`/pets/${pet.id}`).set(bearer(owner)).expect(204);
      expect(await prisma.petWatcher.count()).toBe(0);
    });
  });

  describe('access rules', () => {
    it('hides a pet from a stranger: 404 PET_NOT_FOUND on every route, empty list', async () => {
      const pet = await createPet();
      // Built lazily: supertest binds the server per request, so run them one at a time.
      const requests = [
        () => api(app).get(`/pets/${pet.id}`),
        () => api(app).patch(`/pets/${pet.id}`).send({ name: 'Mine' }),
        () => api(app).delete(`/pets/${pet.id}`),
        () => api(app).post(`/pets/${pet.id}/photo-upload-url`).send({ contentType: 'image/jpeg' }),
        () =>
          api(app)
            .put(`/pets/${pet.id}/photo`)
            .send({ key: `pets/${pet.id}/x.jpg` }),
        () => api(app).delete(`/pets/${pet.id}/photo`),
      ];
      for (const request of requests) {
        const res = await request().set(bearer(stranger)).expect(404);
        expect(res.body).toMatchObject({ code: PET_ERROR_CODES.PET_NOT_FOUND });
      }
      await api(app).get('/pets').set(bearer(stranger)).expect(200, []);
    });

    it('lets a watcher read but not change the pet', async () => {
      const pet = await createPet();
      await addWatcher(pet, stranger);

      const seen = await api(app).get(`/pets/${pet.id}`).set(bearer(stranger)).expect(200);
      expect(seen.body).toMatchObject({ role: 'WATCHER', owner: owner.user });
      const list = await api(app).get('/pets').set(bearer(stranger)).expect(200);
      expect((list.body as PetDto[]).map((p) => p.id)).toEqual([pet.id]);

      const writes = [
        () => api(app).patch(`/pets/${pet.id}`).send({ name: 'Mine' }),
        () => api(app).delete(`/pets/${pet.id}`),
        () => api(app).post(`/pets/${pet.id}/photo-upload-url`).send({ contentType: 'image/jpeg' }),
      ];
      for (const write of writes) {
        const res = await write().set(bearer(stranger)).expect(403);
        expect(res.body).toMatchObject({ code: PET_ERROR_CODES.OWNER_ONLY });
      }

      const asOwner = await api(app).get(`/pets/${pet.id}`).set(bearer(owner)).expect(200);
      expect(asOwner.body).toMatchObject({ watcherCount: 1 });
    });
  });

  describe('photo upload (PET-2)', () => {
    it('presigned PUT to S3 → confirm → photoUrl serves the file', async () => {
      const pet = await createPet();
      const ticket = await uploadPhoto(pet);
      expect(ticket.key).toMatch(new RegExp(`^pets/${pet.id}/.+\\.jpg$`));

      const res = await confirm(pet, ticket.key).expect(200);
      const { photoUrl } = res.body as PetDto;
      expect(photoUrl).toMatch(/^http.+X-Amz-Signature=/); // a presigned URL, never the raw key
      const download = await fetch(photoUrl ?? '');
      expect(download.status).toBe(200);
      expect(Buffer.from(await download.arrayBuffer())).toEqual(JPEG);
    });

    it('rejects a key issued for another pet, and one that was never uploaded', async () => {
      const pet = await createPet();
      const other = await createPet(owner, { name: 'Miso', species: 'CAT' });
      const ticket = await uploadPhoto(other);

      const wrongPet = await confirm(pet, ticket.key).expect(400);
      expect(wrongPet.body).toMatchObject({ code: PET_ERROR_CODES.INVALID_PHOTO_KEY });

      const pending = (
        await api(app)
          .post(`/pets/${pet.id}/photo-upload-url`)
          .set(bearer(owner))
          .send({ contentType: 'image/jpeg' })
          .expect(201)
      ).body as PhotoUploadTicket;
      const notUploaded = await confirm(pet, pending.key).expect(400);
      expect(notUploaded.body).toMatchObject({ code: PET_ERROR_CODES.PHOTO_NOT_UPLOADED });
    });

    it('deletes the old object on replace, on remove and when the pet is deleted', async () => {
      const storage = app.get(StorageService);
      const pet = await createPet();
      const first = await uploadPhoto(pet);
      await confirm(pet, first.key).expect(200);

      const second = await uploadPhoto(pet);
      await confirm(pet, second.key).expect(200);
      expect(await storage.exists(first.key)).toBe(false);

      const removed = await api(app).delete(`/pets/${pet.id}/photo`).set(bearer(owner)).expect(200);
      expect(removed.body).toMatchObject({ photoUrl: null });
      expect(await storage.exists(second.key)).toBe(false);

      const third = await uploadPhoto(pet);
      await confirm(pet, third.key).expect(200);
      await api(app).delete(`/pets/${pet.id}`).set(bearer(owner)).expect(204);
      expect(await storage.exists(third.key)).toBe(false);
    });
  });
});
