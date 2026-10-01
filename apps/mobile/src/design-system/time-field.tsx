import { useState } from 'react';
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

type TimeFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  /** minutes → "08:00" */
  format: (minutes: number) => string;
  /** "08:00" → minutes, or NaN while incomplete (the schema reports it). */
  parse: (text: string) => number;
  testID?: string;
};

/**
 * A 24-hour HH:MM field holding minutes since midnight. Keeps the typed text locally, so a
 * half-typed "8:" isn't wiped by re-formatting. (A native picker needs a native dependency.)
 */
export function TimeField<T extends FieldValues>({
  control,
  name,
  label,
  format,
  parse,
  testID,
}: TimeFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TimeInput
          value={typeof field.value === 'number' ? field.value : null}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          error={fieldState.error?.message}
          {...{ label, format, parse, testID }}
        />
      )}
    />
  );
}

type TimeInputProps = {
  value: number | null;
  onChange: (minutes: number) => void;
  onBlur: () => void;
  inputRef: (instance: unknown) => void;
  error?: string;
  label: string;
  format: (minutes: number) => string;
  parse: (text: string) => number;
  testID?: string;
};

function TimeInput({
  value,
  onChange,
  onBlur,
  inputRef,
  error,
  label,
  format,
  parse,
  testID,
}: TimeInputProps) {
  const [text, setText] = useState(value === null || Number.isNaN(value) ? '' : format(value));
  return (
    <FormControl isInvalid={Boolean(error)}>
      <FormControlLabel>
        <FormControlLabelText>{label}</FormControlLabelText>
      </FormControlLabel>
      <Input>
        <InputField
          ref={inputRef}
          value={text}
          placeholder="08:00"
          keyboardType="numbers-and-punctuation"
          maxLength={5}
          testID={testID}
          onChangeText={(next) => {
            setText(next);
            onChange(parse(next));
          }}
          onBlur={onBlur}
        />
      </Input>
      {error ? (
        <FormControlError>
          <FormControlErrorText>{error}</FormControlErrorText>
        </FormControlError>
      ) : (
        <FormControlHelper>
          <FormControlHelperText>24-hour time, e.g. 18:30</FormControlHelperText>
        </FormControlHelper>
      )}
    </FormControl>
  );
}
