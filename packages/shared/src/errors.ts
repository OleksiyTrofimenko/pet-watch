/**
 * Single error envelope returned by every API error.
 * The mobile client maps `fieldErrors` straight into React Hook Form `setError`.
 */
export interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

/** Stable auth error codes. The mobile client switches on these, so never rename one. */
export const AUTH_ERROR_CODES = {
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
} as const;
export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

/** Stable pet error codes (access rules and photo upload). */
export const PET_ERROR_CODES = {
  /** The pet doesn't exist or the caller can't see it: indistinguishable on purpose. */
  PET_NOT_FOUND: 'PET_NOT_FOUND',
  OWNER_ONLY: 'OWNER_ONLY',
  /** The confirmed key wasn't issued for this pet. */
  INVALID_PHOTO_KEY: 'INVALID_PHOTO_KEY',
  /** Confirm was called before the upload to S3 finished. */
  PHOTO_NOT_UPLOADED: 'PHOTO_NOT_UPLOADED',
} as const;
export type PetErrorCode = (typeof PET_ERROR_CODES)[keyof typeof PET_ERROR_CODES];

/** Stable care task error codes. */
export const CARE_TASK_ERROR_CODES = {
  /** No such task on this pet (also when the id belongs to another pet). */
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
} as const;

/** Stable invitation error codes (the accept screen has one state per code). */
export const INVITATION_ERROR_CODES = {
  /** Only registered users can be invited (required by the brief; enumeration trade-off noted). */
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  CANNOT_INVITE_SELF: 'CANNOT_INVITE_SELF',
  /** Unknown token, or the pet (and with it the invitation) was deleted. */
  INVITE_NOT_FOUND: 'INVITE_NOT_FOUND',
  INVITE_FOR_OTHER_USER: 'INVITE_FOR_OTHER_USER',
  INVITE_EXPIRED: 'INVITE_EXPIRED',
  /** The owner cancelled the invite or removed the watcher. */
  INVITE_REVOKED: 'INVITE_REVOKED',
  INVITE_ALREADY_ACCEPTED: 'INVITE_ALREADY_ACCEPTED',
  WATCHER_NOT_FOUND: 'WATCHER_NOT_FOUND',
} as const;
export type InvitationErrorCode =
  (typeof INVITATION_ERROR_CODES)[keyof typeof INVITATION_ERROR_CODES];
