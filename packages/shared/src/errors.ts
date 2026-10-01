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
