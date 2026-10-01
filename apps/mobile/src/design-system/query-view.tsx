import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { ErrorState } from './error-state';

type QueryViewProps<TData> = {
  query: Pick<UseQueryResult<TData>, 'data' | 'error' | 'isPending' | 'refetch'>;
  /** Skeleton shaped like the content; shown on first load only (cached data renders instantly). */
  loading: ReactNode;
  empty?: ReactNode;
  isEmpty?: (data: TData) => boolean;
  /** A specific error screen (e.g. "no longer available"); return undefined for the default. */
  renderError?: (error: unknown) => ReactNode | undefined;
  children: (data: TData) => ReactNode;
};

/**
 * One place that decides loading → error → empty → content for any query,
 * so screens never re-implement the same four branches.
 */
export function QueryView<TData>({
  query,
  loading,
  empty,
  isEmpty,
  renderError,
  children,
}: QueryViewProps<TData>) {
  if (query.isPending) return <>{loading}</>;
  if (query.data === undefined) {
    const specific = renderError?.(query.error);
    if (specific) return <>{specific}</>;
    const message = query.error instanceof Error ? query.error.message : 'Please try again.';
    return <ErrorState message={message} onRetry={() => void query.refetch()} />;
  }
  if (empty && isEmpty?.(query.data)) return <>{empty}</>;
  return <>{children(query.data)}</>;
}
