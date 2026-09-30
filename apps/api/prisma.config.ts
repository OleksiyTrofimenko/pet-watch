import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7: connection config lives here, not in schema.prisma.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
