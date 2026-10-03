---
ticket: TEMPO-DRYRUN-04
batch: DRYRUN
type: component
lane: auto
scope:
  - apps/web/components/routines/
depends_on: [TEMPO-DRYRUN-01]
contract:
  - api.routines.list(args: {}) -> {_id: Id<"routines">, name: string, habitCount: number, updatedAt: number}[]
  - api.routines.create(args: {name: string, habitIds: Id<"habits">[]}) -> Id<"routines">
  - api.routines.remove(args: {routineId: Id<"routines">}) -> {success: boolean}
  - api.habits.list(args: {}) -> Doc<"habits">[]
overlap_test: false
expected_merge: clean
hold: false
---

FOR: users who run morning or wind-down sequences
WHEN: after TEMPO-DRYRUN-01 (needs routines.*)
WHY: docs/PRD.md §3.8 Habits and Routines: "Routine = ordered sequence of habits ('Morning', 'Wind-down')." (PRD Screen 42, Routines.)
GOAL: A user sees their routines, creates one by naming it and picking habits, and deletes one.
SCOPE: apps/web/components/routines/. Size: about 3 files plus 1 test.
MUTATES:
- apps/web/components/routines/RoutinesScreen.tsx (list + create form)
- apps/web/components/routines/RoutineCard.tsx
- apps/web/components/routines/routineForm.ts (pure validation: trimmed non-empty name, at least one habit, no duplicates)
- apps/web/components/routines/routineForm.test.ts
STEPS:
1. Query the Graphify graph (`graphify query/explain/affected`, graphify-out/graph.json) for the MUTATES files and their dependents; adjust the plan to the current code.
2. Build `routineForm.ts`: `validateRoutineDraft({name, habitIds})` returns `{ok: true, value}` or `{ok: false, error}` with calm messages.
3. Build `RoutineCard.tsx`: name, habit count, link to `/routines/<id>`, and a delete button that calls `api.routines.remove` after a confirm.
4. Build `RoutinesScreen.tsx`: `useQuery(api.routines.list, {})`, `useQuery(api.habits.list, {})` for the habit picker, `useMutation(api.routines.create)`. Loading, empty ("No routines yet, start with a morning one") and error states.
5. Add or extend one test for the behaviour (`bun:test`, `*.test.ts` inside scope).
6. `bun run lint && bun run typecheck && bun run test`.
DONE: the list updates reactively after create and delete; invalid drafts are blocked with a message; the validator is covered by the test; checks green.
EVIDENCE: bun test output for routineForm.test.ts and the lint/typecheck/test summary.
DO NOT:
- don't change convex/ or the database folder (the data ticket owns it; anything missing goes in REPORT)
- don't change files outside scope (shared hot files, package.json, lockfiles, routes, config)
- don't change .github/, scripts/factory/, .cursor/, AGENTS.md, docs/tickets/, docs/contracts/
- don't wire into apps/web/app/(tempo)/routines/page.tsx (hot file, listed in the contract)
- don't build the routine detail view (another ticket owns apps/web/components/routine-detail/)
REPORT: what changed, what was verified, anything missing from the contract.
