/** Display formats for the schedule (en-GB: "Wednesday, 30 September", "Mon 28 Sep"). */
export const longDay = (day: Date) =>
  day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export const shortDay = (day: Date) =>
  day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export const dayMonth = (day: Date) =>
  day.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
