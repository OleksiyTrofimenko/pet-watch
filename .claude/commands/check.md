---
description: Typecheck, lint and test the whole monorepo, then summarise failures
---

Run `pnpm build:shared && pnpm typecheck && pnpm lint && pnpm test` from the repo root.
If anything fails, group failures by package, explain the root cause of each in one line,
and propose the smallest fix. If a lint boundary rule fired, propose a design fix, never a disable.
Do not change code until I confirm.
