import { useLocalSearchParams, useRouter } from 'expo-router';
import { EmptyState, QueryView, RowSkeleton, Screen, ScreenHeader } from '@/src/design-system';
import { TaskForm } from '@/src/features/care-tasks/components/task-form';
import { usePetTasks, useReplaceTask } from '@/src/features/care-tasks/queries';

export default function EditTaskScreen() {
  const router = useRouter();
  const { petId, taskId } = useLocalSearchParams<{ petId: string; taskId: string }>();
  const tasks = usePetTasks(petId);
  const replace = useReplaceTask(petId, taskId);

  return (
    <Screen scroll>
      <ScreenHeader
        title="Edit task"
        leading={{ label: 'Cancel', onPress: () => router.back(), testID: 'task-form.cancel' }}
      />
      <QueryView query={tasks} loading={<RowSkeleton count={4} label="Loading task" />}>
        {(list) => {
          const task = list.find((t) => t.id === taskId);
          if (!task) return <EmptyState title="This task no longer exists" />;
          return (
            <TaskForm
              task={task}
              onSubmit={async (values) => {
                await replace.mutateAsync(values);
                router.back();
              }}
            />
          );
        }}
      </QueryView>
    </Screen>
  );
}
