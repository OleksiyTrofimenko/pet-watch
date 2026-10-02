import { setTimeout as sleep } from 'node:timers/promises';
import { z } from 'zod';

/** Mailpit's HTTP API (https://mailpit.axllent.org/docs/api-v1/). Only the fields we read. */
const baseUrl = () => `${process.env.MAILPIT_URL ?? 'http://localhost:8025'}/api/v1`;

const searchSchema = z.object({ messages: z.array(z.object({ ID: z.string() })) });
const messageSchema = z.object({ Subject: z.string(), Text: z.string(), HTML: z.string() });

export type MailMessage = { subject: string; text: string; html: string };

export async function deleteAllMessages(): Promise<void> {
  const res = await fetch(`${baseUrl()}/messages`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Mailpit delete failed: ${res.status}`);
}

async function getJson<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`);
  if (!res.ok) throw new Error(`Mailpit GET ${path} failed: ${res.status}`);
  return schema.parse(await res.json());
}

/** Messages currently in the inbox for `email` (pair with a later waitForMessageTo to avoid sleeps). */
export async function countMessagesTo(email: string): Promise<number> {
  const { messages } = await getJson(`/search?query=${toQuery(email)}`, searchSchema);
  return messages.length;
}

/**
 * Polls until the newest message to `email` arrives (mail is sent without being awaited),
 * instead of sleeping a fixed time.
 */
export async function waitForMessageTo(email: string, timeoutMs = 5_000): Promise<MailMessage> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { messages } = await getJson(`/search?query=${toQuery(email)}`, searchSchema);
    if (messages[0]) {
      const message = await getJson(`/message/${messages[0].ID}`, messageSchema);
      return { subject: message.Subject, text: message.Text, html: message.HTML };
    }
    await sleep(100);
  }
  throw new Error(`No email to ${email} within ${timeoutMs}ms`);
}

function toQuery(email: string): string {
  return encodeURIComponent(`to:"${email}"`);
}

/** First link in `text` that starts with `prefix`, e.g. extractLink(text, 'petwatch://reset-password'). */
export function extractLink(text: string, prefix: string): string {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`${escaped}[^\\s<>"')]*`).exec(text);
  if (!match) throw new Error(`No link starting with ${prefix} in:\n${text}`);
  return match[0];
}
