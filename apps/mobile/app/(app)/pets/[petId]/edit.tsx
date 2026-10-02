import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { CreatePetInput } from '@petwatch/shared';
import { ConfirmDialog, QueryView, Screen, ScreenHeader, useNotify } from '@/src/design-system';
import { PetForm } from '@/src/features/pets/components/pet-form';
import { PetListSkeleton } from '@/src/features/pets/components/pet-list-skeleton';
import { PetPhotoPicker } from '@/src/features/pets/pet-photo-picker';
import { useDeletePet, usePet, useUpdatePet } from '@/src/features/pets/queries';
import { usePetPhoto } from '@/src/features/pets/use-pet-photo';

export default function EditPetScreen() {
  const router = useRouter();
  const notify = useNotify();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const pet = usePet(petId);
  const update = useUpdatePet(petId);
  const remove = useDeletePet(petId);
  // The pet exists, so a picked photo uploads straight away.
  const photo = usePetPhoto(petId);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const save = async (values: CreatePetInput) => {
    await update.mutateAsync(values);
    router.back();
  };

  const deletePet = (name: string) =>
    remove.mutate(undefined, {
      onSuccess: () => {
        setConfirmingDelete(false);
        notify(`${name} was deleted`);
        router.dismissTo('/pets');
      },
    });

  return (
    <Screen keyboardAware>
      <QueryView query={pet} loading={<PetListSkeleton />}>
        {(data) => (
          <>
            <ScreenHeader
              title={`Edit ${data.name}`}
              leading={{ label: 'Cancel', onPress: () => router.back(), testID: 'pet-form.cancel' }}
            />
            <PetForm
              pet={data}
              onSubmit={save}
              saveDisabledReason={
                photo.isUploading ? 'Save is available once the photo has uploaded.' : undefined
              }
              onDelete={() => setConfirmingDelete(true)}
              photo={(name, species) => (
                <PetPhotoPicker
                  photo={photo}
                  name={name}
                  species={species ?? data.species}
                  savedUri={data.photoUrl}
                />
              )}
            />
            <ConfirmDialog
              requiresNetwork="delete"
              isOpen={confirmingDelete}
              title={`Delete ${data.name}?`}
              body={`${data.name}'s care routine will be deleted and everyone watching loses access. This can't be undone.`}
              confirmLabel="Delete pet"
              isLoading={remove.isPending}
              onConfirm={() => deletePet(data.name)}
              onCancel={() => setConfirmingDelete(false)}
              testID="pet-delete"
            />
          </>
        )}
      </QueryView>
    </Screen>
  );
}
