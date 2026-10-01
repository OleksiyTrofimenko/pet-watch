import { Injectable, NotFoundException, type PipeTransform } from '@nestjs/common';
import { INVITATION_ERROR_CODES } from '@petwatch/shared';

/** Invite tokens are 43-char base64url. Anything else can't match one, so it's "not found". */
@Injectable()
export class ParseInviteTokenPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!/^[A-Za-z0-9_-]{32,64}$/.test(value)) {
      throw new NotFoundException({
        code: INVITATION_ERROR_CODES.INVITE_NOT_FOUND,
        message: 'This invite link is not valid',
      });
    }
    return value;
  }
}
