/**
 * Care-task times are minutes since midnight in local wall-clock time (0–1439). The native time
 * picker works with Dates, and display follows the device locale (24-hour or 12-hour).
 */

/** 480 → a Date on `day` (default today) at 08:00 local time. */
export function minutesToDate(minutes: number, day: Date = new Date()): Date {
  const date = new Date(day);
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date;
}

/** A Date → minutes since its local midnight (seconds dropped). */
export function dateToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** 1110 → "18:30" or "6:30 PM", as the device locale writes times (`locale` is for tests). */
export function formatTime(minutes: number, locale?: string): string {
  return minutesToDate(minutes).toLocaleTimeString(locale, { timeStyle: 'short' });
}
