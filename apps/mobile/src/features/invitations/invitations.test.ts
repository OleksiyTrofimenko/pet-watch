import { ApiError } from '@/src/lib/api-client';
import { expiresLabel } from './format';
import { screenState, stateForError } from './invite-state';

describe('stateForError', () => {
  it.each([
    ['INVITE_EXPIRED', 'expired'],
    ['INVITE_ALREADY_ACCEPTED', 'already'],
    ['INVITE_REVOKED', 'cancelled'],
    ['INVITE_NOT_FOUND', 'unavailable'],
    ['INVITE_FOR_OTHER_USER', 'wrong-account'],
    ['NETWORK_ERROR', 'error'],
  ])('maps %s to the %s screen', (code, state) => {
    expect(stateForError(new ApiError(410, code, 'x'))).toBe(state);
  });

  it('treats anything that is not an ApiError as a generic error', () => {
    expect(stateForError(new Error('boom'))).toBe('error');
  });
});

describe('screenState', () => {
  const idle = { accepted: false, acceptError: null, preview: { isPending: false, error: null } };
  const expired = new ApiError(410, 'INVITE_EXPIRED', 'x');

  it('shows the invite once the preview loaded', () => {
    expect(screenState(idle)).toBe('invite');
  });

  it('shows loading while the preview is pending', () => {
    expect(screenState({ ...idle, preview: { isPending: true, error: null } })).toBe('loading');
  });

  it('maps a preview failure to its screen', () => {
    expect(screenState({ ...idle, preview: { isPending: false, error: expired } })).toBe('expired');
  });

  it('lets an accept failure win over the loaded preview', () => {
    expect(screenState({ ...idle, acceptError: expired })).toBe('expired');
  });

  it('shows accepted above everything else', () => {
    expect(screenState({ ...idle, accepted: true, acceptError: expired })).toBe('accepted');
  });
});

describe('expiresLabel', () => {
  const now = new Date(2026, 8, 30, 13, 10);
  it.each([
    [new Date(2026, 9, 5, 9, 0), 'Expires in 5 days'],
    [new Date(2026, 9, 1, 8, 0), 'Expires tomorrow'],
    [new Date(2026, 8, 30, 23, 0), 'Expires today'],
    [new Date(2026, 8, 30, 13, 0), 'Expired'],
  ])('%s → %s', (expiresAt, label) => {
    expect(expiresLabel(expiresAt.toISOString(), now)).toBe(label);
  });
});
