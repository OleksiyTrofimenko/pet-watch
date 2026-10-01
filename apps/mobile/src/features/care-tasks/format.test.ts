import { formatTime, parseTime, repeatLabel } from './format';

describe('care task formatting', () => {
  it('formats and parses wall-clock times', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(480)).toBe('08:00');
    expect(formatTime(1439)).toBe('23:59');
    expect(parseTime('08:00')).toBe(480);
    expect(parseTime(' 8:05 ')).toBe(485);
    expect(parseTime('23:59')).toBe(1439);
  });

  it.each(['24:00', '8', '08:60', '', 'ab:cd'])('rejects %p as NaN', (text) => {
    expect(parseTime(text)).toBeNaN();
  });

  it('describes repetition in Monday-first order', () => {
    expect(repeatLabel({ recurrence: 'DAILY', daysOfWeek: [] })).toBe('Daily');
    expect(repeatLabel({ recurrence: 'WEEKLY', daysOfWeek: [0, 1, 3, 5] })).toBe(
      'Mon, Wed, Fri, Sun',
    );
    expect(repeatLabel({ recurrence: 'WEEKLY', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] })).toBe('Daily');
  });
});
