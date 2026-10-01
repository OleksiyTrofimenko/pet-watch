import { Pencil, Trash2 } from 'lucide-react-native';
import type { CareTaskDto } from '@petwatch/shared';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatTime } from '@/src/lib/time-of-day';
import { repeatLabel } from '../format';
import { TypeTag } from './type-tag';

type RuleRowProps = {
  task: CareTaskDto;
  /** Owner only: watchers get the row without the actions (removed, not disabled). */
  onEdit?: () => void;
  onDelete?: () => void;
};

/** One rule of a pet's routine: "Breakfast · 08:00 · Daily" (RuleRow.dc.html). */
export function RuleRow({ task, onEdit, onDelete }: RuleRowProps) {
  return (
    <HStack
      className="min-h-[72px] items-center gap-2 rounded-lg border border-outline-100 bg-background-0 py-3 pl-4 pr-1"
      testID={`rule.${task.title}`}
    >
      <VStack className="flex-1 gap-1.5">
        <Text className="text-base font-semibold text-typography-900">
          {task.title} · {formatTime(task.timeOfDay)} · {repeatLabel(task)}
        </Text>
        <TypeTag type={task.type} />
      </VStack>
      {onEdit ? (
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${task.title}`}
          testID={`rule.${task.title}.edit`}
          className="h-11 w-11 items-center justify-center rounded"
        >
          <Icon as={Pencil} className="h-5 w-5 text-typography-700" />
        </Pressable>
      ) : null}
      {onDelete ? (
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${task.title}`}
          testID={`rule.${task.title}.delete`}
          className="h-11 w-11 items-center justify-center rounded"
        >
          <Icon as={Trash2} className="h-5 w-5 text-error-700" />
        </Pressable>
      ) : null}
    </HStack>
  );
}
