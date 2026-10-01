import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pencil } from 'lucide-react-native';
import { Button, QueryView, Screen, ScreenHeader } from '@/src/design-system';
import { PetDetails } from '@/src/features/pets/components/pet-details';
import { PetListSkeleton } from '@/src/features/pets/components/pet-list-skeleton';
import { usePet } from '@/src/features/pets/queries';

export default function PetScreen() {
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const pet = usePet(petId);

  return (
    <Screen scroll>
      <ScreenHeader
        leading={{ label: 'Back', onPress: () => router.back(), testID: 'pet.back' }}
        trailing={
          pet.data?.role === 'OWNER' ? (
            <Button
              label="Edit pet"
              variant="link"
              size="sm"
              icon={Pencil}
              onPress={() => router.push({ pathname: '/pets/[petId]/edit', params: { petId } })}
              testID="pet.edit"
            />
          ) : null
        }
      />
      <QueryView query={pet} loading={<PetListSkeleton />}>
        {(data) => <PetDetails pet={data} />}
      </QueryView>
    </Screen>
  );
}
