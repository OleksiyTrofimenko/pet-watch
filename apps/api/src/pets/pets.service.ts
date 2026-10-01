import { BadRequestException, Injectable } from '@nestjs/common';
import {
  PET_ERROR_CODES,
  type ConfirmPhotoInput,
  type CreatePetInput,
  type PetDto,
  type PhotoUploadRequest,
  type PhotoUploadTicket,
  type UpdatePetInput,
} from '@petwatch/shared';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PetAccessService, petNotFound, visibleTo } from './pet-access.service';
import { petSelect, toPetDto } from './pets.mapper';
import { isPhotoKeyOfPet, newPhotoKey } from './photo-key';

type PetRow = Parameters<typeof toPetDto>[0] & { photoKey: string | null };

@Injectable()
export class PetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PetAccessService,
    private readonly storage: StorageService,
  ) {}

  /** Owned and watched pets in one query; the client splits them by `role`. */
  async list(userId: string): Promise<PetDto[]> {
    const rows = await this.prisma.pet.findMany({
      where: visibleTo(userId),
      select: petSelect,
      orderBy: { createdAt: 'asc' },
    });
    return Promise.all(rows.map((row) => this.toDto(row, userId)));
  }

  async get(userId: string, petId: string): Promise<PetDto> {
    const row = await this.prisma.pet.findFirst({
      where: { id: petId, ...visibleTo(userId) },
      select: petSelect,
    });
    if (!row) throw petNotFound();
    return this.toDto(row, userId);
  }

  /** Anyone can add a pet; they become its owner. */
  async create(userId: string, input: CreatePetInput): Promise<PetDto> {
    const row = await this.prisma.pet.create({
      data: { ...input, ownerId: userId },
      select: petSelect,
    });
    return this.toDto(row, userId);
  }

  async update(userId: string, petId: string, input: UpdatePetInput): Promise<PetDto> {
    await this.access.assertOwner(userId, petId);
    const row = await this.prisma.pet.update({
      where: { id: petId },
      data: input,
      select: petSelect,
    });
    return this.toDto(row, userId);
  }

  /** Tasks, watchers and invitations go with it (ON DELETE CASCADE); the photo after commit. */
  async remove(userId: string, petId: string): Promise<void> {
    await this.access.assertOwner(userId, petId);
    const { photoKey } = await this.prisma.pet.delete({
      where: { id: petId },
      select: { photoKey: true },
    });
    if (photoKey) await this.storage.deleteQuietly(photoKey);
  }

  async createPhotoUpload(
    userId: string,
    petId: string,
    { contentType }: PhotoUploadRequest,
  ): Promise<PhotoUploadTicket> {
    await this.access.assertOwner(userId, petId);
    const key = newPhotoKey(petId, contentType);
    return { key, ...(await this.storage.presignPut(key, contentType)) };
  }

  /** Attach an uploaded object: it must be a key we issued for this pet, and it must exist. */
  async confirmPhoto(userId: string, petId: string, { key }: ConfirmPhotoInput): Promise<PetDto> {
    await this.access.assertOwner(userId, petId);
    if (!isPhotoKeyOfPet(key, petId)) {
      throw new BadRequestException({
        code: PET_ERROR_CODES.INVALID_PHOTO_KEY,
        message: 'This photo was not uploaded for this pet',
      });
    }
    if (!(await this.storage.exists(key))) {
      throw new BadRequestException({
        code: PET_ERROR_CODES.PHOTO_NOT_UPLOADED,
        message: 'The photo has not finished uploading',
      });
    }
    return this.replacePhoto(userId, petId, key);
  }

  async removePhoto(userId: string, petId: string): Promise<PetDto> {
    await this.access.assertOwner(userId, petId);
    return this.replacePhoto(userId, petId, null);
  }

  private async replacePhoto(userId: string, petId: string, key: string | null): Promise<PetDto> {
    const before = await this.prisma.pet.findUniqueOrThrow({
      where: { id: petId },
      select: { photoKey: true },
    });
    const row = await this.prisma.pet.update({
      where: { id: petId },
      data: { photoKey: key },
      select: petSelect,
    });
    if (before.photoKey && before.photoKey !== key)
      await this.storage.deleteQuietly(before.photoKey);
    return this.toDto(row, userId);
  }

  private async toDto(row: PetRow, viewerId: string): Promise<PetDto> {
    const photoUrl = row.photoKey ? await this.storage.presignGet(row.photoKey) : null;
    return toPetDto(row, viewerId, photoUrl);
  }
}
