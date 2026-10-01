import { z } from 'zod';
import { optionalText } from './common';
import type { PetRole } from './pets';

export const CARE_TASK_TYPES = [
  'FEEDING',
  'WALK',
  'MEDICATION',
  'PLAY',
  'GROOMING',
  'OTHER',
] as const;
export const careTaskTypeSchema = z.enum(CARE_TASK_TYPES);
export type CareTaskType = z.infer<typeof careTaskTypeSchema>;

export const RECURRENCES = ['DAILY', 'WEEKLY'] as const;
export const recurrenceSchema = z.enum(RECURRENCES);
export type Recurrence = z.infer<typeof recurrenceSchema>;

/** 0 = Sunday … 6 = Saturday (matches JS Date#getDay). */
export const dayOfWeekSchema = z.number().int().min(0).max(6);

/**
 * A care task is a *rule* ("feed at 08:00 every day"), not an occurrence.
 * Occurrences for Today/Weekly are derived from rules on the client.
 * Time is wall-clock minutes since midnight in the viewer's local time.
 */
export const careTaskSchema = z
  .object({
    type: careTaskTypeSchema,
    title: z.string().trim().min(1, 'Title is required').max(80),
    notes: optionalText(500),
    timeOfDay: z
      .number({ error: 'Enter a time like 08:00' })
      .int()
      .min(0, 'Enter a time like 08:00')
      .max(24 * 60 - 1, 'Enter a time like 08:00'),
    recurrence: recurrenceSchema,
    daysOfWeek: z.array(dayOfWeekSchema).max(7).default([]),
  })
  .superRefine((task, ctx) => {
    if (task.recurrence === 'WEEKLY' && task.daysOfWeek.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['daysOfWeek'],
        message: 'Pick at least one day for a weekly task',
      });
    }
  })
  // Normalise: daily tasks never carry days; weekly days are unique + sorted.
  .transform((task) => ({
    ...task,
    daysOfWeek:
      task.recurrence === 'DAILY' ? [] : [...new Set(task.daysOfWeek)].sort((a, b) => a - b),
  }));

/** PUT semantics for updates: the recurrence invariant must hold for the whole object. */
export type CareTaskInput = z.input<typeof careTaskSchema>;
export type CareTaskPayload = z.output<typeof careTaskSchema>;

export interface CareTaskDto {
  id: string;
  petId: string;
  type: CareTaskType;
  title: string;
  notes: string | null;
  timeOfDay: number;
  recurrence: Recurrence;
  daysOfWeek: number[];
}

/** GET /care-tasks: a task with the pet it belongs to, for the cross-pet schedule. */
export interface ScheduleTaskDto extends CareTaskDto {
  pet: { id: string; name: string };
  /** The viewer's relationship to the pet: only owners can edit. */
  role: PetRole;
}
