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
