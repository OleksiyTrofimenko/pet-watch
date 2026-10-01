import { ApiError, NETWORK_ERROR } from './api-client';
import { applyServerErrors } from './form-errors';

type Form = { email: string; password: string };
const FIELDS = ['email', 'password'] as const;

describe('applyServerErrors', () => {
  it('puts fieldErrors on their fields and returns no form message', () => {
    const setError = jest.fn();
    const error = new ApiError(400, 'VALIDATION_FAILED', 'Some fields are invalid', {
      email: 'Enter a valid email',
      unknownField: 'ignored',
    });

    expect(applyServerErrors<Form>(error, setError, FIELDS)).toBeNull();
    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith('email', {
      type: 'server',
      message: 'Enter a valid email',
    });
  });

  it('maps a domain code onto its field, typed with the code', () => {
    const setError = jest.fn();
    const error = new ApiError(409, 'EMAIL_TAKEN', 'An account with this email already exists');

    expect(applyServerErrors<Form>(error, setError, FIELDS, { EMAIL_TAKEN: 'email' })).toBeNull();
    expect(setError).toHaveBeenCalledWith(
      'email',
      { type: 'EMAIL_TAKEN', message: 'An account with this email already exists' },
      { shouldFocus: true },
    );
  });

  it('returns the server message for form-level errors like wrong credentials', () => {
    const setError = jest.fn();
    const error = new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');

    expect(applyServerErrors<Form>(error, setError, FIELDS)).toBe('Email or password is incorrect');
    expect(setError).not.toHaveBeenCalled();
  });

  it('returns the offline message for network errors and a generic one for anything else', () => {
    const offline = new ApiError(0, NETWORK_ERROR, "You're offline.");
    expect(applyServerErrors<Form>(offline, jest.fn(), FIELDS)).toBe("You're offline.");
    expect(applyServerErrors<Form>(new Error('boom'), jest.fn(), FIELDS)).toBe(
      'Something went wrong. Please try again.',
    );
  });
});
