import { CARE_TASK_TYPES, type CareTaskType } from '@petwatch/shared';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Chip } from '@/src/design-system';
import { TASK_TYPE_VISUALS } from '../task-type-visuals';

type TypeChipsProps = {
  value: CareTaskType;
  onChange: (type: CareTaskType) => void;
};

/** Task type picker: one chip per type, selected = type colour + check (TaskForm.dc.html). */
export function TypeChips({ value, onChange }: TypeChipsProps) {
  return (
    <HStack className="flex-wrap gap-2">
      {CARE_TASK_TYPES.map((type) => {
        const visual = TASK_TYPE_VISUALS[type];
        return (
          <Chip
            key={type}
            label={visual.label}
            selected={value === type}
            onPress={() => onChange(type)}
            leading={<Icon as={visual.icon} className="h-[18px] w-[18px] text-typography-700" />}
            selectedClassName={`border-2 ${visual.borderClassName} ${visual.badgeClassName}`}
            selectedTextClassName={visual.textClassName}
            testID={`task-form.type-${type}`}
          />
        );
      })}
    </HStack>
  );
}
