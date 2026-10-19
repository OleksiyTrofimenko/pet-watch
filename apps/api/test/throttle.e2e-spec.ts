import type { INestApplication } from '@nestjs/common';
import type { PetDto } from '@petwatch/shared';
import type { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { api, createTestApp } from './utils/app';
import { bearer, registerUser } from './utils/auth';
import { resetDb } from './utils/db';

// Small limits instead of the production ones (D41) so the test stays fast; what is under test is
// the wiring: limits come from config, `strict` is opt-in per route, and only /auth and sending
// invites are throttled.
const DEFAULT_LIMIT = 3;
const STRICT_LIMIT = 2;

describe('Throttling (e2e)', () => {
  let app: INestApplication<App>;

  // A fresh app per test: the throttler counters are in memory.
  beforeEach(async () => {
    app = await createTestApp({
      THROTTLE_LIMIT: DEFAULT_LIMIT,
      THROTTLE_STRICT_LIMIT: STRICT_LIMIT,
    });
    await resetDb(app.get(PrismaService));
  });
  afterEach(() => app.close());

  const login = () =>
    api(app)
      .post('/auth/login')
      .send({ email: 'nobody@petwatch.test', password: 'wrong-password' });

  it('limits login with the strict throttler, then answers 429 in the ApiErrorBody shape', async () => {
    for (let i = 0; i < STRICT_LIMIT; i++) await login().expect(401);

    const res = await login().expect(429);
    expect(res.body).toMatchObject({
      statusCode: 429,
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many attempts. Wait a minute and try again.',
    });
  });

  it('limits register with the default throttler only', async () => {
    const register = (n: number) =>
      api(app)
        .post('/auth/register')
        .send({ email: `user${n}@petwatch.test`, password: 'correct-horse-battery' });

    // More than the strict limit succeeds: strict is not applied to register.
    for (let n = 0; n < DEFAULT_LIMIT; n++) await register(n).expect(201);
    await register(DEFAULT_LIMIT).expect(429);
  });

  it('limits sending invites with the strict throttler (each one sends an email)', async () => {
    const ana = await registerUser(app, 'ana@petwatch.test');
    const pet = (
      await api(app)
        .post('/pets')
        .set(bearer(ana))
        .send({ name: 'Rex', species: 'DOG' })
        .expect(201)
    ).body as PetDto;
    const invite = () =>
      api(app)
        .post(`/pets/${pet.id}/invitations`)
        .set(bearer(ana))
        .send({ email: 'nobody@petwatch.test' });

    for (let i = 0; i < STRICT_LIMIT; i++) await invite().expect(404); // USER_NOT_FOUND
    const res = await invite().expect(429);
    expect(res.body).toMatchObject({ code: 'TOO_MANY_REQUESTS' });
  });

  it('does not throttle other routes', async () => {
    for (let i = 0; i <= DEFAULT_LIMIT; i++) await api(app).get('/health').expect(200);
  });
});
