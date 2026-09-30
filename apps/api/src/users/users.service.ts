import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AUTH_ERROR_CODES, type PublicUser } from '@petwatch/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect, toPublicUser } from './users.mapper';

export interface UserWithHash extends PublicUser {
  passwordHash: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmailWithHash(email: string): Promise<UserWithHash | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: { ...publicUserSelect, passwordHash: true },
    });
  }

  /** Inserts directly and lets the unique index decide: a pre-check would race. */
  async create(email: string, passwordHash: string): Promise<PublicUser> {
    try {
      const user = await this.prisma.user.create({
        data: { email, passwordHash },
        select: publicUserSelect,
      });
      return toPublicUser(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException({
          code: AUTH_ERROR_CODES.EMAIL_TAKEN,
          message: 'An account with this email already exists',
        });
      }
      throw error;
    }
  }

  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });
    if (!user) throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found' });
    return toPublicUser(user);
  }
}
