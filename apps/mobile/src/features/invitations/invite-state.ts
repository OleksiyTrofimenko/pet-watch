import { INVITATION_ERROR_CODES } from '@petwatch/shared';
import { ApiError } from '@/src/lib/api-client';

/** Every state of the accept screen (AcceptScreen.dc.html) except loading and the invite itself. */
export type InviteResultState =
  'accepted' | 'expired' | 'already' | 'cancelled' | 'unavailable' | 'wrong-account' | 'error';

/** Preview/accept failure → the screen to show. Each API code has its own state. */
export function stateForError(error: unknown): InviteResultState {
  if (!(error instanceof ApiError)) return 'error';
  switch (error.code) {
    case INVITATION_ERROR_CODES.INVITE_EXPIRED:
      return 'expired';
    case INVITATION_ERROR_CODES.INVITE_ALREADY_ACCEPTED:
      return 'already';
    case INVITATION_ERROR_CODES.INVITE_REVOKED:
      return 'cancelled';
    case INVITATION_ERROR_CODES.INVITE_NOT_FOUND:
      return 'unavailable';
    case INVITATION_ERROR_CODES.INVITE_FOR_OTHER_USER:
      return 'wrong-account';
    default:
      return 'error';
  }
}

export type InviteScreenState = InviteResultState | 'loading' | 'invite';

/**
 * What the accept screen shows, in priority order: a finished accept, then an accept failure,
 * then the preview (loading / failed / the invite itself).
 */
export function screenState(input: {
  accepted: boolean;
  acceptError: unknown;
  preview: { isPending: boolean; error: unknown };
}): InviteScreenState {
  if (input.accepted) return 'accepted';
  if (input.acceptError) return stateForError(input.acceptError);
  if (input.preview.isPending) return 'loading';
  if (input.preview.error) return stateForError(input.preview.error);
  return 'invite';
}
