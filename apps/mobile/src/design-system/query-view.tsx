import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { ErrorState } from './error-state';

type QueryViewProps<TData> = {
  query: Pick<UseQueryResult<TData>, 'data' | 'error' | 'isPending' | 'refetch'>;
  /** Skeleton shaped like the content; shown on first load only (cached data renders instantly). */
  loading: ReactNode;
  empty?: ReactNode;
  isEmpty?: (data: TData) => boolean;
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
  children,
}: QueryViewProps<TData>) {
  if (query.isPending) return <>{loading}</>;
  if (query.data === undefined) {
    const message = query.error instanceof Error ? query.error.message : 'Please try again.';
    return <ErrorState message={message} onRetry={() => void query.refetch()} />;
  }
  if (empty && isEmpty?.(query.data)) return <>{empty}</>;
  return <>{children(query.data)}</>;
}
