import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  INVITATION_ERROR_CODES,
  type AcceptInvitationResult,
  type CreateInvitationInput,
  type CreateInvitationResult,
  type InvitationPreview,
  type PetWatchersDto,
} from '@petwatch/shared';
import { generateToken, hashToken } from '../auth/tokens';
import type { Env } from '../config/env';
import { MailService } from '../mail/mail.service';
import { PetAccessService, petNotFound } from '../pets/pet-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { assertUsable, inviteNotFound } from './invitation-errors';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Invite lifecycle: PENDING → ACCEPTED (watcher created), REVOKED (owner cancelled/removed) or
 * DECLINED (invitee said no).
 * One row per (pet, invitee) (D9): re-inviting rotates the token and resets the expiry.
 */
@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PetAccessService,
    private readonly mail: MailService,
    private readonly storage: StorageService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async invite(
    userId: string,
    petId: string,
    { email }: CreateInvitationInput,
  ): Promise<CreateInvitationResult> {
    await this.access.assertOwner(userId, petId);
    const invitee = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!invitee) {
      throw new NotFoundException({
        code: INVITATION_ERROR_CODES.USER_NOT_FOUND,
        message: "There's no PetWatch account for this email. Ask them to sign up first.",
      });
    }
    if (invitee.id === userId) {
      throw new BadRequestException({
        code: INVITATION_ERROR_CODES.CANNOT_INVITE_SELF,
        message: "You can't invite yourself.",
      });
    }
    const key = { petId_userId: { petId, userId: invitee.id } };
    if (await this.prisma.petWatcher.findUnique({ where: key, select: { petId: true } })) {
      return { outcome: 'ALREADY_WATCHING', inviteeEmail: email };
    }

    const token = generateToken();
    const expiresAt = new Date(
      Date.now() + this.config.get('INVITE_TTL_DAYS', { infer: true }) * DAY_MS,
    );
    const pair = { petId_inviteeId: { petId, inviteeId: invitee.id } };
    const link = `${this.config.get('APP_SCHEME', { infer: true })}://invites/${token}`;
    const tokenHash = hashToken(token);

    // Write first, then email (never inside a transaction: SMTP can be slow and would hold a DB
    // connection and the row lock). If the email fails, put the row back as it was, so a re-invite
    // never kills the old link without delivering a new one (D62).
    const previous = await this.prisma.invitation.findUnique({
      where: pair,
      select: { status: true, inviterId: true, tokenHash: true, expiresAt: true, acceptedAt: true },
    });
    const invitation = await this.prisma.invitation.upsert({
      where: pair,
      create: { petId, inviterId: userId, inviteeId: invitee.id, tokenHash, expiresAt },
      // Re-invite: new token (the old link stops working), fresh expiry, back to PENDING.
      update: { inviterId: userId, tokenHash, expiresAt, status: 'PENDING', acceptedAt: null },
      select: { pet: { select: { name: true } }, inviter: { select: { email: true } } },
    });
    try {
      await this.mail.sendInvitation(email, {
        inviterEmail: invitation.inviter.email,
        petName: invitation.pet.name,
        link,
        expiresAt,
      });
    } catch (error) {
      this.logger.error('Invite email failed', error instanceof Error ? error.stack : error);
      // Only undo our own write: `tokenHash` still matching means no newer invite replaced it.
      const ours = { petId, inviteeId: invitee.id, tokenHash };
      await (previous
        ? this.prisma.invitation.updateMany({ where: ours, data: previous })
        : this.prisma.invitation.deleteMany({ where: ours }));
      throw new ServiceUnavailableException({
        code: INVITATION_ERROR_CODES.INVITE_EMAIL_FAILED,
        message: "We couldn't send the invite email. Please try again in a moment.",
      });
    }
    return {
      outcome: previous?.status === 'PENDING' ? 'INVITE_RESENT' : 'INVITE_SENT',
      inviteeEmail: email,
    };
  }

  /** What the invitee sees before accepting. Only the invitee's own account can open it. */
  async preview(userId: string, token: string): Promise<InvitationPreview> {
    const invitation = await this.findForInvitee(userId, token);
    assertUsable(invitation, new Date());
    const { pet } = invitation;
    return {
      petId: pet.id,
      petName: pet.name,
      species: pet.species,
      petPhotoUrl: pet.photoKey ? await this.storage.presignGet(pet.photoKey) : null,
      inviterEmail: invitation.inviter.email,
      expiresAt: invitation.expiresAt.toISOString(),
    };
  }

  /**
   * Conditional claim + watcher row in one transaction (same pattern as refresh, D40): of two
   * concurrent accepts only one updates the row; the other re-reads and sees ACCEPTED.
   */
  async accept(userId: string, token: string): Promise<AcceptInvitationResult> {
    const invitation = await this.findForInvitee(userId, token);
    const now = new Date();
    const claimed = await this.prisma.$transaction(async (tx) => {
      const claim = await tx.invitation.updateMany({
        where: { id: invitation.id, inviteeId: userId, status: 'PENDING', expiresAt: { gt: now } },
        data: { status: 'ACCEPTED', acceptedAt: now },
      });
      if (claim.count !== 1) return false;
      await tx.petWatcher.create({ data: { petId: invitation.pet.id, userId } });
      return true;
    });

    if (!claimed) {
      const current = await this.findForInvitee(userId, token);
      const watching = await this.prisma.petWatcher.findUnique({
        where: { petId_userId: { petId: current.pet.id, userId } },
        select: { petId: true },
      });
      // Accepting twice (double tap, second device) is a success, not an error.
      if (current.status === 'ACCEPTED' && watching) return { petId: current.pet.id };
      assertUsable(current, now);
    }
    return { petId: invitation.pet.id };
  }

  /**
   * The invitee says no: same conditional claim as accept. Declining twice is a success; any other
   * non-pending state answers with its 410 code. The owner's list drops it from "Pending".
   */
  async decline(userId: string, token: string): Promise<void> {
    const invitation = await this.findForInvitee(userId, token);
    const now = new Date();
    const claim = await this.prisma.invitation.updateMany({
      where: { id: invitation.id, inviteeId: userId, status: 'PENDING', expiresAt: { gt: now } },
      data: { status: 'DECLINED' },
    });
    if (claim.count === 1) return;
    const current = await this.findForInvitee(userId, token);
    if (current.status !== 'DECLINED') assertUsable(current, now);
  }

  async watchers(userId: string, petId: string): Promise<PetWatchersDto> {
    await this.access.assertOwner(userId, petId);
    const [watchers, pending] = await Promise.all([
      this.prisma.petWatcher.findMany({
        where: { petId },
        select: { createdAt: true, user: { select: { id: true, email: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.invitation.findMany({
        where: { petId, status: 'PENDING' },
        select: { id: true, expiresAt: true, invitee: { select: { email: true } } },
        orderBy: { createdAt: 'asc' },
      }),
    ]);
    return {
      watchers: watchers.map((w) => ({
        userId: w.user.id,
        email: w.user.email,
        since: w.createdAt.toISOString(),
      })),
      pending: pending.map((i) => ({
        invitationId: i.id,
        email: i.invitee.email,
        expiresAt: i.expiresAt.toISOString(),
      })),
    };
  }

  /** Removes access now: the watcher's next request for the pet or its tasks is a 404. */
  async revokeWatcher(userId: string, petId: string, watcherId: string): Promise<void> {
    await this.access.assertOwner(userId, petId);
    await this.prisma.$transaction(async (tx) => {
      const removed = await tx.petWatcher.deleteMany({ where: { petId, userId: watcherId } });
      if (removed.count === 0) {
        throw new NotFoundException({
          code: INVITATION_ERROR_CODES.WATCHER_NOT_FOUND,
          message: 'This person is not watching the pet',
        });
      }
      await tx.invitation.updateMany({
        where: { petId, inviteeId: watcherId },
        data: { status: 'REVOKED' },
      });
    });
  }

  /**
   * The watcher stops watching (INV-7): access ends at once, like a revoke. The accepted invitation
   * goes too, so the old link answers "no longer available" instead of "you're already watching"
   * (REVOKED would say "the owner cancelled"); a re-invite creates a fresh row. Leaving twice, or a
   * pet you can't see, is the usual 404 (D15).
   */
  async leave(userId: string, petId: string): Promise<void> {
    if ((await this.access.resolveRole(userId, petId)) === 'OWNER') {
      throw new ForbiddenException({
        code: INVITATION_ERROR_CODES.OWNER_CANNOT_LEAVE,
        message: 'You own this pet. To stop seeing it, delete the pet instead.',
      });
    }
    await this.prisma.$transaction(async (tx) => {
      const removed = await tx.petWatcher.deleteMany({ where: { petId, userId } });
      if (removed.count === 0) throw petNotFound();
      await tx.invitation.deleteMany({ where: { petId, inviteeId: userId, status: 'ACCEPTED' } });
    });
  }

  /** Cancels a pending invite: its link then answers INVITE_REVOKED. */
  async cancelInvitation(userId: string, petId: string, invitationId: string): Promise<void> {
    await this.access.assertOwner(userId, petId);
    const cancelled = await this.prisma.invitation.updateMany({
      where: { id: invitationId, petId, status: 'PENDING' },
      data: { status: 'REVOKED' },
    });
    if (cancelled.count === 0) throw inviteNotFound();
  }

  /** The invitation for this token, only if it was sent to this user (403 otherwise). */
  private async findForInvitee(userId: string, token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { tokenHash: hashToken(token) },
      select: {
        id: true,
        status: true,
        expiresAt: true,
        inviteeId: true,
        inviter: { select: { email: true } },
        pet: { select: { id: true, name: true, species: true, photoKey: true } },
      },
    });
    if (!invitation) throw inviteNotFound();
    if (invitation.inviteeId !== userId) {
      throw new ForbiddenException({
        code: INVITATION_ERROR_CODES.INVITE_FOR_OTHER_USER,
        message: 'This invite is for a different account',
      });
    }
    return invitation;
  }
}
