# Reading list for the review

Grouped by what you'll be asked. For each topic: what to read, then what you should be able to say out loud.

## 1. NestJS architecture
- Modules — https://docs.nestjs.com/modules
- Guards (where access control lives) — https://docs.nestjs.com/guards
- Custom decorators (`@CurrentUser`, `@RequirePetRole`) — https://docs.nestjs.com/custom-decorators
- Pipes (validation) — https://docs.nestjs.com/pipes
- Exception filters (our error envelope) — https://docs.nestjs.com/exception-filters
- Configuration — https://docs.nestjs.com/techniques/configuration
- Authentication with JWT — https://docs.nestjs.com/security/authentication
- Rate limiting — https://docs.nestjs.com/security/rate-limiting
- Testing — https://docs.nestjs.com/fundamentals/testing
- Request lifecycle (middleware → guards → interceptors → pipes → handler → filters) — https://docs.nestjs.com/faq/request-lifecycle

**Be able to say:** why guards (not services or middleware) decide access; request lifecycle order; why DTO validation is a global pipe.

## 2. Zod as the shared contract
- Zod 4 docs — https://zod.dev
- nestjs-zod (`createZodDto`, `ZodValidationPipe`) — https://github.com/BenLorantfy/nestjs-zod
- RHF resolvers (`zodResolver`) — https://github.com/react-hook-form/resolvers

**Be able to say:** input vs output types (`z.input`/`z.output`) when a schema has `.transform()`; why one schema beats class-validator + Zod.

## 3. Prisma 7 + PostgreSQL
- Upgrade to v7 (driver adapters, `prisma.config.ts`, new generator) — https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
- Prisma Migrate — https://www.prisma.io/docs/orm/prisma-migrate
- Transactions — https://www.prisma.io/docs/orm/prisma-client/queries/transactions
- Postgres indexes (why `@@index([userId])` on the join table) — https://www.postgresql.org/docs/current/indexes-multicolumn.html
- UUIDv7 (RFC 9562) — https://www.rfc-editor.org/rfc/rfc9562

**Be able to say:** `migrate dev` vs `migrate deploy`; why the composite PK on `pet_watchers`; cascade rules; what runs inside the accept-invite transaction and why.

## 4. Auth & security
- OWASP Password Storage — https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- OWASP Forgot Password — https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
- OWASP Authentication (account enumeration) — https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- OWASP JSON Web Token cheat sheet — https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html
- OAuth 2.0 Security BCP, refresh token rotation & reuse detection (RFC 9700) — https://datatracker.ietf.org/doc/html/rfc9700
- OWASP API Security Top 10: BOLA (broken object-level auth = our pet access rule) — https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/

**Be able to say:** why access tokens are short and refresh tokens opaque + hashed; what happens when a revoked refresh token is reused; why reset always returns 200; why 404 instead of 403; why SHA-256 is fine for tokens but not passwords.

## 5. S3 presigned uploads
- Presigned URL uploads — https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html
- Presigned URLs with AWS SDK v3 — https://aws.amazon.com/blogs/developer/generate-presigned-url-modular-aws-sdk-javascript/
- MinIO (S3-compatible server) — https://github.com/minio/minio

**Be able to say:** why the file never touches the API; what a presigned PUT can't enforce (size → presigned POST with `content-length-range`); why we store the key, not the URL; the Android emulator host problem.

## 6. Expo & React Native
- Expo Router intro — https://docs.expo.dev/router/introduction/
- Authentication / `Stack.Protected` — https://docs.expo.dev/router/advanced/authentication/
- Linking into your app (deep links, testing) — https://docs.expo.dev/linking/into-your-app/
- Development builds (why not Expo Go) — https://docs.expo.dev/develop/development-builds/introduction/
- SecureStore — https://docs.expo.dev/versions/latest/sdk/securestore/
- ImagePicker — https://docs.expo.dev/versions/latest/sdk/imagepicker/
- Environment variables (`EXPO_PUBLIC_`) — https://docs.expo.dev/guides/environment-variables/
- Monorepos with Expo — https://docs.expo.dev/guides/monorepos/

**Be able to say:** cold-start deep link while logged out; why a dev build; what SecureStore protects against (vs AsyncStorage).

## 7. Server state vs UI state
- TanStack Query overview — https://tanstack.com/query/latest/docs/framework/react/overview
- React Native specifics (onlineManager, focusManager) — https://tanstack.com/query/latest/docs/framework/react/react-native
- Query invalidation — https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation
- Optimistic updates — https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
- TkDodo, Effective React Query Keys — https://tkdodo.eu/blog/effective-react-query-keys
- TkDodo, React Query as a State Manager — https://tkdodo.eu/blog/react-query-as-a-state-manager
- Jotai concepts — https://jotai.org/docs/basics/concepts

**Be able to say:** why server data never goes into Jotai/Context; query-key factory; what you invalidate after "accept invite" (pets list + schedule).

## 8. Forms
- React Hook Form `useForm` — https://react-hook-form.com/docs/useform
- `setError` (mapping server `fieldErrors`) — https://react-hook-form.com/docs/useform/seterror
- `Controller` (RN inputs are controlled) — https://react-hook-form.com/docs/usecontroller/controller

## 9. UI
- Gluestack UI v3 — https://v3.gluestack.io/ui/docs/home/overview/introduction
- NativeWind v4 — https://www.nativewind.dev/docs

## 10. Monorepo & tooling
- pnpm workspaces — https://pnpm.io/workspaces
- pnpm `node-linker` — https://pnpm.io/settings#nodelinker
- Claude Code memory (`CLAUDE.md`) — https://code.claude.com/docs/en/memory
- Claude Code slash commands — https://code.claude.com/docs/en/slash-commands
