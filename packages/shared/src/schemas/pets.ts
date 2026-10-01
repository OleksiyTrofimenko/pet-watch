import { z } from 'zod';

export const SPECIES = ['DOG', 'CAT', 'BIRD', 'RABBIT', 'FISH', 'REPTILE', 'OTHER'] as const;
export const speciesSchema = z.enum(SPECIES);
export type Species = z.infer<typeof speciesSchema>;

/** Optional free text: blank means "none" (null), so an edit can clear it. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .optional();

export const createPetSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50),
  species: speciesSchema,
  breed: optionalText(50),
  ageYears: z
    .number()
    .int()
    .min(0, 'Age must be 0–50')
    .max(50, 'Age must be 0–50')
    .nullable()
    .optional(),
  notes: optionalText(1000),
});
/** What a form holds (blank strings allowed) vs. what the API receives (blanks → null). */
export type CreatePetFormValues = z.input<typeof createPetSchema>;
export type CreatePetInput = z.output<typeof createPetSchema>;

// Omitted = unchanged, null = cleared.
export const updatePetSchema = createPetSchema.partial();
export type UpdatePetInput = z.output<typeof updatePetSchema>;

export const PHOTO_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const photoUploadRequestSchema = z.object({
  contentType: z.enum(PHOTO_CONTENT_TYPES),
});
export type PhotoUploadRequest = z.infer<typeof photoUploadRequestSchema>;

export const confirmPhotoSchema = z.object({
  key: z.string().min(1),
});
export type ConfirmPhotoInput = z.infer<typeof confirmPhotoSchema>;

/** The caller's relationship to a pet. Not a global role. */
export type PetRole = 'OWNER' | 'WATCHER';

export interface PetDto {
  id: string;
  name: string;
  species: Species;
  breed: string | null;
  ageYears: number | null;
  notes: string | null;
  /** Short-lived presigned GET URL, null when no photo. */
  photoUrl: string | null;
  role: PetRole;
  owner: { id: string; email: string };
  /** Active watchers (not pending invites). */
  watcherCount: number;
}

export interface PhotoUploadTicket {
  uploadUrl: string;
  key: string;
  expiresInSeconds: number;
}
