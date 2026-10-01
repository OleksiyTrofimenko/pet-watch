import { useRouter } from 'expo-router';
import { Screen } from '@/src/design-system';
import { RegisterForm } from '@/src/features/auth/components/register-form';
import { useRegister } from '@/src/features/auth/queries';

export default function RegisterScreen() {
  const router = useRouter();
  const register = useRegister();

  return (
    <Screen keyboardAware>
      <RegisterForm
        onSubmit={register.mutateAsync}
        onLogin={(email) => router.replace({ pathname: '/login', params: email ? { email } : {} })}
      />
    </Screen>
  );
}
