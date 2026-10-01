/**
 * Opt-in demo data (`pnpm db:seed`), created through the running API, never written to the DB
 * directly, so hashing, access rules and the invite flow are the real ones. Safe to re-run.
 * Needs: `pnpm db:up` and `pnpm dev:api`.
 */
import type { AuthResponse, CareTaskInput, CreatePetInput, PetDto } from '@petwatch/shared';

const API = process.env.API_URL ?? 'http://localhost:3000';
const MAILPIT = process.env.MAILPIT_URL ?? 'http://localhost:8025';
const PASSWORD = 'petwatch-demo';

// Plain fields only: Node runs this file by stripping types, which can't do parameter properties.
class HttpError extends Error {
  readonly status: number;
  constructor(status: number, body: string) {
    super(`HTTP ${status}: ${body}`);
    this.status = status;
  }
}

async function call<T>(method: string, path: string, body?: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new HttpError(res.status, text);
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Register, or log in when the account already exists (re-runs). */
async function account(email: string): Promise<AuthResponse> {
  try {
    return await call<AuthResponse>('POST', '/auth/register', { email, password: PASSWORD });
  } catch (error) {
    if (!(error instanceof HttpError) || error.status !== 409) throw error;
    return call<AuthResponse>('POST', '/auth/login', { email, password: PASSWORD });
  }
}

async function pet(owner: AuthResponse, input: CreatePetInput, tasks: CareTaskInput[]) {
  const existing = (await call<PetDto[]>('GET', '/pets', undefined, owner.accessToken)).find(
    (p) => p.name === input.name && p.role === 'OWNER',
  );
  if (existing) return existing;
  const created = await call<PetDto>('POST', '/pets', input, owner.accessToken);
  for (const task of tasks) {
    await call('POST', `/pets/${created.id}/care-tasks`, task, owner.accessToken);
  }
  return created;
}

/** The invite link from the newest email to `email`, as the invitee's phone would open it. */
async function inviteToken(email: string): Promise<string> {
  for (let attempt = 0; attempt < 50; attempt++) {
    const search = (await (
      await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`)
    ).json()) as { messages: { ID: string }[] };
    const id = search.messages[0]?.ID;
    if (id) {
      const message = (await (await fetch(`${MAILPIT}/api/v1/message/${id}`)).json()) as {
        Text: string;
      };
      const match = /petwatch:\/\/invites\/([A-Za-z0-9_-]+)/.exec(message.Text);
      if (match?.[1]) return match[1];
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`No invite email to ${email} in Mailpit`);
}

async function main(): Promise<void> {
  const ana = await account('ana@example.com');
  const sam = await account('sam@example.com');
  await account('lee@example.com');

  const rex = await pet(
    ana,
    {
      name: 'Rex',
      species: 'DOG',
      breed: 'Labrador',
      ageYears: 4,
      notes: 'Scared of thunder — close the curtains. Loves ear scratches.',
    },
    [
      {
        type: 'MEDICATION',
        title: 'Joint supplement',
        timeOfDay: 450,
        recurrence: 'DAILY',
        notes: 'Hide it in a spoon of wet food.',
      },
      {
        type: 'FEEDING',
        title: 'Breakfast',
        timeOfDay: 480,
        recurrence: 'DAILY',
        notes: '1 cup dry food, fresh water.',
      },
      {
        type: 'WALK',
        title: 'Evening walk',
        timeOfDay: 1110,
        recurrence: 'DAILY',
        notes: 'Park loop. Keep him on the lead near the road.',
      },
      {
        type: 'GROOMING',
        title: 'Brush coat',
        timeOfDay: 600,
        recurrence: 'WEEKLY',
        daysOfWeek: [6],
      },
    ],
  );
  const miso = await pet(ana, { name: 'Miso', species: 'CAT', ageYears: 2 }, [
    { type: 'FEEDING', title: 'Wet food', timeOfDay: 420, recurrence: 'DAILY' },
    {
      type: 'PLAY',
      title: 'Feather wand time',
      timeOfDay: 1020,
      recurrence: 'WEEKLY',
      daysOfWeek: [1, 3, 5],
      notes: '10 minutes, then two treats.',
    },
  ]);

  // Sam watches Rex: a real invite, accepted with the token from the email.
  const toSam = await call<{ outcome: string }>(
    'POST',
    `/pets/${rex.id}/invitations`,
    { email: 'sam@example.com' },
    ana.accessToken,
  );
  if (toSam.outcome !== 'ALREADY_WATCHING') {
    await call(
      'POST',
      `/invitations/${await inviteToken('sam@example.com')}/accept`,
      undefined,
      sam.accessToken,
    );
  }
  // Lee has a pending invite to Miso (shows "Pending" in Miso's watchers).
  await call('POST', `/pets/${miso.id}/invitations`, { email: 'lee@example.com' }, ana.accessToken);

  console.log(`Demo data ready (password for every account: ${PASSWORD})
  ana@example.com  owns Rex and Miso, with care routines
  sam@example.com  watches Rex
  lee@example.com  has a pending invite to Miso (link in Mailpit: ${MAILPIT})`);
}

main().catch((error: unknown) => {
  console.error('Seed failed. Is the API running (pnpm dev:api) with pnpm db:up?');
  console.error(error);
  process.exit(1);
});
