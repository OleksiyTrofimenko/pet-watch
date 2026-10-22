import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateInvitationInput } from '@petwatch/shared';
import { careTaskKeys } from '@/src/features/care-tasks/queries';
import { petKeys } from '@/src/features/pets/queries';
import { useRefetchOnFocus } from '@/src/lib/use-refetch-on-focus';
import { invitationsApi } from './api';

const invitationKeys = {
  watchers: (petId: string) => ['watchers', petId] as const,
  preview: (token: string) => ['invitation', token] as const,
};

export function useWatchers(petId: string, enabled: boolean) {
  const query = useQuery({
    queryKey: invitationKeys.watchers(petId),
    queryFn: () => invitationsApi.watchers(petId),
    enabled,
  });
  useRefetchOnFocus(query.refetch, enabled);
  return query;
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

/**
 * Drops the cached preview: reopening the link must ask the API (→ "declined"), not show the
 * old invite. The owner's list refetches on their side (D61).
 */
export function useDeclineInvitation(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => invitationsApi.decline(token),
    onSuccess: () => queryClient.removeQueries({ queryKey: invitationKeys.preview(token) }),
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
