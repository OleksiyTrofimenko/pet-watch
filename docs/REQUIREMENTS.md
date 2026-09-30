# Requirements traceability

Every line of the brief, with an ID, where it's implemented, and the edge cases we commit to.
Status: ⬜ todo · 🟨 in progress · ✅ done. Update this file as features land.

## User stories

### Authentication

| ID     | Requirement                                     | Edge cases / acceptance                                                                                                                                                           | Status |
| ------ | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| AUTH-1 | Register with email + password                  | Email trimmed + lower-cased; duplicate → 409 `EMAIL_TAKEN`; password ≥ 8 chars; returns tokens (auto-login)                                                                       | ⬜     |
| AUTH-2 | Log in with email + password                    | Wrong email _or_ password → same 401 `INVALID_CREDENTIALS`; rate-limited                                                                                                          | ⬜     |
| AUTH-3 | Request password reset link by email            | Always 200 (no account enumeration); token single-use, 30 min, stored hashed; link `petwatch://reset-password?token=…` opens reset screen; after reset all refresh tokens revoked | ⬜     |
| AUTH-4 | Tokens stored + attached automatically (client) | SecureStore; one `apiClient`; 401 → single-flight refresh → retry once; refresh fails → sign out                                                                                  | ⬜     |

### Pets

| ID    | Requirement                                    | Edge cases / acceptance                                                                                                                                                   | Status |
| ----- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| PET-1 | Add pet: name, species, breed, age, notes      | Name required; species enum; age 0–50 optional                                                                                                                            | ⬜     |
| PET-2 | Upload a photo per pet (camera **or** library) | Permissions denied → explain + settings link; resize/compress before upload; presigned PUT direct to S3; server checks key belongs to pet and object exists before saving | ⬜     |
| PET-3 | Edit / remove pet                              | Owner only (watcher → 403); delete cascades tasks, watchers, invites; S3 object deleted best-effort                                                                       | ⬜     |

### Care schedule

| ID     | Requirement                                                                             | Edge cases / acceptance                                               | Status |
| ------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ |
| CARE-1 | Create daily or weekly routine entries (feeding, walk, medication, play…)               | Weekly needs ≥ 1 day; time 00:00–23:59                                | ⬜     |
| CARE-2 | Edit / delete entries                                                                   | Owner only                                                            | ⬜     |
| CARE-3 | Owner **and** watcher can view a pet's schedule                                         | Watcher read-only (no edit affordances)                               | ⬜     |
| CARE-4 | "Today" view (all tasks due today) and "Weekly" view (grouped day by day, current week) | Week = Mon–Sun containing today; sorted by time; empty days shown     | ⬜     |
| CARE-5 | Filter either view by pet                                                               | Filter persists when switching views (Jotai atom); "All pets" default | ⬜     |

### Watchers & invitations

| ID    | Requirement                                                     | Edge cases / acceptance                                                                                                                                                                       | Status |
| ----- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| INV-1 | Owner invites a **registered** user by email                    | Unknown email → 404 `USER_NOT_FOUND` (required by brief; enumeration trade-off noted); self-invite → 400; already watching → 200 `ALREADY_WATCHING`; pending → token rotated, `INVITE_RESENT` | ⬜     |
| INV-2 | Invitee gets an email with a deep link; must click it to accept | `petwatch://invites/<token>`; opens accept screen showing pet, inviter, expiry                                                                                                                | ⬜     |
| INV-3 | Accepting adds the pet to the invitee's watching list           | Transaction: create watcher + mark ACCEPTED; token for another account → 403 `INVITE_FOR_OTHER_USER`; expired/revoked/used → 410; pet deleted → 404; logged out → login then return to link   | ⬜     |
| INV-4 | Owner sees who watches each pet                                 | Also lists pending invites (status badge)                                                                                                                                                     | ⬜     |
| INV-5 | Owner revokes a watcher                                         | Deletes watcher row + marks invitation REVOKED; watcher's queries then 404                                                                                                                    | ⬜     |

