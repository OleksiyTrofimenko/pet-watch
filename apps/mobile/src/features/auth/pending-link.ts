/**
 * A protected deep link (petwatch://invites/<token>) that arrived while signed out. Kept in
 * memory only: it is replayed once after sign-in and must not survive an app restart.
 */
const INVITE_LINK = /(?:^|\/)invites\/([^/?#]+)/;

let pendingInviteToken: string | null = null;
// The linking URL stays the same until the next link (the launch URL, or a link opened while
// signed in); after a logout it must not come back.
let lastSeenUrl: string | null = null;

/** Every linking URL passes through here; only one opened while signed out is kept for later. */
export function rememberPendingLink(url: string, signedIn: boolean): void {
  if (url === lastSeenUrl) return;
  lastSeenUrl = url;
  if (signedIn) return; // the router opened it already
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
