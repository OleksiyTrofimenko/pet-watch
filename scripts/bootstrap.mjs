// One-command local setup after `pnpm install`: env files, services, contract, migrations, demo data.
// Safe to re-run: existing .env files are kept, migrations and the seed are idempotent.
// Usage: pnpm bootstrap
import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync } from 'node:fs';

const API_HEALTH = 'http://localhost:3000/health';

function step(title) {
  console.log(`\n▸ ${title}`);
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`\n✖ ${command} ${args.join(' ')} failed.`);
    process.exit(result.status ?? 1);
  }
}

async function apiIsUp() {
  try {
    const response = await fetch(API_HEALTH);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForApi(timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await apiIsUp()) return true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

step('Checking prerequisites');
if (spawnSync('docker', ['info'], { stdio: 'ignore' }).status !== 0) {
  console.error('✖ Docker is not running. Start Docker Desktop and run `pnpm bootstrap` again.');
  process.exit(1);
}

step('Environment files (existing ones are kept)');
for (const [example, target] of [
  ['.env.example', 'apps/api/.env'],
  ['apps/api/.env.test.example', 'apps/api/.env.test'],
  ['apps/mobile/.env.example', 'apps/mobile/.env'],
]) {
  if (existsSync(target)) {
    console.log(`  keep   ${target}`);
    if (
      target.startsWith('apps/api/') &&
      readFileSync(target, 'utf8').includes('@localhost:5432/')
    ) {
      console.warn(
        `  ⚠ ${target} uses port 5432; the Docker Postgres is on 5433 now (see ${example}).`,
      );
    }
  } else {
    copyFileSync(example, target);
    console.log(`  create ${target} (from ${example})`);
  }
}

step('Postgres, S3 (SeaweedFS) and Mailpit');
run('docker', ['compose', 'up', '-d', '--wait', 'postgres', 's3', 'mailpit']);
run('docker', ['compose', 'run', '--rm', 's3-init']);

step('Shared contract and database schema');
run('pnpm', ['build:shared']);
run('pnpm', ['--filter', '@petwatch/api', 'prisma:deploy']);

step('Demo data (through the API)');
let api;
if (!(await apiIsUp())) {
  run('pnpm', ['--filter', '@petwatch/api', 'build']);
  api = spawn('node', ['dist/main.js'], { cwd: 'apps/api', stdio: 'ignore' });
  if (!(await waitForApi(60_000))) {
    api.kill();
    console.error(`✖ The API didn't answer on ${API_HEALTH}. Is port 3000 free?`);
    process.exit(1);
  }
}
const seed = spawnSync('pnpm', ['db:seed'], { stdio: 'inherit' });
api?.kill();
if (seed.status !== 0) process.exit(seed.status ?? 1);

console.log(`
✔ Ready. Next:
  pnpm dev:api                              # API on http://localhost:3000
  pnpm --filter @petwatch/mobile ios        # or android (then: pnpm android:ports)
  Sign in as ana@example.com / petwatch-demo. Emails: http://localhost:8025`);
