import { ApiError, NETWORK_ERROR } from './api-client';
import { shouldRetryQuery } from './query-client';

// query-client wires NetInfo at import; the native module doesn't exist under Jest.
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
}));

describe('shouldRetryQuery', () => {
  it('retries a network error or a server error once', () => {
    const offline = new ApiError(0, NETWORK_ERROR, 'Offline');
    const serverDown = new ApiError(503, 'UNKNOWN_ERROR', 'Down');
    expect(shouldRetryQuery(0, offline)).toBe(true);
    expect(shouldRetryQuery(0, serverDown)).toBe(true);
    expect(shouldRetryQuery(1, serverDown)).toBe(false);
  });

  it('never retries a 4xx: a deleted pet or lost access stays that way', () => {
    expect(shouldRetryQuery(0, new ApiError(404, 'PET_NOT_FOUND', 'Gone'))).toBe(false);
    expect(shouldRetryQuery(0, new ApiError(403, 'FORBIDDEN', 'No access'))).toBe(false);
  });
});
