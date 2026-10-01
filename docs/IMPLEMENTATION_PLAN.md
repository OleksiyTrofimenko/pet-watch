# PetWatch — Implementation Plan (Claude Code)

The scaffold, design tokens and design-system Button are done. The rest of the project gets built in
Claude Code by following this file. Put it at `docs/IMPLEMENTATION_PLAN.md` and commit it.

**How to use it:** do one phase per Claude Code session. Every phase gives you the prompt to paste,
what a good plan looks like, the tests it must add, and the commit messages.
Mark a phase ✅ in this file when you commit it.

---

## Session protocol (same for every phase)

```
1. /clear
2. Shift+Tab (plan mode) → paste the phase prompt
3. Check the plan against "Good plan has" → approve or correct
4. Let it implement
5. /check              (typecheck + lint + unit tests)
6. pnpm test:e2e       (API e2e)  and/or  pnpm e2e:mobile (Maestro), as the phase says
7. /review             → fix until "ready to commit"
8. Commit with the given message
9. /explain <the phase's key flow>   ← you must be able to say it without notes
```

**Definition of done for every slice:** shared schema → API → mobile. It must have unit tests for the
rules, an API e2e test for the endpoints, a Maestro flow for the user journey, and updated
docs/REQUIREMENTS.md and docs/DECISIONS.md. Nothing is marked ✅ unless all tests are green.

