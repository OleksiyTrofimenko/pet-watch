import { useState } from 'react';
import { ChevronDown } from 'lucide-react-native';
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
import { OptionSheet } from './option-sheet';

type SelectFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  options: readonly { value: string; label: string }[];
  testID?: string;
};

/** A form field that opens an OptionSheet: for short fixed lists (species, task type). */
export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  testID,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selected = options.find((option) => option.value === field.value);
        return (
          <FormControl isInvalid={Boolean(fieldState.error)}>
            <FormControlLabel>
              <FormControlLabelText>{label}</FormControlLabelText>
            </FormControlLabel>
            <Pressable
              onPress={() => setOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
              testID={testID}
              className={`min-h-12 justify-center rounded border bg-background-0 px-3 ${
                fieldState.error ? 'border-2 border-error-600' : 'border-outline-200'
              }`}
            >
              <HStack className="items-center justify-between">
                <Text className={selected ? 'text-typography-900' : 'text-typography-500'}>
                  {selected?.label ?? placeholder}
                </Text>
                <Icon as={ChevronDown} className="text-typography-700" />
              </HStack>
            </Pressable>
            {fieldState.error?.message ? (
              <FormControlError>
                <FormControlErrorText>{fieldState.error.message}</FormControlErrorText>
              </FormControlError>
            ) : null}
            <OptionSheet
              isOpen={open}
              onClose={() => setOpen(false)}
              title={label}
              options={options.map((option) => ({
                label: option.label,
                onPress: () => field.onChange(option.value),
                testID: testID ? `${testID}-${option.value}` : undefined,
              }))}
            />
          </FormControl>
        );
      }}
    />
  );
}
