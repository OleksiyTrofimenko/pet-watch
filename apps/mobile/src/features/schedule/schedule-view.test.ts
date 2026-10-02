import { formatTime } from '@/src/lib/time-of-day';
import { countLabel, effectiveFilter, isPast, staleLabel } from './schedule-view';

describe('schedule view helpers', () => {
  it('names the filter in the count', () => {
    expect(countLabel(4)).toBe('4 tasks');
    expect(countLabel(1)).toBe('1 task');
    expect(countLabel(3, 'Rex')).toBe('3 tasks for Rex');
  });

  it('falls back to all pets when the filtered pet is gone', () => {
    expect(effectiveFilter({ petId: 'rex' }, ['rex', 'miso'])).toEqual({ petId: 'rex' });
    expect(effectiveFilter({ petId: 'gone' }, ['rex'])).toBe('all');
    expect(effectiveFilter('all', [])).toBe('all');
  });

  it('marks earlier days and earlier times today as past', () => {
    const now = new Date(2026, 8, 30, 13, 10);
    expect(isPast({ date: '2026-09-30', timeOfDay: 480 }, now)).toBe(true);
    expect(isPast({ date: '2026-09-30', timeOfDay: 790 }, now)).toBe(false); // 13:10 itself
    expect(isPast({ date: '2026-09-29', timeOfDay: 1300 }, now)).toBe(true);
    expect(isPast({ date: '2026-10-01', timeOfDay: 0 }, now)).toBe(false);
  });

  it('says when the data was fetched only while offline with cached data', () => {
    const fetchedAt = new Date(2026, 8, 30, 13, 10).getTime();
    expect(staleLabel(true, fetchedAt)).toBeUndefined();
    expect(staleLabel(false, 0)).toBeUndefined();
    expect(staleLabel(false, fetchedAt)).toBe(`Updated ${formatTime(790)}`);
  });
});
