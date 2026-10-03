---
ticket: TEMPO-DRYRUN-08
batch: DRYRUN
type: component
lane: auto
scope:
  - apps/web/components/goal-detail/
depends_on: []
contract:
  - api.goals.list(args: {status?: "active"|"completed"|"archived"}) -> Doc<"goals">[]
  - api.goals.update(args: {goalId: Id<"goals">, title?: string, description?: string|null, targetDate?: number|null, progressPercent?: number, status?: "active"|"completed"|"archived"}) -> Id<"goals">
  - api.goals.remove(args: {goalId: Id<"goals">}) -> {success: boolean}
overlap_test: false
expected_merge: clean
hold: false
---

FOR: users managing one goal
WHEN: independent; uses existing goals functions only
WHY: docs/PRD.md §3.9 Goals and Projects: "Both surfaces allow free-form notes, linked library items, and Coach-suggested decompositions." and Screen 15: "Tap to open Goal Detail." Only fields that exist today (title, description, targetDate, progressPercent, status) are in scope; milestones and linked items are not.
GOAL: A user opens a goal, edits its title, description and date, moves its progress, marks it completed or archived, or deletes it.
SCOPE: apps/web/components/goal-detail/. Size: about 3 files plus 1 test.
MUTATES:
- apps/web/components/goal-detail/GoalDetail.tsx (takes a `goalId: Id<"goals">` prop)
- apps/web/components/goal-detail/ProgressControl.tsx (range 0-100, step 5, with number label)
- apps/web/components/goal-detail/goalPatch.ts (pure: builds the minimal `goals.update` args from original vs draft)
- apps/web/components/goal-detail/goalPatch.test.ts
STEPS:
1. Query the Graphify graph (`graphify query/explain/affected`, graphify-out/graph.json) for the MUTATES files and their dependents; adjust the plan to the current code.
2. Build `goalPatch.ts`: `buildGoalPatch(original, draft)` returns only changed fields; a cleared description or date becomes `null`; an empty title is rejected.
3. Build `ProgressControl.tsx` (accessible, labelled range input).
4. Build `GoalDetail.tsx`: there is no `goals.get`, so use `useQuery(api.goals.list, {})` and find the goal by id; a missing goal shows a gentle not-found state. Save calls `api.goals.update`; "Mark completed" sets status completed and progress 100; "Archive" sets archived; delete calls `api.goals.remove` after a confirm.
5. Add or extend one test for the behaviour (`bun:test`, `*.test.ts` inside scope).
6. `bun run lint && bun run typecheck && bun run test`.
DONE: edits persist via `goals.update` with a minimal patch; completed, archive and delete work; `buildGoalPatch` is covered for unchanged, cleared and changed fields; checks green.
EVIDENCE: bun test output for goalPatch.test.ts and the lint/typecheck/test summary.
DO NOT:
- don't change convex/ or the database folder (the data ticket owns it; anything missing goes in REPORT)
- don't change files outside scope (shared hot files, package.json, lockfiles, routes, config)
- don't change .github/, scripts/factory/, .cursor/, AGENTS.md, docs/tickets/, docs/contracts/
- don't wire into apps/web/app/(tempo)/goals/[id]/page.tsx (hot file, listed in the contract)
- don't build the goals list (another ticket owns apps/web/components/goals/)
REPORT: what changed, what was verified; note that `goals.get` does not exist (list + find was used).
