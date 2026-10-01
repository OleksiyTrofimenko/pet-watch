import type { INestApplication } from '@nestjs/common';
import {
  CARE_TASK_ERROR_CODES,
  PET_ERROR_CODES,
  type AuthResponse,
  type CareTaskDto,
  type PetDto,
  type ScheduleTaskDto,
} from '@petwatch/shared';
import type { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { api, createTestApp } from './utils/app';
import { bearer, registerUser } from './utils/auth';
import { resetDb } from './utils/db';

const FEEDING = { type: 'FEEDING', title: 'Breakfast', timeOfDay: 480, recurrence: 'DAILY' };
const WALK = {
  type: 'WALK',
  title: 'Evening walk',
  timeOfDay: 1080,
  recurrence: 'WEEKLY',
  daysOfWeek: [5, 1, 3, 1],
};

describe('Care tasks (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let owner: AuthResponse;
  let watcher: AuthResponse;
  let stranger: AuthResponse;
  let rex: PetDto;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });
  beforeEach(async () => {
    await resetDb(prisma);
    owner = await registerUser(app, 'ana@petwatch.test');
    watcher = await registerUser(app, 'sam@petwatch.test');
    stranger = await registerUser(app, 'eve@petwatch.test');
    rex = (
      await api(app)
        .post('/pets')
        .set(bearer(owner))
        .send({ name: 'Rex', species: 'DOG' })
        .expect(201)
    ).body as PetDto;
    // Watching comes from accepting an invite (Phase 6); insert the row directly for now.
    await prisma.petWatcher.create({ data: { petId: rex.id, userId: watcher.user.id } });
  });
  afterAll(() => app.close());

  const tasksUrl = () => `/pets/${rex.id}/care-tasks`;
  async function createTask(body: object = FEEDING): Promise<CareTaskDto> {
    return (await api(app).post(tasksUrl()).set(bearer(owner)).send(body).expect(201))
      .body as CareTaskDto;
  }

  it('lets the owner create, list, replace and delete rules', async () => {
    const feeding = await createTask();
    expect(feeding).toMatchObject({ ...FEEDING, petId: rex.id, daysOfWeek: [], notes: null });

    const walk = await createTask(WALK);
    expect(walk.daysOfWeek).toEqual([1, 3, 5]); // normalised: unique + sorted

    const list = await api(app).get(tasksUrl()).set(bearer(owner)).expect(200);
    expect((list.body as CareTaskDto[]).map((t) => t.title)).toEqual(['Breakfast', 'Evening walk']);

    // PUT replaces the whole rule: weekly → daily drops the days.
    const replaced = await api(app)
      .put(`${tasksUrl()}/${walk.id}`)
      .set(bearer(owner))
      .send({ ...WALK, recurrence: 'DAILY', notes: 'Bring water' })
      .expect(200);
    expect(replaced.body).toMatchObject({
      recurrence: 'DAILY',
      daysOfWeek: [],
      notes: 'Bring water',
    });

    await api(app).delete(`${tasksUrl()}/${feeding.id}`).set(bearer(owner)).expect(204);
    const after = await api(app).get(tasksUrl()).set(bearer(owner)).expect(200);
    expect((after.body as CareTaskDto[]).map((t) => t.id)).toEqual([walk.id]);
  });

  it('rejects a weekly rule without days, with a field error', async () => {
    const res = await api(app)
      .post(tasksUrl())
      .set(bearer(owner))
      .send({ ...WALK, daysOfWeek: [] })
      .expect(400);
    expect(res.body).toMatchObject({
      code: 'VALIDATION_FAILED',
      fieldErrors: { daysOfWeek: 'Pick at least one day for a weekly task' },
    });
  });

  it('lets a watcher read the routine but not change it', async () => {
    const task = await createTask();
    await api(app).get(tasksUrl()).set(bearer(watcher)).expect(200);

    const writes = [
      () => api(app).post(tasksUrl()).send(FEEDING),
      () => api(app).put(`${tasksUrl()}/${task.id}`).send(FEEDING),
      () => api(app).delete(`${tasksUrl()}/${task.id}`),
    ];
    for (const write of writes) {
      const res = await write().set(bearer(watcher)).expect(403);
      expect(res.body).toMatchObject({ code: PET_ERROR_CODES.OWNER_ONLY });
    }
  });

  it('hides the routine from a stranger (404 PET_NOT_FOUND)', async () => {
    const task = await createTask();
    const requests = [
      () => api(app).get(tasksUrl()),
      () => api(app).post(tasksUrl()).send(FEEDING),
      () => api(app).put(`${tasksUrl()}/${task.id}`).send(FEEDING),
      () => api(app).delete(`${tasksUrl()}/${task.id}`),
    ];
    for (const request of requests) {
      const res = await request().set(bearer(stranger)).expect(404);
      expect(res.body).toMatchObject({ code: PET_ERROR_CODES.PET_NOT_FOUND });
    }
  });

  it("can't reach another pet's task through a pet the caller owns", async () => {
    const task = await createTask();
    const miso = (
      await api(app)
        .post('/pets')
        .set(bearer(owner))
        .send({ name: 'Miso', species: 'CAT' })
        .expect(201)
    ).body as PetDto;

    const res = await api(app)
      .delete(`/pets/${miso.id}/care-tasks/${task.id}`)
      .set(bearer(owner))
      .expect(404);
    expect(res.body).toMatchObject({ code: CARE_TASK_ERROR_CODES.TASK_NOT_FOUND });
  });

  it('GET /care-tasks returns rules of owned and watched pets, with the viewer role', async () => {
    await createTask();
    const own = (
      await api(app)
        .post('/pets')
        .set(bearer(watcher))
        .send({ name: 'Miso', species: 'CAT' })
        .expect(201)
    ).body as PetDto;
    await api(app).post(`/pets/${own.id}/care-tasks`).set(bearer(watcher)).send(WALK).expect(201);

    const res = await api(app).get('/care-tasks').set(bearer(watcher)).expect(200);
    const schedule = res.body as ScheduleTaskDto[];
    expect(schedule.map((t) => [t.pet.name, t.role, t.title])).toEqual([
      ['Rex', 'WATCHER', 'Breakfast'],
      ['Miso', 'OWNER', 'Evening walk'],
    ]);
    await api(app).get('/care-tasks').set(bearer(stranger)).expect(200, []);
  });

  it('the database rejects an invalid rule even when the API is bypassed', async () => {
    await expect(
      prisma.careTask.create({
        data: { petId: rex.id, type: 'WALK', title: 'x', timeOfDay: 600, recurrence: 'WEEKLY' },
      }),
    ).rejects.toThrow(/care_tasks_recurrence_days_check/);
    await expect(
      prisma.careTask.create({
        data: { petId: rex.id, type: 'WALK', title: 'x', timeOfDay: 1440, recurrence: 'DAILY' },
      }),
    ).rejects.toThrow(/care_tasks_time_of_day_check/);
    // NULL days: cardinality(NULL) is NULL, which a CHECK would let through without IS NOT NULL.
    await expect(
      prisma.$executeRaw`
        INSERT INTO care_tasks (id, pet_id, type, title, time_of_day, recurrence, days_of_week, updated_at)
        VALUES (gen_random_uuid(), ${rex.id}::uuid, 'WALK', 'x', 600, 'WEEKLY', NULL, now())`,
    ).rejects.toThrow(/care_tasks_recurrence_days_check/);
  });
});
