import { repeatLabel } from './format';

describe('care task formatting', () => {
  it('describes repetition in Monday-first order', () => {
    expect(repeatLabel({ recurrence: 'DAILY', daysOfWeek: [] })).toBe('Daily');
    expect(repeatLabel({ recurrence: 'WEEKLY', daysOfWeek: [0, 1, 3, 5] })).toBe(
      'Mon, Wed, Fri, Sun',
    );
    expect(repeatLabel({ recurrence: 'WEEKLY', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] })).toBe('Daily');
  });
});
