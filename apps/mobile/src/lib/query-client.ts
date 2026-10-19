import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { ApiError } from './api-client';

// React Native has no window "online"/"focus" events, so wire them manually:
// - queries pause while offline and refetch when the connection returns
// - stale queries refetch when the app comes back to the foreground
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected))),
);

AppState.addEventListener('change', (status) => {
  focusManager.setFocused(status === 'active');
});

/**
 * Retry once for a network error or a 5xx; a 4xx (404 gone, 403 no access) won't change on a
 * retry, so the screen shows its state right away. 401s are refreshed inside apiClient.
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  const clientError = error instanceof ApiError && error.status >= 400 && error.status < 500;
  return !clientError && failureCount < 1;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetryQuery,
    },
    mutations: {
      // Mutations are not idempotent; never retry them silently.
      retry: 0,
    },
  },
});
