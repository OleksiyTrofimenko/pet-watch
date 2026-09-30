import { useLocalSearchParams } from 'expo-router';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Screen } from '@/src/design-system';

/**
 * Deep link target: petwatch://invites/<token>
 * Expo Router maps the URL path to this file; no manual linking config needed.
 */
export default function AcceptInviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  return (
    <Screen>
      <Heading>Invitation</Heading>
      <Text className="text-typography-500">token: {token}</Text>
    </Screen>
  );
}
