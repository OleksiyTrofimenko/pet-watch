import type { PublicUser } from '@petwatch/shared';

export const publicUserSelect = { id: true, email: true } as const;

export function toPublicUser(row: { id: string; email: string }): PublicUser {
  return { id: row.id, email: row.email };
}
