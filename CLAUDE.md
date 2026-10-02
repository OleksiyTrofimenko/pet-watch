# PetWatch — guide for Claude

PetWatch is a take-home MVP: Expo (React Native) app + NestJS API for pet owners who invite
trusted users to watch their pets. Treat it as the first commit of a long-lived product:
**small, readable, explainable code beats volume.** The author must be able to defend every line.

App-specific patterns live next to the code and load automatically when you work there:

- `apps/api/CLAUDE.md` — NestJS layering, access control, PostgreSQL/Prisma conventions
- `apps/mobile/CLAUDE.md` — design-system layers, component rules, data/forms patterns

## Repo map

```
apps/api         NestJS 11 + Prisma 7 + PostgreSQL (REST, JWT)
apps/mobile      Expo SDK 57 + Expo Router + Gluestack UI v3 (NativeWind v4)
packages/shared  Zod schemas + inferred types = the API contract (used by both apps)
docs/            REQUIREMENTS (what) · DECISIONS (why) · DESIGN_PROMPT
```

## Commands

```bash
pnpm install                 # also runs `prisma generate` for the API
pnpm db:up                   # postgres, seaweedfs s3 (+bucket), mailpit
pnpm build:shared            # rebuild the contract after editing packages/shared
pnpm --filter @petwatch/api prisma:migrate   # create/apply migrations (dev)
pnpm dev:api                 # http://localhost:3000/health
pnpm --filter @petwatch/mobile ios|android   # dev build (custom scheme needs it; not Expo Go)
pnpm typecheck && pnpm lint && pnpm test     # static checks + unit tests
pnpm test:e2e                # API e2e (real services, petwatch_test DB); needs db:up + apps/api/.env.test
pnpm e2e:mobile              # Maestro flows; needs API + Metro + dev build on a booted simulator
pnpm format                  # prettier
```

## Cross-cutting rules

1. **No `any`**, no `as unknown as`, no `@ts-ignore`/`eslint-disable` to silence a problem. Model the type.
2. **The contract lives in `packages/shared`.** Every request body/query is a Zod schema there, used by
   the API DTO _and_ the mobile form. Never duplicate a validation rule. Rebuild with `pnpm build:shared`.
3. **"Owner"/"watcher" are per-pet relationships, not user roles.** Never add a role to `User`.
4. **Errors have one shape** (`ApiErrorBody`: `statusCode, code, message, fieldErrors?`) with stable `code`s.
5. **Secrets are stored hashed**: passwords (argon2id), refresh/reset/invite tokens (SHA-256).
6. **Care tasks are rules, not occurrences.** Views expand rules with a pure, tested function.
7. **Lint rules encode architecture.** If a boundary rule fires, fix the design; don't disable the rule.

## How to work with me

- Before non-trivial work: a short plan (files to touch, one decision + the rejected alternative). Wait for OK.
- Build one vertical slice at a time (shared schema → API → mobile), smallest change that satisfies
  the requirement ID in `docs/REQUIREMENTS.md`.
- Prefer extending an existing pattern over inventing a new one. If something repeats twice, extract it.
- Don't add a dependency without saying why the platform/existing deps aren't enough.
- Record real choices in `docs/DECISIONS.md` (one row). Update the requirement status.
- Finish with: what changed, how it was verified, open questions. **Definition of done:**
  `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e` pass, plus `pnpm e2e:mobile` when a
  simulator is booted. Each slice adds API e2e tests and a Maestro flow for its journey.

## Local dev gotchas

- Android emulator reaches the host at `10.0.2.2`; set `EXPO_PUBLIC_API_URL` and `S3_PUBLIC_ENDPOINT`.
- Deep links: `xcrun simctl openurl booted "petwatch://invites/<token>"` /
  `adb shell am start -W -a android.intent.action.VIEW -d "petwatch://invites/<token>"`.
- Emails land in Mailpit: http://localhost:8025. S3 (SeaweedFS): http://localhost:9000 (no web console).
