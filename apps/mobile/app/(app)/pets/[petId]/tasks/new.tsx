import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Screen, ScreenHeader } from '@/src/design-system';
import { TaskForm } from '@/src/features/care-tasks/components/task-form';
import { useCreateTask } from '@/src/features/care-tasks/queries';
import { usePet } from '@/src/features/pets/queries';

export default function NewTaskScreen() {
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const pet = usePet(petId);
  const create = useCreateTask(petId);

  return (
    <Screen keyboardAware>
      <ScreenHeader
        title="New task"
        leading={{ label: 'Cancel', onPress: () => router.back(), testID: 'task-form.cancel' }}
      />
      {pet.data ? (
        <Text className="-mt-2 text-center text-typography-700">For {pet.data.name}</Text>
      ) : null}
      <TaskForm
        onSubmit={async (values) => {
          await create.mutateAsync(values);
          router.back();
        }}
      />
    </Screen>
  );
}
