import { rememberPendingLink, takePendingInvite } from './pending-link';

describe('pending link', () => {
  it.each(['petwatch://invites/abc123', '/invites/abc123', 'petwatch:///invites/abc123?utm=mail'])(
    'remembers the invite token from %s, once',
    (url) => {
      rememberPendingLink(url, false);
      expect(takePendingInvite()).toBe('abc123');
      expect(takePendingInvite()).toBeNull();
    },
  );

  it('does not remember the same link twice (e.g. the launch URL after a logout)', () => {
    rememberPendingLink('petwatch://invites/once', false);
    expect(takePendingInvite()).toBe('once');
    rememberPendingLink('petwatch://invites/once', false);
    expect(takePendingInvite()).toBeNull();
  });

  it('does not replay a link opened while signed in after a logout (for the next account)', () => {
    rememberPendingLink('petwatch://invites/sams', true);
    expect(takePendingInvite()).toBeNull();
    rememberPendingLink('petwatch://invites/sams', false); // same URL, now signed out
    expect(takePendingInvite()).toBeNull();
  });

  it('ignores links that need no sign-in', () => {
    rememberPendingLink('petwatch://reset-password?token=abc', false);
    expect(takePendingInvite()).toBeNull();
  });
});
