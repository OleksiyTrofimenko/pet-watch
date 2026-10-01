import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';

type SegmentedControlProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** Read by screen readers, e.g. "Schedule view". */
  label: string;
  testID?: string;
};

/** Two or three exclusive choices. Selected = raised + bold, not just recoloured (design rule). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  testID,
}: SegmentedControlProps<T>) {
  return (
    <HStack
      className="gap-[3px] rounded bg-secondary-100 p-[3px]"
      accessibilityRole="tablist"
      accessibilityLabel={label}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            testID={testID ? `${testID}-${option.value}` : undefined}
            className={
              selected
                ? 'min-h-11 flex-1 items-center justify-center rounded bg-background-0 shadow-hard-5'
                : 'min-h-11 flex-1 items-center justify-center rounded'
            }
          >
            <Text
              className={
                selected
                  ? 'text-[15px] font-bold text-typography-900'
                  : 'text-[15px] font-medium text-typography-700'
              }
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );
}
