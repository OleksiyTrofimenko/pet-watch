import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pencil } from 'lucide-react-native';
import { VStack } from '@/components/ui/vstack';
import { Button, QueryView, Screen, ScreenHeader } from '@/src/design-system';
import { PetCareRoutine } from '@/src/features/care-tasks/pet-care-routine';
import { PetWatchers } from '@/src/features/invitations/pet-watchers';
import { PetDetails } from '@/src/features/pets/components/pet-details';
import { PetDetailSkeleton } from '@/src/features/pets/components/pet-detail-skeleton';
import { petUnavailable } from '@/src/features/pets/pet-unavailable';
import { usePet } from '@/src/features/pets/queries';
import { useRefreshScreen } from '@/src/lib/use-refresh-screen';

/** A pet: details, care routine and (owner only) watchers. Watchers get a read-only view. */
export default function PetScreen() {
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const pet = usePet(petId);
  const refresh = useRefreshScreen();
  const isOwner = pet.data?.role === 'OWNER';

  const ownerActions = {
    onAdd: () => router.push({ pathname: '/pets/[petId]/tasks/new', params: { petId } }),
    onEdit: (task: { id: string }) =>
      router.push({
        pathname: '/pets/[petId]/tasks/[taskId]/edit',
        params: { petId, taskId: task.id },
      }),
  };

  return (
    <Screen scroll onRefresh={refresh}>
      <ScreenHeader
        leading={{ label: 'Back', onPress: () => router.back(), testID: 'pet.back' }}
        trailing={
          isOwner ? (
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
      <QueryView
        query={pet}
        loading={<PetDetailSkeleton />}
        renderError={(error) => petUnavailable(error, () => router.dismissTo('/pets'))}
      >
        {(data) => (
          <VStack className="gap-6 pb-6">
            <PetDetails pet={data} />
            <PetCareRoutine
              petId={petId}
              petName={data.name}
              owner={isOwner ? ownerActions : undefined}
            />
            {isOwner ? <PetWatchers petId={petId} petName={data.name} /> : null}
          </VStack>
        )}
      </QueryView>
    </Screen>
  );
}
