import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';
import { Platform } from 'react-native';
import { KeyboardController } from 'react-native-keyboard-controller';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { dateToMinutes, formatTime, minutesToDate } from '@/src/lib/time-of-day';
import { useTokenColor } from './token-color';

type TimeFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  testID?: string;
};

/**
 * A time of day held as minutes since midnight, picked with the system time picker: compact
 * inline on iOS, the clock dialog on Android. 24-hour vs 12-hour follows the device locale.
 * Opening it closes the text keyboard, which would otherwise cover the rest of the form.
 */
export function TimeField<T extends FieldValues>({
  control,
  name,
  label,
  testID,
}: TimeFieldProps<T>) {
  const accent = useTokenColor('primary-600');
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const minutes = typeof field.value === 'number' ? field.value : 0;
        const pick = (date: Date) => {
          field.onChange(dateToMinutes(date));
          field.onBlur();
        };
        return (
          <FormControl isInvalid={Boolean(fieldState.error)}>
            <FormControlLabel>
              <FormControlLabelText>{label}</FormControlLabelText>
            </FormControlLabel>
            {Platform.OS === 'ios' ? (
              <HStack
                className="min-h-12 items-center"
                onTouchStart={() => void KeyboardController.dismiss()}
              >
                <DateTimePicker
                  mode="time"
                  display="compact"
                  value={minutesToDate(minutes)}
                  onValueChange={(_event, date) => pick(date)}
                  accentColor={accent}
                  accessibilityLabel={label}
                  testID={testID}
                />
              </HStack>
            ) : (
              <Pressable
                onPress={() => {
                  void KeyboardController.dismiss();
                  DateTimePickerAndroid.open({
                    mode: 'time',
                    value: minutesToDate(minutes),
                    onValueChange: (_event, date) => pick(date),
                    onDismiss: field.onBlur,
                  });
                }}
                accessibilityRole="button"
                accessibilityLabel={`${label}: ${formatTime(minutes)}`}
                testID={testID}
                className={`min-h-12 justify-center rounded border bg-background-0 px-3 ${
                  fieldState.error ? 'border-2 border-error-600' : 'border-outline-200'
                }`}
              >
                <HStack className="items-center justify-between">
                  <Text className="text-typography-900">{formatTime(minutes)}</Text>
                  <Icon as={Clock} className="text-typography-700" />
                </HStack>
              </Pressable>
            )}
            {fieldState.error?.message ? (
              <FormControlError>
                <FormControlErrorText>{fieldState.error.message}</FormControlErrorText>
              </FormControlError>
            ) : null}
          </FormControl>
        );
      }}
    />
  );
}
