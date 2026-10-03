---
ticket: TEMPO-DRYRUN-06
batch: DRYRUN
type: component
lane: auto
scope:
  - apps/web/components/rewards/
depends_on: [TEMPO-DRYRUN-01]
contract:
  - api.rewards.getPebbles(args: {}) -> {pebbles: number, longestStreak: number, daysToNextPebble: number}
  - api.streaks.getCurrent(args: {}) -> {streakCount: number, longestAmongHabits: number, habitCount: number}
overlap_test: false
expected_merge: clean
hold: false
---

FOR: users with habit streaks
WHEN: after TEMPO-DRYRUN-01 (needs rewards.getPebbles)
WHY: docs/PRD.md §3.13 Rewards: "Streaks earn 'pebbles' — tiny cosmetic unlocks (theme accents, avatar backgrounds). No gambling mechanics. No variable-ratio dopamine traps."
GOAL: A user sees a Pebbles card showing how many pebbles their streaks have earned and how far away the next one is.
SCOPE: apps/web/components/rewards/. Size: about 3 files plus 1 test.
MUTATES:
- apps/web/components/rewards/PebblesCard.tsx (client component)
- apps/web/components/rewards/pebbleCopy.ts (pure: headline, progress text and ratio from the query result)
- apps/web/components/rewards/PebbleRow.tsx (row of pebble icons, at most 12 shown plus "+N")
- apps/web/components/rewards/pebbleCopy.test.ts
STEPS:
1. Query the Graphify graph (`graphify query/explain/affected`, graphify-out/graph.json) for the MUTATES files and their dependents; adjust the plan to the current code.
2. Build `pebbleCopy.ts`: `describePebbles({pebbles, longestStreak, daysToNextPebble})` returns `{headline, progress, ratio}` with ratio = (7 - daysToNextPebble) / 7. Zero pebbles reads as an invitation ("Your first pebble is {n} days away"). No pressure countdowns, no loss language.
3. Build `PebbleRow.tsx`: decorative icons are `aria-hidden`, and a visible text count is always shown.
4. Build `PebblesCard.tsx`: `useQuery(api.rewards.getPebbles, {})` and `useQuery(api.streaks.getCurrent, {})`; loading and error states; wrap in `SoftCard`.
5. Add or extend one test for the behaviour (`bun:test`, `*.test.ts` inside scope).
6. `bun run lint && bun run typecheck && bun run test`.
DONE: the card renders counts and a progress bar from live data; the copy helper is covered for 0, 1 and many pebbles; no gambling or loss-aversion wording; checks green.
EVIDENCE: bun test output for pebbleCopy.test.ts and the lint/typecheck/test summary.
DO NOT:
- don't change convex/ or the database folder (the data ticket owns it; anything missing goes in REPORT)
- don't change files outside scope (shared hot files, package.json, lockfiles, routes, config)
- don't change .github/, scripts/factory/, .cursor/, AGENTS.md, docs/tickets/, docs/contracts/
- don't build cosmetic unlock or spend logic (not in the contract)
- don't mount the card in the dashboard (hot file, listed in the contract)
REPORT: what changed, what was verified, anything missing from the contract.
