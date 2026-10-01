import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button } from '@/src/design-system';

type AuthFooterProps = {
  prompt: string;
  actionLabel: string;
  onPress: () => void;
  testID?: string;
};

/** "New to PetWatch? Create an account": a prompt followed by a link-style button. */
export function AuthFooter({ prompt, actionLabel, onPress, testID }: AuthFooterProps) {
  return (
    <HStack className="flex-wrap items-center justify-center gap-0.5">
      <Text className="text-[15px] text-typography-700">{prompt}</Text>
      <Button variant="link" size="sm" label={actionLabel} onPress={onPress} testID={testID} />
    </HStack>
  );
}
