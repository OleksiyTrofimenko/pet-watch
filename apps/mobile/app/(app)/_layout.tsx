import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { takePendingInvite } from '@/src/features/auth/pending-link';

export default function SignedInLayout() {
  const router = useRouter();

  // Mounts when the user signs in: open the invite link that arrived while signed out.
  useEffect(() => {
    const token = takePendingInvite();
    if (token) router.replace({ pathname: '/invites/[token]', params: { token } });
  }, [router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
