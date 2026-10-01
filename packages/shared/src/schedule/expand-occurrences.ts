import type { Recurrence } from '../schemas/care-tasks';

/** What expansion needs from a care task rule. */
export interface ScheduleRule {
  id: string;
  petId: string;
  /** Wall-clock minutes since local midnight (D11). */
  timeOfDay: number;
  recurrence: Recurrence;
  /** 0 = Sunday … 6 = Saturday; empty for DAILY. */
  daysOfWeek: readonly number[];
}

export interface Occurrence<T extends ScheduleRule> {
  task: T;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  timeOfDay: number;
}

/**
 * Local midnight `n` days after `day`. Calendar arithmetic, not `+ n * 24h`: around a DST change
 * a day has 23 or 25 hours, and adding milliseconds lands on the wrong date.
 */
export function addDays(day: Date, n: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + n);
}

export function localDateKey(day: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
}

/** Monday … Sunday of the week containing `today` (weeks start on Monday). */
export function weekDays(today: Date): Date[] {
  const sinceMonday = (today.getDay() + 6) % 7; // getDay: 0 = Sunday
  const monday = addDays(today, -sinceMonday);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/**
 * Rules → occurrences for `dayCount` local days starting at `firstDay`'s calendar date,
 * sorted by date then time. Runs on the device, so "08:00" means 08:00 where the viewer is.
 */
export function expandOccurrences<T extends ScheduleRule>(
  tasks: readonly T[],
  firstDay: Date,
  dayCount: number,
): Occurrence<T>[] {
  const occurrences: Occurrence<T>[] = [];
  for (let i = 0; i < dayCount; i++) {
    const day = addDays(firstDay, i);
    const date = localDateKey(day);
    for (const task of tasks) {
      if (task.recurrence === 'DAILY' || task.daysOfWeek.includes(day.getDay())) {
        occurrences.push({ task, date, timeOfDay: task.timeOfDay });
      }
    }
  }
  // Dates are YYYY-MM-DD, so string order is chronological.
  return occurrences.sort((a, b) =>
    a.date === b.date ? a.timeOfDay - b.timeOfDay : a.date < b.date ? -1 : 1,
  );
}
