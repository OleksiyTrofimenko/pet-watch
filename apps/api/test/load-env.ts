import { resolve } from 'node:path';
import { config } from 'dotenv';

// `override` so a DATABASE_URL exported in the shell can never point the tests at the dev database.
const result = config({ path: resolve(__dirname, '../.env.test'), override: true, quiet: true });
if (result.error) {
  throw new Error(
    'apps/api/.env.test is missing. Run: cp apps/api/.env.test.example apps/api/.env.test',
  );
}
