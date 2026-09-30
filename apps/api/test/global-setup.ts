import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { Client } from 'pg';
import './load-env';

/**
 * Once per run: make sure the test database exists and has every committed migration.
 * `migrate deploy` only applies pending migrations and never drops anything; clean data comes
 * from resetDb() before each test. If an applied migration was ever edited, drop petwatch_test once.
 */
export default async function globalSetup(): Promise<void> {
  const url = new URL(process.env.DATABASE_URL ?? '');
  const dbName = url.pathname.slice(1);
  // resetDb() truncates every table; refuse anything that isn't clearly a test database.
  if (!dbName.endsWith('_test')) {
    throw new Error(`Refusing to run e2e tests against "${dbName}": the name must end in _test`);
  }

  await createDatabaseIfMissing(url, dbName);
  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    cwd: resolve(__dirname, '..'),
    env: process.env,
    stdio: ['ignore', 'ignore', 'inherit'],
  });
}

async function createDatabaseIfMissing(url: URL, dbName: string): Promise<void> {
  // Connect to the server's default database; the test database may not exist yet.
  const admin = new URL(url);
  admin.pathname = '/postgres';
  admin.search = '';
  const client = new Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      dbName,
    ]);
    // Identifiers can't be query parameters; dbName is from our own .env.test and checked above.
    if (rowCount === 0) await client.query(`CREATE DATABASE "${dbName}"`);
  } finally {
    await client.end();
  }
}
