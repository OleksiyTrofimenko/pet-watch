# PetWatch

Mobile app for pet owners who invite trusted people to look after their pets.
Expo (React Native) + NestJS + PostgreSQL, in one pnpm monorepo.

> Status: **scaffold**. Infrastructure, data model, contract package and app shells are in place.
> Feature progress is tracked in [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md).

## Quick start

Prerequisites: Node 22+, pnpm 10 (`corepack enable`), Docker, Xcode (iOS) and/or Android Studio.

```bash
pnpm install                       # installs everything, generates the Prisma client
cp .env.example apps/api/.env      # API config (defaults match docker-compose)
cp apps/mobile/.env.example apps/mobile/.env
pnpm db:up                         # Postgres :5432, SeaweedFS S3 :9000, Mailpit :8025
pnpm build:shared                  # compile the shared contract package
pnpm --filter @petwatch/api prisma:deploy   # apply committed migrations
pnpm dev:api                       # http://localhost:3000/health → {"status":"ok","db":"up"}

# in another terminal – first run builds the native dev client (a few minutes)
pnpm --filter @petwatch/mobile ios       # or: android
```

Android emulator: set `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000` (mobile `.env`) and
`S3_PUBLIC_ENDPOINT=http://10.0.2.2:9000` (API `.env`).

### Try the deep links

```bash
xcrun simctl openurl booted "petwatch://invites/<token>"
adb shell am start -W -a android.intent.action.VIEW -d "petwatch://invites/<token>" com.petwatch.app
```

Invite and reset emails are captured by Mailpit at http://localhost:8025.

## Repository layout

```
apps/api         NestJS 11 · Prisma 7 · PostgreSQL · JWT
apps/mobile      Expo SDK 57 · Expo Router · Gluestack UI v3 · TanStack Query · Jotai · RHF + Zod
packages/shared  Zod schemas + inferred types – the API contract used by both apps
docs/            REQUIREMENTS (traceability) · DECISIONS (why) · LEARNING (reading list)
CLAUDE.md, .claude/   AI configuration used while building this
```

## Technical choices (summary)

Full reasoning with rejected alternatives: [`docs/DECISIONS.md`](docs/DECISIONS.md).

- **One contract, two apps.** Zod schemas in `packages/shared` validate API requests (`nestjs-zod`) _and_
  mobile forms (`zodResolver`). Types are inferred, never duplicated.
- **Relationships, not roles.** Ownership is `pets.owner_id`; watching is a row in `pet_watchers`.
  Access is resolved per pet on the server; invisible pets return 404.
- **Schedules are rules.** A care task is "08:00 daily" or "18:00 Mon/Wed/Fri"; Today/Weekly views
  are computed from rules by a pure, tested function.
- **Auth.** 15-minute JWT access token + opaque, hashed, rotating refresh token (revocable).
  Reset and invite tokens are random, single-use, stored as SHA-256 hashes.
- **Uploads go straight to S3** with a presigned PUT; the API only stores the object key.

## What is stubbed and how to make it real

| Concern        | Local                          | Production                                                                                                                        |
| -------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Email          | Mailpit (real SMTP, web inbox) | Point `SMTP_*` at SES/Postmark/SendGrid SMTP, or swap the mail transport for the provider SDK                                     |
| Object storage | SeaweedFS (S3 API)             | Real S3: remove `S3_ENDPOINT`/`S3_PUBLIC_ENDPOINT`, use IAM role credentials, private bucket (+ CloudFront signed URLs if needed) |
| Deep links     | Custom scheme `petwatch://`    | Universal Links (iOS) / App Links (Android) on an https domain with a web fallback                                                |

## Assumptions

See the "Ambiguities → assumptions" section of [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md).

## Known limitations / with more time

_To be completed at the end of implementation._ Candidates: push reminders for due tasks, task completion log
("fed at 08:05 by Ana"), watcher can leave a pet, pet `birthDate` instead of age, universal links,
presigned POST with size limits, e2e tests (Maestro), CI pipeline.

- **Reset-password links use the custom scheme** (`petwatch://reset-password?token=…`). Many mail clients
  don't make custom-scheme links clickable. Production would send an https link handled by Universal
  Links (iOS) / App Links (Android), with a web fallback page.
- **Rate limits are in memory** (D41): fine for one API instance; several instances need shared (Redis) storage.

## Working with AI

Built with Claude Code. Project rules for the assistant live in [`CLAUDE.md`](CLAUDE.md); reusable prompts in
[`.claude/commands`](.claude/commands) (`/feature`, `/check`, `/review`, `/explain`). Every generated change was reviewed,
typechecked and tested; decisions are recorded in `docs/DECISIONS.md`.
