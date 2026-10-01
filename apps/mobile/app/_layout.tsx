import '@/global.css';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { useLinkingURL } from 'expo-linking';
import { Stack } from 'expo-router';
import { rememberPendingLink } from '@/src/features/auth/pending-link';
import { useSession } from '@/src/features/auth/session-provider';
import { AppProviders } from '@/src/providers/app-providers';

// Expo Router 57.0.24 race (useLinking.native.js): the async launch URL can resolve before its own
// <ContextNavigator> mounts, so React warns from inside the router on slow devices. Not our code and
// harmless; the dev-only overlay would sit over the screen (and break e2e taps). Still logged to Metro.
// Remove when Expo Router fixes it.
LogBox.ignoreLogs(["Can't perform a React state update on a component that hasn't mounted yet"]);

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

/**
 * Route access follows the session: (app) only when signed in, (auth) only when signed out.
 * Expo Router redirects away from a group as soon as its guard turns false.
 */
function RootNavigator() {
  const { session } = useSession();
  const url = useLinkingURL();

  // A protected link opened while signed out is redirected to login by the guard: remember it so
  // (app) can open it after sign-in.
  useEffect(() => {
    if (url && session.status !== 'signed-in') rememberPendingLink(url);
  }, [url, session.status]);

  if (session.status === 'loading') return null; // reading SecureStore takes a few ms
  const signedIn = session.status === 'signed-in';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      {/* Opened from the email, signed in or not. */}
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
