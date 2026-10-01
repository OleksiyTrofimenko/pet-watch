import type { Recurrence } from '@petwatch/shared';

/** 480 → "08:00" (24-hour, as in the design). */
export function formatTime(minutes: number): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** "08:00" / "8:00" → 480; anything else → NaN (the schema turns NaN into a field error). */
export function parseTime(text: string): number {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(text.trim());
  return match ? Number(match[1]) * 60 + Number(match[2]) : Number.NaN;
}

/** Monday-first, as the week views. Values are JS getDay() numbers (0 = Sunday). */
export const WEEK_DAYS = [
  { value: 1, short: 'Mon', letter: 'M', full: 'Monday' },
  { value: 2, short: 'Tue', letter: 'T', full: 'Tuesday' },
  { value: 3, short: 'Wed', letter: 'W', full: 'Wednesday' },
  { value: 4, short: 'Thu', letter: 'T', full: 'Thursday' },
  { value: 5, short: 'Fri', letter: 'F', full: 'Friday' },
  { value: 6, short: 'Sat', letter: 'S', full: 'Saturday' },
  { value: 0, short: 'Sun', letter: 'S', full: 'Sunday' },
] as const;

/** "Daily", "Every day" for all seven, or "Mon, Wed, Fri" in week order. */
export function repeatLabel(task: {
  recurrence: Recurrence;
  daysOfWeek: readonly number[];
}): string {
  if (task.recurrence === 'DAILY' || task.daysOfWeek.length === 7) return 'Daily';
  return WEEK_DAYS.filter((day) => task.daysOfWeek.includes(day.value))
    .map((day) => day.short)
    .join(', ');
}
