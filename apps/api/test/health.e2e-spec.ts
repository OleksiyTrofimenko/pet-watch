import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { api, createTestApp } from './utils/app';
import { resetDb } from './utils/db';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });
  beforeEach(() => resetDb(app.get(PrismaService)));
  afterAll(() => app.close());

  it('GET /health reports the database as up', async () => {
    await api(app).get('/health').expect(200, { status: 'ok', db: 'up' });
  });

  it('rejects a protected route without a token in the ApiErrorBody shape', async () => {
    const res = await api(app).get('/users/me').expect(401);
    expect(res.body).toMatchObject({ statusCode: 401, code: 'UNAUTHENTICATED' });
  });
});
