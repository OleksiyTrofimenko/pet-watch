import { GoneException, NotFoundException } from '@nestjs/common';
import { INVITATION_ERROR_CODES } from '@petwatch/shared';

export function inviteNotFound(): NotFoundException {
  return new NotFoundException({
    code: INVITATION_ERROR_CODES.INVITE_NOT_FOUND,
    message: 'This invite no longer exists',
  });
}

/** Why a found invitation can't be used: 410 with one stable code per reason. */
export function assertUsable(
  invitation: { status: 'PENDING' | 'ACCEPTED' | 'REVOKED'; expiresAt: Date },
  now: Date,
): void {
  const gone = (code: string, message: string) => new GoneException({ code, message });
  if (invitation.status === 'ACCEPTED') {
    throw gone(INVITATION_ERROR_CODES.INVITE_ALREADY_ACCEPTED, 'This invite was already accepted');
  }
  if (invitation.status === 'REVOKED') {
    throw gone(INVITATION_ERROR_CODES.INVITE_REVOKED, 'This invite was cancelled');
  }
  if (invitation.expiresAt <= now) {
    throw gone(INVITATION_ERROR_CODES.INVITE_EXPIRED, 'This invite has expired');
  }
}
