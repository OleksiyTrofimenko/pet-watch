import { Image } from 'expo-image';
import { PawPrint } from 'lucide-react-native';
import type { Species } from '@petwatch/shared';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { SPECIES_LABEL } from '../species-visuals';

type Size = 'card' | 'large';

const SIZE: Record<Size, { box: string; icon: string; showLabel: boolean }> = {
  card: { box: 'h-[72px] w-[72px] rounded', icon: 'h-[26px] w-[26px]', showLabel: true },
  large: { box: 'h-32 w-32 rounded-lg', icon: 'h-12 w-12', showLabel: true },
};

type PetPhotoProps = {
  uri: string | null;
  species: Species;
  name: string;
  size?: Size;
};

/** The pet's photo, or a species placeholder (paw + "Cat") so a card never looks broken. */
export function PetPhoto({ uri, species, name, size = 'card' }: PetPhotoProps) {
  const visual = SIZE[size];
  if (uri) {
    return (
      // expo-image doesn't take className; the Box sizes and clips it.
      <Box className={`overflow-hidden bg-secondary-100 ${visual.box}`}>
        <Image
          source={{ uri }}
          accessibilityLabel={`Photo of ${name}`}
          contentFit="cover"
          transition={150}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
    );
  }
  return (
    <Box
      className={`items-center justify-center gap-1 bg-secondary-100 ${visual.box}`}
      accessibilityLabel={`${name} has no photo`}
    >
      <Icon as={PawPrint} className={`text-secondary-400 ${visual.icon}`} />
      {visual.showLabel ? (
        <Text className="text-xs font-semibold text-secondary-700">{SPECIES_LABEL[species]}</Text>
      ) : null}
    </Box>
  );
}
