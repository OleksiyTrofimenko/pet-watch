import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { AUTH_ERROR_CODES, registerSchema, type RegisterInput } from '@petwatch/shared';
import { Button, FormAlert, FormInput } from '@/src/design-system';
import { useApiSubmit } from '@/src/lib/form-errors';
import { AuthFooter } from './auth-footer';
import { AuthLayout } from './auth-layout';

type RegisterFormProps = {
  onSubmit: (values: RegisterInput) => Promise<unknown>;
  /** "Log in instead" (after EMAIL_TAKEN) passes the email so login can pre-fill it. */
  onLogin: (email?: string) => void;
};

export function RegisterForm({ onSubmit, onLogin }: RegisterFormProps) {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  });
  const { submit, formError } = useApiSubmit(form, ['email', 'password'], onSubmit, {
    [AUTH_ERROR_CODES.EMAIL_TAKEN]: 'email',
  });
  const emailTaken = form.formState.errors.email?.type === AUTH_ERROR_CODES.EMAIL_TAKEN;

  return (
    <AuthLayout
      title="Create your account"
      lead="Set up care routines and share them with people you trust."
      footer={
        <AuthFooter
          prompt="Already have an account?"
          actionLabel="Log in"
          onPress={() => onLogin()}
          testID="register.login-link"
        />
      }
    >
      {formError ? <FormAlert message={formError} testID="register.alert" /> : null}
      <VStack className="gap-4">
        <VStack className="gap-1">
          <FormInput
            control={form.control}
            name="email"
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            testID="register.email"
          />
          {emailTaken ? (
            <HStack className="ml-4">
              <Button
                variant="link"
                size="sm"
                label="Log in instead"
                onPress={() => onLogin(form.getValues('email'))}
                testID="register.login-instead"
              />
            </HStack>
          ) : null}
        </VStack>
        <FormInput
          control={form.control}
          name="password"
          label="Password"
          helperText="Use 8 or more characters."
          autoComplete="new-password"
          secureToggle
          testID="register.password"
        />
      </VStack>
      <Button
        label="Create account"
        size="lg"
        fullWidth
        isLoading={form.formState.isSubmitting}
        onPress={() => void submit()}
        testID="register.submit"
      />
    </AuthLayout>
  );
}
