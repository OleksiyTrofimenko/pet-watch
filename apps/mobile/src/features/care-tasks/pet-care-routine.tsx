import { useState } from 'react';
import type { CareTaskDto } from '@petwatch/shared';
import { ConfirmDialog, QueryView, RowSkeleton, useNotify } from '@/src/design-system';
import { CareRoutine } from './components/care-routine';
import { useDeleteTask, usePetTasks } from './queries';

type PetCareRoutineProps = {
  petId: string;
  petName: string;
  /** Owner navigation; omitted for watchers (read-only routine). */
  owner?: {
    onAdd: () => void;
    onEdit: (task: CareTaskDto) => void;
  };
};

/** The Care routine block on a pet: list, and for the owner delete with confirmation. */
export function PetCareRoutine({ petId, petName, owner }: PetCareRoutineProps) {
  const notify = useNotify();
  const tasks = usePetTasks(petId);
  const deleteTask = useDeleteTask(petId);
  const [deleting, setDeleting] = useState<CareTaskDto | null>(null);

  const confirmDelete = (task: CareTaskDto) =>
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        setDeleting(null);
        notify(`${task.title} was deleted`);
      },
    });

  return (
    <>
      <QueryView query={tasks} loading={<RowSkeleton label="Loading care routine" />}>
        {(list) => (
          <CareRoutine
            petName={petName}
            tasks={list}
            owner={owner ? { ...owner, onDelete: setDeleting } : undefined}
          />
        )}
      </QueryView>
      <ConfirmDialog
        requiresNetwork="delete"
        isOpen={deleting !== null}
        title={deleting ? `Delete ${deleting.title} from ${petName}'s routine?` : ''}
        body="It disappears from everyone's schedule. This can't be undone."
        confirmLabel="Delete task"
        isLoading={deleteTask.isPending}
        onConfirm={() => deleting && confirmDelete(deleting)}
        onCancel={() => setDeleting(null)}
        testID="task-delete"
      />
    </>
  );
}
