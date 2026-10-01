const DAY_MS = 24 * 60 * 60 * 1000;

/** "Expires in 5 days" / "Expires tomorrow" / "Expires today" / "Expired" (calendar days). */
export function expiresLabel(expiresAtIso: string, now: Date): string {
  const expiresAt = new Date(expiresAtIso);
  if (expiresAt <= now) return 'Expired';
  const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.round((startOfDay(expiresAt) - startOfDay(now)) / DAY_MS);
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  return `Expires in ${days} days`;
}

/** "Watching since 12 Sep" */
export function sinceLabel(sinceIso: string): string {
  return `Watching since ${new Date(sinceIso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })}`;
}

/** "Monday, 5 October" */
export function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
