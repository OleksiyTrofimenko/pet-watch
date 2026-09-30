import { validateEnv } from './env';

const base = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  JWT_ACCESS_SECRET: 'x'.repeat(32),
  S3_ENDPOINT: 'http://localhost:9000',
  S3_PUBLIC_ENDPOINT: 'http://localhost:9000',
  S3_REGION: 'us-east-1',
  S3_BUCKET: 'petwatch',
  S3_ACCESS_KEY: 'k',
  S3_SECRET_KEY: 's',
  SMTP_HOST: 'localhost',
  SMTP_PORT: '1025',
  MAIL_FROM: 'PetWatch <no-reply@petwatch.local>',
};

describe('validateEnv', () => {
  it('coerces numbers and applies defaults', () => {
    const env = validateEnv(base);
    expect(env.SMTP_PORT).toBe(1025);
    expect(env.PORT).toBe(3000);
    expect(env.JWT_ACCESS_TTL_SECONDS).toBe(900);
    expect(env.THROTTLE_LIMIT).toBe(10);
    expect(env.THROTTLE_STRICT_LIMIT).toBe(5);
  });

  it('fails fast with a readable message on bad config', () => {
    expect(() => validateEnv({ ...base, JWT_ACCESS_SECRET: 'short' })).toThrow(/JWT_ACCESS_SECRET/);
  });
});
