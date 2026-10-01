import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/src/design-system';
import { LoginForm } from '@/src/features/auth/components/login-form';
import { useLogin } from '@/src/features/auth/queries';

export default function LoginScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const login = useLogin();

  return (
    <Screen keyboardAware>
      <LoginForm
        defaultEmail={email}
        onSubmit={login.mutateAsync}
        onForgotPassword={(current) =>
          router.push({ pathname: '/forgot-password', params: { email: current } })
        }
        onRegister={() => router.replace('/register')}
      />
    </Screen>
  );
}
