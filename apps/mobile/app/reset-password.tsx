import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AUTH_ERROR_CODES } from '@petwatch/shared';
import { Screen, useNotify } from '@/src/design-system';
import { LinkExpired } from '@/src/features/auth/components/link-expired';
import { ResetPasswordForm } from '@/src/features/auth/components/reset-password-form';
import { useResetPassword } from '@/src/features/auth/queries';
import { ApiError } from '@/src/lib/api-client';

/** Deep link target: petwatch://reset-password?token=<token> */
export default function ResetPasswordScreen() {
  const router = useRouter();
  const notify = useNotify();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const reset = useResetPassword();
  // Expiry is only known on submit; a link without a token is broken from the start.
  const [expired, setExpired] = useState(!token);

  const submit = async (password: string) => {
    try {
      await reset.mutateAsync({ token: token ?? '', password });
    } catch (error) {
      if (error instanceof ApiError && error.code === AUTH_ERROR_CODES.INVALID_RESET_TOKEN) {
        setExpired(true);
        return;
      }
      throw error;
    }
    // The reset signed the user in (new session); leave the signed-out screen behind.
    notify('Password updated');
    router.replace('/');
  };

  return (
    <Screen scroll>
      {expired ? (
        <LinkExpired
          onRequestNewLink={() => router.replace('/forgot-password')}
          onBackToLogin={() => router.replace('/login')}
        />
      ) : (
        <ResetPasswordForm onSubmit={submit} />
      )}
    </Screen>
  );
}
