import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  CARE_TASK_TYPES,
  careTaskSchema,
  type CareTaskDto,
  type CareTaskInput,
  type CareTaskPayload,
} from '@petwatch/shared';
import {
  Button,
  Chip,
  FormAlert,
  FormInput,
  SegmentedControl,
  TimeField,
} from '@/src/design-system';
import { useApiSubmit } from '@/src/lib/form-errors';
import { formatTime, parseTime, repeatLabel } from '../format';
import { TASK_TYPE_VISUALS } from '../task-type-visuals';
import { DayToggles } from './day-toggles';

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
          render={({ field }) => (
            <HStack className="flex-wrap gap-2">
              {CARE_TASK_TYPES.map((type) => {
                const visual = TASK_TYPE_VISUALS[type];
                return (
                  <Chip
                    key={type}
                    label={visual.label}
                    selected={field.value === type}
                    onPress={() => field.onChange(type)}
                    leading={
                      <Icon as={visual.icon} className="h-[18px] w-[18px] text-typography-700" />
                    }
                    selectedClassName={`border-2 ${visual.borderClassName} ${visual.badgeClassName}`}
                    selectedTextClassName={visual.textClassName}
                    testID={`task-form.type-${type}`}
                  />
                );
              })}
            </HStack>
          )}
        />
      </VStack>
      <FormInput
        control={form.control}
        name="title"
        label="Title"
        placeholder="e.g. Breakfast"
        isRequired
        testID="task-form.title"
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
        testID="task-form.save"
      />
    </VStack>
  );
}
