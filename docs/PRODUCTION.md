# From this MVP to a store release

What it takes to publish PetWatch to the App Store and Google Play with a hosted backend. Platform-neutral:
any container host, managed Postgres, S3 and email provider fit. Nothing here is implemented yet; the
[checklist](#checklist) at the end orders the work.

## Would it work today?

**The code and the database schema carry over; the setup is local-only.** A store build made from the
repo as it is would not work:

- **The app points at `http://localhost:3000`.** `EXPO_PUBLIC_API_URL` falls back to it
  (`apps/mobile/src/lib/env.ts`) and is inlined into the JS bundle at build time, so it has to be set to
  the production URL when the store build is made. It must be `https`: iOS blocks plain http (App
  Transport Security).
- **There is nothing to deploy the API with yet**: no Dockerfile, no hosted environment, no `eas.json` for
  store builds.
- **Emails contain `petwatch://` links**, which many mail apps don't make tappable, and which do nothing
  on a phone without the app.
- **The app can't delete an account.** App Store Review Guideline 5.1.1(v) requires in-app account
  deletion for apps that let people sign up; Google Play asks for a deletion path too. This is a store
  blocker.

What does carry over as is:

- **Database**: PostgreSQL 16 with committed Prisma migrations (`apps/api/prisma/migrations`), applied with
  `prisma migrate deploy`. Invariants are enforced in the database (CHECK constraints), ids are UUIDv7. A
  managed Postgres runs the same migrations. The local Docker data is demo data: don't copy it.
- **Configuration**: every setting is an environment variable validated at boot
  (`apps/api/src/config/env.ts`), so a misconfigured server refuses to start instead of failing later.
- **Security model**: hashed passwords (argon2id) and tokens (SHA-256), rotating refresh tokens, server-side
  access rules covered by the access-matrix e2e test, presigned S3 uploads with server-chosen keys.

## Target architecture

```
App (EAS build, store)
   │  HTTPS  api.petwatch.app
   ▼
Load balancer / platform router (TLS)
   │
   ▼
API containers (2+, stateless)  ──►  Managed Postgres (TLS, pooled connections, backups)
   │        │        │
   │        │        └──►  Redis (shared rate-limit counters)
   │        └──►  S3 private bucket (presigned upload/download URLs)
   └──►  Email provider (SES / Postmark / Resend)

petwatch.app (website): Universal Links / App Links files + a fallback page for links opened without the app
```

## Environments

| Environment | Database                     | App build                                    | Purpose                 |
| ----------- | ---------------------------- | -------------------------------------------- | ----------------------- |
| development | Docker (`pnpm bootstrap`)    | dev build, `localhost`                       | what the README sets up |
| staging     | own managed Postgres, bucket | internal build (TestFlight / internal track) | test before release     |
| production  | own managed Postgres, bucket | store build                                  | users                   |

Each environment has its own secrets, database, bucket and email sender. For the app, replace `app.json`
with `app.config.ts` reading an `APP_VARIANT` variable, so staging installs next to production (bundle id
`com.petwatch.app.staging`, its own name and icon badge).

## Backend

- **Container**: a multi-stage Dockerfile for `apps/api`: install with pnpm, build `packages/shared` and the
  API, then copy `dist/` and production dependencies into a slim Node image running `node dist/main.js`
  with `NODE_ENV=production`.
- **Health check**: point the platform's health check at `GET /health`. It already checks the database and
  returns `{"status":"ok","db":"up"}`.
- **Migrations**: run `prisma migrate deploy` as a release step before new containers take traffic. Never
  `migrate dev`, and never the demo seed (`pnpm db:seed`) in staging or production.
- **Behind a load balancer**:
  - **Trust the proxy.** The API doesn't set Express's `trust proxy` (`apps/api/src/main.ts`), so behind a
    load balancer every request appears to come from the balancer's IP and all users share one rate limit.
    Set `trust proxy` to the platform's hop count.
  - **Share the rate-limit counters.** They live in memory per instance (D41). With more than one instance,
    store them in Redis (`@nestjs/throttler` storage).
- **Rate limits beyond auth**: add a limit to `POST /pets/:petId/invitations`. It currently isn't limited,
  and its answer reveals whether an email has an account (README assumption 2).
- **Observability**: structured JSON logs, request ids, and error tracking (for example Sentry for both the
  API and the app). Alert on 5xx rate and health-check failures.
- **CORS** isn't needed: only the mobile app calls the API. Add it only if a web client appears.

## Database

- **Managed PostgreSQL 16** (RDS, Cloud SQL, Neon, Supabase, Render, …), same major version as
  `docker-compose.yml`.
- **TLS**: `?sslmode=require` in `DATABASE_URL`.
- **Connections**: the API uses Prisma's `pg` driver adapter (`apps/api/src/prisma/prisma.service.ts`), one
  pool per instance. Size the pool so `instances × pool size` stays under the database's connection limit,
  or put a pooler (PgBouncer, the provider's pooled URL) in between.
- **Backups**: automated daily backups with point-in-time restore. Test a restore once before launch.
- **Changes**: schema changes stay migrations, reviewed as SQL. Breaking changes go expand → migrate data →
  contract, so old and new API versions can run side by side during a deploy (see `apps/api/CLAUDE.md`).
- **Data**: production starts empty. Local and demo data are never copied.

## Secrets and configuration

Store secrets in the platform's secret manager, never in the repo or the image. The variables come from
`apps/api/src/config/env.ts`:

| Variable                                           | Production value                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `NODE_ENV`                                         | `production`                                                                       |
| `PORT`                                             | the platform's port                                                                |
| `DATABASE_URL`                                     | managed Postgres URL with `sslmode=require` (secret)                               |
| `JWT_ACCESS_SECRET`                                | random, 64+ chars, per environment: `openssl rand -base64 48` (secret)             |
| `JWT_ACCESS_TTL_SECONDS`, `REFRESH_TOKEN_TTL_DAYS` | defaults (15 min, 30 days) are reasonable                                          |
| `PASSWORD_RESET_TTL_MINUTES`, `INVITE_TTL_DAYS`    | defaults (30 min, 7 days)                                                          |
| `S3_REGION`, `S3_BUCKET`                           | the real bucket                                                                    |
| `S3_ACCESS_KEY`, `S3_SECRET_KEY`                   | prefer an IAM role; otherwise a key scoped to this bucket only (secret)            |
| `S3_ENDPOINT`, `S3_PUBLIC_ENDPOINT`                | remove for AWS S3 (they exist for SeaweedFS); set for S3-compatible stores like R2 |
| `SMTP_HOST`, `SMTP_PORT`, `MAIL_FROM`              | the provider's SMTP endpoint, a verified sender on your domain                     |
| `APP_SCHEME`                                       | used for links in emails; replaced by https links (see [Links](#links))            |
| `THROTTLE_*`                                       | defaults; tune after launch                                                        |

`JWT_ACCESS_SECRET` can be rotated without signing anyone out: current access tokens stop verifying, the
app gets a 401 and refreshes once with its refresh token (stored hashed in the database, independent of
the secret), receiving an access token signed with the new secret.

## Email

- Use an email provider (SES, Postmark, Resend, …) with a verified domain: SPF, DKIM and DMARC records, so
  invites and password resets don't land in spam.
- **Code change needed**: the mail transport passes only host and port
  (`apps/api/src/mail/mail.service.ts`). Providers need authentication and TLS: add `SMTP_USER`,
  `SMTP_PASS` and `SMTP_SECURE` to the config schema and the transport, or switch to the provider's SDK.
- Sending is fire-and-forget today. Retries and a dead-letter queue (or the provider's own retries) keep a
  provider hiccup from losing an invite.

## Storage

- A private S3 bucket per environment; the app only ever gets presigned URLs (already the design).
- Remove `S3_ENDPOINT` / `S3_PUBLIC_ENDPOINT` for AWS. Give the API an IAM role limited to the bucket.
- Cap upload size: switch the presigned PUT to a presigned POST with a `content-length-range` condition
  (the app resizes photos, but the URL itself doesn't enforce a limit).
- Optional: CloudFront (or the provider's CDN) with signed URLs for faster photo loads.

## Links

`petwatch://` links work for development and testing, not for users. For production:

1. Email **https** links: `https://petwatch.app/invites/<token>`, `https://petwatch.app/reset-password?token=…`.
2. Serve `/.well-known/apple-app-site-association` (iOS Universal Links) and `/.well-known/assetlinks.json`
   (Android App Links) from that domain, and add `associatedDomains` / `intentFilters` with
   `autoVerify` in the app config. Expo Router already maps the same paths to the same screens.
3. A small web page at those URLs for people without the app: what PetWatch is, store badges.
4. Keep the `petwatch` scheme for development builds and Maestro.

## Mobile release

- **Builds**: EAS Build and EAS Submit with an `eas.json` that has `development`, `preview` (staging) and
  `production` profiles, each setting `EXPO_PUBLIC_API_URL` (and `APP_VARIANT`). The config plugins
  (`apps/mobile/plugins/with-scene-delegate.js`) run in EAS builds exactly as in local prebuilds.
- **Identity**: register the bundle id / package (`com.petwatch.app` in `app.json`) under the client's
  Apple Developer and Google Play accounts; the store listing and certificates belong to the client.
- **Versions**: `version` in `app.json` is the user-facing version; let EAS auto-increment build numbers
  (`ios.buildNumber` / `android.versionCode`).
- **Store requirements**:
  - **In-app account deletion** (store blocker): a "Delete account" action under Account that deletes the
    user, their pets (cascading tasks, watchers and invitations, already set up in the schema), their
    watcher rows, and their S3 photos. It needs a new API endpoint and an e2e test.
  - Privacy policy and terms URLs (in the app and the listings).
  - App Store "App Privacy" and Google Play "Data safety" forms: email address, photos, user content; no
    tracking.
  - iOS privacy manifest: Expo generates one; declare the required-reason APIs the app and its native
    modules use (`ios.privacyManifests` in the app config).
  - Camera and photo permission texts are already in `app.json`.
  - Screenshots, description and a demo account for App Review (reviewers must be able to sign in).
- **Updates**: optional `expo-updates` (EAS Update) to ship JS fixes without a store review; native changes
  still need a new build.

## CI/CD

The existing CI (format, typecheck, lint, unit tests, API e2e against Docker services) stays the gate.
Add:

1. On `main`: build and push the API image, run `prisma migrate deploy` against staging, deploy staging.
2. Promote the same image to production manually (tag or approval), migrations first.
3. On a release tag: EAS Build (production profile) and EAS Submit to TestFlight / the internal track.
4. Maestro against staging builds (optional, needs a macOS runner or a device cloud).

## Checklist

| #   | Item                                                       | Why                                            | Effort | Store blocker                      |
| --- | ---------------------------------------------------------- | ---------------------------------------------- | ------ | ---------------------------------- |
| 1   | In-app account deletion (API endpoint + Account screen)    | App Store 5.1.1(v), Google Play policy         | M      | yes                                |
| 2   | Hosted API over HTTPS (Dockerfile, platform, health check) | the app needs a reachable `https` API          | M      | yes                                |
| 3   | Managed Postgres + `migrate deploy` release step           | production data, backups                       | S      | yes                                |
| 4   | `eas.json` profiles with `EXPO_PUBLIC_API_URL` per profile | store builds pointing at the right API         | S      | yes                                |
| 5   | Email provider + SMTP auth/TLS in the mail transport       | invites and resets must arrive                 | S      | yes                                |
| 6   | Real S3 bucket, IAM role, endpoint overrides removed       | photos                                         | S      | yes                                |
| 7   | Privacy policy, store privacy forms, privacy manifest      | store review                                   | S      | yes                                |
| 8   | https links + Universal Links / App Links + fallback page  | tappable invite/reset links                    | M      | no, but needed for a usable launch |
| 9   | `trust proxy` + Redis rate-limit storage                   | correct per-user limits behind a load balancer | S      | no                                 |
| 10  | Rate limit on invitations                                  | stops probing which emails have accounts       | S      | no                                 |
| 11  | Error tracking, structured logs, alerts                    | know when it breaks                            | S      | no                                 |
| 12  | Staging environment + app variant                          | test releases before users see them            | M      | no                                 |
| 13  | Presigned POST with a size limit                           | enforce the upload limit server-side           | S      | no                                 |
| 14  | Mail retries                                               | don't lose an invite to a provider hiccup      | S      | no                                 |
| 15  | EAS Update                                                 | ship JS fixes without review                   | S      | no                                 |

Items 1–7 are the minimum for a store submission; 8 makes invites and password resets usable on real
phones and belongs in the first public release.
