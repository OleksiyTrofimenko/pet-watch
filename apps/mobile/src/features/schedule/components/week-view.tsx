import { expandOccurrences, localDateKey, weekDays, type ScheduleTaskDto } from '@petwatch/shared';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { dayMonth, shortDay } from '../dates';
import { countLabel, isPast } from '../schedule-view';
import { DaySection } from './day-section';
import { TaskRow } from './task-row';

type WeekViewProps = {
  /** Already filtered by pet. */
  tasks: ScheduleTaskDto[];
  now: Date;
  petName?: string;
  onOpen: (task: ScheduleTaskDto) => void;
};

/** Monday–Sunday of the current week, day by day; empty days keep their header. */
export function WeekView({ tasks, now, petName, onOpen }: WeekViewProps) {
  const days = weekDays(now);
  const occurrences = expandOccurrences(tasks, days[0] ?? now, days.length);
  const today = localDateKey(now);
  const first = days[0];
  const last = days[days.length - 1];

  return (
    <VStack className="gap-4">
      {first && last ? (
        <Text className="px-1 font-heading text-[22px] font-semibold leading-7 text-typography-900">
          {dayMonth(first)} – {dayMonth(last)}
        </Text>
      ) : null}
      {days.map((day) => {
        const key = localDateKey(day);
        const dayOccurrences = occurrences.filter((occurrence) => occurrence.date === key);
        return (
          <DaySection
            key={key}
            title={shortDay(day)}
            count={countLabel(dayOccurrences.length, petName)}
            isToday={key === today}
            isEmpty={dayOccurrences.length === 0}
          >
            {dayOccurrences.map((occurrence) => (
              <TaskRow
                key={occurrence.task.id}
                task={occurrence.task}
                past={isPast(occurrence, now)}
                showPet={!petName}
                onPress={
                  occurrence.task.role === 'OWNER' ? () => onOpen(occurrence.task) : undefined
                }
              />
            ))}
          </DaySection>
        );
      })}
    </VStack>
  );
}
