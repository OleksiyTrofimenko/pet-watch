import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  careTaskSchema,
  type CareTaskDto,
  type CareTaskInput,
  type CareTaskPayload,
} from '@petwatch/shared';
import { Button, FormAlert, FormInput, SegmentedControl, TimeField } from '@/src/design-system';
import { useApiSubmit } from '@/src/lib/form-errors';
import { formatTime, parseTime, repeatLabel } from '../format';
import { DayToggles } from './day-toggles';
import { TypeChips } from './type-chips';

const FIELDS = ['type', 'title', 'notes', 'timeOfDay', 'recurrence', 'daysOfWeek'] as const;
const REPEAT_OPTIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
] as const;

type TaskFormProps = {
  /** Edit mode when set. */
  task?: CareTaskDto;
  onSubmit: (values: CareTaskPayload) => Promise<unknown>;
};

/** Type chips, title, time, Daily|Weekly with day toggles, notes (TaskForm.dc.html). */
export function TaskForm({ task, onSubmit }: TaskFormProps) {
  const form = useForm<CareTaskInput, unknown, CareTaskPayload>({
    resolver: zodResolver(careTaskSchema),
    defaultValues: {
      type: task?.type ?? 'FEEDING',
      title: task?.title ?? '',
      notes: task?.notes ?? '',
      timeOfDay: task?.timeOfDay ?? 480,
      recurrence: task?.recurrence ?? 'DAILY',
      daysOfWeek: task?.daysOfWeek ?? [],
    },
  });
  const { submit, formError } = useApiSubmit(form, FIELDS, onSubmit);
  const [recurrence, daysOfWeek] = useWatch({
    control: form.control,
    name: ['recurrence', 'daysOfWeek'],
  });
  const daysError = form.formState.errors.daysOfWeek?.message;

  return (
    <VStack className="gap-5 pb-4">
      {formError ? <FormAlert message={formError} testID="task-form.alert" /> : null}
      <VStack className="gap-2">
        <Text className="font-semibold text-typography-900">Type</Text>
        <Controller
          control={form.control}
          name="type"
          render={({ field }) => <TypeChips value={field.value} onChange={field.onChange} />}
        />
      </VStack>
      <FormInput
        control={form.control}
        name="title"
        label="Title"
        placeholder="e.g. Breakfast"
        isRequired
        testID="task-form.title"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => form.setFocus('notes')}
      />
      <TimeField
        control={form.control}
        name="timeOfDay"
        label="Time"
        format={formatTime}
        parse={parseTime}
        testID="task-form.time"
      />
      <VStack className="gap-3">
        <Text className="font-semibold text-typography-900">Repeat</Text>
        <Controller
          control={form.control}
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
          <VStack className="gap-2">
            <Controller
              control={form.control}
              name="daysOfWeek"
              render={({ field }) => (
                <DayToggles
                  value={field.value ?? []}
                  onChange={field.onChange}
                  invalid={Boolean(daysError)}
                />
              )}
            />
            <Text className={`text-sm ${daysError ? 'text-error-700' : 'text-typography-700'}`}>
              {daysError ??
                (daysOfWeek?.length
                  ? `Repeats ${repeatLabel({ recurrence, daysOfWeek })}`
                  : 'Pick the days it repeats.')}
            </Text>
          </VStack>
        ) : null}
      </VStack>
      <FormInput
        control={form.control}
        name="notes"
        label="Notes (optional)"
        placeholder="e.g. 1 cup dry food, fresh water"
        multiline
        testID="task-form.notes"
      />
      <Button
        label={task ? 'Save changes' : 'Add task'}
        size="lg"
        fullWidth
        isLoading={form.formState.isSubmitting}
        onPress={() => void submit()}
        requiresNetwork="save"
        testID="task-form.save"
      />
    </VStack>
  );
}
