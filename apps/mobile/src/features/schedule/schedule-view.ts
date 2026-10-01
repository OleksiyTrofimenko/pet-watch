import type { ScheduleTaskDto } from '@petwatch/shared';
import { localDateKey } from '@petwatch/shared';
import type { PetFilter } from './atoms';

/** The filter in effect: a pet that's gone (deleted, access revoked) falls back to all pets. */
export function effectiveFilter(filter: PetFilter, petIds: readonly string[]): PetFilter {
  return filter !== 'all' && petIds.includes(filter.petId) ? filter : 'all';
}

export function filterTasks(tasks: ScheduleTaskDto[], filter: PetFilter): ScheduleTaskDto[] {
  return filter === 'all' ? tasks : tasks.filter((task) => task.petId === filter.petId);
}

/** "4 tasks", "1 task", "3 tasks for Rex": names the filter so screen readers hear the state. */
export function countLabel(count: number, petName?: string): string {
  const tasks = `${count} ${count === 1 ? 'task' : 'tasks'}`;
  return petName ? `${tasks} for ${petName}` : tasks;
}

/** Earlier than `now` in local wall-clock terms (an earlier day, or earlier today). */
export function isPast(occurrence: { date: string; timeOfDay: number }, now: Date): boolean {
  const today = localDateKey(now);
  if (occurrence.date !== today) return occurrence.date < today;
  return occurrence.timeOfDay < now.getHours() * 60 + now.getMinutes();
}
