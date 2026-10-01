import type { CareTaskDto } from '@petwatch/shared';

export const careTaskSelect = {
  id: true,
  petId: true,
  type: true,
  title: true,
  notes: true,
  timeOfDay: true,
  recurrence: true,
  daysOfWeek: true,
} as const;

type CareTaskRow = CareTaskDto;

export function toCareTaskDto(row: CareTaskRow): CareTaskDto {
  return {
    id: row.id,
    petId: row.petId,
    type: row.type,
    title: row.title,
    notes: row.notes,
    timeOfDay: row.timeOfDay,
    recurrence: row.recurrence,
    daysOfWeek: row.daysOfWeek,
  };
}
