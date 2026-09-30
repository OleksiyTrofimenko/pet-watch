import { z } from 'zod';

export const SPECIES = ['DOG', 'CAT', 'BIRD', 'RABBIT', 'FISH', 'REPTILE', 'OTHER'] as const;
export const speciesSchema = z.enum(SPECIES);
export type Species = z.infer<typeof speciesSchema>;

export const createPetSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50),
  species: speciesSchema,
  breed: z.string().trim().max(50).optional(),
  ageYears: z.number().int().min(0).max(50).optional(),
  notes: z.string().trim().max(1000).optional(),
});
export type CreatePetInput = z.infer<typeof createPetSchema>;

export const updatePetSchema = createPetSchema.partial();
export type UpdatePetInput = z.infer<typeof updatePetSchema>;

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
}

export interface PhotoUploadTicket {
  uploadUrl: string;
  key: string;
  expiresInSeconds: number;
}
