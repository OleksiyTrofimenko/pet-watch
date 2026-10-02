import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Refetch when the screen comes back into view: a tab switch or navigating back. Tabs stay mounted,
 * so without this another user's change only shows after the app returns from the background
 * (query-client.ts). The first focus is skipped: mounting the query has just fetched.
 */
export function useRefetchOnFocus(refetch: () => unknown, enabled = true): void {
  const isFirstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      if (enabled) void refetch();
    }, [refetch, enabled]),
  );
}
