import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { loginSchema, type LoginInput } from '@petwatch/shared';
import { Button, FormAlert, FormInput } from '@/src/design-system';
import { useApiSubmit } from '@/src/lib/form-errors';
import { AuthFooter } from './auth-footer';
import { AuthLayout } from './auth-layout';

type LoginFormProps = {
  defaultEmail?: string;
  onSubmit: (values: LoginInput) => Promise<unknown>;
  onForgotPassword: (email: string) => void;
  onRegister: () => void;
};

export function LoginForm({
  defaultEmail,
  onSubmit,
  onForgotPassword,
  onRegister,
}: LoginFormProps) {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail ?? '', password: '' },
  });
  const { submit, formError } = useApiSubmit(form, ['email', 'password'], onSubmit);

  return (
    <AuthLayout
      title="Welcome back"
      lead="Log in to see today's care routine."
      footer={
        <AuthFooter
          prompt="New to PetWatch?"
          actionLabel="Create an account"
          onPress={onRegister}
          testID="login.register-link"
        />
      }
    >
      {formError ? <FormAlert message={formError} testID="login.alert" /> : null}
      <VStack className="gap-4">
        <FormInput
          control={form.control}
          name="email"
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          testID="login.email"
        />
        <FormInput
          control={form.control}
          name="password"
          label="Password"
          placeholder="Your password"
          autoComplete="current-password"
          secureToggle
          testID="login.password"
        />
        <HStack className="-mt-2 justify-end">
          <Button
            variant="link"
            size="sm"
            label="Forgot password?"
            onPress={() => onForgotPassword(form.getValues('email'))}
            testID="login.forgot-link"
          />
        </HStack>
      </VStack>
      <Button
        label="Log in"
        size="lg"
        fullWidth
        isLoading={form.formState.isSubmitting}
        onPress={() => void submit()}
        testID="login.submit"
      />
    </AuthLayout>
  );
}
