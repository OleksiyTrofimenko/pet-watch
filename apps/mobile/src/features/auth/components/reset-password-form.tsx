import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { VStack } from '@/components/ui/vstack';
import { resetPasswordSchema } from '@petwatch/shared';
import { Button, FormAlert, FormInput } from '@/src/design-system';
import { useApiSubmit } from '@/src/lib/form-errors';
import { AuthLayout } from './auth-layout';

// The password rule comes from the shared contract; "confirm" is a UI-only check.
const resetFormSchema = resetPasswordSchema
  .pick({ password: true })
  .extend({ confirmPassword: z.string() })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: "Passwords don't match.",
  });
type ResetFormValues = z.infer<typeof resetFormSchema>;

type ResetPasswordFormProps = {
  onSubmit: (password: string) => Promise<unknown>;
};

export function ResetPasswordForm({ onSubmit }: ResetPasswordFormProps) {
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const { submit, formError } = useApiSubmit(form, ['password'], (values) =>
    onSubmit(values.password),
  );

  return (
    <AuthLayout title="Choose a new password">
      {formError ? <FormAlert message={formError} testID="reset.alert" /> : null}
      <VStack className="gap-4">
        <FormInput
          control={form.control}
          name="password"
          label="New password"
          helperText="Use 8 or more characters."
          autoComplete="new-password"
          secureToggle
          testID="reset.password"
        />
        <FormInput
          control={form.control}
          name="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          secureToggle
          testID="reset.confirm"
        />
      </VStack>
      <Button
        label="Save new password"
        size="lg"
        fullWidth
        isLoading={form.formState.isSubmitting}
        onPress={() => void submit()}
        requiresNetwork="save your password"
        testID="reset.submit"
      />
    </AuthLayout>
  );
}
