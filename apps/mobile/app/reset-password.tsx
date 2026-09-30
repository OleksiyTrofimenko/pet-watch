import { useLocalSearchParams } from 'expo-router';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Screen } from '@/src/design-system';

/** Deep link target: petwatch://reset-password?token=<token> */
export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  return (
    <Screen>
      <Heading>Reset password</Heading>
      <Text className="text-typography-500">token: {token ?? 'missing'}</Text>
    </Screen>
  );
}
