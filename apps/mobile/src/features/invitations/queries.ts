import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateInvitationInput } from '@petwatch/shared';
import { careTaskKeys } from '@/src/features/care-tasks/queries';
import { petKeys } from '@/src/features/pets/queries';
import { invitationsApi } from './api';

export const invitationKeys = {
  watchers: (petId: string) => ['watchers', petId] as const,
  preview: (token: string) => ['invitation', token] as const,
};

export function useWatchers(petId: string, enabled: boolean) {
  return useQuery({
    queryKey: invitationKeys.watchers(petId),
    queryFn: () => invitationsApi.watchers(petId),
    enabled,
  });
}

/** Watchers changed: the list (pending rows) and the pet card's watcher count. */
function useInvalidateWatchers(petId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: invitationKeys.watchers(petId) });
    void queryClient.invalidateQueries({ queryKey: petKeys.all });
  };
}

export function useInvite(petId: string) {
  const invalidate = useInvalidateWatchers(petId);
  return useMutation({
    mutationFn: (input: CreateInvitationInput) => invitationsApi.invite(petId, input),
    onSuccess: invalidate,
  });
}

export function useRevokeWatcher(petId: string) {
  const invalidate = useInvalidateWatchers(petId);
  return useMutation({
    mutationFn: (userId: string) => invitationsApi.revokeWatcher(petId, userId),
    onSuccess: invalidate,
  });
}

export function useCancelInvitation(petId: string) {
  const invalidate = useInvalidateWatchers(petId);
  return useMutation({
    mutationFn: (invitationId: string) => invitationsApi.cancelInvitation(petId, invitationId),
    onSuccess: invalidate,
  });
}

/** Errors are screen states (expired, cancelled…), not transient: never retry them. */
export function useInvitationPreview(token: string) {
  return useQuery({
    queryKey: invitationKeys.preview(token),
    queryFn: () => invitationsApi.preview(token),
    retry: false,
  });
}

/** Accepting adds a pet to "Pets I'm watching" and its tasks to the schedule. */
export function useAcceptInvitation(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => invitationsApi.accept(token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: petKeys.all });
      void queryClient.invalidateQueries({ queryKey: careTaskKeys.all });
    },
  });
}
