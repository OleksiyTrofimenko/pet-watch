import type * as TokenStoreModule from './token-store';

const mockStore = new Map<string, string>();

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((key: string) => Promise.resolve(mockStore.get(key) ?? null)),
  setItemAsync: jest.fn((key: string, value: string) => {
    mockStore.set(key, value);
    return Promise.resolve();
  }),
  deleteItemAsync: jest.fn((key: string) => {
    mockStore.delete(key);
    return Promise.resolve();
  }),
}));

const KEY = 'petwatch.session';

/** A fresh module per test: token-store caches the first read in memory. */
function loadTokenStore(): typeof TokenStoreModule.tokenStore {
  let tokenStore: typeof TokenStoreModule.tokenStore | undefined;
  jest.isolateModules(() => {
    tokenStore = jest.requireActual<typeof TokenStoreModule>('./token-store').tokenStore;
  });
  if (!tokenStore) throw new Error('token-store did not load');
  return tokenStore;
}

beforeEach(() => mockStore.clear());

const session = {
  accessToken: 'a',
  refreshToken: 'r',
  user: { id: 'u1', email: 'ana@petwatch.test' },
};

describe('tokenStore', () => {
  it('reads a saved session back', async () => {
    mockStore.set(KEY, JSON.stringify(session));

    await expect(loadTokenStore().get()).resolves.toEqual(session);
  });

  it('treats a corrupt entry as signed out and removes it, instead of throwing', async () => {
    mockStore.set(KEY, '{not json');

    await expect(loadTokenStore().get()).resolves.toBeNull();
    expect(mockStore.has(KEY)).toBe(false);
  });

  it('treats a Keychain read error as signed out', async () => {
    mockStore.set(KEY, JSON.stringify(session));
    const SecureStore = jest.requireMock<{ getItemAsync: jest.Mock }>('expo-secure-store');
    SecureStore.getItemAsync.mockRejectedValueOnce(new Error('User interaction is not allowed'));

    await expect(loadTokenStore().get()).resolves.toBeNull();
  });
});
