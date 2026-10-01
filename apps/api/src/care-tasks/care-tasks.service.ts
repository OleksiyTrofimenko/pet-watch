import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CARE_TASK_ERROR_CODES,
  type CareTaskDto,
  type CareTaskPayload,
  type ScheduleTaskDto,
} from '@petwatch/shared';
import { PetAccessService, visibleTo } from '../pets/pet-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { careTaskSelect, toCareTaskDto } from './care-tasks.mapper';

function taskNotFound(): NotFoundException {
  return new NotFoundException({
    code: CARE_TASK_ERROR_CODES.TASK_NOT_FOUND,
    message: 'Task not found',
  });
}

/** Care task rules. Reads: owner or watcher. Writes: owner only. Occurrences are client-side. */
@Injectable()
export class CareTasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PetAccessService,
  ) {}

  async listForPet(userId: string, petId: string): Promise<CareTaskDto[]> {
    await this.access.resolveRole(userId, petId);
    const rows = await this.prisma.careTask.findMany({
      where: { petId },
      select: careTaskSelect,
      orderBy: [{ timeOfDay: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(toCareTaskDto);
  }

  /** Every rule for every pet the user owns or watches: the input of the schedule views. */
  async schedule(userId: string): Promise<ScheduleTaskDto[]> {
    const rows = await this.prisma.careTask.findMany({
      where: { pet: visibleTo(userId) },
      select: { ...careTaskSelect, pet: { select: { id: true, name: true, ownerId: true } } },
      orderBy: [{ timeOfDay: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(({ pet, ...task }) => ({
      ...toCareTaskDto(task),
      pet: { id: pet.id, name: pet.name },
      role: pet.ownerId === userId ? 'OWNER' : 'WATCHER',
    }));
  }

  async create(userId: string, petId: string, input: CareTaskPayload): Promise<CareTaskDto> {
    await this.access.assertOwner(userId, petId);
    const row = await this.prisma.careTask.create({
      data: { ...input, petId },
      select: careTaskSelect,
    });
    return toCareTaskDto(row);
  }

  /** PUT: full replace, so the recurrence/days invariant is checked on the whole rule. */
  async replace(
    userId: string,
    petId: string,
    taskId: string,
    input: CareTaskPayload,
  ): Promise<CareTaskDto> {
    await this.access.assertOwner(userId, petId);
    await this.assertTaskOfPet(taskId, petId);
    const row = await this.prisma.careTask.update({
      where: { id: taskId },
      // Omitted notes means "none" in a replace (Prisma would read undefined as "unchanged").
      data: { ...input, notes: input.notes ?? null },
      select: careTaskSelect,
    });
    return toCareTaskDto(row);
  }

  async remove(userId: string, petId: string, taskId: string): Promise<void> {
    await this.access.assertOwner(userId, petId);
    await this.assertTaskOfPet(taskId, petId);
    await this.prisma.careTask.delete({ where: { id: taskId } });
  }

  /** A task id from another pet is "not found" here, so access to pet A can't reach pet B's tasks. */
  private async assertTaskOfPet(taskId: string, petId: string): Promise<void> {
    const task = await this.prisma.careTask.findFirst({
      where: { id: taskId, petId },
      select: { id: true },
    });
    if (!task) throw taskNotFound();
  }
}
