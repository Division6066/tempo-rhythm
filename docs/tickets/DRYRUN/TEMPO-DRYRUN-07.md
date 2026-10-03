---
ticket: TEMPO-DRYRUN-07
batch: DRYRUN
type: component
lane: auto
scope:
  - apps/web/components/goals/
depends_on: []
contract:
  - api.goals.list(args: {status?: "active"|"completed"|"archived"}) -> Doc<"goals">[]
  - api.goals.create(args: {title: string, description?: string, targetDate?: number}) -> Id<"goals">
overlap_test: false
expected_merge: clean
hold: false
---

FOR: users tracking outcomes
WHEN: independent; uses existing goals functions only
WHY: docs/PRD.md §3.9 Goals and Projects: "Goals are outcome-focused; Projects are delivery-focused." and Screen 15: "Card-based goal list. Each goal card shows: title, ... due date, progress bar." Category, linked-task progress and AI decomposition are not in the current schema and are out of scope.
GOAL: A user sees their goals as cards with title, due date and progress bar, filters by status, and adds a new goal.
SCOPE: apps/web/components/goals/. Size: about 3 files plus 1 test.
MUTATES:
- apps/web/components/goals/GoalsScreen.tsx (status filter + create form)
- apps/web/components/goals/GoalCard.tsx (title, due date, progress bar, link to /goals/<id>)
- apps/web/components/goals/goalFormat.ts (pure: `formatDueDate`, `dueState` = none|upcoming|soon|past, `parseDateInput`)
- apps/web/components/goals/goalFormat.test.ts
STEPS:
1. Query the Graphify graph (`graphify query/explain/affected`, graphify-out/graph.json) for the MUTATES files and their dependents; adjust the plan to the current code.
2. Build `goalFormat.ts`; a past due date is described neutrally ("was due 3 Oct"), never as failure.
3. Build `GoalCard.tsx` with a labelled `role="progressbar"` driven by `progressPercent`.
4. Build `GoalsScreen.tsx`: `useQuery(api.goals.list, ...)` with All/Active/Completed/Archived chips (All passes no status); a create form with title, optional description and optional target date calls `api.goals.create`. Loading, empty and error states.
5. Add or extend one test for the behaviour (`bun:test`, `*.test.ts` inside scope).
6. `bun run lint && bun run typecheck && bun run test`.
DONE: goals list and create work reactively; the status filter changes the query; helpers are covered by the test; checks green.
EVIDENCE: bun test output for goalFormat.test.ts and the lint/typecheck/test summary.
DO NOT:
- don't change convex/ or the database folder (the data ticket owns it; anything missing goes in REPORT)
- don't change files outside scope (shared hot files, package.json, lockfiles, routes, config)
- don't change .github/, scripts/factory/, .cursor/, AGENTS.md, docs/tickets/, docs/contracts/
- don't wire into apps/web/app/(tempo)/goals/page.tsx (hot file, listed in the contract)
- don't build the goal detail view (another ticket owns apps/web/components/goal-detail/)
REPORT: what changed, what was verified; note that the PRD category and effort fields have no schema column.
