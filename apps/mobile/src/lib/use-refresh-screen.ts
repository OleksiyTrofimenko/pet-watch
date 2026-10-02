import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Pull to refresh: refetch every query on screen right now (also the ones owned by sections such as a
 * pet's routine and watchers), resolving when all are done so the spinner stops at the right time.
 */
export function useRefreshScreen(): () => Promise<void> {
  const queryClient = useQueryClient();
  return useCallback(() => queryClient.refetchQueries({ type: 'active' }), [queryClient]);
}
