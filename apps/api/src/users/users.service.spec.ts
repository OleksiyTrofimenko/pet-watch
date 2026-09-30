import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService.create', () => {
  const prisma = { user: { create: jest.fn() } };
  let users: UsersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    users = moduleRef.get(UsersService);
  });

  it('maps a unique violation (lost race or duplicate) to 409 EMAIL_TAKEN', async () => {
    prisma.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    const created = users.create('a@b.com', 'hash');

    await expect(created).rejects.toBeInstanceOf(ConflictException);
    await expect(created).rejects.toMatchObject({ response: { code: 'EMAIL_TAKEN' } });
  });
});
