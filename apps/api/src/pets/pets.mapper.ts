import type { PetDto } from '@petwatch/shared';
import { publicUserSelect } from '../users/users.mapper';

/** Everything a PetDto needs, in one query. */
export const petSelect = {
  id: true,
  name: true,
  species: true,
  breed: true,
  ageYears: true,
  notes: true,
  photoKey: true,
  ownerId: true,
  owner: { select: publicUserSelect },
  _count: { select: { watchers: true } },
} as const;

type PetRow = {
  id: string;
  name: string;
  species: PetDto['species'];
  breed: string | null;
  ageYears: number | null;
  notes: string | null;
  ownerId: string;
  owner: { id: string; email: string };
  _count: { watchers: number };
};

/** Row → DTO for one viewer. The photo key never leaves the API; only a presigned URL does. */
export function toPetDto(row: PetRow, viewerId: string, photoUrl: string | null): PetDto {
  return {
    id: row.id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    ageYears: row.ageYears,
    notes: row.notes,
    photoUrl,
    role: row.ownerId === viewerId ? 'OWNER' : 'WATCHER',
    owner: { id: row.owner.id, email: row.owner.email },
    watcherCount: row._count.watchers,
  };
}
