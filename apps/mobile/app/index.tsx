import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Screen } from '@/src/design-system';

// Placeholder. Replaced by the auth redirect + (app)/(auth) route groups.
export default function Home() {
  return (
    <Screen>
      <Heading size="2xl" testID="home.title">
        PetWatch
      </Heading>
      <Text className="text-typography-500">Scaffold is running.</Text>
    </Screen>
  );
}
