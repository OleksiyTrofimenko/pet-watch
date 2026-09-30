import type { ComponentProps } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';

type NativeInputProps = Omit<
  ComponentProps<typeof InputField>,
  'value' | 'onChangeText' | 'onBlur'
>;

type FormInputProps<T extends FieldValues> = NativeInputProps & {
  control: Control<T>;
  name: Path<T>;
  label: string;
  helperText?: string;
  isRequired?: boolean;
  /** Map between the form value and the text shown, e.g. numbers: String(v) / Number(text). */
  format?: (value: unknown) => string;
  parse?: (text: string) => unknown;
};

const defaultFormat = (value: unknown): string =>
  value === undefined || value === null ? '' : String(value);

/**
 * The only way screens render a text field: label, helper, and the RHF/Zod error in one place.
 * Server-side `fieldErrors` set via `setError` show up here too.
 */
export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  helperText,
  isRequired,
  format = defaultFormat,
  parse,
  ...inputProps
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormControl isInvalid={Boolean(fieldState.error)} isRequired={isRequired}>
          <FormControlLabel>
            <FormControlLabelText>{label}</FormControlLabelText>
          </FormControlLabel>
          <Input>
            <InputField
              {...inputProps}
              value={format(field.value)}
              onChangeText={(text) => field.onChange(parse ? parse(text) : text)}
              onBlur={field.onBlur}
            />
          </Input>
          {fieldState.error?.message ? (
            <FormControlError>
              <FormControlErrorText>{fieldState.error.message}</FormControlErrorText>
            </FormControlError>
          ) : helperText ? (
            <FormControlHelper>
              <FormControlHelperText>{helperText}</FormControlHelperText>
            </FormControlHelper>
          ) : null}
        </FormControl>
      )}
    />
  );
}
