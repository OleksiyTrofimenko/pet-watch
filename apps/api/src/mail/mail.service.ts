import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import type { Env } from '../config/env';

/** Plain SMTP: Mailpit locally, any SMTP relay (e.g. SES) in production via env vars. */
@Injectable()
export class MailService {
  private readonly transport: Transporter;
  private readonly from: string;

  constructor(config: ConfigService<Env, true>) {
    this.transport = createTransport({
      host: config.get('SMTP_HOST', { infer: true }),
      port: config.get('SMTP_PORT', { infer: true }),
    });
    this.from = config.get('MAIL_FROM', { infer: true });
  }

  async sendInvitation(
    to: string,
    invite: { inviterEmail: string; petName: string; link: string; expiresAt: Date },
  ): Promise<void> {
    const expires = invite.expiresAt.toUTCString().slice(0, 16);
    await this.transport.sendMail({
      from: this.from,
      to,
      subject: `${invite.inviterEmail} invited you to watch ${invite.petName} on PetWatch`,
      text: `${invite.inviterEmail} invited you to help look after ${invite.petName}.\n\nOpen this link on your phone (with PetWatch installed) to review and accept:\n\n${invite.link}\n\nThe invite expires on ${expires}. If you weren't expecting it, ignore this email.`,
    });
  }

  async sendPasswordReset(to: string, link: string): Promise<void> {
    await this.transport.sendMail({
      from: this.from,
      to,
      subject: 'Reset your PetWatch password',
      text: `Open this link on your phone to choose a new password (valid for a short time):\n\n${link}\n\nIf you didn't ask for this, ignore this email.`,
    });
  }
}
