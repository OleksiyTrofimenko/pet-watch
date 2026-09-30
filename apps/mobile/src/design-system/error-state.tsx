import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <VStack space="sm" className="flex-1 items-center justify-center px-6 py-10">
      <Heading size="md">Something went wrong</Heading>
      <Text className="text-center text-typography-500">{message}</Text>
      {onRetry ? (
        <Button variant="outline" className="mt-2" onPress={onRetry}>
          <ButtonText>Try again</ButtonText>
        </Button>
      ) : null}
    </VStack>
  );
}
