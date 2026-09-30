---
description: Plan and implement one feature slice end-to-end following CLAUDE.md
argument-hint: <requirement id from docs/REQUIREMENTS.md, e.g. INV-1>
---

Implement $ARGUMENTS from docs/REQUIREMENTS.md.

1. Read CLAUDE.md and the requirement. Post a plan: shared schema changes, API
   (module/controller/service/DTO, access rule), mobile (api.ts, queries.ts, components, screen),
   tests (unit, API e2e cases, Maestro flow + the testIDs it needs), and one decision with its
   rejected alternative. Wait for my OK.
2. Implement shared → API → mobile. Keep files small and typed (no `any`).
3. Tests, as part of the slice (not after):
   - `apps/api/test/<feature>.e2e-spec.ts`: happy path, access rules (404/403), error `code`s,
     emails via Mailpit where the feature sends one.
   - `apps/mobile/e2e/flows/<journey>.yaml`: the user journey, setup through `scripts/api.js`,
     selectors by testID (`<screen>.<element>`).
4. Run `/check` and `pnpm test:e2e`; run `pnpm e2e:mobile` if a simulator is booted (say so if not).
   Update the requirement's status in docs/REQUIREMENTS.md and add any decision to docs/DECISIONS.md.
