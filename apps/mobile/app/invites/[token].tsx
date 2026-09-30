import { useLocalSearchParams } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

/**
 * Deep link target: petwatch://invites/<token>
 * Expo Router maps the URL path to this file; no manual linking config needed.
 */
export default function AcceptInviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  return (
    <Box className="flex-1 items-center justify-center bg-background-0 p-6">
      <Heading>Invitation</Heading>
      <Text className="text-typography-500">token: {token}</Text>
    </Box>
  );
}
