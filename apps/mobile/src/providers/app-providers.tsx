import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { queryClient } from '@/src/lib/query-client';

/**
 * Jotai needs no provider: atoms live in the default store.
 * The auth session provider will be added here in the auth step.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GluestackUIProvider mode="system">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </GluestackUIProvider>
  );
}
