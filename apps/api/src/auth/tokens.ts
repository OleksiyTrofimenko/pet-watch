import { createHash, randomBytes } from 'node:crypto';

/** 256 bits of randomness, URL-safe: used for refresh and password-reset tokens. */
export function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Tokens are high-entropy, so a fast hash is enough (D13). Only the hash is stored. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
