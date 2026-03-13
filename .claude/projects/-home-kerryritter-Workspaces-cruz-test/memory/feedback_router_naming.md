---
name: tRPC router file naming convention
description: Router files must be named *.trpc.ts not *.router.ts
type: feedback
---

Always name tRPC router files `{feature}.trpc.ts`, not `{feature}.router.ts`.

**Why:** Project convention — the user corrected this explicitly.

**How to apply:** Any time a new tRPC router file is created for a feature, use the `.trpc.ts` suffix (e.g. `subreddits.trpc.ts`, `posts.trpc.ts`, `votes.trpc.ts`, etc.).
