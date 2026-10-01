import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@petwatch/shared';
import { Button, FormAlert, FormInput } from '@/src/design-system';
import { useApiSubmit } from '@/src/lib/form-errors';
import { AuthFooter } from './auth-footer';
import { AuthLayout } from './auth-layout';

type ForgotPasswordFormProps = {
  defaultEmail?: string;
  onSubmit: (values: ForgotPasswordInput) => Promise<unknown>;
  onBackToLogin: () => void;
};

export function ForgotPasswordForm({
  defaultEmail,
  onSubmit,
  onBackToLogin,
}: ForgotPasswordFormProps) {
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: defaultEmail ?? '' },
  });
  const { submit, formError } = useApiSubmit(form, ['email'], onSubmit);

  return (
    <AuthLayout
      title="Reset your password"
      lead="Enter the email you signed up with. We'll send you a link to choose a new password."
      footer={
        <AuthFooter
          prompt="Remembered it?"
          actionLabel="Back to log in"
          onPress={onBackToLogin}
          testID="forgot.login-link"
        />
      }
    >
      {formError ? <FormAlert message={formError} testID="forgot.alert" /> : null}
      <FormInput
        control={form.control}
        name="email"
        label="Email"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        testID="forgot.email"
      />
      <Button
        label="Send reset link"
        size="lg"
        fullWidth
        isLoading={form.formState.isSubmitting}
        onPress={() => void submit()}
        requiresNetwork="send the link"
        testID="forgot.submit"
      />
    </AuthLayout>
  );
}
