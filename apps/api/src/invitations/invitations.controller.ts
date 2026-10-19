import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import type {
  AcceptInvitationResult,
  CreateInvitationResult,
  InvitationPreview,
  PetWatchersDto,
} from '@petwatch/shared';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { CreateInvitationDto } from './dto';
import { InvitationsService } from './invitations.service';
import { ParseInviteTokenPipe } from './parse-token.pipe';

@Controller()
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  /** Every call sends an email: the `strict` limit (per IP, D41) stops inbox flooding and email probing. */
  @Post('pets/:petId/invitations')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @SkipThrottle({ default: true })
  invite(
    @CurrentUser() user: AuthUser,
    @Param('petId', ParseUUIDPipe) petId: string,
    @Body() dto: CreateInvitationDto,
  ): Promise<CreateInvitationResult> {
    return this.invitations.invite(user.id, petId, dto);
  }

  @Delete('pets/:petId/invitations/:invitationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('petId', ParseUUIDPipe) petId: string,
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
  ): Promise<void> {
    return this.invitations.cancelInvitation(user.id, petId, invitationId);
  }

  @Get('pets/:petId/watchers')
  watchers(
    @CurrentUser() user: AuthUser,
    @Param('petId', ParseUUIDPipe) petId: string,
  ): Promise<PetWatchersDto> {
    return this.invitations.watchers(user.id, petId);
  }

  @Delete('pets/:petId/watchers/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  revoke(
    @CurrentUser() user: AuthUser,
    @Param('petId', ParseUUIDPipe) petId: string,
    @Param('userId', ParseUUIDPipe) watcherId: string,
  ): Promise<void> {
    return this.invitations.revokeWatcher(user.id, petId, watcherId);
  }

  /** Opened from the email's deep link: requires sign-in as the invitee. */
  @Get('invitations/:token')
  preview(
    @CurrentUser() user: AuthUser,
    @Param('token', ParseInviteTokenPipe) token: string,
  ): Promise<InvitationPreview> {
    return this.invitations.preview(user.id, token);
  }

  @Post('invitations/:token/accept')
  @HttpCode(HttpStatus.OK)
  accept(
    @CurrentUser() user: AuthUser,
    @Param('token', ParseInviteTokenPipe) token: string,
  ): Promise<AcceptInvitationResult> {
    return this.invitations.accept(user.id, token);
  }
}
