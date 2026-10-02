import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { CareTaskPayload } from '@petwatch/shared';
import { useRefetchOnFocus } from '@/src/lib/use-refetch-on-focus';
import { careTasksApi } from './api';

export const careTaskKeys = {
  all: ['care-tasks'] as const,
  /** Every rule of every visible pet: the schedule's input. */
  schedule: () => [...careTaskKeys.all, 'schedule'] as const,
  pet: (petId: string) => [...careTaskKeys.all, 'pet', petId] as const,
};

/** A rule changed: the pet's routine and the schedule both derive from it. */
function invalidateTasks(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: careTaskKeys.all });
}

export function useSchedule() {
  const query = useQuery({ queryKey: careTaskKeys.schedule(), queryFn: careTasksApi.schedule });
  useRefetchOnFocus(query.refetch);
  return query;
}

export function usePetTasks(petId: string) {
  const query = useQuery({
    queryKey: careTaskKeys.pet(petId),
    queryFn: () => careTasksApi.listForPet(petId),
  });
  useRefetchOnFocus(query.refetch);
  return query;
}

export function useCreateTask(petId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CareTaskPayload) => careTasksApi.create(petId, input),
    onSuccess: () => invalidateTasks(queryClient),
  });
}

export function useReplaceTask(petId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CareTaskPayload) => careTasksApi.replace(petId, taskId, input),
    onSuccess: () => invalidateTasks(queryClient),
  });
}

export function useDeleteTask(petId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => careTasksApi.remove(petId, taskId),
    onSuccess: () => invalidateTasks(queryClient),
  });
}
