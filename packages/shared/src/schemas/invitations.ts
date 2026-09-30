import { z } from 'zod';
import { emailSchema } from './common';

export const createInvitationSchema = z.object({
  email: emailSchema,
});
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

/**
 * Explicit outcome so the UI can give precise feedback
 * ("invite email sent" vs "already watching").
 */
export type InvitationOutcome = 'INVITE_SENT' | 'INVITE_RESENT' | 'ALREADY_WATCHING';

export interface CreateInvitationResult {
  outcome: InvitationOutcome;
  inviteeEmail: string;
}

export interface InvitationPreview {
  petName: string;
  petPhotoUrl: string | null;
  inviterEmail: string;
  expiresAt: string;
}

export interface WatcherDto {
  userId: string;
  email: string;
  since: string;
}
