import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, Screen } from '@/src/design-system';
import { useLogout } from '@/src/features/auth/queries';
import { useSession } from '@/src/features/auth/session-provider';

// Placeholder home until the schedule (Phase 5) replaces it.
export default function Home() {
  const { session } = useSession();
  const logout = useLogout();

  return (
    <Screen>
      <Heading size="2xl" testID="home.title">
        PetWatch
      </Heading>
      {session.status === 'signed-in' ? (
        <Text className="text-typography-500">Signed in as {session.user.email}</Text>
      ) : null}
      <Button
        label="Log out"
        variant="outline"
        isLoading={logout.isPending}
        onPress={() => logout.mutate()}
        testID="home.logout"
      />
    </Screen>
  );
}
