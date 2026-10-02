import { Controller, useWatch, type Control } from 'react-hook-form';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { CareTaskInput, CareTaskPayload } from '@petwatch/shared';
import { SegmentedControl } from '@/src/design-system';
import { repeatLabel } from '../format';
import { DayToggles } from './day-toggles';

const REPEAT_OPTIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
] as const;

type RepeatFieldProps = {
  control: Control<CareTaskInput, unknown, CareTaskPayload>;
};

/** Daily | Weekly; weekly shows day toggles with a live "Repeats Mon, Wed" hint or the error. */
export function RepeatField({ control }: RepeatFieldProps) {
  const recurrence = useWatch({ control, name: 'recurrence' });

  return (
    <VStack className="gap-3">
      <Text className="font-semibold text-typography-900">Repeat</Text>
      <Controller
        control={control}
        name="recurrence"
        render={({ field }) => (
          <SegmentedControl
            options={REPEAT_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            label="Repeat"
            testID="task-form.repeat"
          />
        )}
      />
      {recurrence === 'WEEKLY' ? (
        <Controller
          control={control}
          name="daysOfWeek"
          render={({ field, fieldState }) => {
            const days = field.value ?? [];
            const error = fieldState.error?.message;
            return (
              <VStack className="gap-2">
                <DayToggles value={days} onChange={field.onChange} invalid={Boolean(error)} />
                <Text className={`text-sm ${error ? 'text-error-700' : 'text-typography-700'}`}>
                  {error ??
                    (days.length
                      ? `Repeats ${repeatLabel({ recurrence, daysOfWeek: days })}`
                      : 'Pick the days it repeats.')}
                </Text>
              </VStack>
            );
          }}
        />
      ) : null}
    </VStack>
  );
}
