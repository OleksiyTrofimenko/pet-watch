import { useRouter } from 'expo-router';
import type { CreatePetInput } from '@petwatch/shared';
import { Screen, ScreenHeader, useNotify } from '@/src/design-system';
import { PetForm } from '@/src/features/pets/components/pet-form';
import { PhotoPermissionDialog } from '@/src/features/pets/components/photo-permission-dialog';
import { PhotoField } from '@/src/features/pets/components/photo-field';
import { useCreatePet } from '@/src/features/pets/queries';
import { usePetPhoto } from '@/src/features/pets/use-pet-photo';

export default function NewPetScreen() {
  const router = useRouter();
  const notify = useNotify();
  const create = useCreatePet();
  // No pet id yet: the picked photo uploads after the pet is created.
  const photo = usePetPhoto(null);

  const submit = async (values: CreatePetInput) => {
    const pet = await create.mutateAsync(values);
    try {
      await photo.uploadTo(pet.id);
    } catch {
      notify(`${pet.name} was added, but the photo didn't upload. Try again from Edit.`, 'error');
    }
    router.replace({ pathname: '/pets/[petId]', params: { petId: pet.id } });
  };

  return (
    <Screen scroll>
      <ScreenHeader
        title="Add pet"
        leading={{ label: 'Cancel', onPress: () => router.back(), testID: 'pet-form.cancel' }}
      />
      <PetForm
        onSubmit={submit}
        photo={(name, species) => (
          <PhotoField
            name={name}
            species={species ?? 'OTHER'}
            uri={photo.localUri}
            progress={photo.upload.status === 'uploading' ? photo.upload.progress : null}
            hasError={photo.upload.status === 'error'}
            onTakePhoto={() => void photo.choose('camera')}
            onChooseFromLibrary={() => void photo.choose('library')}
            onRemove={() => void photo.remove()}
          />
        )}
      />
      <PhotoPermissionDialog
        source={photo.deniedSource}
        onOpenSettings={photo.openSettings}
        onCancel={photo.dismissDenied}
      />
    </Screen>
  );
}
