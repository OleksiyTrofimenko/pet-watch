import { expandOccurrences, localDateKey, weekDays, type ScheduleRule } from './expand-occurrences';

// Runs with TZ=Europe/Lisbon (package.json), so the DST cases are real.
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);
const MON_28_SEP = day(2026, 9, 28);

const daily = (id: string, timeOfDay: number, petId = 'rex'): ScheduleRule => ({
  id,
  petId,
  timeOfDay,
  recurrence: 'DAILY',
  daysOfWeek: [],
});
const weekly = (id: string, timeOfDay: number, daysOfWeek: number[]): ScheduleRule => ({
  id,
  petId: 'rex',
  timeOfDay,
  recurrence: 'WEEKLY',
  daysOfWeek,
});

const summary = (occurrences: { task: ScheduleRule; date: string; timeOfDay: number }[]) =>
  occurrences.map((o) => `${o.date} ${o.timeOfDay} ${o.task.id}`);

describe('weekDays', () => {
  it('returns Monday to Sunday of the week containing today', () => {
    expect(weekDays(day(2026, 9, 30)).map(localDateKey)).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ]);
  });

  it('treats Sunday (getDay 0) as the end of the week, not the start', () => {
    expect(localDateKey(weekDays(day(2026, 10, 4))[0]!)).toBe('2026-09-28');
    expect(localDateKey(weekDays(day(2026, 9, 28))[0]!)).toBe('2026-09-28');
  });
});

describe('expandOccurrences', () => {
  it('expands a daily rule to one occurrence per day', () => {
    const result = expandOccurrences([daily('feed', 480)], MON_28_SEP, 7);
    expect(result).toHaveLength(7);
    expect(result.map((o) => o.date)).toEqual(weekDays(MON_28_SEP).map(localDateKey));
  });

  it('expands a weekly Mon/Wed/Fri rule to three occurrences on those days', () => {
    const result = expandOccurrences([weekly('walk', 1080, [1, 3, 5])], MON_28_SEP, 7);
    expect(result.map((o) => o.date)).toEqual(['2026-09-28', '2026-09-30', '2026-10-02']);
  });

  it('places a Sunday-only rule (day 0) on the last day of a Monday-start week', () => {
    const result = expandOccurrences([weekly('bath', 600, [0])], MON_28_SEP, 7);
    expect(result.map((o) => o.date)).toEqual(['2026-10-04']);
  });

  it('returns nothing for an empty range or no rules', () => {
    expect(expandOccurrences([daily('feed', 480)], MON_28_SEP, 0)).toEqual([]);
    expect(expandOccurrences([], MON_28_SEP, 7)).toEqual([]);
  });

  it('sorts by date, then time of day', () => {
    const tasks = [daily('dinner', 1080), daily('breakfast', 480), weekly('pill', 720, [2])];
    expect(summary(expandOccurrences(tasks, day(2026, 9, 28), 2))).toEqual([
      '2026-09-28 480 breakfast',
      '2026-09-28 1080 dinner',
      '2026-09-29 480 breakfast',
      '2026-09-29 720 pill',
      '2026-09-29 1080 dinner',
    ]);
  });

  it('keeps one occurrence per day at the same wall-clock time across the October DST change', () => {
    // Lisbon leaves summer time on Sun 25 Oct 2026; that day has 25 hours.
    const result = expandOccurrences([daily('feed', 480)], day(2026, 10, 23), 7);
    expect(result.map((o) => o.date)).toEqual([
      '2026-10-23',
      '2026-10-24',
      '2026-10-25',
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
    ]);
    expect(new Set(result.map((o) => o.timeOfDay))).toEqual(new Set([480]));
  });

  it('starts from the calendar day even when given a time later in that day', () => {
    const afternoon = new Date(2026, 8, 30, 13, 10);
    expect(expandOccurrences([daily('feed', 480)], afternoon, 1).map((o) => o.date)).toEqual([
      '2026-09-30',
    ]);
  });
});
