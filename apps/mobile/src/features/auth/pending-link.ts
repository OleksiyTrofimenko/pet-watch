/**
 * A protected deep link (petwatch://invites/<token>) that arrived while signed out. Kept in
 * memory only: it is replayed once after sign-in and must not survive an app restart.
 */
const INVITE_LINK = /(?:^|\/)invites\/([^/?#]+)/;

let pendingInviteToken: string | null = null;
// The launch URL stays the same for the whole session; after a logout it must not come back.
let lastSeenUrl: string | null = null;

export function rememberPendingLink(url: string): void {
  if (url === lastSeenUrl) return;
  lastSeenUrl = url;
  const match = INVITE_LINK.exec(url);
  if (match?.[1]) pendingInviteToken = decodeURIComponent(match[1]);
}

/** Returns the invite token to open after sign-in, at most once. */
export function takePendingInvite(): string | null {
  const token = pendingInviteToken;
  pendingInviteToken = null;
  return token;
}

/** "Switch account" on an invite for another user: reopen this invite after the next sign-in. */
export function rememberPendingInvite(token: string): void {
  pendingInviteToken = token;
}
