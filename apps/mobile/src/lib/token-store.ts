import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';
import type { AuthResponse } from '@petwatch/shared';

const KEY = 'petwatch.session';

/** What we persist: the AuthResponse itself, so a cold start (even offline) knows the user. */
const storedSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  user: z.object({ id: z.string(), email: z.string() }),
});

// SecureStore reads cross the native bridge; every request needs the token, so keep a copy.
// `undefined` = not loaded yet, `null` = loaded and signed out.
let cache: AuthResponse | null | undefined;

/**
 * An unreadable entry (corrupt JSON, Keychain error after a restore) means "signed out", never a
 * crash: otherwise the session never leaves `loading` and the splash screen stays up forever.
 */
async function readStored(): Promise<AuthResponse | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return null;
    const parsed = storedSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
  } catch {
    // fall through: drop the broken entry below
  }
  await SecureStore.deleteItemAsync(KEY).catch(() => undefined);
  return null;
}

/** The only place tokens live: the Keychain / Keystore via expo-secure-store (never AsyncStorage). */
export const tokenStore = {
  async get(): Promise<AuthResponse | null> {
    if (cache !== undefined) return cache;
    cache = await readStored();
    return cache;
  },

  async save(session: AuthResponse): Promise<void> {
    cache = session;
    await SecureStore.setItemAsync(KEY, JSON.stringify(session));
  },

  async clear(): Promise<void> {
    cache = null;
    await SecureStore.deleteItemAsync(KEY);
  },
};
