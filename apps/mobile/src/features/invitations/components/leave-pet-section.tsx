import { LogOut } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Button } from '@/src/design-system';

type LeavePetSectionProps = {
  petName: string;
  ownerEmail: string;
  onLeave: () => void;
};

/** Bottom of a watched pet (INV-7): the watcher's way out, set apart like "Delete pet". */
export function LeavePetSection({ petName, ownerEmail, onLeave }: LeavePetSectionProps) {
  return (
    <VStack className="gap-2 border-t border-outline-100 pt-5">
      <Button
        label="Stop watching"
        icon={LogOut}
        action="negative"
        variant="outline"
        fullWidth
        onPress={onLeave}
        requiresNetwork="stop watching"
        testID="pet.leave"
      />
      <Text className="text-center text-sm text-typography-700">
        You won&apos;t see {petName}&apos;s routine anymore. {ownerEmail} can invite you again.
      </Text>
    </VStack>
  );
}
