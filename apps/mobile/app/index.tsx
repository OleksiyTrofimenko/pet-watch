import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

// Placeholder. Replaced by the auth redirect + (app)/(auth) route groups.
export default function Home() {
  return (
    <Box className="flex-1 items-center justify-center bg-background-0 p-6">
      <VStack space="md" className="items-center">
        <Heading size="2xl">PetWatch</Heading>
        <Text className="text-typography-500">Scaffold is running.</Text>
      </VStack>
    </Box>
  );
}
