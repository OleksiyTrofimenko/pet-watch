import { z } from 'zod';

/**
 * Emails are compared case-insensitively everywhere, so normalise at the edge.
 * Order matters: trim/lower-case first, *then* validate the format
 * (`z.email().trim()` would validate the untrimmed input and reject " a@b.com").
 */
export const emailSchema = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email'));

export const idSchema = z.uuid();

/** Optional free text: blank means "none" (null), so an edit can clear it. */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .optional();
