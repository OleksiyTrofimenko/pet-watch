# Decisions log

Short ADR-style entries: the choice, why, and what was rejected. Newest at the bottom.
This is the file to re-read before the review.

## Scaffold (2026-09-30)

| # | Decision | Why | Rejected alternative |
|---|----------|-----|----------------------|
| D1 | **pnpm workspaces monorepo** (`apps/api`, `apps/mobile`, `packages/shared`) | One repo to review; shared contract without publishing packages | Nx / Turborepo: caching + generators we don't need for 2 apps |
| D2 | **Shared Zod schemas** in `packages/shared` | One validation rule used by NestJS DTOs *and* React Hook Form; types inferred, never hand-written | class-validator DTOs on the API + separate Zod on mobile → every rule written twice and drifts |
| D3 | **`node-linker=hoisted`** | Metro and several RN native modules still assume a flat `node_modules` | pnpm's default isolated layout: works for Node, fragile for React Native |
| D4 | **NestJS 11**, not 12 | Nest 12 (Aug 2026) is ESM-only and `nestjs-zod` peers `@nestjs/common ^10 \|\| ^11` | Latest major: would mean fighting ecosystem lag in a timed exercise |
| D5 | **Prisma 7.10** (stable), not 8 RC | Stable; typed client; committed SQL migrations; driver adapter (`@prisma/adapter-pg`) = no Rust query engine | Drizzle (closer to SQL, also good); TypeORM (weaker types, decorator entities) |
| D6 | **UUID v7 primary keys** | Unguessable in URLs like v4, but time-ordered → better B-tree index locality | Autoincrement ints: leak counts, enumerable |
| D7 | **snake_case tables/columns via `@map`** | Idiomatic Postgres; camelCase in TS | Prisma defaults (quoted camelCase identifiers in SQL) |
| D8 | **Watcher = row in `pet_watchers`**, ownership = `pets.owner_id` | Brief: owner/watcher are per-pet relationships, not global roles | `role` column on `users` |
| D9 | **One `invitations` row per (pet, invitee)**, token rotated on re-invite | No duplicate pending invites without a partial unique index; clean history per pair | Row per send + partial unique index `WHERE status='PENDING'` (Prisma can't express it in schema) |
| D10 | **Care task = recurrence rule** (`timeOfDay` minutes, `DAILY`/`WEEKLY`, `daysOfWeek int[]`) | "Feed 08:00 daily" is 1 row; Today/Weekly computed by a pure, unit-tested function | Materialised occurrences: needs a generator job, backfills, cleanup |
| D11 | **Wall-clock times in the viewer's local timezone** | Pets eat at "8am where the pet is"; owner and watcher are normally in the same place | Store UTC instants: breaks on DST and for recurring rules |
| D12 | **Short JWT access token (15 min) + opaque rotating refresh token, stored hashed** | Refresh tokens are revocable (logout, password reset, reuse detection) | Long-lived JWT only: can't log anyone out |
| D13 | **All one-time tokens stored as SHA-256 hashes** (refresh, reset, invite) | DB leak ≠ usable links. Tokens are high-entropy random, so a fast hash is enough | Plain tokens; or bcrypt/argon2 for tokens (slow hash is only needed for low-entropy passwords) |
| D14 | **argon2id** for passwords | OWASP first recommendation | bcrypt (fine, 72-byte limit) |
| D15 | **404 (not 403) when a pet isn't visible to the caller** | Don't reveal that a pet ID exists | 403 everywhere |
| D16 | **One error envelope** `{statusCode, code, message, fieldErrors?}` via a global filter | Client maps `fieldErrors` straight to RHF `setError`; stable `code`s for UI copy | Nest default shapes (differ between validation and HTTP errors) |
| D17 | **Env validated with Zod at boot** | Fail fast on misconfiguration | Reading `process.env` ad hoc |
| D18 | **Docker Compose for infra only** (Postgres, MinIO, Mailpit); API + app run on host | Hot reload + simulators reach `localhost` without container networking | API in a container: slower loop, extra networking config for devices |
| D19 | **MinIO for S3, Mailpit for SMTP** | Real presigned URLs and real SMTP locally; production = change env vars (S3/SES) | Logging links / writing files: doesn't exercise the real code path |
| D20 | **Expo Router** | File-based routes = deep links for free (`app/invites/[token].tsx` ↔ `petwatch://invites/<token>`); `Stack.Protected` for auth gating | React Navigation + manual linking config |
| D21 | **Gluestack UI v3 + NativeWind v4 (Tailwind 3)** | Stable pair. Gluestack's v5 CLI labels itself alpha and its generated components failed `tsc` against NativeWind v5 RC (breaks the "fully typed" rule) | Gluestack v5 + NativeWind v5 RC (re-evaluate when stable) |
| D22 | **TypeScript 6.0 everywhere** | Expo SDK 57 pins TS 6.0; one compiler across the repo | TS 7 (native Go compiler; tooling like ts-jest not ready) |
| D23 | **Jotai for UI state** (view mode, pet filter); **Context only for the auth session** | Atoms re-render only subscribers; no provider needed | Context for everything: re-renders whole subtree on each change |
| D24 | **TanStack Query `onlineManager` + `focusManager` wired to NetInfo/AppState** | RN has no browser online/focus events; gives offline pause + refetch on foreground | Manual refetch logic in screens |
| D25 | **Development build** (`expo run:ios/android`), not Expo Go | Custom URL scheme `petwatch://` and native modules need our own binary | Expo Go: deep links become `exp://…/--/…` |
