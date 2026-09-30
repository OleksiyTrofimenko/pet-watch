---
description: Explain a file or flow the way I will need to defend it in a code review
argument-hint: <file path or flow name, e.g. "invite acceptance">
---
Explain $ARGUMENTS for a senior code review. Structure:
1. **What it does** — 3 sentences max.
2. **How it works** — walk the control flow with file:line references.
3. **Why this way** — the decision and at least one rejected alternative with its trade-off
   (check docs/DECISIONS.md first and stay consistent with it).
4. **Edge cases handled** and **edge cases not handled**.
5. **Likely interviewer questions** — 3 questions with short model answers.
Do not modify files.
