// One-command local setup after `pnpm install`: env files, services, contract, migrations, demo data.
// Safe to re-run: existing .env files are kept, data lives in Docker volumes, migrations and the
// seed are idempotent.
// Usage: pnpm bootstrap
import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { connect } from 'node:net';

const API_HEALTH = 'http://localhost:3000/health';

// Host ports the setup needs (docker-compose.yml, and the API started for the seed).
const PORTS = [
  { port: 5433, use: 'Postgres' },
  { port: 9000, use: 'S3 (SeaweedFS)' },
  { port: 1025, use: 'Mailpit SMTP' },
  { port: 8025, use: 'Mailpit web' },
  { port: 3000, use: 'API (if it is this project’s `pnpm dev:api`, stop it first)' },
];

function step(title) {
  console.log(`\n▸ ${title}`);
}

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) fail(`\`${command} ${args.join(' ')}\` failed (see above).`);
}

/** True when something accepts connections on the port (IPv4 or IPv6 loopback). */
function portInUse(port) {
  const probe = (host) =>
    new Promise((resolve) => {
      const socket = connect({ port, host });
      socket.setTimeout(500);
      socket.once('connect', () => (socket.destroy(), resolve(true)));
      socket.once('timeout', () => (socket.destroy(), resolve(false)));
      socket.once('error', () => resolve(false));
    });
  return Promise.all([probe('127.0.0.1'), probe('::1')]).then(([v4, v6]) => v4 || v6);
}

/** Our own API (`pnpm dev:api`) already running: the seed can use it. */
async function ourApiIsUp() {
  try {
    const body = await (await fetch(API_HEALTH)).json();
    return body?.status === 'ok' && body?.db === 'up';
  } catch {
    return false;
  }
}

async function waitForApi(timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await ourApiIsUp()) return true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

step('Checking prerequisites');
if (spawnSync('docker', ['info'], { stdio: 'ignore' }).status !== 0) {
  fail('Docker is not running. Start Docker Desktop and run `pnpm bootstrap` again.');
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

// Checked before stopping the database: `pnpm dev:api` already running owns port 3000 legitimately.
const apiRunning = await ourApiIsUp();

// Stop this project's containers first (volumes, i.e. the data, are kept). Every run then starts
// fresh containers, and any port still taken belongs to another program, so it can be named.
step('Stopping this project’s containers (data is kept)');
run('docker', ['compose', 'down']);

step('Checking ports');
const busy = [];
for (const { port, use } of PORTS) {
  if (port === 3000 && apiRunning) continue; // our own API, reused for the seed
  if (await portInUse(port)) busy.push({ port, use });
}
if (busy.length > 0) {
  const lines = busy.map(({ port, use }) => `  ${port}  ${use}`).join('\n');
  fail(
    `These ports are already in use by another program:\n${lines}\n\n` +
      `Stop what holds them and run \`pnpm bootstrap\` again. To find it:\n` +
      `  lsof -nP -iTCP:<port> -sTCP:LISTEN        # any program\n` +
      `  docker ps --filter publish=<port>         # a container from another project`,
  );
}
console.log('  all free');

step('Postgres, S3 (SeaweedFS) and Mailpit');
run('docker', ['compose', 'up', '-d', '--wait', 'postgres', 's3', 'mailpit']);
// --no-deps: S3 is already up and healthy; don't let `run` recreate it.
run('docker', ['compose', 'run', '--rm', '--no-deps', 's3-init']);

step('Shared contract and database schema');
run('pnpm', ['build:shared']);
run('pnpm', ['--filter', '@petwatch/api', 'prisma:deploy']);

step('Demo data (through the API)');
let api;
if (!(await ourApiIsUp())) {
  run('pnpm', ['--filter', '@petwatch/api', 'build']);
  api = spawn('node', ['dist/main.js'], { cwd: 'apps/api', stdio: 'ignore' });
  if (!(await waitForApi(60_000))) {
    api.kill();
    fail(`The API didn't become healthy on ${API_HEALTH} within a minute.`);
  }
}
const seed = spawnSync('pnpm', ['db:seed'], { stdio: 'inherit' });
api?.kill();
if (seed.status !== 0) fail('Seeding the demo data failed (see above).');

console.log(`
✔ Ready. Next:
  pnpm dev:api                              # API on http://localhost:3000
  pnpm --filter @petwatch/mobile ios        # or android (then: pnpm android:ports)
  Sign in as ana@example.com / petwatch-demo. Emails: http://localhost:8025`);
