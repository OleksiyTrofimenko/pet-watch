import { rememberPendingLink } from '@/src/features/auth/pending-link';

/**
 * Expo Router calls this for every incoming deep link, before routing. A protected link opened
 * while signed out is redirected to login by the guard, so remember it to replay after sign-in.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  rememberPendingLink(path);
  return path;
}
