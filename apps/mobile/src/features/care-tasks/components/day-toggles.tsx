import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { WEEK_DAYS } from '../format';

type DayTogglesProps = {
  value: readonly number[];
  onChange: (days: number[]) => void;
  invalid: boolean;
};

/** M T W T F S S: Monday-first toggles storing getDay() numbers (0 = Sunday). */
export function DayToggles({ value, onChange, invalid }: DayTogglesProps) {
  return (
    <HStack className="justify-between">
      {WEEK_DAYS.map((day) => {
        const on = value.includes(day.value);
        return (
          <Pressable
            key={day.value}
            onPress={() =>
              onChange(on ? value.filter((d) => d !== day.value) : [...value, day.value])
            }
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            accessibilityLabel={day.full}
            testID={`task-form.day-${day.short}`}
            className={`h-11 w-11 items-center justify-center rounded-full border-[1.5px] ${
              on
                ? 'border-primary-600 bg-primary-600'
                : invalid
                  ? 'border-error-600 bg-background-0'
                  : 'border-secondary-500 bg-background-0'
            }`}
          >
            <Text className={`font-semibold ${on ? 'text-typography-0' : 'text-typography-900'}`}>
              {day.letter}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );
}
