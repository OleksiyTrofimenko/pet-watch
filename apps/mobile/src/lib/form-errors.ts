import { useState } from 'react';
import type { FieldValues, Path, UseFormReturn, UseFormSetError } from 'react-hook-form';
import { ApiError } from './api-client';

/** Error codes that belong to one field, e.g. { EMAIL_TAKEN: 'email' }. */
export type CodeFields<T extends FieldValues> = Partial<Record<string, Path<T>>>;

/**
 * Puts an ApiError where the user will see it: `fieldErrors` (and codes mapped in `codeFields`)
 * on their inputs via setError, so server and client validation look the same. Returns the
 * form-level message for anything else (wrong credentials, offline…), or null when every
 * error landed on a field.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
  codeFields: CodeFields<T> = {},
): string | null {
  if (!(error instanceof ApiError)) return 'Something went wrong. Please try again.';

  const codeField = codeFields[error.code];
  if (codeField) {
    setError(codeField, { type: error.code, message: error.message }, { shouldFocus: true });
    return null;
  }

  let onField = false;
  for (const [key, message] of Object.entries(error.fieldErrors ?? {})) {
    const field = fields.find((name) => name === key);
    if (field) {
      setError(field, { type: 'server', message });
      onField = true;
    }
  }
  return onField ? null : error.message;
}

/**
 * handleSubmit for forms backed by an API call: validates with the form's resolver, awaits
 * `onSubmit`, and routes a rejection through applyServerErrors. `formError` feeds a FormAlert.
 */
export function useApiSubmit<T extends FieldValues>(
  form: UseFormReturn<T>,
  fields: readonly Path<T>[],
  onSubmit: (values: T) => Promise<unknown>,
  codeFields?: CodeFields<T>,
) {
  const [formError, setFormError] = useState<string | null>(null);
  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setFormError(applyServerErrors(error, form.setError, fields, codeFields));
    }
  });
  return { submit, formError };
}
