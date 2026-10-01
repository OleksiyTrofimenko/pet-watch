import type { CareTaskType } from '@petwatch/shared';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { TASK_TYPE_VISUALS } from '../task-type-visuals';

/** Icon + label + colour for a task type (three cues, never colour alone). */
export function TypeTag({ type }: { type: CareTaskType }) {
  const visual = TASK_TYPE_VISUALS[type];
  return (
    <HStack
      className={`items-center gap-1 self-start rounded-full px-2 py-0.5 ${visual.badgeClassName}`}
    >
      <Icon as={visual.icon} className={`h-3.5 w-3.5 ${visual.textClassName}`} />
      <Text className={`text-[13px] font-semibold ${visual.textClassName}`}>{visual.label}</Text>
    </HStack>
  );
}
