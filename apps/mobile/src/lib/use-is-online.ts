import { useSyncExternalStore } from 'react';
import { onlineManager } from '@tanstack/react-query';

/**
 * Online state from TanStack's onlineManager, which query-client.ts feeds from NetInfo: one
 * source of truth for "queries pause" and "save buttons disable".
 */
export function useIsOnline(): boolean {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
}
