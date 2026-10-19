import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import type { AuthResponse } from '@petwatch/shared';
import { SessionProvider, useSession } from './session-provider';

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    setItemAsync: jest.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
  };
});

const bob: AuthResponse = {
  accessToken: 'access-bob',
  refreshToken: 'refresh-bob',
  user: { id: 'bob', email: 'bob@petwatch.test' },
};

function Probe() {
  const { session, signIn } = useSession();
  return (
    <Pressable onPress={() => void signIn(bob)}>
      <Text>{session.status === 'signed-in' ? session.user.email : session.status}</Text>
    </Pressable>
  );
}

describe('SessionProvider', () => {
  it("drops the previous account's cached data when someone else signs in", async () => {
    const queryClient = new QueryClient();
    // Ana's pets, still cached when Bob opens his reset link on her phone.
    queryClient.setQueryData(['pets'], [{ id: 'ana-pet', name: 'Rex' }]);
    await render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <Probe />
        </SessionProvider>
      </QueryClientProvider>,
    );

    await fireEvent.press(await screen.findByText('signed-out'));

    expect(await screen.findByText('bob@petwatch.test')).toBeTruthy();
    expect(queryClient.getQueryData(['pets'])).toBeUndefined();
  });
});
