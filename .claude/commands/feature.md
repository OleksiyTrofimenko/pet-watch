---
description: Plan and implement one feature slice end-to-end following CLAUDE.md
argument-hint: <requirement id from docs/REQUIREMENTS.md, e.g. INV-1>
---

Implement $ARGUMENTS from docs/REQUIREMENTS.md.

1. Read CLAUDE.md and the requirement. Post a plan: shared schema changes, API
   (module/controller/service/DTO, access rule), mobile (api.ts, queries.ts, components, screen),
   tests, and one decision with its rejected alternative. Wait for my OK.
2. Implement shared → API → mobile. Keep files small and typed (no `any`).
3. Run `/check`. Update the requirement's status in docs/REQUIREMENTS.md and add any
   decision to docs/DECISIONS.md.
