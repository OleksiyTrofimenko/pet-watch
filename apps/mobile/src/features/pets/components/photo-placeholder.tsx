import { Camera } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

/** The dashed "Add photo" box shown before a photo is picked. */
export function PhotoPlaceholder() {
  return (
    <Box className="h-32 w-32 items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-secondary-500 bg-background-0">
      <Icon as={Camera} className="h-7 w-7 text-typography-700" />
      <Text className="text-[15px] font-semibold text-typography-900">Add photo</Text>
    </Box>
  );
}
