import type { INestApplication } from '@nestjs/common';
import type { AuthResponse } from '@petwatch/shared';
import type { App } from 'supertest/types';
import { api } from './app';

export const TEST_PASSWORD = 'correct-horse-battery';

/** Registers through the real endpoint, so tokens are exactly what the app would get. */
export async function registerUser(
  app: INestApplication<App>,
  email: string,
  password = TEST_PASSWORD,
): Promise<AuthResponse> {
  const res = await api(app).post('/auth/register').send({ email, password }).expect(201);
  return res.body as AuthResponse;
}

export const bearer = (auth: AuthResponse) => ({ Authorization: `Bearer ${auth.accessToken}` });
