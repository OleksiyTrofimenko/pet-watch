import { useRouter } from 'expo-router';
import { PawPrint, Plus } from 'lucide-react-native';
import { Heading } from '@/components/ui/heading';
import { EmptyState, Fab, QueryView, Screen } from '@/src/design-system';
import { PetListSkeleton } from '@/src/features/pets/components/pet-list-skeleton';
import { PetSections } from '@/src/features/pets/components/pet-sections';
import { usePets } from '@/src/features/pets/queries';

export default function PetsScreen() {
  const router = useRouter();
  const pets = usePets();
  const addPet = () => router.push('/pets/new');
  // One primary action: the Fab hides while the empty state's own button is on screen.
  const hasPets = (pets.data?.length ?? 0) > 0;

  return (
    <Screen
      scroll
      floating={
        hasPets ? <Fab label="Add pet" icon={Plus} onPress={addPet} testID="pets.add" /> : null
      }
    >
      <Heading className="text-[32px] font-semibold leading-[38px]" testID="pets.title">
        Pets
      </Heading>
      <QueryView
        query={pets}
        loading={<PetListSkeleton />}
        isEmpty={(list) => list.length === 0}
        empty={
          <EmptyState
            icon={PawPrint}
            title="No pets yet"
            description="Add a pet to set up its care routine, then invite someone to look after it."
            action={{ label: 'Add pet', onPress: addPet }}
          />
        }
      >
        {(list) => (
          <PetSections
            pets={list}
            onOpen={(pet) => router.push({ pathname: '/pets/[petId]', params: { petId: pet.id } })}
          />
        )}
      </QueryView>
    </Screen>
  );
}
