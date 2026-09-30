import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';

// React Native has no window "online"/"focus" events, so wire them manually:
// - queries pause while offline and refetch when the connection returns
// - stale queries refetch when the app comes back to the foreground
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected))),
);

AppState.addEventListener('change', (status) => {
  focusManager.setFocused(status === 'active');
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
    mutations: {
      // Mutations are not idempotent; never retry them silently.
      retry: 0,
    },
  },
});
