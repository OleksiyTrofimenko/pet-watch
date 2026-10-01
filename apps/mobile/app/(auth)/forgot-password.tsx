import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/src/design-system';
import { CheckEmail } from '@/src/features/auth/components/check-email';
import { ForgotPasswordForm } from '@/src/features/auth/components/forgot-password-form';
import { useForgotPassword } from '@/src/features/auth/queries';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const forgot = useForgotPassword();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const backToLogin = () =>
    router.replace({ pathname: '/login', params: { email: sentTo ?? email } });

  return (
    <Screen keyboardAware>
      {sentTo ? (
        <CheckEmail
          email={sentTo}
          isResending={forgot.isPending}
          onResend={() => forgot.mutate({ email: sentTo })}
          onBackToLogin={backToLogin}
        />
      ) : (
        <ForgotPasswordForm
          defaultEmail={email}
          onSubmit={async (values) => {
            await forgot.mutateAsync(values);
            setSentTo(values.email);
          }}
          onBackToLogin={backToLogin}
        />
      )}
    </Screen>
  );
}
