import { useLocalSearchParams } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

/** Deep link target: petwatch://reset-password?token=<token> */
export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  return (
    <Box className="flex-1 items-center justify-center bg-background-0 p-6">
      <Heading>Reset password</Heading>
      <Text className="text-typography-500">token: {token ?? 'missing'}</Text>
    </Box>
  );
}
