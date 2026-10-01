import { z } from 'zod';
import { AUTH_ERROR_CODES, type AuthResponse } from '@petwatch/shared';
import { API_URL } from './env';
import { tokenStore } from './token-store';

export const NETWORK_ERROR = 'NETWORK_ERROR';

/** Every failed call rejects with this: the server's ApiErrorBody, or NETWORK_ERROR. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

let sessionEndedListener: () => void = () => undefined;

/** The session provider subscribes here: a failed refresh means the user is signed out. */
export function onSessionEnded(listener: () => void): void {
  sessionEndedListener = listener;
}

/**
 * Single-flight refresh. Module-level (not React state) so every request, from any screen,
 * awaits the same promise: the server treats a second use of a rotated token as theft (D40).
 */
let refreshing: Promise<void> | null = null;

function refreshSession(): Promise<void> {
  refreshing ??= (async () => {
    const session = await tokenStore.get();
    if (!session) throw new ApiError(401, AUTH_ERROR_CODES.UNAUTHENTICATED, 'Please sign in.');
    try {
      await tokenStore.save(
        await send<AuthResponse>('POST', '/auth/refresh', { refreshToken: session.refreshToken }),
      );
    } catch (error) {
      // Offline or a server hiccup: keep the session and let the caller retry later.
      if (error instanceof ApiError && error.status === 401) {
        await tokenStore.clear();
        sessionEndedListener();
      }
      throw error;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function send<T>(method: Method, path: string, body?: unknown, accessToken?: string) {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, NETWORK_ERROR, "You're offline. Check your connection and try again.");
  }

  const json = parseJson(await res.text());
  if (!res.ok) throw toApiError(res.status, json);
  return json as T;
}

/** 204s have no body, and a proxy error page isn't JSON: neither may crash the caller. */
function parseJson(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** ApiErrorBody, read defensively: a proxy or crash page may answer with anything. */
const errorBodySchema = z.object({
  code: z.string(),
  message: z.string(),
  fieldErrors: z.record(z.string(), z.string()).optional(),
});

function toApiError(status: number, json: unknown): ApiError {
  const body = errorBodySchema.safeParse(json);
  return body.success
    ? new ApiError(status, body.data.code, body.data.message, body.data.fieldErrors)
    : new ApiError(status, 'UNKNOWN_ERROR', 'Something went wrong. Please try again.');
}

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const session = await tokenStore.get();
  try {
    return await send<T>(method, path, body, session?.accessToken);
  } catch (error) {
    const expired =
      error instanceof ApiError &&
      error.code === AUTH_ERROR_CODES.UNAUTHENTICATED &&
      session !== null;
    if (!expired) throw error;

    // Another request may have refreshed while this one was in flight: then just retry.
    const current = await tokenStore.get();
    if (current?.accessToken === session.accessToken) await refreshSession();
    const fresh = await tokenStore.get();
    return send<T>(method, path, body, fresh?.accessToken); // retry once, never loop
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
