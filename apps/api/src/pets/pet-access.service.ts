import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PET_ERROR_CODES, type PetRole } from '@petwatch/shared';
import { PrismaService } from '../prisma/prisma.service';

/** Where a user can see a pet: they own it or watch it. Used by every pet read. */
export function visibleTo(userId: string) {
  return { OR: [{ ownerId: userId }, { watchers: { some: { userId } } }] };
}

export function petNotFound(): NotFoundException {
  return new NotFoundException({ code: PET_ERROR_CODES.PET_NOT_FOUND, message: 'Pet not found' });
}

/**
 * The only place that decides owner / watcher / none. Invisible → 404 (don't reveal that the
 * pet exists), visible but wrong role → 403.
 */
@Injectable()
export class PetAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveRole(userId: string, petId: string): Promise<PetRole> {
    const pet = await this.prisma.pet.findFirst({
      where: { id: petId, ...visibleTo(userId) },
      select: { ownerId: true },
    });
    if (!pet) throw petNotFound();
    return pet.ownerId === userId ? 'OWNER' : 'WATCHER';
  }

  async assertOwner(userId: string, petId: string): Promise<void> {
    if ((await this.resolveRole(userId, petId)) !== 'OWNER') {
      throw new ForbiddenException({
        code: PET_ERROR_CODES.OWNER_ONLY,
        message: 'Only the owner can do this',
      });
    }
  }
}
