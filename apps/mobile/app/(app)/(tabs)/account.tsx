import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, Screen } from '@/src/design-system';
import { useLogout } from '@/src/features/auth/queries';
import { useSession } from '@/src/features/auth/session-provider';

export default function AccountScreen() {
  const { session } = useSession();
  const logout = useLogout();

  return (
    <Screen>
      <Heading className="text-[32px] font-semibold leading-[38px]" testID="account.title">
        Account
      </Heading>
      {session.status === 'signed-in' ? (
        <Text className="text-typography-700">Signed in as {session.user.email}</Text>
      ) : null}
      <Button
        label="Log out"
        variant="outline"
        isLoading={logout.isPending}
        onPress={() => logout.mutate()}
        testID="account.logout"
      />
    </Screen>
  );
}
