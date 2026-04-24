# Phase 3 Audit — 2026-04-24

**Scope:** read-only audit of PR #21 (brain-dump-to-plan loop). No deploys, no merges, no product-code changes.

**Subject commit:** `4e383b8 feat(today): complete brain dump planning loop` on branch `codex/phase3-brain-dump-plan-loop`.

---

## PR #21 status at audit time

- `state: OPEN`, `isDraft: false`, `mergeable: MERGEABLE`, `mergeStateStatus: BLOCKED`.
- `reviewDecision: REVIEW_REQUIRED`, `reviewRequests: []`.
- CI: `Typecheck`, `Lint`, `Test`, `Scans (forbidden-tech, ram-only-audit, design-tokens)`, `Vercel`, `Vercel Preview Comments` — all **SUCCESS**.
- Only existing review: `gemini-code-assist` bot, state `COMMENTED` (not an approval).

**Block reason:** branch protection requires a human approving review. Not a code issue.

## Diff scope (5 files, +922 / −4)

```
apps/web/components/today/TodayBrainDumpPanel.tsx   +499
apps/web/components/today/TodayScreen.tsx           +15 / −4
apps/web/lib/brainDumpPrioritizer.ts                +248
convex/_generated/api.d.ts                          +2
convex/brain_dump.ts                                +162
```

Tight and matches the intended Phase 3 slice.

## What was verified

- HARD_RULES §2 — no forbidden AI SDK. Direct `fetch` to `https://api.mistral.ai/v1/chat/completions`.
- HARD_RULES §6.1 — tier map, `safe_prompt: false`, 30s timeout, retry 500ms on 429/5xx, context-overflow escalation `balanced → deep`, all present in `convex/lib/ai_router.ts`.
- HARD_RULES §6.2 accept-reject — the action is **preview-only** (no DB write); the actual `tasks.createQuick` mutation runs only after the user ticks checkboxes and clicks Add. User-mediated confirm is honored.
- HARD_RULES §6.3 — no `confidence` field emitted, but the flow always requires explicit confirm, which is stricter than §6.3 requires for low-confidence items.
- HARD_RULES §6.4 — N/A; user's own brain-dump text, not third-party ingestion. Dump is not persisted.
- Auth: `brain_dump.prioritize` calls `ctx.auth.getUserIdentity()` and throws a user-honest error if unauthenticated.
- Input cap: `MAX_RAW_CHARS = 12_000`. Error copy is ADHD-friendly, never shaming.
- JSON parsing: `response_format: json_object` + fenced-fallback; defensive type checks; priorities capped at 6; strings trimmed and length-capped.
- Local fallback (`brainDumpPrioritizer.ts`) is clearly separated and surfaced in the UI as `Source: local sort` vs `Source: server planner`.
- No secrets in repo. `.env.example` has `MISTRAL_API_KEY=` with empty value. `process.env.MISTRAL_API_KEY` read at runtime in Convex.

## Known issues (not introduced by this PR)

- **Cross-midnight `dueAt` staleness.** `TodayScreen.tsx` computes `bounds` once per mount via `useMemo(..., [])`. Tasks added after local midnight (without a reload) will persist with yesterday's `dueAt` and not appear on the next day's Today list. Affects both `TodayQuickAdd` and `TodayBrainDumpPanel`. Fix in a follow-up that recomputes bounds at click time or on focus/visibility change.

## Nice-to-have follow-ups (from Gemini bot review, non-blocking)

- On successful Add-to-Today, remove added indices from `selected` to prevent duplicate adds on a second click.
- Disable the Clear button while `isPlanning` is true.
- Consider not pre-selecting every priority by default.

Bundle these into a small follow-up PR rather than blocking #21.

## What is still unverified (insufficient evidence)

1. **Authenticated browser QA.** No screenshot or screen recording of the end-to-end flow (sign in → paste dump → run AI plan → tick items → Add → refresh → tasks appear on Today).
2. **Real Mistral call path.** Unit tests are mocked. No artifact confirms the dev Convex deployment has `MISTRAL_API_KEY` set in its dashboard env vars, and no real-call smoke has been logged here.
3. **Add-to-Today happy path.** Tied to (1) — not independently verified.

Recommended way to close all three: run the steps in (1) against the dev Convex deployment with `MISTRAL_API_KEY` set, save the screen recording under `.tmp/qa/` (git-ignored) or link a share URL here.

## Mistral voice

No voice / STT / TTS / MediaRecorder code exists anywhere in the repo. The only `voice` mentions are HARD_RULES §9 policy, PRD §9 future spec, TASKS T-0331/T-0332/T-0333 placeholders (M3), and a placeholder comment in `apps/mobile/app/(tempo)/capture.tsx`. No `voiceSessions` table.

Voice should not be bundled into Phase 4.5 — it belongs in M3 and needs a dedicated PRD covering consent, DSR, minute tracking, and voice-cloning policy. Voice cloning is consent-gated per HARD_RULES §1 + §10.

## Verdicts

- **PR #21 is ready to merge** as soon as a human reviewer approves it and the verification items above are closed.
- **Phase 4 validation may proceed** in parallel on a new branch cut from `origin/master`.
- **Phase 4.5 should be split:** `4.5a` = brain-dump persistence + reopen/search (small, bounded, closes the PRD Screen 11 gap). Voice defers to M3.
