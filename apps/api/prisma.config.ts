import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma 7: connection config lives here, not in schema.prisma. Read the URL without `env()`, which
// throws when it's unset: `prisma generate` (run by `pnpm install`) needs no database, so a fresh
// clone installs before any .env exists. Commands that connect (migrate, studio) report the missing URL.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL },
});
