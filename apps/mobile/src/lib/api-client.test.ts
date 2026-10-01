import type { AuthResponse } from '@petwatch/shared';
import { ApiError, NETWORK_ERROR, apiClient, onSessionEnded } from './api-client';
import { tokenStore } from './token-store';

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    setItemAsync: jest.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
  };
});

const user = { id: 'u1', email: 'ana@petwatch.test' };
const session = (n: number): AuthResponse => ({
  user,
  accessToken: `access-${n}`,
  refreshToken: `refresh-${n}`,
});

const json = (status: number, body?: unknown) =>
  Promise.resolve(new Response(body === undefined ? null : JSON.stringify(body), { status }));
const unauthenticated = () =>
  json(401, { statusCode: 401, code: 'UNAUTHENTICATED', message: 'Please sign in' });

const fetchMock = jest.fn<Promise<Response>, [string, RequestInit]>();
globalThis.fetch = fetchMock as typeof fetch;

const authHeader = (init: RequestInit) => new Headers(init.headers).get('Authorization');
const calls = (path: string) => fetchMock.mock.calls.filter(([url]) => url.endsWith(path));

beforeEach(async () => {
  fetchMock.mockReset();
  await tokenStore.save(session(1));
});

describe('apiClient', () => {
  it('attaches the access token', async () => {
    fetchMock.mockImplementation(() => json(200, { ok: true }));

    await expect(apiClient.get('/pets')).resolves.toEqual({ ok: true });
    expect(authHeader(fetchMock.mock.calls[0]![1])).toBe('Bearer access-1');
  });

  it('refreshes once for three parallel 401s and retries all three with the new token', async () => {
    let resolveRefresh: (res: Response) => void = () => undefined;
    fetchMock.mockImplementation((url, init) => {
      if (url.endsWith('/auth/refresh')) {
        // Hold the refresh open so all three requests are waiting on it at the same time.
        return new Promise((resolve) => (resolveRefresh = resolve));
      }
      return authHeader(init) === 'Bearer access-2' ? json(200, { url }) : unauthenticated();
    });

    const pending = Promise.all([apiClient.get('/a'), apiClient.get('/b'), apiClient.get('/c')]);
    await new Promise((resolve) => setTimeout(resolve, 0));
    resolveRefresh(new Response(JSON.stringify(session(2)), { status: 200 }));

    await expect(pending).resolves.toHaveLength(3);
    expect(calls('/auth/refresh')).toHaveLength(1);
    expect(JSON.parse(String(calls('/auth/refresh')[0]![1].body))).toEqual({
      refreshToken: 'refresh-1',
    });
    expect(await tokenStore.get()).toEqual(session(2));
  });

  it('signs out when the refresh token is rejected', async () => {
    const ended = jest.fn();
    onSessionEnded(ended);
    fetchMock.mockImplementation((url) =>
      url.endsWith('/auth/refresh')
        ? json(401, { statusCode: 401, code: 'INVALID_REFRESH_TOKEN', message: 'Session ended' })
        : unauthenticated(),
    );

    await expect(apiClient.get('/pets')).rejects.toMatchObject({ code: 'INVALID_REFRESH_TOKEN' });
    expect(ended).toHaveBeenCalledTimes(1);
    expect(await tokenStore.get()).toBeNull();
  });

  it('keeps the session when the refresh fails because the device is offline', async () => {
    const ended = jest.fn();
    onSessionEnded(ended);
    fetchMock.mockImplementation((url) =>
      url.endsWith('/auth/refresh')
        ? Promise.reject(new TypeError('Network request failed'))
        : unauthenticated(),
    );

    await expect(apiClient.get('/pets')).rejects.toMatchObject({ code: NETWORK_ERROR });
    expect(ended).not.toHaveBeenCalled();
    expect(await tokenStore.get()).toEqual(session(1));
  });

  it('does not refresh on other 401s, e.g. wrong credentials on login', async () => {
    fetchMock.mockImplementation(() =>
      json(401, {
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect',
      }),
    );

    await expect(apiClient.post('/auth/login', {})).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Email or password is incorrect',
    });
    expect(calls('/auth/refresh')).toHaveLength(0);
  });

  it('maps validation errors and unexpected bodies to ApiError', async () => {
    fetchMock.mockImplementationOnce(() =>
      json(400, {
        statusCode: 400,
        code: 'VALIDATION_FAILED',
        message: 'Some fields are invalid',
        fieldErrors: { email: 'Invalid email' },
      }),
    );
    await expect(apiClient.post('/auth/register', {})).rejects.toEqual(
      new ApiError(400, 'VALIDATION_FAILED', 'Some fields are invalid', { email: 'Invalid email' }),
    );

    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(new Response('<html>502</html>', { status: 502 })),
    );
    await expect(apiClient.get('/pets')).rejects.toMatchObject({
      status: 502,
      code: 'UNKNOWN_ERROR',
    });
  });
});
