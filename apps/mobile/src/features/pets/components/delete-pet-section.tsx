import { Trash2 } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Button } from '@/src/design-system';

type DeletePetSectionProps = {
  petName: string;
  onDelete: () => void;
};

/** Bottom of the edit form: the destructive action, set apart and saying what it removes. */
export function DeletePetSection({ petName, onDelete }: DeletePetSectionProps) {
  return (
    <VStack className="mt-2 gap-2 border-t border-outline-100 pt-5">
      <Button
        label="Delete pet"
        icon={Trash2}
        action="negative"
        variant="outline"
        fullWidth
        onPress={onDelete}
        requiresNetwork="delete"
        testID="pet-form.delete"
      />
      <Text className="text-center text-sm text-typography-700">
        Removes {petName}&apos;s care routine and everyone&apos;s access.
      </Text>
    </VStack>
  );
}
