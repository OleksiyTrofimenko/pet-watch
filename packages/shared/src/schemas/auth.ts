import { z } from 'zod';
import { emailSchema } from './common';

/**
 * Opaque tokens are 43 chars (32 random bytes, base64url); the cap only stops a huge body from
 * reaching the hash/lookup.
 */
const tokenSchema = z.string().min(1).max(256);

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long');

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  // No strength rules on login: never tell an attacker which rule failed.
  // The max matches registration: argon2 never hashes a 100 KB "password".
  password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: tokenSchema,
});
export type RefreshInput = z.infer<typeof refreshSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: tokenSchema,
  password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PublicUser {
  id: string;
  email: string;
}

/** Returned by register, login and refresh: the client gets the user without an extra call. */
export interface AuthResponse extends AuthTokens {
  user: PublicUser;
}
