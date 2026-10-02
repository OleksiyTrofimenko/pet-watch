import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  careTaskSchema,
  type CareTaskDto,
  type CareTaskInput,
  type CareTaskPayload,
} from '@petwatch/shared';
import { Button, FormAlert, FormInput, TimeField } from '@/src/design-system';
import { useApiSubmit } from '@/src/lib/form-errors';
import { RepeatField } from './repeat-field';
import { TypeChips } from './type-chips';

const FIELDS = ['type', 'title', 'notes', 'timeOfDay', 'recurrence', 'daysOfWeek'] as const;

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
      <TimeField control={form.control} name="timeOfDay" label="Time" testID="task-form.time" />
      <RepeatField control={form.control} />
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
