import { randomBytes } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import type { AuthResponse } from '@petwatch/shared';
import type { App } from 'supertest/types';
import { hashToken } from '../src/auth/tokens';
import { PrismaService } from '../src/prisma/prisma.service';
import { api, createTestApp } from './utils/app';
import { bearer, registerUser } from './utils/auth';
import { resetDb } from './utils/db';

/**
 * "A user may only read or modify pets they own or watch", proven route by route:
 * every pet-scoped endpoint × every relationship to the pet. One table, one test per cell.
 * A guard below fails if a new pet-scoped route is added without a row here.
 */
type Role = 'owner' | 'watcher' | 'stranger' | 'anonymous';
type Fixture = { petId: string; taskId: string; invitationId: string; watcherId: string };
type Row = {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  route: string;
  path: (f: Fixture) => string;
  body?: (f: Fixture) => object;
  expect: Record<Role, number>;
};

const READ = { watcher: 200, stranger: 404, anonymous: 401 } as const;
const WRITE = { watcher: 403, stranger: 404, anonymous: 401 } as const;
const TASK = { type: 'FEEDING', title: 'Breakfast', timeOfDay: 480, recurrence: 'DAILY' };

const MATRIX: Row[] = [
  {
    method: 'get',
    route: '/pets/:petId',
    path: (f) => `/pets/${f.petId}`,
    expect: { owner: 200, ...READ },
  },
  {
    method: 'patch',
    route: '/pets/:petId',
    path: (f) => `/pets/${f.petId}`,
    body: () => ({ name: 'Rexy' }),
    expect: { owner: 200, ...WRITE },
  },
  {
    method: 'delete',
    route: '/pets/:petId',
    path: (f) => `/pets/${f.petId}`,
    expect: { owner: 204, ...WRITE },
  },
  {
    method: 'post',
    route: '/pets/:petId/photo-upload-url',
    path: (f) => `/pets/${f.petId}/photo-upload-url`,
    body: () => ({ contentType: 'image/jpeg' }),
    expect: { owner: 201, ...WRITE },
  },
  // Owner passes the access check and stops at the business rule: nothing was uploaded yet.
  {
    method: 'put',
    route: '/pets/:petId/photo',
    path: (f) => `/pets/${f.petId}/photo`,
    body: (f) => ({ key: `pets/${f.petId}/0199a0b0-0000-7000-8000-000000000000.jpg` }),
    expect: { owner: 400, ...WRITE },
  },
  {
    method: 'delete',
    route: '/pets/:petId/photo',
    path: (f) => `/pets/${f.petId}/photo`,
    expect: { owner: 200, ...WRITE },
  },
  {
    method: 'get',
    route: '/pets/:petId/care-tasks',
    path: (f) => `/pets/${f.petId}/care-tasks`,
    expect: { owner: 200, ...READ },
  },
  {
    method: 'post',
    route: '/pets/:petId/care-tasks',
    path: (f) => `/pets/${f.petId}/care-tasks`,
    body: () => TASK,
    expect: { owner: 201, ...WRITE },
  },
  {
    method: 'put',
    route: '/pets/:petId/care-tasks/:taskId',
    path: (f) => `/pets/${f.petId}/care-tasks/${f.taskId}`,
    body: () => TASK,
    expect: { owner: 200, ...WRITE },
  },
  {
    method: 'delete',
    route: '/pets/:petId/care-tasks/:taskId',
    path: (f) => `/pets/${f.petId}/care-tasks/${f.taskId}`,
    expect: { owner: 204, ...WRITE },
  },
  {
    method: 'post',
    route: '/pets/:petId/invitations',
    path: (f) => `/pets/${f.petId}/invitations`,
    body: () => ({ email: 'lee@petwatch.test' }),
    expect: { owner: 200, ...WRITE },
  },
  {
    method: 'delete',
    route: '/pets/:petId/invitations/:invitationId',
    path: (f) => `/pets/${f.petId}/invitations/${f.invitationId}`,
    expect: { owner: 204, ...WRITE },
  },
  {
    method: 'get',
    route: '/pets/:petId/watchers',
    path: (f) => `/pets/${f.petId}/watchers`,
    expect: { owner: 200, ...WRITE },
  },
  {
    method: 'delete',
    route: '/pets/:petId/watchers/:userId',
    path: (f) => `/pets/${f.petId}/watchers/${f.watcherId}`,
    expect: { owner: 204, ...WRITE },
  },
];

const CASES = MATRIX.flatMap((row) =>
  (['owner', 'watcher', 'stranger', 'anonymous'] as const).map((role) => ({ row, role })),
);

/** Express 5 keeps registered routes on its router; good enough to list what Nest mounted. */
type ExpressLike = {
  router: { stack: { route?: { path: string; methods: Record<string, boolean> } }[] };
};

describe('Access matrix (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const users = {} as Record<Exclude<Role, 'anonymous'>, AuthResponse>;
  let lee: AuthResponse;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await resetDb(prisma);
    users.owner = await registerUser(app, 'ana@petwatch.test');
    users.watcher = await registerUser(app, 'sam@petwatch.test');
    users.stranger = await registerUser(app, 'eve@petwatch.test');
    lee = await registerUser(app, 'lee@petwatch.test');
  });
  afterAll(() => app.close());

  /** A fresh pet per case: a successful DELETE in one cell can't change the next. */
  async function fixture(): Promise<Fixture> {
    await prisma.pet.deleteMany();
    const pet = await prisma.pet.create({
      data: {
        ownerId: users.owner.user.id,
        name: 'Rex',
        species: 'DOG',
        careTasks: {
          create: { type: 'WALK', title: 'Walk', timeOfDay: 1080, recurrence: 'DAILY' },
        },
        watchers: { create: { userId: users.watcher.user.id } },
        invitations: {
          create: {
            inviterId: users.owner.user.id,
            inviteeId: lee.user.id,
            tokenHash: hashToken(randomBytes(32).toString('base64url')),
            expiresAt: new Date(Date.now() + 86_400_000),
          },
        },
      },
      select: {
        id: true,
        careTasks: { select: { id: true } },
        invitations: { select: { id: true } },
      },
    });
    return {
      petId: pet.id,
      taskId: pet.careTasks[0]?.id ?? '',
      invitationId: pet.invitations[0]?.id ?? '',
      watcherId: users.watcher.user.id,
    };
  }

  it.each(CASES)('$role $row.method $row.route → $row.expect.$role', async ({ row, role }) => {
    const f = await fixture();
    let request = api(app)[row.method](row.path(f));
    if (role !== 'anonymous') request = request.set(bearer(users[role]));
    if (row.body) request = request.send(row.body(f));
    const res = await request;
    expect({ status: res.status, body: res.body as unknown }).toMatchObject({
      status: row.expect[role],
    });
  });

  it('covers every pet-scoped route the API exposes', () => {
    const express = app.getHttpAdapter().getInstance() as ExpressLike;
    const mounted = express.router.stack
      .flatMap((layer) =>
        layer.route
          ? Object.keys(layer.route.methods).map((m) => `${m.toUpperCase()} ${layer.route?.path}`)
          : [],
      )
      .filter((route) => route.includes('/pets/:petId'));
    const tested = MATRIX.map((row) => `${row.method.toUpperCase()} ${row.route}`);
    expect(mounted.sort()).toEqual(tested.sort());
  });
});
