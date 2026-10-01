import { useState } from 'react';
import { Camera, ImageIcon, Trash2 } from 'lucide-react-native';
import type { Species } from '@petwatch/shared';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { OptionSheet, type SheetOption } from '@/src/design-system';
import { PetPhoto } from './pet-photo';

type PhotoFieldProps = {
  name: string;
  species: Species;
  /** Local (just picked) or remote (presigned) photo. */
  uri: string | null;
  /** 0–1 while uploading. */
  progress: number | null;
  hasError: boolean;
  onTakePhoto: () => void;
  onChooseFromLibrary: () => void;
  onRemove: () => void;
};

/** Tap the photo → sheet: take / choose / remove (PetForm.dc.html). */
export function PhotoField(props: PhotoFieldProps) {
  const { name, species, uri, progress, hasError } = props;
  const [sheetOpen, setSheetOpen] = useState(false);
  const uploading = progress !== null;
  const options: SheetOption[] = [
    { label: 'Take photo', icon: Camera, onPress: props.onTakePhoto, testID: 'photo.camera' },
    {
      label: 'Choose from library',
      icon: ImageIcon,
      onPress: props.onChooseFromLibrary,
      testID: 'photo.library',
    },
    ...(uri
      ? [
          {
            label: 'Remove photo',
            icon: Trash2,
            tone: 'negative' as const,
            onPress: props.onRemove,
          },
        ]
      : []),
  ];
  const hint = uploading
    ? 'Keep the app open while it uploads.'
    : hasError
      ? 'Upload failed. Tap to try again.'
      : uri
        ? 'Tap to change photo'
        : 'Optional';

  return (
    <VStack className="items-center gap-2">
      <Pressable
        onPress={() => setSheetOpen(true)}
        disabled={uploading}
        accessibilityRole="button"
        accessibilityLabel={uri ? 'Change photo' : 'Add photo'}
        testID="pet-form.photo"
      >
        {uri ? (
          <Box className="relative">
            <PetPhoto uri={uri} species={species} name={name || 'your pet'} size="large" />
            {uploading ? (
              <Box className="absolute inset-0 items-center justify-center gap-2.5 rounded-lg bg-typography-900/60 p-4">
                <Text className="text-sm font-bold text-typography-0">
                  Uploading… {Math.round(progress * 100)}%
                </Text>
                <Box className="h-1.5 w-full overflow-hidden rounded-full bg-typography-0/30">
                  <Box
                    className="h-full rounded-full bg-typography-0"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </Box>
              </Box>
            ) : (
              <Box className="absolute -bottom-1.5 -right-1.5 h-10 w-10 items-center justify-center rounded-full border border-outline-100 bg-background-0">
                <Icon as={Camera} className="h-5 w-5 text-typography-900" />
              </Box>
            )}
          </Box>
        ) : (
          <Box className="h-32 w-32 items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-secondary-500 bg-background-0">
            <Icon as={Camera} className="h-7 w-7 text-typography-700" />
            <Text className="text-[15px] font-semibold text-typography-900">Add photo</Text>
          </Box>
        )}
      </Pressable>
      <Text className={`text-sm ${hasError ? 'text-error-700' : 'text-typography-700'}`}>
        {hint}
      </Text>
      <OptionSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={name ? `${name}'s photo` : 'Pet photo'}
        options={options}
      />
    </VStack>
  );
}
