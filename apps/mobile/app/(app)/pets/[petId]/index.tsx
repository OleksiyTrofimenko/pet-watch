import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pencil } from 'lucide-react-native';
import type { CareTaskDto } from '@petwatch/shared';
import { VStack } from '@/components/ui/vstack';
import {
  Button,
  ConfirmDialog,
  QueryView,
  Screen,
  ScreenHeader,
  useNotify,
} from '@/src/design-system';
import { CareRoutine } from '@/src/features/care-tasks/components/care-routine';
import { useDeleteTask, usePetTasks } from '@/src/features/care-tasks/queries';
import { PetDetails } from '@/src/features/pets/components/pet-details';
import { PetListSkeleton } from '@/src/features/pets/components/pet-list-skeleton';
import { usePet } from '@/src/features/pets/queries';

export default function PetScreen() {
  const router = useRouter();
  const notify = useNotify();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const pet = usePet(petId);
  const tasks = usePetTasks(petId);
  const deleteTask = useDeleteTask(petId);
  const [deleting, setDeleting] = useState<CareTaskDto | null>(null);
  const isOwner = pet.data?.role === 'OWNER';

  const confirmDelete = (task: CareTaskDto) =>
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        setDeleting(null);
        notify(`${task.title} was deleted`);
      },
    });

  return (
    <Screen scroll>
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
      <QueryView query={pet} loading={<PetListSkeleton />}>
        {(data) => (
          <VStack className="gap-6 pb-6">
            <PetDetails pet={data} />
            <QueryView query={tasks} loading={null}>
              {(list) => (
                <CareRoutine
                  petName={data.name}
                  tasks={list}
                  owner={
                    isOwner
                      ? {
                          onAdd: () =>
                            router.push({ pathname: '/pets/[petId]/tasks/new', params: { petId } }),
                          onEdit: (task) =>
                            router.push({
                              pathname: '/pets/[petId]/tasks/[taskId]/edit',
                              params: { petId, taskId: task.id },
                            }),
                          onDelete: setDeleting,
                        }
                      : undefined
                  }
                />
              )}
            </QueryView>
            <ConfirmDialog
              isOpen={deleting !== null}
              title={deleting ? `Delete ${deleting.title} from ${data.name}'s routine?` : ''}
              body="It disappears from everyone's schedule. This can't be undone."
              confirmLabel="Delete task"
              isLoading={deleteTask.isPending}
              onConfirm={() => deleting && confirmDelete(deleting)}
              onCancel={() => setDeleting(null)}
              testID="task-delete"
            />
          </VStack>
        )}
      </QueryView>
    </Screen>
  );
}
