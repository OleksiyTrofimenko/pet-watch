import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { hashToken } from './tokens';

const USER = { id: 'user-1', email: 'owner@example.com' };
const HOUR_MS = 60 * 60 * 1000;
const inOneHour = (): Date => new Date(Date.now() + HOUR_MS);
const anHourAgo = (): Date => new Date(Date.now() - HOUR_MS);

// Jest's asymmetric matchers are typed `any`; give them the type of the value they stand for.
const anyDate = expect.any(Date) as Date;
const argon2idHash = expect.stringMatching(/^\$argon2id\$/) as string;
function containing<T extends object>(value: T): T {
  return expect.objectContaining(value) as T;
}

/** Only the Prisma calls AuthService makes. `tx` is the same fake, so writes are observable. */
function createFakePrisma() {
  const fake = {
    user: { findUnique: jest.fn(), update: jest.fn() },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    passwordResetToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    $transaction: jest.fn(
      (arg: ((tx: unknown) => Promise<unknown>) | Promise<unknown>[]): Promise<unknown> =>
        typeof arg === 'function' ? arg(fake) : Promise.all(arg),
    ),
  };
  return fake;
}

describe('AuthService', () => {
  let prisma: ReturnType<typeof createFakePrisma>;
  const users = { findByEmailWithHash: jest.fn(), create: jest.fn() };
  const mail = { sendPasswordReset: jest.fn() };
  let auth: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = createFakePrisma();
    mail.sendPasswordReset.mockResolvedValue(undefined);
    const config: Record<string, unknown> = {
      REFRESH_TOKEN_TTL_DAYS: 30,
      PASSWORD_RESET_TTL_MINUTES: 30,
      APP_SCHEME: 'petwatch',
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: UsersService, useValue: users },
        { provide: MailService, useValue: mail },
        { provide: ConfigService, useValue: { get: (key: string) => config[key] } },
        {
          provide: JwtService,
          useValue: new JwtService({ secret: 'test-secret-that-is-at-least-32-chars!!' }),
        },
      ],
    }).compile();
    auth = moduleRef.get(AuthService);
  });

  describe('login', () => {
    it('returns the same error for an unknown email and a wrong password', async () => {
      users.findByEmailWithHash.mockResolvedValueOnce(null);
      const unknownEmail = auth.login({ email: USER.email, password: 'whatever1' });
      await expect(unknownEmail).rejects.toMatchObject({
        status: 401,
        response: { code: 'INVALID_CREDENTIALS' },
      });

      users.findByEmailWithHash.mockResolvedValueOnce({
        ...USER,
        passwordHash: await argon2.hash('correct-horse'),
      });
      const wrongPassword = auth.login({ email: USER.email, password: 'whatever1' });
      await expect(wrongPassword).rejects.toMatchObject({
        status: 401,
        response: { code: 'INVALID_CREDENTIALS' },
      });
    });

    it('issues a session and stores only the refresh token hash', async () => {
      users.findByEmailWithHash.mockResolvedValue({
        ...USER,
        passwordHash: await argon2.hash('correct-horse'),
      });

      const session = await auth.login({ email: USER.email, password: 'correct-horse' });

      expect(session.user).toEqual(USER);
      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: containing({
          userId: USER.id,
          tokenHash: hashToken(session.refreshToken),
        }),
      });
    });
  });

  describe('refresh', () => {
    const stored = (overrides: { expiresAt?: Date; revokedAt?: Date | null } = {}) => ({
      id: 'rt-1',
      userId: USER.id,
      expiresAt: inOneHour(),
      revokedAt: null,
      user: USER,
      ...overrides,
    });

    it('rotates: claims the old token and stores a new one', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(stored());

      const session = await auth.refresh('old-token');

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { id: 'rt-1', revokedAt: null },
        data: { revokedAt: anyDate },
      });
      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: containing({ tokenHash: hashToken(session.refreshToken) }),
      });
      expect(session.refreshToken).not.toBe('old-token');
    });

    it('treats a revoked token as reuse: revokes every token of the user', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(stored({ revokedAt: anHourAgo() }));

      await expect(auth.refresh('stolen')).rejects.toMatchObject({
        response: { code: 'INVALID_REFRESH_TOKEN' },
      });
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: USER.id, revokedAt: null },
        data: { revokedAt: anyDate },
      });
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });

    it('rejects an expired token without issuing a new one', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(stored({ expiresAt: anHourAgo() }));

      await expect(auth.refresh('expired')).rejects.toMatchObject({ status: 401 });
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });

    it('rejects when a concurrent refresh claimed the token first', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(stored());
      prisma.refreshToken.updateMany.mockResolvedValueOnce({ count: 0 });

      await expect(auth.refresh('raced')).rejects.toMatchObject({ status: 401 });
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('does nothing observable for an unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(auth.forgotPassword('nobody@example.com')).resolves.toBeUndefined();
      expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
      expect(mail.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('emails a deep link whose token is stored only as a hash', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: USER.id });

      await auth.forgotPassword(USER.email);

      const [to, link] = mail.sendPasswordReset.mock.calls[0] as [string, string];
      const token = new URL(link).searchParams.get('token') ?? '';
      expect(to).toBe(USER.email);
      expect(link.startsWith('petwatch://reset-password?token=')).toBe(true);
      expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({
        data: containing({ userId: USER.id, tokenHash: hashToken(token) }),
      });
    });

    it('still resolves when sending the email fails', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: USER.id });
      mail.sendPasswordReset.mockRejectedValue(new Error('SMTP down'));
      const logError = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

      await expect(auth.forgotPassword(USER.email)).resolves.toBeUndefined();
      await new Promise(setImmediate); // let the un-awaited send settle
      expect(logError).toHaveBeenCalledWith(
        'Failed to send password reset email',
        expect.any(String),
      );
      logError.mockRestore();
    });
  });

  describe('resetPassword', () => {
    const input = { token: 'reset-token', password: 'new-password' };

    it('rejects a used token', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'pr-1',
        userId: USER.id,
        expiresAt: inOneHour(),
        usedAt: anHourAgo(),
      });

      await expect(auth.resetPassword(input)).rejects.toMatchObject({
        status: 400,
        response: { code: 'INVALID_RESET_TOKEN' },
      });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('updates the password and revokes every refresh token', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'pr-1',
        userId: USER.id,
        expiresAt: inOneHour(),
        usedAt: null,
      });

      await auth.resetPassword(input);

      expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith({
        where: { id: 'pr-1', usedAt: null },
        data: { usedAt: anyDate },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: USER.id },
        data: { passwordHash: argon2idHash },
      });
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: USER.id, revokedAt: null },
        data: { revokedAt: anyDate },
      });
    });
  });
});
