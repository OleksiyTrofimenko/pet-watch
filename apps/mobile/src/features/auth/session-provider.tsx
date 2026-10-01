import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AuthResponse, PublicUser } from '@petwatch/shared';
import { onSessionEnded } from '@/src/lib/api-client';
import { tokenStore } from '@/src/lib/token-store';
import { authApi } from './api';

export type Session =
  { status: 'loading' } | { status: 'signed-out' } | { status: 'signed-in'; user: PublicUser };

type SessionContextValue = {
  session: Session;
  signIn: (auth: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
};

const SIGNED_OUT: Session = { status: 'signed-out' };
const SessionContext = createContext<SessionContextValue | null>(null);

/** The app's one Context: who is signed in. Tokens stay in token-store, never in React state. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    // Restore from SecureStore; an expired token is handled by the first request's refresh.
    void tokenStore.get().then((stored) => {
      if (active) setSession(stored ? { status: 'signed-in', user: stored.user } : SIGNED_OUT);
    });
    // A rejected refresh (revoked, reused, expired) signs the user out from anywhere.
    onSessionEnded(() => {
      queryClient.clear();
      setSession(SIGNED_OUT);
    });
    return () => {
      active = false;
      onSessionEnded(() => undefined);
    };
  }, [queryClient]);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      signIn: async (auth) => {
        await tokenStore.save(auth);
        setSession({ status: 'signed-in', user: auth.user });
      },
      signOut: async () => {
        const stored = await tokenStore.get();
        await tokenStore.clear();
        // User A's cached data must never show up for user B.
        queryClient.clear();
        setSession(SIGNED_OUT);
        // Best effort: the local sign-out already happened, so offline logout still works.
        if (stored) void authApi.logout(stored.refreshToken).catch(() => undefined);
      },
    }),
    [session, queryClient],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside <SessionProvider>');
  return value;
}
