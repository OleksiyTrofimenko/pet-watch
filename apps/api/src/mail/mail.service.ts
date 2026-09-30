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

  async sendPasswordReset(to: string, link: string): Promise<void> {
    await this.transport.sendMail({
      from: this.from,
      to,
      subject: 'Reset your PetWatch password',
      text: `Open this link on your phone to choose a new password (valid for a short time):\n\n${link}\n\nIf you didn't ask for this, ignore this email.`,
    });
  }
}
