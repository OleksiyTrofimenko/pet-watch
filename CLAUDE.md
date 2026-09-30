# PetWatch — guide for Claude

PetWatch is a take-home MVP: Expo (React Native) app + NestJS API for pet owners who invite
trusted users to watch their pets. Treat it as the first commit of a long-lived product:
small, readable, explainable code beats volume. The author must be able to defend every line.

## Repo map

```
apps/api         NestJS 11 + Prisma 7 + PostgreSQL (REST, JWT)
apps/mobile      Expo SDK 57 + Expo Router + Gluestack UI v3 (NativeWind v4)
packages/shared  Zod schemas + inferred types = the API contract (used by both apps)
docs/            DECISIONS.md (why), LEARNING.md (reading list), REQUIREMENTS.md (traceability)
```

## Commands

```bash
pnpm install                 # also runs `prisma generate` for the API
pnpm db:up                   # postgres, minio (+bucket), mailpit
pnpm build:shared            # rebuild the contract after editing packages/shared
pnpm --filter @petwatch/api prisma:migrate   # create/apply migrations (dev)
pnpm dev:api                 # http://localhost:3000/health
pnpm --filter @petwatch/mobile ios|android   # dev build (custom scheme needs it; not Expo Go)
pnpm typecheck && pnpm test  # run before declaring any task done
```

## Non-negotiable rules

1. **No `any`**, no `as unknown as`, no `@ts-ignore`. Model the type or narrow it.
2. **Contract lives in `packages/shared`.** Every request body/query is a Zod schema there.
   API DTOs are `class X extends createZodDto(schema) {}`; mobile forms use the same schema via
   `zodResolver`. Never duplicate a validation rule.
3. **Access control is server-side and centralised** in `PetAccessService`
   (`owner` | `watcher` | none). Controllers never query ownership ad hoc.
   Pet not visible to the caller → **404** (don't leak existence). Visible but wrong role → 403.
4. **"Owner"/"watcher" are relationships, not user roles.** Never add a role column to `User`.
5. **Server state only through TanStack Query hooks** in `src/features/<feature>/queries.ts`.
   No API responses in `useState`, Context or Jotai. Jotai is for UI state only
   (schedule view mode, pet filter). Auth session is the one Context.
6. **Errors have one shape**: `ApiErrorBody` (`statusCode, code, message, fieldErrors?`).
   Throw Nest `HttpException`s with a stable `code`; the global filter formats them.
7. **Secrets are stored hashed**: passwords (argon2), refresh/reset/invite tokens (SHA-256).
8. **Care tasks are rules, not occurrences.** Today/Weekly are computed by a pure, tested
   `expandOccurrences()`; don't persist occurrences.
9. **Migrations are committed.** Change `schema.prisma` → `prisma migrate dev --name <what>`.
   Never edit an applied migration.
10. Keep components small (≈ <150 lines). Presentation components get props + callbacks, no fetching.

## Feature layout

API (`apps/api/src/<feature>/`): `<feature>.module.ts`, `.controller.ts`, `.service.ts`,
`dto.ts` (createZodDto wrappers only), `*.spec.ts` next to the code.

Mobile (`apps/mobile/src/features/<feature>/`):
- `api.ts` — typed fetch functions using the shared `apiClient`
- `queries.ts` — query-key factory + `useX`/`useXMutation` hooks, invalidation lives here
- `components/` — presentational components
Screens in `app/` are thin: compose hooks + components.

## How to work with me

- Start non-trivial work with a short plan (files to touch, decision + rejected alternative).
- Prefer the smallest change that satisfies the requirement in `docs/REQUIREMENTS.md`.
- When you make a choice with a real alternative, append one entry to `docs/DECISIONS.md`.
- Don't add a dependency without saying why the platform/stdlib isn't enough.
- Finish with: what changed, how it was verified (typecheck/test/manual), open questions.

## Local dev gotchas

- Android emulator reaches the host at `10.0.2.2`; set `EXPO_PUBLIC_API_URL` and
  `S3_PUBLIC_ENDPOINT` accordingly (presigned URLs are signed for the host they name).
- Deep links: `xcrun simctl openurl booted "petwatch://invites/<token>"` /
  `adb shell am start -W -a android.intent.action.VIEW -d "petwatch://invites/<token>"`.
- Emails land in Mailpit: http://localhost:8025. MinIO console: http://localhost:9001.
