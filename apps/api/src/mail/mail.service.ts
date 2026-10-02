import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import type { Env } from '../config/env';
import { escapeHtml } from './escape-html';

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
    const inviter = escapeHtml(invite.inviterEmail);
    const pet = escapeHtml(invite.petName);
    await this.transport.sendMail({
      from: this.from,
      to,
      subject: `${invite.inviterEmail} invited you to watch ${invite.petName} on PetWatch`,
      text: `${invite.inviterEmail} invited you to help look after ${invite.petName}.\n\nOpen this link on your phone (with PetWatch installed) to review and accept:\n\n${invite.link}\n\nThe invite expires on ${expires}. If you weren't expecting it, ignore this email.`,
      html: htmlEmail(
        `<p>${inviter} invited you to help look after <strong>${pet}</strong>.</p>
<p>Open this link on your phone (with PetWatch installed) to review and accept:</p>`,
        { label: 'Review invite', href: invite.link },
        `The invite expires on ${expires}. If you weren't expecting it, ignore this email.`,
      ),
    });
  }

  async sendPasswordReset(to: string, link: string): Promise<void> {
    await this.transport.sendMail({
      from: this.from,
      to,
      subject: 'Reset your PetWatch password',
      text: `Open this link on your phone to choose a new password (valid for a short time):\n\n${link}\n\nIf you didn't ask for this, ignore this email.`,
      html: htmlEmail(
        '<p>Open this link on your phone to choose a new password (valid for a short time):</p>',
        { label: 'Reset password', href: link },
        "If you didn't ask for this, ignore this email.",
      ),
    });
  }
}

/**
 * The HTML part, so mail clients show a tappable link (the text part stays for plain-text clients).
 * `intro` must already be escaped; the link is also printed in full for clients that drop custom schemes.
 */
function htmlEmail(intro: string, action: { label: string; href: string }, footer: string): string {
  const href = escapeHtml(action.href);
  return `<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#2A2520">
${intro}
<p><a href="${href}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#AE5230;color:#ffffff;text-decoration:none;font-weight:600">${escapeHtml(action.label)}</a></p>
<p style="font-size:13px;color:#6b7280">Or open: <a href="${href}">${href}</a></p>
<p style="font-size:13px;color:#6b7280">${escapeHtml(footer)}</p>
</div>`;
}
