import { loginSchema, refreshSchema, resetPasswordSchema } from './auth';

describe('auth schemas', () => {
  it('caps the login password like registration does', () => {
    const email = 'ana@petwatch.test';
    expect(loginSchema.safeParse({ email, password: 'x'.repeat(128) }).success).toBe(true);
    expect(loginSchema.safeParse({ email, password: 'x'.repeat(129) }).success).toBe(false);
  });

  it('caps opaque tokens, which are 43 characters', () => {
    const token = 'a'.repeat(43);
    expect(refreshSchema.safeParse({ refreshToken: token }).success).toBe(true);
    expect(refreshSchema.safeParse({ refreshToken: 'a'.repeat(10_000) }).success).toBe(false);
    expect(
      resetPasswordSchema.safeParse({ token: 'a'.repeat(10_000), password: 'long-enough' }).success,
    ).toBe(false);
  });
});
