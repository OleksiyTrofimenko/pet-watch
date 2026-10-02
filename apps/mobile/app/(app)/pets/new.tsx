import { useRouter } from 'expo-router';
import type { CreatePetInput } from '@petwatch/shared';
import { Screen, ScreenHeader, useNotify } from '@/src/design-system';
import { PetForm } from '@/src/features/pets/components/pet-form';
import { PetPhotoPicker } from '@/src/features/pets/pet-photo-picker';
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
    <Screen keyboardAware>
      <ScreenHeader
        title="Add pet"
        leading={{ label: 'Cancel', onPress: () => router.back(), testID: 'pet-form.cancel' }}
      />
      <PetForm
        onSubmit={submit}
        photo={(name, species) => (
          <PetPhotoPicker photo={photo} name={name} species={species ?? 'OTHER'} />
        )}
      />
    </Screen>
  );
}
