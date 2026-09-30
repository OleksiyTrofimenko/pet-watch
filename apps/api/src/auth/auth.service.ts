import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import {
  AUTH_ERROR_CODES,
  type AuthResponse,
  type LoginInput,
  type PublicUser,
  type RegisterInput,
  type ResetPasswordInput,
} from '@petwatch/shared';
import type { Env } from '../config/env';
import type { Prisma } from '../generated/prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect, toPublicUser } from '../users/users.mapper';
import { UsersService } from '../users/users.service';
import type { AccessTokenPayload } from './jwt-auth.guard';
import { generateToken, hashToken } from './tokens';

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  /** Verified against when the email is unknown, so both failure paths cost one argon2 verify. */
  private readonly dummyHash = hashPassword(generateToken());

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async register({ email, password }: RegisterInput): Promise<AuthResponse> {
    const user = await this.users.create(email, await hashPassword(password));
    return this.issueSession(user);
  }

  async login({ email, password }: LoginInput): Promise<AuthResponse> {
    const user = await this.users.findByEmailWithHash(email);
    const valid = await argon2.verify(user?.passwordHash ?? (await this.dummyHash), password);
    if (!user || !valid) {
      throw new UnauthorizedException({
        code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        message: 'Email or password is incorrect',
      });
    }
    return this.issueSession(toPublicUser(user));
  }

  /** Rotation with reuse detection (D40). The client must refresh single-flight (AUTH-4). */
  async refresh(rawToken: string): Promise<AuthResponse> {
    const now = new Date();
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        revokedAt: true,
        user: { select: publicUserSelect },
      },
    });
    if (!token || token.expiresAt <= now) throw invalidRefreshToken();
    if (token.revokedAt) {
      // A rotated-away token came back: someone else may hold the chain. Log out all devices.
      await revokeAllRefreshTokens(this.prisma, token.userId, now);
      throw invalidRefreshToken();
    }

    const refreshToken = generateToken();
    await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.refreshToken.updateMany({
        where: { id: token.id, revokedAt: null },
        data: { revokedAt: now },
      });
      if (claimed.count !== 1) throw invalidRefreshToken(); // lost a concurrent refresh
      await tx.refreshToken.create({ data: this.refreshTokenData(token.userId, refreshToken) });
    });
    return {
      user: toPublicUser(token.user),
      accessToken: await this.signAccessToken(token.userId),
      refreshToken,
    };
  }

  async logout(rawToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(rawToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Same response and near-same timing whether or not the account exists. */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) return;

    const now = new Date();
    const token = generateToken();
    const ttlMinutes = this.config.get('PASSWORD_RESET_TTL_MINUTES', { infer: true });
    await this.prisma.$transaction([
      // Only the newest link works.
      this.prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: now },
      }),
      this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(now.getTime() + ttlMinutes * MINUTE_MS),
        },
      }),
    ]);

    const link = `${this.config.get('APP_SCHEME', { infer: true })}://reset-password?token=${token}`;
    // Not awaited: SMTP latency must not reveal that the account exists.
    this.mail.sendPasswordReset(email, link).catch((error: unknown) => {
      this.logger.error(
        'Failed to send password reset email',
        error instanceof Error ? error.stack : error,
      );
    });
  }

  async resetPassword({ token: rawToken, password }: ResetPasswordInput): Promise<void> {
    const now = new Date();
    const token = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });
    if (!token || token.usedAt || token.expiresAt <= now) throw invalidResetToken();

    const passwordHash = await hashPassword(password);
    await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: token.id, usedAt: null },
        data: { usedAt: now },
      });
      if (claimed.count !== 1) throw invalidResetToken();
      await tx.user.update({ where: { id: token.userId }, data: { passwordHash } });
      // Whoever knew the old password is signed out everywhere.
      await revokeAllRefreshTokens(tx, token.userId, now);
    });
  }

  private async issueSession(user: PublicUser): Promise<AuthResponse> {
    const refreshToken = generateToken();
    await this.prisma.refreshToken.create({ data: this.refreshTokenData(user.id, refreshToken) });
    return { user, accessToken: await this.signAccessToken(user.id), refreshToken };
  }

  private refreshTokenData(userId: string, rawToken: string) {
    const ttlDays = this.config.get('REFRESH_TOKEN_TTL_DAYS', { infer: true });
    return {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + ttlDays * DAY_MS),
    };
  }

  private signAccessToken(userId: string): Promise<string> {
    const payload: AccessTokenPayload = { sub: userId };
    return this.jwt.signAsync(payload);
  }
}

async function revokeAllRefreshTokens(
  db: Prisma.TransactionClient,
  userId: string,
  now: Date,
): Promise<void> {
  await db.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: now },
  });
}

function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

function invalidRefreshToken(): UnauthorizedException {
  return new UnauthorizedException({
    code: AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN,
    message: 'Your session has ended. Please sign in again.',
  });
}

function invalidResetToken(): BadRequestException {
  return new BadRequestException({
    code: AUTH_ERROR_CODES.INVALID_RESET_TOKEN,
    message: 'This reset link is invalid or has expired. Request a new one.',
  });
}
