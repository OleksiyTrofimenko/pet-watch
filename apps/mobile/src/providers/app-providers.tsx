import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { SessionProvider } from '@/src/features/auth/session-provider';
import { queryClient } from '@/src/lib/query-client';

/** Jotai needs no provider: atoms live in the default store. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <KeyboardProvider>
      <GluestackUIProvider mode="system">
        <QueryClientProvider client={queryClient}>
          <SessionProvider>{children}</SessionProvider>
        </QueryClientProvider>
      </GluestackUIProvider>
    </KeyboardProvider>
  );
}
