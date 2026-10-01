import { dateToMinutes, formatTime, minutesToDate } from './time-of-day';

describe('time of day', () => {
  it.each([0, 1, 480, 1110, 1439])('round-trips %p minutes through a local Date', (minutes) => {
    expect(dateToMinutes(minutesToDate(minutes))).toBe(minutes);
  });

  it('puts midnight and 23:59 on the given local day', () => {
    const day = new Date(2026, 9, 1, 15, 45, 30);
    const midnight = minutesToDate(0, day);
    const lastMinute = minutesToDate(1439, day);
    expect([midnight.getDate(), midnight.getHours(), midnight.getMinutes()]).toEqual([1, 0, 0]);
    expect([lastMinute.getDate(), lastMinute.getHours(), lastMinute.getMinutes()]).toEqual([
      1, 23, 59,
    ]);
    expect(midnight.getSeconds()).toBe(0);
  });

  it('drops seconds when reading a Date', () => {
    expect(dateToMinutes(new Date(2026, 9, 1, 23, 59, 59))).toBe(1439);
  });

  it('formats in the 24-hour or 12-hour style of the locale', () => {
    expect(formatTime(0, 'en-GB')).toBe('00:00');
    expect(formatTime(1439, 'en-GB')).toBe('23:59');
    // ICU separates AM/PM with a narrow no-break space.
    expect(formatTime(0, 'en-US').replace(/\s/g, ' ')).toBe('12:00 AM');
    expect(formatTime(1110, 'en-US').replace(/\s/g, ' ')).toBe('6:30 PM');
  });
});
