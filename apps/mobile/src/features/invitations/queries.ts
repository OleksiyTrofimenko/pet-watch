import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PET_ERROR_CODES, type CreateInvitationInput, type PetDto } from '@petwatch/shared';
import { careTaskKeys } from '@/src/features/care-tasks/queries';
import { petKeys } from '@/src/features/pets/queries';
import { ApiError } from '@/src/lib/api-client';
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

/**
 * The watcher stops watching (INV-7): the pet leaves "Pets I'm watching" at once and its tasks leave
 * the schedule. The pet's own queries are left alone (not refetched): the screen is closing, and a
 * refetch would answer 404 and flash "not found" during the transition; unused, they are GC'd.
 * Already gone (left on another device, or the owner removed them) is the same outcome: success.
 */
export function useLeavePet(petId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await invitationsApi.leave(petId);
      } catch (error) {
        if (!(error instanceof ApiError && error.code === PET_ERROR_CODES.PET_NOT_FOUND))
          throw error;
      }
    },
    onSuccess: () => {
      queryClient.setQueryData<PetDto[]>(petKeys.all, (pets) =>
        pets?.filter((p) => p.id !== petId),
      );
      void queryClient.invalidateQueries({ queryKey: petKeys.all, exact: true });
      void queryClient.invalidateQueries({ queryKey: careTaskKeys.schedule() });
    },
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
