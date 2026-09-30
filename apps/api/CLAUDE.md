# API patterns (NestJS 11 + Prisma 7 + PostgreSQL)

## Layering (lint-enforced)

```
HTTP ─▶ Controller ─▶ Service ─▶ PrismaService ─▶ PostgreSQL
        routing,       business rules,  data access
        DTOs, auth     access checks,
        decorators     transactions, domain errors
```

- **Controllers** are thin: route, validated DTO in, one service call, return. They never import
  Prisma (ESLint `no-restricted-imports` on `*.controller.ts`).
- **Services** own the rules: access checks first, then work, then map to a response DTO.
- **Modules** are features (`auth`, `users`, `pets`, `care-tasks`, `invitations`, `storage`, `mail`).
  Export only what other modules need (e.g. `PetsModule` exports `PetAccessService`).
  Infrastructure modules (`PrismaModule`, `ConfigModule`) are global.

## Feature anatomy

```
src/pets/
  pets.module.ts
  pets.controller.ts
  pets.service.ts
  pet-access.service.ts      # the only place that decides owner/watcher/none
  pets.mapper.ts             # Prisma row → PetDto (never return Prisma models)
  dto.ts                     # createZodDto wrappers only
  pets.service.spec.ts
```

## Canonical snippets

**DTO** — schema from `@petwatch/shared`, no logic here:

```ts
export class CreatePetDto extends createZodDto(createPetSchema) {}
```

**Controller** — secure by default (global `JwtAuthGuard`; opt out with `@Public()`):

```ts
@Controller('pets')
export class PetsController {
  constructor(private readonly pets: PetsService) {}

  @Patch(':petId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('petId', ParseUUIDPipe) petId: string,
    @Body() dto: UpdatePetDto,
  ): Promise<PetDto> {
    return this.pets.update(user.id, petId, dto);
  }
}
```

**Access check** — one query decides the relationship; invisible → 404, wrong role → 403:

```ts
async resolveRole(userId: string, petId: string): Promise<PetRole> {
  const pet = await this.prisma.pet.findFirst({
    where: { id: petId, OR: [{ ownerId: userId }, { watchers: { some: { userId } } }] },
    select: { ownerId: true },
  });
  if (!pet) throw new NotFoundException({ code: 'PET_NOT_FOUND', message: 'Pet not found' });
  return pet.ownerId === userId ? 'OWNER' : 'WATCHER';
}

async assertOwner(userId: string, petId: string): Promise<void> {
  if ((await this.resolveRole(userId, petId)) !== 'OWNER') {
    throw new ForbiddenException({ code: 'OWNER_ONLY', message: 'Only the owner can do this' });
  }
}
```

**Transaction** — whenever more than one write must succeed together:

```ts
await this.prisma.$transaction(async (tx) => {
  await tx.petWatcher.create({ data: { petId, userId } });
  await tx.invitation.update({
    where: { id },
    data: { status: 'ACCEPTED', acceptedAt: new Date() },
  });
});
```

**Domain errors** — always a stable `code` (the mobile app switches on it):

```ts
throw new ConflictException({
  code: 'EMAIL_TAKEN',
  message: 'An account with this email already exists',
});
```

## Rules

- **Never return Prisma models.** Use `select` for what you need and a mapper to the shared DTO type
  (prevents leaking `passwordHash`, `tokenHash`, raw `photoKey`).
- **Config** via `ConfigService<Env, true>` (`config.get('X', { infer: true })`), never `process.env`.
- **DI trap:** don't `import type` a class you inject; Nest needs the runtime reference for metadata.
- **Path params** are validated (`ParseUUIDPipe`); bodies/queries are Zod DTOs. Nothing unvalidated.
- **Idempotent where cheap**: re-invite rotates the token instead of erroring; revoke of a missing
  watcher is 404, not 500.
- **Security defaults**: rate-limit auth endpoints (`@nestjs/throttler`); same response for
  "no such user" on forgot-password; compare token hashes, never raw tokens.

## PostgreSQL / Prisma conventions

- Tables plural snake_case (`@@map`), columns snake_case (`@map`), UUIDv7 ids (`@default(uuid(7)) @db.Uuid`).
- Every FK used for lookups has an index; composite PKs for pure join tables (`pet_watchers`).
- `onDelete` is explicit on every relation. Deleting a pet cascades tasks, watchers, invitations.
- **Invariants live in the database too**: CHECK constraints go in migration SQL
  (see `20260930180000_check_constraints`), because Prisma schema can't express them.
- Workflow: edit `schema.prisma` → `pnpm prisma:migrate --name <verb_noun>` → review the SQL → commit.
  Never edit an applied migration; fix forward. Breaking changes use expand → migrate data → contract.
- `migrate dev` locally only; `migrate deploy` in CI/production.
- Avoid N+1: fetch related data with `include`/`select` or one `findMany({ where: { id: { in } } })`.
- Timestamps are `TIMESTAMP(3)` in UTC; schedule times are wall-clock minutes (see DECISIONS D11).

## Testing

- Pure logic (mappers, token helpers, recurrence) → plain unit tests.
- Services with real rules (auth rotation, invitations) → unit tests with a typed fake of the Prisma
  calls they use, or integration tests against the dev database for the critical paths.
- The error filter has tests (`api-exception.filter.spec.ts`); keep new error mappings covered.

## New endpoint checklist

1. Schema in `packages/shared` (+ response type) → `pnpm build:shared`.
2. DTO wrapper in `dto.ts`.
3. Service method: access check → logic → mapper. Domain errors with codes.
4. Thin controller method with `@CurrentUser()` and validated params.
5. Test for the rule that matters (access, edge case).
6. `pnpm typecheck && pnpm lint && pnpm test`.
