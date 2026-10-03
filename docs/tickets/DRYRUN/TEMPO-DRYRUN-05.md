---
ticket: TEMPO-DRYRUN-05
batch: DRYRUN
type: component
lane: auto
scope:
  - apps/web/components/routine-detail/
depends_on: [TEMPO-DRYRUN-01]
contract:
  - api.routines.get(args: {routineId: Id<"routines">}) -> {_id: Id<"routines">, name: string, habits: {_id: Id<"habits">, name: string, cadence: "daily"|"weekly", currentStreak: number}[]} | null
  - api.routines.update(args: {routineId: Id<"routines">, name?: string, habitIds?: Id<"habits">[]}) -> Id<"routines">
  - api.habits.list(args: {}) -> Doc<"habits">[]
overlap_test: false
expected_merge: clean
hold: false
---

FOR: users editing a single routine
WHEN: after TEMPO-DRYRUN-01 (needs routines.get and routines.update)
WHY: docs/PRD.md §3.8 Habits and Routines: "Routine = ordered sequence of habits" and "Streaks are celebrated, but broken streaks are never punished in copy." (PRD Screen 42, Routines.)
GOAL: A user opens one routine, sees its habits in order with their streaks, renames it, and reorders, adds or removes habits.
SCOPE: apps/web/components/routine-detail/. Size: about 3 files plus 1 test.
MUTATES:
- apps/web/components/routine-detail/RoutineDetail.tsx (takes a `routineId: Id<"routines">` prop)
- apps/web/components/routine-detail/HabitOrderList.tsx (reorder up/down, remove)
- apps/web/components/routine-detail/reorder.ts (pure `moveItem`, `removeItem`, `addItem`)
- apps/web/components/routine-detail/reorder.test.ts
STEPS:
1. Query the Graphify graph (`graphify query/explain/affected`, graphify-out/graph.json) for the MUTATES files and their dependents; adjust the plan to the current code.
2. Build `reorder.ts`: immutable `moveItem(ids, from, to)`, `removeItem(ids, id)`, `addItem(ids, id)` (no duplicates); an out-of-range move returns the input unchanged.
3. Build `HabitOrderList.tsx` with accessible up/down buttons (no drag library, no new dependency).
4. Build `RoutineDetail.tsx`: `useQuery(api.routines.get, {routineId})`; a null result shows a gentle "This routine is gone" state; edits call `api.routines.update` with the full new `habitIds`; an "Add habit" select is fed by `api.habits.list`. Streak copy is celebratory only: a streak of 0 shows "Fresh start today", never a warning.
5. Add or extend one test for the behaviour (`bun:test`, `*.test.ts` inside scope).
6. `bun run lint && bun run typecheck && bun run test`.
DONE: reorder, add, remove and rename persist through `routines.update`; the helpers are covered by the test; zero-streak copy has no shaming text; checks green.
EVIDENCE: bun test output for reorder.test.ts and the lint/typecheck/test summary.
DO NOT:
- don't change convex/ or the database folder (the data ticket owns it; anything missing goes in REPORT)
- don't change files outside scope (shared hot files, package.json, lockfiles, routes, config)
- don't change .github/, scripts/factory/, .cursor/, AGENTS.md, docs/tickets/, docs/contracts/
- don't wire into apps/web/app/(tempo)/routines/[id]/page.tsx (hot file, listed in the contract)
- don't build the routine list (another ticket owns apps/web/components/routines/)
REPORT: what changed, what was verified, anything missing from the contract.
