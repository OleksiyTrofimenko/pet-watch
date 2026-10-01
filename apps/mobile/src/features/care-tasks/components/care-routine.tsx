import { Plus } from 'lucide-react-native';
import type { CareTaskDto } from '@petwatch/shared';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Button } from '@/src/design-system';
import { RuleRow } from './rule-row';

type CareRoutineProps = {
  petName: string;
  tasks: CareTaskDto[];
  /** Owner actions; omitted for watchers. */
  owner?: {
    onAdd: () => void;
    onEdit: (task: CareTaskDto) => void;
    onDelete: (task: CareTaskDto) => void;
  };
};

/** The pet's rules on its detail screen ("Care routine · 4 tasks"). */
export function CareRoutine({ petName, tasks, owner }: CareRoutineProps) {
  return (
    <VStack className="gap-3">
      <HStack className="items-baseline justify-between">
        <Text className="text-lg font-bold text-typography-900">Care routine</Text>
        <Text className="text-sm text-typography-700">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </Text>
      </HStack>
      {tasks.length === 0 ? (
        <Text className="rounded-lg border border-dashed border-outline-200 p-4 text-typography-700">
          {owner
            ? `No routine yet. Add feeding, walks or medication so watchers know what to do.`
            : `${petName} has no routine yet.`}
        </Text>
      ) : (
        tasks.map((task) => (
          <RuleRow
            key={task.id}
            task={task}
            onEdit={owner ? () => owner.onEdit(task) : undefined}
            onDelete={owner ? () => owner.onDelete(task) : undefined}
          />
        ))
      )}
      {owner ? (
        <Button
          label="Add task"
          icon={Plus}
          variant="outline"
          fullWidth
          onPress={owner.onAdd}
          testID="pet.add-task"
        />
      ) : null}
    </VStack>
  );
}
