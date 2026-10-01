import { Client } from 'pg';
import './load-env';

/**
 * Leave the test database empty. resetDb() runs *before* each test, so without this the last
 * test's rows stay behind, and a new migration (e.g. a stricter CHECK) can fail to apply on them.
 */
export default async function globalTeardown(): Promise<void> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const { rows } = await client.query<{ tablename: string }>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`,
    );
    if (rows.length > 0) {
      const tables = rows.map(({ tablename }) => `"public"."${tablename}"`).join(', ');
      await client.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
    }
  } finally {
    await client.end();
  }
}
