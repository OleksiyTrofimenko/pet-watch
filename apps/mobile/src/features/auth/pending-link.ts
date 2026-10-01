/**
 * A protected deep link (petwatch://invites/<token>) that arrived while signed out. Kept in
 * memory only: it is replayed once after sign-in and must not survive an app restart.
 */
const INVITE_LINK = /(?:^|\/)invites\/([^/?#]+)/;

let pendingInviteToken: string | null = null;

export function rememberPendingLink(url: string): void {
  const match = INVITE_LINK.exec(url);
  if (match?.[1]) pendingInviteToken = decodeURIComponent(match[1]);
}

/** Returns the invite token to open after sign-in, at most once. */
export function takePendingInvite(): string | null {
  const token = pendingInviteToken;
  pendingInviteToken = null;
  return token;
}
