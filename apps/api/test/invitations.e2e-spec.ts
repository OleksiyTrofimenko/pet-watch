import type { INestApplication } from '@nestjs/common';
import {
  INVITATION_ERROR_CODES,
  PET_ERROR_CODES,
  type AuthResponse,
  type InvitationPreview,
  type PetDto,
  type PetWatchersDto,
  type ScheduleTaskDto,
} from '@petwatch/shared';
import type { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { api, createTestApp } from './utils/app';
import { bearer, registerUser } from './utils/auth';
import { resetDb } from './utils/db';
import { countMessagesTo, deleteAllMessages, extractLink, waitForMessageTo } from './utils/mailpit';

const SAM = 'sam@petwatch.test';

describe('Invitations and watchers (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let ana: AuthResponse;
  let sam: AuthResponse;
  let eve: AuthResponse;
  let rex: PetDto;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });
  beforeEach(async () => {
    await resetDb(prisma);
    await deleteAllMessages();
    ana = await registerUser(app, 'ana@petwatch.test');
    sam = await registerUser(app, SAM);
    eve = await registerUser(app, 'eve@petwatch.test');
    rex = (
      await api(app)
        .post('/pets')
        .set(bearer(ana))
        .send({ name: 'Rex', species: 'DOG' })
        .expect(201)
    ).body as PetDto;
    await api(app)
      .post(`/pets/${rex.id}/care-tasks`)
      .set(bearer(ana))
      .send({ type: 'FEEDING', title: 'Breakfast', timeOfDay: 480, recurrence: 'DAILY' })
      .expect(201);
  });
  afterAll(() => app.close());

  const invite = (email = SAM, as = ana) =>
    api(app).post(`/pets/${rex.id}/invitations`).set(bearer(as)).send({ email });
  const preview = (token: string, as = sam) =>
    api(app).get(`/invitations/${token}`).set(bearer(as));
  const accept = (token: string, as = sam) =>
    api(app).post(`/invitations/${token}/accept`).set(bearer(as));

  /** Invite Sam and read the token from the email, as the app would from the deep link. */
  async function inviteSam(): Promise<string> {
    await invite().expect(200);
    const { text } = await waitForMessageTo(SAM);
    return extractLink(text, 'petwatch://invites/').replace('petwatch://invites/', '');
  }

  it('invite → email → preview → accept: Sam watches Rex and sees its routine', async () => {
    const res = await invite().expect(200);
    expect(res.body).toEqual({ outcome: 'INVITE_SENT', inviteeEmail: SAM });
    const { subject, text } = await waitForMessageTo(SAM);
    expect(subject).toContain('Rex');
    const token = extractLink(text, 'petwatch://invites/').replace('petwatch://invites/', '');

    await api(app).get(`/pets/${rex.id}`).set(bearer(sam)).expect(404); // not yet

    const seen = await preview(token).expect(200);
    expect(seen.body).toMatchObject({
      petId: rex.id,
      petName: 'Rex',
      species: 'DOG',
      inviterEmail: 'ana@petwatch.test',
    } satisfies Partial<InvitationPreview>);

    await accept(token).expect(200, { petId: rex.id });

    const pet = await api(app).get(`/pets/${rex.id}`).set(bearer(sam)).expect(200);
    expect(pet.body).toMatchObject({ role: 'WATCHER' });
    const schedule = await api(app).get('/care-tasks').set(bearer(sam)).expect(200);
    expect((schedule.body as ScheduleTaskDto[]).map((t) => t.title)).toEqual(['Breakfast']);

    const watchers = await api(app).get(`/pets/${rex.id}/watchers`).set(bearer(ana)).expect(200);
    expect(watchers.body).toMatchObject({ watchers: [{ email: SAM }], pending: [] });

    // Already watching: an explicit outcome, and no new email.
    await invite().expect(200, { outcome: 'ALREADY_WATCHING', inviteeEmail: SAM });
    expect(await countMessagesTo(SAM)).toBe(1);
  });

  it('emails a tappable link, with the user-typed pet name escaped in the HTML part', async () => {
    const pet = (
      await api(app)
        .post('/pets')
        .set(bearer(ana))
        .send({ name: '<b>Bo</b> & "Co"', species: 'CAT' })
        .expect(201)
    ).body as PetDto;
    await api(app)
      .post(`/pets/${pet.id}/invitations`)
      .set(bearer(ana))
      .send({ email: SAM })
      .expect(200);

    const { text, html } = await waitForMessageTo(SAM);
    expect(html).toContain(`href="${extractLink(text, 'petwatch://invites/')}"`);
    expect(html).toContain('&lt;b&gt;Bo&lt;/b&gt; &amp; &quot;Co&quot;');
    expect(html).not.toContain('<b>Bo</b>');
  });

  it('rejects inviting unknown, self, and by non-owners', async () => {
    const unknown = await invite('nobody@petwatch.test').expect(404);
    expect(unknown.body).toMatchObject({ code: INVITATION_ERROR_CODES.USER_NOT_FOUND });
    const self = await invite('ana@petwatch.test').expect(400);
    expect(self.body).toMatchObject({ code: INVITATION_ERROR_CODES.CANNOT_INVITE_SELF });
    const bad = await invite('not-an-email').expect(400);
    expect(bad.body).toMatchObject({ fieldErrors: { email: expect.any(String) as string } });

    const stranger = await invite(SAM, eve).expect(404);
    expect(stranger.body).toMatchObject({ code: PET_ERROR_CODES.PET_NOT_FOUND });
    await prisma.petWatcher.create({ data: { petId: rex.id, userId: eve.user.id } });
    const watcher = await invite(SAM, eve).expect(403);
    expect(watcher.body).toMatchObject({ code: PET_ERROR_CODES.OWNER_ONLY });
  });

  it('re-inviting a pending invitee rotates the token: the old link stops working', async () => {
    const first = await inviteSam();
    await deleteAllMessages();
    const res = await invite().expect(200);
    expect(res.body).toMatchObject({ outcome: 'INVITE_RESENT' });
    const second = extractLink((await waitForMessageTo(SAM)).text, 'petwatch://invites/').replace(
      'petwatch://invites/',
      '',
    );

    expect(second).not.toBe(first);
    const old = await preview(first).expect(404);
    expect(old.body).toMatchObject({ code: INVITATION_ERROR_CODES.INVITE_NOT_FOUND });
    await preview(second).expect(200);
    const watchers = await api(app).get(`/pets/${rex.id}/watchers`).set(bearer(ana)).expect(200);
    expect((watchers.body as PetWatchersDto).pending).toHaveLength(1);
  });

  it('answers each unusable link with its own code', async () => {
    const token = await inviteSam();

    const other = await preview(token, eve).expect(403);
    expect(other.body).toMatchObject({ code: INVITATION_ERROR_CODES.INVITE_FOR_OTHER_USER });
    await accept(token, eve).expect(403);
    const malformed = await preview('not-a-token').expect(404);
    expect(malformed.body).toMatchObject({ code: INVITATION_ERROR_CODES.INVITE_NOT_FOUND });

    await prisma.invitation.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });
    for (const res of [await preview(token).expect(410), await accept(token).expect(410)]) {
      expect(res.body).toMatchObject({ code: INVITATION_ERROR_CODES.INVITE_EXPIRED });
    }

    await api(app).delete(`/pets/${rex.id}`).set(bearer(ana)).expect(204);
    const gone = await preview(token).expect(404);
    expect(gone.body).toMatchObject({ code: INVITATION_ERROR_CODES.INVITE_NOT_FOUND });
  });

  it('accepting twice is safe, and concurrent accepts create one watcher', async () => {
    const token = await inviteSam();

    const results = await Promise.all([accept(token), accept(token), accept(token)]);
    expect(results.map((r) => r.status)).toEqual([200, 200, 200]);
    await accept(token).expect(200, { petId: rex.id });
    expect(await prisma.petWatcher.count({ where: { petId: rex.id } })).toBe(1);

    const again = await preview(token).expect(410);
    expect(again.body).toMatchObject({ code: INVITATION_ERROR_CODES.INVITE_ALREADY_ACCEPTED });
  });

  it('revoking a watcher removes access to the pet and its tasks at once', async () => {
    const token = await inviteSam();
    await accept(token).expect(200);

    await api(app).delete(`/pets/${rex.id}/watchers/${sam.user.id}`).set(bearer(ana)).expect(204);

    await api(app).get(`/pets/${rex.id}`).set(bearer(sam)).expect(404);
    await api(app).get(`/pets/${rex.id}/care-tasks`).set(bearer(sam)).expect(404);
    await api(app).get('/care-tasks').set(bearer(sam)).expect(200, []);
    const link = await preview(token).expect(410);
    expect(link.body).toMatchObject({ code: INVITATION_ERROR_CODES.INVITE_REVOKED });

    const twice = await api(app)
      .delete(`/pets/${rex.id}/watchers/${sam.user.id}`)
      .set(bearer(ana))
      .expect(404);
    expect(twice.body).toMatchObject({ code: INVITATION_ERROR_CODES.WATCHER_NOT_FOUND });
    await api(app).delete(`/pets/${rex.id}/watchers/${sam.user.id}`).set(bearer(sam)).expect(404);
  });

  it('cancelling a pending invite makes its link answer INVITE_REVOKED', async () => {
    const token = await inviteSam();
    const { pending } = (
      await api(app).get(`/pets/${rex.id}/watchers`).set(bearer(ana)).expect(200)
    ).body as PetWatchersDto;
    const invitationId = pending[0]?.invitationId ?? '';

    await api(app)
      .delete(`/pets/${rex.id}/invitations/${invitationId}`)
      .set(bearer(ana))
      .expect(204);
    const res = await accept(token).expect(410);
    expect(res.body).toMatchObject({ code: INVITATION_ERROR_CODES.INVITE_REVOKED });
    await api(app)
      .delete(`/pets/${rex.id}/invitations/${invitationId}`)
      .set(bearer(ana))
      .expect(404);

    // Invited again later: a fresh invite, not a re-send.
    await invite().expect(200, { outcome: 'INVITE_SENT', inviteeEmail: SAM });
  });

  it('only the owner sees and manages watchers', async () => {
    await api(app).get(`/pets/${rex.id}/watchers`).set(bearer(eve)).expect(404);
    await prisma.petWatcher.create({ data: { petId: rex.id, userId: eve.user.id } });
    const res = await api(app).get(`/pets/${rex.id}/watchers`).set(bearer(eve)).expect(403);
    expect(res.body).toMatchObject({ code: PET_ERROR_CODES.OWNER_ONLY });
  });
});
