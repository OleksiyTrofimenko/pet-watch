import { z } from 'zod';

/** Emails are compared case-insensitively everywhere, so normalise at the edge. */
export const emailSchema = z.email().trim().toLowerCase();

export const idSchema = z.uuid();
