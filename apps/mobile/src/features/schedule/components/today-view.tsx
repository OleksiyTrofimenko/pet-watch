import { Fragment } from 'react';
import { expandOccurrences, type ScheduleTaskDto } from '@petwatch/shared';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatTime } from '@/src/features/care-tasks/format';
import { longDay } from '../dates';
import { countLabel, isPast } from '../schedule-view';
import { NowMarker } from './now-marker';
import { TaskRow } from './task-row';

type TodayViewProps = {
  /** Already filtered by pet. */
  tasks: ScheduleTaskDto[];
  now: Date;
  /** Set when filtered to one pet: named in the count, pet hidden on rows. */
  petName?: string;
  /** Offline: "Updated 12:42" replaces the count, so staleness is explicit. */
  staleLabel?: string;
  onOpen: (task: ScheduleTaskDto) => void;
};

/** Every task due today, by time, with a "Now" line between past and upcoming. */
export function TodayView({ tasks, now, petName, staleLabel, onOpen }: TodayViewProps) {
  const occurrences = expandOccurrences(tasks, now, 1);
  const firstUpcoming = occurrences.findIndex((occurrence) => !isPast(occurrence, now));
  const nowTime = formatTime(now.getHours() * 60 + now.getMinutes());

  return (
    <VStack className="gap-2">
      <HStack className="flex-wrap items-baseline justify-between gap-2 px-1 pb-1">
        <Text className="font-heading text-[22px] font-semibold leading-7 text-typography-900">
          {longDay(now)}
        </Text>
        <Text className="text-sm text-typography-700" testID="schedule.count">
          {staleLabel ?? countLabel(occurrences.length, petName)}
        </Text>
      </HStack>
      {occurrences.length === 0 ? (
        <Text className="rounded-lg border border-dashed border-outline-200 p-4 text-center text-typography-600">
          Nothing scheduled today
        </Text>
      ) : null}
      {occurrences.map((occurrence, index) => (
        <Fragment key={`${occurrence.task.id}-${occurrence.date}`}>
          {index === firstUpcoming ? <NowMarker time={nowTime} /> : null}
          <TaskRow
            task={occurrence.task}
            past={isPast(occurrence, now)}
            showPet={!petName}
            onPress={occurrence.task.role === 'OWNER' ? () => onOpen(occurrence.task) : undefined}
          />
        </Fragment>
      ))}
      {occurrences.length > 0 && firstUpcoming === -1 ? <NowMarker time={nowTime} /> : null}
    </VStack>
  );
}
