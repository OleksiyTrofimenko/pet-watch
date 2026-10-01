import { z } from 'zod';
import { emailSchema } from './common';
import type { Species } from './pets';

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

/** GET /invitations/:token — what the invitee reviews before accepting. */
export interface InvitationPreview {
  petId: string;
  petName: string;
  species: Species;
  petPhotoUrl: string | null;
  inviterEmail: string;
  expiresAt: string;
}

export interface AcceptInvitationResult {
  petId: string;
}

export interface WatcherDto {
  userId: string;
  email: string;
  since: string;
}

export interface PendingInvitationDto {
  invitationId: string;
  email: string;
  expiresAt: string;
}

/** GET /pets/:petId/watchers (owner only): who has access, and who's been asked. */
export interface PetWatchersDto {
  watchers: WatcherDto[];
  pending: PendingInvitationDto[];
}
