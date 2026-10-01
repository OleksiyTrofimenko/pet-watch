import type { INestApplication } from '@nestjs/common';
import { AUTH_ERROR_CODES, type ApiErrorBody, type AuthResponse } from '@petwatch/shared';
import type { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { api, createTestApp } from './utils/app';
import { resetDb } from './utils/db';
import { countMessagesTo, deleteAllMessages, extractLink, waitForMessageTo } from './utils/mailpit';

const EMAIL = 'ana@petwatch.test';
const PASSWORD = 'correct-horse-battery';
const NEW_PASSWORD = 'new-horse-battery-staple';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });
  beforeEach(async () => {
    await resetDb(app.get(PrismaService));
    await deleteAllMessages();
  });
  afterAll(() => app.close());

  async function register(email = EMAIL, password = PASSWORD): Promise<AuthResponse> {
    const res = await api(app).post('/auth/register').send({ email, password }).expect(201);
    return res.body as AuthResponse;
  }
  const login = (email: string, password: string) =>
    api(app).post('/auth/login').send({ email, password });
  const refresh = (refreshToken: string) => api(app).post('/auth/refresh').send({ refreshToken });
  const me = (accessToken: string) =>
    api(app).get('/users/me').set('Authorization', `Bearer ${accessToken}`);

  /** forgot-password → Mailpit → the raw token from petwatch://reset-password?token=… */
  async function requestResetToken(email = EMAIL): Promise<string> {
    await api(app).post('/auth/forgot-password').send({ email }).expect(204);
    const { text } = await waitForMessageTo(email);
    const token = new URL(extractLink(text, 'petwatch://reset-password')).searchParams.get('token');
    if (!token) throw new Error(`Reset link without a token in:\n${text}`);
    return token;
  }

  describe('register (AUTH-1)', () => {
    it('signs the user in: the access token works on /users/me', async () => {
      const { user, accessToken, refreshToken } = await register();

      // Exactly these keys: nothing like passwordHash leaks into the response.
      expect(Object.keys(user).sort()).toEqual(['email', 'id']);
      expect(user.email).toBe(EMAIL);
      expect(refreshToken).toEqual(expect.any(String));
      await me(accessToken).expect(200, user);
    });

    it('trims and lower-cases the email, so the same address in another case is taken', async () => {
      const { user } = await register('  Ana@PetWatch.TEST ');
      expect(user.email).toBe(EMAIL);

      const res = await api(app)
        .post('/auth/register')
        .send({ email: 'ANA@petwatch.test', password: PASSWORD })
        .expect(409);
      expect(res.body).toMatchObject({ code: AUTH_ERROR_CODES.EMAIL_TAKEN });
    });

    it('rejects a short password with a field error', async () => {
      const res = await api(app)
        .post('/auth/register')
        .send({ email: EMAIL, password: 'short' })
        .expect(400);
      const body = res.body as ApiErrorBody;
      expect(body.code).toBe('VALIDATION_FAILED');
      expect(body.fieldErrors).toHaveProperty('password');
    });
  });

  describe('login (AUTH-2)', () => {
    it('returns a new session for the right password', async () => {
      const { user } = await register();

      const res = await login(EMAIL, PASSWORD).expect(200);
      expect((res.body as AuthResponse).user).toEqual(user);
    });

    it('answers a wrong password and an unknown email identically', async () => {
      await register();

      const wrongPassword = await login(EMAIL, 'wrong-password').expect(401);
      const unknownEmail = await login('nobody@petwatch.test', PASSWORD).expect(401);
      expect(wrongPassword.body).toEqual(unknownEmail.body);
      expect(wrongPassword.body).toMatchObject({ code: AUTH_ERROR_CODES.INVALID_CREDENTIALS });
    });
  });

  describe('refresh and logout (D40)', () => {
    it('rotates the refresh token: the new one works, the old one is rejected', async () => {
      const first = await register();

      const res = await refresh(first.refreshToken).expect(200);
      const second = res.body as AuthResponse;
      expect(second.refreshToken).not.toBe(first.refreshToken);
      await me(second.accessToken).expect(200);

      const reused = await refresh(first.refreshToken).expect(401);
      expect(reused.body).toMatchObject({ code: AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN });
    });

    it('treats reuse of a rotated token as theft and revokes every session of the user', async () => {
      const phone = await register();
      const tablet = (await login(EMAIL, PASSWORD).expect(200)).body as AuthResponse;
      const rotated = (await refresh(phone.refreshToken).expect(200)).body as AuthResponse;

      await refresh(phone.refreshToken).expect(401); // reuse detected

      await refresh(rotated.refreshToken).expect(401);
      await refresh(tablet.refreshToken).expect(401);
    });

    it('logout revokes the refresh token', async () => {
      const { refreshToken } = await register();

      await api(app).post('/auth/logout').send({ refreshToken }).expect(204);
      await refresh(refreshToken).expect(401);
    });

    it('rejects /users/me without a token or with a forged one', async () => {
      const missing = await api(app).get('/users/me').expect(401);
      expect(missing.body).toMatchObject({ code: AUTH_ERROR_CODES.UNAUTHENTICATED });

      const forged = await me('not-a-jwt').expect(401);
      expect(forged.body).toMatchObject({ code: AUTH_ERROR_CODES.UNAUTHENTICATED });
    });
  });

  describe('password reset (AUTH-3)', () => {
    it('emails a link whose token resets the password and signs out every session', async () => {
      const session = await register();

      const token = await requestResetToken();
      await api(app)
        .post('/auth/reset-password')
        .send({ token, password: NEW_PASSWORD })
        .expect(204);

      await refresh(session.refreshToken).expect(401);
      await login(EMAIL, PASSWORD).expect(401);
      await login(EMAIL, NEW_PASSWORD).expect(200);
    });

    it('accepts a reset link only once', async () => {
      await register();
      const token = await requestResetToken();
      await api(app)
        .post('/auth/reset-password')
        .send({ token, password: NEW_PASSWORD })
        .expect(204);

      const res = await api(app)
        .post('/auth/reset-password')
        .send({ token, password: 'yet-another-password' })
        .expect(400);
      expect(res.body).toMatchObject({ code: AUTH_ERROR_CODES.INVALID_RESET_TOKEN });
    });

    it('invalidates older links when a new one is requested', async () => {
      await register();
      const older = await requestResetToken();
      await deleteAllMessages();
      const newer = await requestResetToken();

      await api(app)
        .post('/auth/reset-password')
        .send({ token: older, password: NEW_PASSWORD })
        .expect(400);
      await api(app)
        .post('/auth/reset-password')
        .send({ token: newer, password: NEW_PASSWORD })
        .expect(204);
    });

    it('answers 204 for an unknown email and sends nothing', async () => {
      await register();
      const unknown = 'nobody@petwatch.test';

      await api(app).post('/auth/forgot-password').send({ email: unknown }).expect(204);
      // Mail is sent without being awaited. A later email to a real user arriving proves the
      // earlier request had its chance to send, without sleeping a fixed time.
      await requestResetToken(EMAIL);
      expect(await countMessagesTo(unknown)).toBe(0);
    });
  });
});
