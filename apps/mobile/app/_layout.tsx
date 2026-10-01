import '@/global.css';
import { Stack } from 'expo-router';
import { useSession } from '@/src/features/auth/session-provider';
import { AppProviders } from '@/src/providers/app-providers';

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
