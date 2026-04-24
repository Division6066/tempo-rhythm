# Ship State

This document is the one-table source of truth for what is `shipped-and-running` versus merely planned or coded. It is updated by hand on every state transition. See HARD_RULES §13.5 for the rules that govern this table.

---

## Rules

1. Every feature has exactly one state: `planned`, `coded`, `locally-tested`, `preview-tested`, or `shipped-and-running`.
2. An agent MUST NOT describe a feature as "ready", "done", or "shipped" unless it is `shipped-and-running` (live on production Vercel + production Convex).
3. Casual edits to a `shipped-and-running` feature either (a) re-verify the full ladder or (b) move the feature back to `coded`.

---

## Current state

| Feature | State | Evidence | Last verified |
|---|---|---|---|
| Convex Auth + beta gating | `locally-tested` | Password sign-in/sign-up succeeds locally after `NEXT_PUBLIC_CONVEX_URL` uses the full regional `https://<deployment>.<region>.convex.cloud` URL (legacy non-regional `*.convex.cloud` returned empty 404s from `/api/action`); see `docs/PHASE2_LOCALHOST_QA_2026-04-24.md` | 2026-04-24 |
| /dashboard redirect after sign-in/sign-up | `locally-tested` | `apps/web/app/(app)/dashboard/page.tsx` redirects authenticated users to `/today`; verified with browser after regional Convex URL fix | 2026-04-24 |
| /today route | `locally-tested` | `apps/web/app/(tempo)/today/page.tsx` mounts `TodayScreen`; authenticated load verified locally after auth fix; quick-add exercised where available | 2026-04-24 |
| /tasks route | `coded` | scaffold only | 2026-04-24 |
| /coach route | `coded` | scaffold only | 2026-04-24 |
| /journal route | `coded` | scaffold only | 2026-04-24 |
| CI typecheck + lint | `shipped-and-running` | .github/workflows/ci.yml, green on PR #19 | 2026-04-24 |
| CI forbidden-tech + secrets scans | `planned` | T-0020 todo; scripts not yet implemented | 2026-04-24 |
| Convex production deployment | `planned` | T-0008 todo (human-amit) | 2026-04-24 |
| Four-mode environment contract | `shipped-and-running` | this commit | 2026-04-24 |

---

## How to update this table

- Update the row on every state transition (e.g., when a feature moves from `locally-tested` to `preview-tested` after a real preview build passes).
- Move a feature to a lower state if edits invalidate the previous verification (e.g., a refactor of an auth flow moves it back to `coded` until locally tested again).
- Reality wins over the table — if the table says `shipped-and-running` but production is broken, update the table immediately; do not wait for a fix to restore the previous state label.
