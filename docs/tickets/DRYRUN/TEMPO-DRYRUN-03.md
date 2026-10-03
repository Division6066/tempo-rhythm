---
ticket: TEMPO-DRYRUN-03
batch: DRYRUN
type: component
lane: auto
scope:
  - apps/web/components/search/
depends_on: [TEMPO-DRYRUN-01]
contract:
  - api.search.global(args: {query: string, limit?: number}) -> {tasks: {_id: Id<"tasks">, title: string, status: string}[], notes: {_id: Id<"notes">, title: string, snippet: string, periodType: string}[], habits: {_id: Id<"habits">, name: string}[], goals: {_id: Id<"goals">, title: string}[], routines: {_id: Id<"routines">, name: string}[]}
overlap_test: false
expected_merge: clean
hold: false
---

FOR: any signed-in user looking for something they wrote
WHEN: after TEMPO-DRYRUN-01 (needs search.global)
WHY: docs/PRD.md §3.14 Search: "Global search across tasks, notes, journal, library, routines." and "Keyboard shortcut CMD/CTRL-K on web." (PRD Screen 24, Search.) Library and the scoped RAG index are out of scope; only the groups in the contract.
GOAL: A user types in a search box and sees grouped results (tasks, notes, journal, habits, goals, routines) with links.
SCOPE: apps/web/components/search/. Size: about 3 files plus 1 test.
MUTATES:
- apps/web/components/search/GlobalSearch.tsx (client component: input, debounce, grouped results)
- apps/web/components/search/groupResults.ts (pure: `search.global` result → ordered display groups with an href per item)
- apps/web/components/search/useDebouncedValue.ts
- apps/web/components/search/groupResults.test.ts
STEPS:
1. Query the Graphify graph (`graphify query/explain/affected`, graphify-out/graph.json) for the MUTATES files and their dependents; adjust the plan to the current code.
2. Build `groupResults.ts`: `groupSearchResults(result)` returns `{label, items:[{id, title, subtitle?, href}]}[]` in the order Tasks, Notes, Journal, Habits, Goals, Routines, omitting empty groups. Notes with periodType "none" go to Notes, other periodTypes go to Journal. Hrefs: /tasks, /notes/<id>, /journal, /habits/<id>, /goals/<id>, /routines/<id>.
3. Build `useDebouncedValue.ts` (250 ms).
4. Build `GlobalSearch.tsx`: `useQuery(api.search.global, debounced.trim() ? {query: debounced} : "skip")`; loading state, a calm "Nothing found, try fewer words" empty state, and results as `next/link`. The input has a label; ArrowUp/ArrowDown moves between results and Enter opens one.
5. Add or extend one test for the behaviour (`bun:test`, `*.test.ts` inside scope).
6. `bun run lint && bun run typecheck && bun run test`.
DONE: typing a query renders grouped results; an empty query sends no request; group order and the notes/journal split are covered by the test; checks green.
EVIDENCE: bun test output for groupResults.test.ts and the lint/typecheck/test summary.
DO NOT:
- don't change convex/ or the database folder (the data ticket owns it; anything missing goes in REPORT)
- don't change files outside scope (shared hot files, package.json, lockfiles, routes, config)
- don't change .github/, scripts/factory/, .cursor/, AGENTS.md, docs/tickets/, docs/contracts/
- don't bind CMD/CTRL-K or edit apps/web/components/tempo/CommandPalette.tsx or the search route page (hot files, listed in the contract)
REPORT: what changed, what was verified, anything missing from the contract.
