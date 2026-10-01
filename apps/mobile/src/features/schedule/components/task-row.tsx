import type { ScheduleTaskDto } from '@petwatch/shared';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatTime } from '@/src/lib/time-of-day';
import { TypeTag } from '@/src/features/care-tasks/components/type-tag';

type TaskRowProps = {
  task: ScheduleTaskDto;
  past: boolean;
  /** Shown when the view isn't filtered to one pet. */
  showPet: boolean;
  /** Owner: opens the rule to edit. Watchers' rows aren't tappable. */
  onPress?: () => void;
};

/** One occurrence (TaskRow.dc.html). Past = muted surface + "Past" label, not colour alone. */
export function TaskRow({ task, past, showPet, onPress }: TaskRowProps) {
  const time = formatTime(task.timeOfDay);
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${time}, ${task.title}, ${task.pet.name}${past ? ', past' : ''}`}
      testID={`task.${task.title}`}
      className={`min-h-[72px] flex-row gap-3 rounded-lg border py-3 pl-3.5 pr-4 ${
        past ? 'border-background-100 bg-background-100' : 'border-outline-100 bg-background-0'
      }`}
    >
      <VStack className="w-12 gap-0.5 pt-0.5">
        <Text
          className={`text-base font-bold ${past ? 'text-typography-600' : 'text-typography-900'}`}
        >
          {time}
        </Text>
        {past ? <Text className="text-xs font-semibold text-typography-600">Past</Text> : null}
      </VStack>
      <VStack className="flex-1 gap-1.5">
        <HStack className="flex-wrap items-center justify-between gap-2">
          <TypeTag type={task.type} />
          {showPet ? (
            <Text className="text-sm font-semibold text-typography-700">{task.pet.name}</Text>
          ) : null}
        </HStack>
        <Text
          className={`text-base font-semibold ${past ? 'text-typography-700' : 'text-typography-900'}`}
        >
          {task.title}
        </Text>
        {task.notes ? (
          <Text className="text-sm text-typography-600" numberOfLines={1}>
            {task.notes}
          </Text>
        ) : null}
      </VStack>
    </Pressable>
  );
}