**Budget:** about 7.5 h of focused work (scaffolding doesn't count).

| Phase | What | Time | Status |
|---|---|---|---|
| 0 | Scaffold, design tokens, design-system Button | – | ✅ |
| 1 | Test infrastructure (API e2e + Maestro) | 45 min | ⬜ |
| 2 | Auth API | 60 min | 🟨 plan approved |
| 3 | Auth mobile (API client, session, screens) | 60 min | ⬜ |
| 4 | Pets + photo upload | 75 min | ⬜ |
| 5 | Care schedule (Today / Weekly / filter) | 75 min | ⬜ |
| 6 | Invitations, watchers, deep link | 75 min | ⬜ |
| 7 | Polish (nice-to-haves, seed, screenshots) | 30 min | ⬜ |
| 8 | Hardening (access matrix, full review, CI) | 30 min | ⬜ |
| 9 | Submission docs | 20 min | ⬜ |

If the budget is tight, cut from phase 7 first. Never cut the tests from phases 2–6.

---

## Testing strategy (the part reviewers will ask about)

| Layer | Tool | What it proves | Where |
|---|---|---|---|
| Unit | Jest | Pure rules: token hashing, recurrence expansion, mappers, error filter, form components | next to code (`*.spec.ts`, `*.test.tsx`) |
| API e2e | Jest + supertest + **real** Postgres, SeaweedFS and Mailpit | Endpoints, guards, access rules, transactions, emails and presigned uploads work together | `apps/api/test/*.e2e-spec.ts` |
| Mobile e2e | **Maestro** on the iOS simulator (Android also works) | Real user journeys, including deep links and the photo picker | `apps/mobile/e2e/*.yaml` |

Why this split:
- **API e2e runs against real services, not mocks.** The bugs that matter (race conditions, CHECK
  constraints, SQL, SMTP, S3 signing) only show up there. Each test file truncates the tables and
  uses a separate `petwatch_test` database, so dev data is never touched.
- **Emails are read back from Mailpit's HTTP API.** Reset and invite flows are therefore tested end
  to end: send the email, extract the link, use the token.
- **Maestro, not Detox:** it uses YAML, needs no native test harness in the app, and works the same
  on iOS and Android. `openLink` tests deep links, `addMedia` tests the photo library, and
  `runScript` can call the API and Mailpit for setup.
- **Maestro flows make their own data** (unique emails per run) through the API, so they never need
  a DB reset and can run in any order.

**testID convention** (Maestro selectors): `<screen>.<element>`, for example `login.email`,
`login.submit`, `pets.add`, `pet-form.name`, `schedule.tab-week`, `invite.email`, `invite.result`.
Every interactive element in a journey gets one, and icon-only buttons also get `accessibilityLabel`.

---

## Phase 1 — Test infrastructure (45 min)

Do this before more features, so every slice adds its e2e tests as it goes.

**Prompt**
```
Set up e2e testing infrastructure, no features. Read CLAUDE.md, apps/api/CLAUDE.md, apps/mobile/CLAUDE.md and docs/IMPLEMENTATION_PLAN.md (Testing strategy).

API e2e (apps/api/test/):
- jest-e2e config (testRegex \.e2e-spec\.ts$, same .js moduleNameMapper as unit tests), script "test:e2e".
- A separate database petwatch_test: globalSetup runs `prisma migrate reset --force` with DATABASE_URL pointing at petwatch_test (Prisma creates it if missing). Load env from .env.test (commit .env.test.example).
- test/utils/app.ts: createTestApp() builds AppModule with the real providers and the same global pipe/filter/guards as main.ts (extract a shared configureApp(app) used by both so tests can't drift from prod).
- test/utils/db.ts: resetDb() truncates all tables (RESTART IDENTITY CASCADE), called in beforeEach.
- test/utils/mailpit.ts: deleteAllMessages(), waitForMessageTo(email) that polls http://localhost:8025/api/v1 and returns subject + text, and extractLink(text, 'petwatch://…').
- Throttling must not break tests: read limits from config and set them high in .env.test (don't special-case NODE_ENV in code).
- test/health.e2e-spec.ts as the first test.
- Root script "test:e2e": pnpm --filter @petwatch/api test:e2e.

Mobile e2e (apps/mobile/e2e/):
- Maestro layout: config.yaml, flows/, subflows/ (e.g. subflows/register.yaml taking EMAIL/PASSWORD env), scripts/ (JS for runScript: api.js that registers users/creates data via http, mailpit.js that fetches the latest link for an address).
- Root script "e2e:mobile": maestro test apps/mobile/e2e/flows.
- A smoke flow launching the app (appId com.petwatch.app) and asserting the home screen.
- Document the testID convention in apps/mobile/CLAUDE.md.

Update .claude/commands/feature.md: each slice must add API e2e tests and a Maestro flow, and run `pnpm test:e2e` (+ `pnpm e2e:mobile` when a simulator is booted) before done. Update root CLAUDE.md "definition of done" and README (how to run tests).
Plan first; wait for my OK.
```

**Good plan has:** one `configureApp()` shared by `main.ts` and tests, a separate test DB, Mailpit
polling rather than fixed sleeps, and no feature code.

**You install once:** `curl -fsSL "https://get.maestro.mobile.dev" | bash`, then `maestro --version`.

**Commit:** `test: e2e infrastructure (API with real services, Maestro)`

**Understand:** why real services instead of mocks, why truncating beats transactions for Nest e2e,
and how Mailpit makes email flows testable.

---

## Phase 2 — Auth API (60 min) · AUTH-1/2/3 server side

The plan is already approved, with these amendments: create the user and catch Prisma's P2002
unique-violation error rather than checking for the email first; do the refresh/reset claim by id
plus the write in one `$transaction`; pin HS256; send the forgot-password email after the
transaction, without awaiting it; add `AUTH_ERROR_CODES` to shared; add the README note about
custom-scheme links.

**Extra prompt line to add now:**
```
Also add apps/api/test/auth.e2e-spec.ts covering: register → /users/me 200; duplicate email 409 EMAIL_TAKEN; login wrong password vs unknown email → identical 401; refresh rotates and the old token is rejected; reusing a rotated token revokes all sessions; forgot-password for unknown email → 204 and no Mailpit message; forgot → Mailpit link → reset → old refresh 401 → login with new password 200; reset link reused → 400; protected route without token → 401 UNAUTHENTICATED.
```

**Commit:** `feat(api): users and auth modules with refresh rotation and password reset`

**Understand:** the atomic claim (why read-then-update loses under READ COMMITTED), reuse detection,
why forgot-password always returns 204, and why argon2 compares against a dummy hash for unknown emails.

---

## Phase 3 — Auth mobile (60 min) · AUTH-1..4 client side

**Prompt**
```
/feature AUTH-1 AUTH-2 AUTH-3 AUTH-4 — mobile half. Read docs/design for the auth screens.
- src/lib/api-client.ts: typed get/post/patch/put/delete; attaches the access token; on 401 UNAUTHENTICATED runs ONE shared refresh promise (single-flight) that concurrent requests await, retries once, and on refresh failure clears the session. ApiError extends Error { status, code, fieldErrors }. Network failures → ApiError code NETWORK_ERROR.
- src/lib/token-store.ts: expo-secure-store only.
- src/features/auth/: api.ts, queries.ts (useLogin, useRegister, useForgotPassword, useResetPassword, useLogout, useMe), session-provider.tsx (the one Context: status 'loading'|'signed-in'|'signed-out' + user), apply-server-errors.ts (ApiError.fieldErrors → RHF setError; form-level message for INVALID_CREDENTIALS etc. via AUTH_ERROR_CODES).
- Routes: app/(auth)/login, register, forgot-password; app/reset-password (deep link, reachable signed-out); app/(app)/… guarded with Stack.Protected. A pending deep link (e.g. invites/<token>) opened while signed out is stored and restored after login.
- On logout: call /auth/logout, clear tokens, queryClient.clear().
- Unit tests: api-client single-flight (3 parallel 401s → exactly 1 refresh call, all 3 retried), refresh failure → signed out, applyServerErrors mapping.
- Maestro: flows/auth.yaml — register new user → lands in app → logout → login → forgot password → runScript mailpit.js gets reset link → openLink → reset → login with new password.
testIDs per convention. Plan first.
```

**Good plan has:**
- the refresh promise held in a module-level variable (not React state);
- screens that never call `apiClient` directly;
- `queryClient.clear()` on logout, so user A's data never appears for user B;
- the pending deep link stored in memory (not SecureStore).

**Push back if:** tokens end up in React state or AsyncStorage, each screen retries on its own, or a
`useEffect` fetches data.

**Commits:** `feat(mobile): api client with single-flight refresh and secure token storage`, then
`feat(mobile): auth screens and protected routes`

**Understand:** the single-flight refresh (draw it), why it's required by server reuse detection,
and cold-start deep links while signed out.

---

## Phase 4 — Pets and photo upload (75 min) · PET-1/2/3

**Prompt**
```
/feature PET-1 PET-2 PET-3. Follow apps/api/CLAUDE.md snippets exactly.
API:
- PetsModule with PetAccessService (resolveRole / assertOwner, one query, invisible → 404 PET_NOT_FOUND, not owner → 403 OWNER_ONLY) exported for other modules.
- GET /pets (owned + watched, each with role and owner email), GET /pets/:id, POST, PATCH, DELETE (owner only; delete also removes the S3 object best-effort after the DB delete).
- StorageModule: S3Client with forcePathStyle: true; presignPut(key, contentType) and presignGet(key) (the GET is signed for S3_PUBLIC_ENDPOINT so devices can reach it).
- POST /pets/:id/photo-upload-url → { uploadUrl, key, expiresInSeconds }, key = pets/{petId}/{uuid}.{ext}. PUT /pets/:id/photo { key }: verify the key prefix belongs to this pet and HeadObject exists, then save and delete the previous object.
- Mapper returns photoUrl (presigned GET), never photoKey.
API e2e (pets.e2e-spec.ts): CRUD happy path; stranger gets 404 on every pet route; photo: get upload URL → real PUT of a small JPEG to SeaweedFS → confirm → GET pet has a photoUrl that fetches 200; confirm with a key from another pet → 400.
Mobile:
- features/pets: api.ts, queries.ts (key factory, invalidation), components/pet-card, pet-form (RHF + createPetSchema + FormInput), photo-picker (expo-image-picker camera|library via Actionsheet, expo-image-manipulator resize to 1024px JPEG 0.8, upload with progress state).
- Screens: pets list (sections "My pets" / "Pets I'm watching", QueryView + skeleton + EmptyState, Fab), pet detail, create/edit (owner only), delete with confirm.
- Permission denied → explain and offer to open Settings.
Maestro: flows/pets.yaml — register → add pet (name, species, breed, age) → addMedia a fixture photo and pick it from library → see card with photo → edit name → delete → empty state.
Plan first.
```

**Good plan has:**
- one access check per service method;
- the upload key generated by the server, never taken from the client;
- no Prisma model returned to the client;
- a `photo-upload.ts` hook that runs pick → resize → presign → PUT → confirm, so screens stay thin.

**Commits:** `feat(api): pets with access control and presigned photo uploads`, then
`feat(mobile): pet list, form and photo upload`

**Understand:** the upload sequence (draw it); why the key comes from the server; what a presigned
PUT can't enforce (file size), and how presigned POST fixes it; why GET URLs are short-lived.

---

## Phase 5 — Care schedule (75 min) · CARE-1..5

**Prompt**
```
/feature CARE-1 CARE-2 CARE-3 CARE-4 CARE-5.
Start test-first: packages/shared/src/schedule/expand-occurrences.ts, a pure function (tasks, rangeStart: Date, rangeEnd: Date) → occurrences { taskId, petId, date (local YYYY-MM-DD), timeOfDay } sorted by date then time, plus weekDays(today) returning Mon–Sun of the current week. Write the unit tests FIRST (add jest to packages/shared): daily across a week = 7; weekly Mon/Wed/Fri = 3; Sunday handling (0) with a Monday-start week; empty range; sorting; a DST-change week in Europe/Lisbon still yields one occurrence per day at the same wall-clock time. Show me the failing tests, then implement.
API: CareTasksModule — GET /pets/:petId/care-tasks (owner or watcher), POST/PUT/DELETE (owner only), all through PetAccessService; GET /care-tasks (all tasks for pets I own or watch, with pet name) for the schedule. careTaskSchema from shared (PUT = full replace).
API e2e: owner CRUD; watcher can read but gets 403 on write; stranger 404; weekly without days → 400 with fieldErrors.daysOfWeek; the CHECK constraint still rejects a bad row written straight through Prisma (proves the DB guard).
Mobile:
- features/schedule: atoms.ts (viewModeAtom 'today'|'week', petFilterAtom 'all'|petId: UI state only), queries.ts, components: segmented control (design-system), pet filter chips, task-row (uses TASK_TYPE_VISUALS), day-section.
- Schedule tab: Today and This week from expandOccurrences over GET /care-tasks, filtered by pet, with the filter kept when switching views; past-time tasks dimmed; empty days show "Nothing scheduled".
- Pet detail "Care routine": list of rules; owner sees add/edit/delete; task form (type chips, title, time picker, Daily|Weekly, day toggles only when weekly, notes).
Maestro: flows/schedule.yaml — create pet → add daily 08:00 feeding + weekly Mon/Wed/Fri walk → Today shows the right items → switch to This week, sees 7 sections with correct counts → filter by pet → edit task → delete task.
Plan first.
```

**Good plan has:**
- the expansion done on the client from rules, with the reason stated (timezone and DST: wall-clock rules expand correctly in the device's zone);
- Jotai used only for view mode and filter;
- tests failing first.

**Commits:** `feat(shared): expandOccurrences with tests`, `feat(api): care tasks`,
`feat(mobile): schedule today/week with pet filter`

**Understand:** rules vs occurrences, where the timezone is decided, and why the filter lives in Jotai
while the tasks live in TanStack Query.

---

## Phase 6 — Invitations, watchers and deep link (75 min) · INV-1..5

**Prompt**
```
/feature INV-1 INV-2 INV-3 INV-4 INV-5.
API: InvitationsModule.
- POST /pets/:petId/invitations { email } (owner only) → { outcome: INVITE_SENT | INVITE_RESENT | ALREADY_WATCHING, inviteeEmail }. Unknown email → 404 USER_NOT_FOUND; self → 400 CANNOT_INVITE_SELF. One row per (pet, invitee): re-invite rotates the token (hash stored), resets expiry (INVITE_TTL_DAYS) and status PENDING. Email petwatch://invites/<token> via MailService after commit.
- GET /invitations/:token (auth required) → preview { petName, petPhotoUrl, inviterEmail, expiresAt, status }; token for another account → 403 INVITE_FOR_OTHER_USER; expired/revoked/accepted → 410 with a specific code.
- POST /invitations/:token/accept → transaction: claim (status PENDING, not expired, invitee = me) → create PetWatcher → mark ACCEPTED. Idempotent if already watching.
- GET /pets/:petId/watchers (owner) → watchers + pending invites; DELETE /pets/:petId/watchers/:userId (owner) → delete watcher, mark invitation REVOKED.
API e2e (invitations.e2e-spec.ts): full journey with two users through Mailpit; every error code; after revoke the watcher gets 404 on the pet and its tasks; accepting twice is safe; two concurrent accepts create only one watcher.
Mobile:
- Pet detail Watchers section (owner only): list + Pending badges + revoke with confirm; invite sheet with RHF + createInvitationSchema; result feedback per outcome (sent / re-sent / already watching) and per error code.
- app/invites/[token].tsx: preview → Accept / Not now; every state from docs/design (loading, accepted → "View schedule", expired, revoked, already accepted, wrong account with Switch account, pet gone). After accept, invalidate pets + care-tasks queries.
- Signed-out cold start: pending link → login → back to the invite (built in phase 3; verify it).
Maestro: flows/invite.yaml — runScript creates owner Ana (with a pet) and watcher Sam via the API → log in as Ana → invite Sam → see "Invite sent" → runScript mailpit.js gets the link → log out → openLink while signed out → log in as Sam → accept → pet appears under "Pets I'm watching" with no edit buttons → log in as Ana → revoke Sam.
Plan first.
```

**Good plan has:**
- all access decisions made through `PetAccessService`;
- the accept step done as a conditional claim inside a transaction (the same pattern as refresh);
- tests for the owner-vs-watcher UI differences;
- an explicit `outcome` from the API, not a message the UI has to guess from.

**Commits:** `feat(api): invitations and watchers`, `feat(mobile): invite, accept deep link, watchers`

**Understand:** the whole invite lifecycle (draw the states); the account-existence trade-off of
USER_NOT_FOUND; why the invite is tied to the invitee's account; and what happens when the link
arrives while the app is closed.

---

## Phase 7 — Polish (30 min) · N-2, N-3, N-4

**Prompt**
```
Nice-to-haves, smallest diff:
1. Skeletons: confirm every QueryView has a content-shaped skeleton (pets, schedule, pet detail, invite preview).
2. Offline: design-system OfflineBanner driven by NetInfo (via a useIsOnline hook in src/lib); mutations' buttons disabled with disabledReason "Connect to the internet to …"; cached data still shows.
3. Invite feedback: verify the three outcomes have distinct copy and icons (N-4).
4. apps/api/prisma/seed.ts + "db:seed" script (opt-in, never automatic): Ana (owner of Rex and Miso, with tasks), Sam (watching Rex), a pending invite for a third user. README "Demo data" section.
5. Maestro flows/offline.yaml if feasible (toggle airplane mode isn't scriptable on iOS sim; otherwise document a manual check).
Plan first.
```

**Commit:** `feat: skeletons, offline banner, demo seed`

---

## Phase 8 — Hardening (30 min)

**Prompt**
```
1. API e2e access-matrix.e2e-spec.ts: table-driven — for EVERY pet-scoped route × {owner, watcher, stranger, anonymous} assert the expected status (e.g. watcher PATCH /pets/:id → 403, stranger GET → 404, anonymous → 401). One table, generated test names. This is the proof of "access rules enforced server-side".
2. /review on the whole repo (not just the diff): list anything violating CLAUDE.md rules, any file > 150 lines, any duplicated UI pattern, and any unhandled error code.
3. .github/workflows/ci.yml: install, build:shared, typecheck, lint, unit tests, and API e2e with postgres + seaweedfs + mailpit service containers. (Maestro stays local; document why: it needs a macOS runner and a simulator.)
Plan first.
```

**Commit:** `test: access matrix; ci: typecheck, lint, unit and API e2e`

**Understand:** be ready to walk through the access-matrix table live. It's the strongest single
answer to "how do you know watchers can't edit?"

---

## Phase 9 — Submission (20 min)

**Prompt**
```
Final docs pass:
- README: setup (clean clone → running app in 5 commands), how to run unit / API e2e / Maestro, demo data, what is stubbed and how to wire it for real (SES, S3, Universal Links), assumptions (link docs/REQUIREMENTS.md), known limitations and "with more time", 3–4 screenshots in docs/screenshots/.
- docs/REQUIREMENTS.md: every row ✅ or an explicit reason.
- docs/DECISIONS.md: consistent numbering, no stale entries (e.g. MinIO → SeaweedFS).
- Verify from a clean clone: git clone to /tmp, follow README exactly, everything works.
Plan first.
```

**Commit:** `docs: submission README`

Then come back to the Claude chat to build the interview prep doc from `DECISIONS.md`, the
`/explain` outputs and this plan.

---

## If something goes wrong

| Symptom | Do this |
|---|---|
| Claude's plan is much bigger than the prompt | "Smallest diff that satisfies <ID>. Remove anything not required." |
| A lint boundary rule fires | Ask "what design change makes this rule pass?" Never disable it. |
| A flaky Maestro step | Replace sleeps with `extendedWaitUntil`, and make sure the element has a testID. |
| API e2e interfering with dev data | Check that `.env.test` points to `petwatch_test`. |
| Running out of time | Skip phase 7 items 4–5, then phase 8 CI. Keep the access matrix. |
| You can't explain a piece of code | `/explain <file>`. If it's still unclear, ask Claude to simplify it. You should be able to defend every line. |