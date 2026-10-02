import '@/global.css';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { useLinkingURL } from 'expo-linking';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Box } from '@/components/ui/box';
import { OfflineBanner } from '@/src/design-system';
import { rememberPendingLink } from '@/src/features/auth/pending-link';
import { useSession } from '@/src/features/auth/session-provider';
import { AppProviders } from '@/src/providers/app-providers';

// Expo Router 57.0.24 race (useLinking.native.js): the async launch URL can resolve before its own
// <ContextNavigator> mounts, so React warns from inside the router on slow devices. Not our code and
// harmless; the dev-only overlay would sit over the screen (and break e2e taps). Still logged to Metro.
// Remove when Expo Router fixes it.
// "Cannot connect to Expo CLI": the dev client losing Metro whenever the device goes offline, which
// is exactly what the offline mode (N-3) is for; it reconnects by itself.
// "Response.blob() is using React Native's Blob": Expo's perf hint for large responses; the photo
// upload reads one already-resized image (upload-file.ts). Not worth a new dependency (expo-blob).
// "Sending `onAnimatedValueUpdate` with no listeners": React Native's native-driver bookkeeping when a
// native screen container (the native tabs) animates a value JS isn't listening to. Harmless; the
// overlay would sit on the tab bar.
LogBox.ignoreLogs([
  "Can't perform a React state update on a component that hasn't mounted yet",
  'Cannot connect to Expo CLI',
  "Response.blob() is using React Native's Blob",
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

// Keep the native splash up until the saved session is read, then go straight to login or the app.
void SplashScreen.preventAutoHideAsync();

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

  useEffect(() => {
    if (session.status !== 'loading') void SplashScreen.hideAsync();
  }, [session.status]);

  if (session.status === 'loading') return null; // the splash is still showing (reading SecureStore)
  const signedIn = session.status === 'signed-in';

  return (
    <Box className="flex-1 bg-background-0">
      <OfflineBanner />
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
    </Box>
  );
}
