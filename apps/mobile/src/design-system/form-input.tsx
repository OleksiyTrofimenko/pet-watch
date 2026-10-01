import { useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react-native';
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
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';

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
  /** Password field with a 44×44 eye button that shows/hides the text. */
  secureToggle?: boolean;
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
  secureToggle = false,
  format = defaultFormat,
  parse,
  testID,
  ...inputProps
}: FormInputProps<T>) {
  const [revealed, setRevealed] = useState(false);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormControl isInvalid={Boolean(fieldState.error)} isRequired={isRequired}>
          <FormControlLabel>
            <FormControlLabelText>{label}</FormControlLabelText>
          </FormControlLabel>
          {/* testID goes on the wrapper: iOS exposes field + wrapper as one element with the wrapper's id. */}
          <Input
            testID={testID}
            className={inputProps.multiline ? 'h-auto min-h-24 items-start py-2' : undefined}
          >
            <InputField
              // Gluestack defaults to "Input Field"; screen readers should announce the field's label.
              aria-label={label}
              {...inputProps}
              // RHF focuses the first invalid field on submit through this ref.
              ref={field.ref}
              secureTextEntry={secureToggle ? !revealed : inputProps.secureTextEntry}
              value={format(field.value)}
              onChangeText={(text) => field.onChange(parse ? parse(text) : text)}
              onBlur={field.onBlur}
            />
            {secureToggle ? (
              <InputSlot
                onPress={() => setRevealed((value) => !value)}
                className="h-11 w-11 items-center justify-center"
                // InputSlot hides itself from assistive tech by default; this one is a real button.
                accessibilityElementsHidden={false}
                importantForAccessibility="yes"
                accessibilityRole="button"
                accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
                testID={testID ? `${testID}-toggle` : undefined}
              >
                <InputIcon as={revealed ? EyeOff : Eye} className="text-typography-700" />
              </InputSlot>
            ) : null}
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