## Technical requirements

| ID   | Requirement                                                                  | How                                                     | Status                     |
| ---- | ---------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------- |
| T-1  | Expo React Native, runs on iOS + Android simulators                          | Expo SDK 57 dev build                                   | 🟨 scaffold                |
| T-2  | NestJS + TypeScript, organised in modules                                    | One module per feature                                  | 🟨 scaffold                |
| T-3  | PostgreSQL via ORM, migrations committed                                     | Prisma 7, `apps/api/prisma/migrations`                  | ✅ schema + init migration |
| T-4  | JWT auth; client token storage + auto-attach, reusable                       | See AUTH-4                                              | ⬜                         |
| T-5  | DTO validation on **every** endpoint, sensible errors                        | Global `ZodValidationPipe` + `ApiExceptionFilter`       | ✅ infra                   |
| T-6  | Server-side access rules: only pets you own or watch                         | `PetAccessService` + guard/decorator; 404 for invisible | ⬜                         |
| T-7  | Docker Compose for DB + README run instructions                              | Postgres, SeaweedFS (S3), Mailpit                       | ✅                         |
| T-8  | Email + S3 may be stubbed; README says what + how to wire real               | Mailpit + SeaweedFS (real protocols)                    | 🟨 README                  |
| T-9  | Deep link opens accept-invite screen; no store fallback                      | Expo Router file route                                  | 🟨 route stub              |
| T-10 | Jotai/Context for UI state; TanStack Query for **all** server state          | Rule in CLAUDE.md                                       | 🟨 QueryClient wired       |
| T-11 | React Hook Form + Zod on **all** forms                                       | login, register, forgot, reset, pet, care task, invite  | ⬜                         |
| T-12 | Photo via camera or library; direct S3 upload via presigned URL              | expo-image-picker + presigned PUT                       | ⬜                         |
| T-13 | Gluestack UI                                                                 | v3 + NativeWind v4                                      | ✅ installed               |
| T-14 | Fully typed, no `any`; focused components; hooks separated from presentation | CLAUDE.md rules                                         | ongoing                    |
| T-15 | AI config committed                                                          | `CLAUDE.md`, `.claude/`                                 | ✅                         |
| T-16 | README: setup, choices, limitations, stubs                                   |                                                         | 🟨                         |

## Nice to have

| ID  | Item                                                                 | Plan                                                                         | Status                 |
| --- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| N-1 | Tests for a non-trivial unit                                         | `expandOccurrences` (shared), invite service outcomes, auth refresh rotation | ⬜                     |
| N-2 | Loading states + skeletons                                           | Pet list, schedule, pet detail                                               | ⬜                     |
| N-3 | Offline-aware                                                        | NetInfo banner; queries paused; mutations disabled with message              | 🟨 onlineManager wired |
| N-4 | Clear invite feedback ("added to their list" vs "invite email sent") | API returns explicit `outcome`; UI copy per outcome                          | 🟨 contract            |

## Ambiguities → assumptions (put these in the README)

1. **"Added to their list" vs "invite email sent"** — the brief also says the invitee _must click the link_ to be added.
   Interpretation: the invite always sends an email; feedback distinguishes _sent_ / _re-sent_ / _already watching_,
   and the owner's watcher list shows the invite as **Pending** until accepted.
2. **Unregistered invitee** — not supported by the brief, so we return a clear error. This reveals whether an
   email has an account; acceptable because only authenticated owners can call it (rate-limited).
3. **Age** — stored as whole years as specified; with more time store `birthDate` so it doesn't go stale.
4. **Timezone** — schedule times are wall-clock local time; owner and watcher assumed to share a timezone.
5. **Week** — Monday–Sunday week containing today.
6. **Who edits schedules** — owners only; watchers read. (Brief: owner "creates/edits", owner _or_ watcher "views".)
7. **Declining an invite** — not required; the invitee can simply ignore it; it expires after 7 days.
8. **Watcher leaving a pet** — not required; out of scope (listed in "with more time").
