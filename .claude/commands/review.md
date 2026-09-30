---
description: Review uncommitted changes against the project patterns before committing
argument-hint: [optional path or git range, defaults to uncommitted changes]
---

Review ${ARGUMENTS:-the output of `git diff HEAD` plus untracked files} as a strict senior reviewer.
Read CLAUDE.md, apps/api/CLAUDE.md and apps/mobile/CLAUDE.md first and judge against them.

Report, most important first, max 10 items, each with file:line and a concrete fix:

1. **Correctness & security** — access checks missing, data leaks (Prisma models returned),
   missing transaction, unhashed secrets, unvalidated input.
2. **Layering** — logic in controllers/screens, fetching in presentational components,
   design-system importing domain code, server state outside TanStack Query.
3. **Duplication & size** — repeated UI/logic that should use or extend an existing pattern,
   components > 150 lines, dead code, speculative abstractions.
4. **Types** — `any`, casts, non-exhaustive switches over shared enums.
5. **Tests** — the one test that would catch the most likely regression, if missing.

End with a verdict: "ready to commit" or "fix first". Don't edit files.
