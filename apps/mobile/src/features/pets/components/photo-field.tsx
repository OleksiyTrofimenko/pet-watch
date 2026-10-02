import { useState } from 'react';
import { Camera, ImageIcon, Trash2 } from 'lucide-react-native';
import type { Species } from '@petwatch/shared';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { OptionSheet, type SheetOption } from '@/src/design-system';
import { PhotoPlaceholder } from './photo-placeholder';
import { PhotoPreview } from './photo-preview';

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
          <PhotoPreview uri={uri} species={species} name={name || 'your pet'} progress={progress} />
        ) : (
          <PhotoPlaceholder />
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
