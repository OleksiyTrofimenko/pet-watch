import { randomUUID } from 'node:crypto';
import type { PhotoUploadRequest } from '@petwatch/shared';

const EXTENSION: Record<PhotoUploadRequest['contentType'], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** The server picks the key (never the client), scoped to the pet: pets/{petId}/{uuid}.{ext}. */
export function newPhotoKey(petId: string, contentType: PhotoUploadRequest['contentType']): string {
  return `pets/${petId}/${randomUUID()}.${EXTENSION[contentType]}`;
}

/** True only for a key shaped exactly like newPhotoKey(petId, …) produces (no `..`, no nesting). */
export function isPhotoKeyOfPet(key: string, petId: string): boolean {
  const [prefix, keyPetId, file, ...rest] = key.split('/');
  return (
    prefix === 'pets' &&
    keyPetId === petId &&
    rest.length === 0 &&
    /^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(file ?? '')
  );
}
