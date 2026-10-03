---
ticket: TEMPO-DRYRUN-01
batch: DRYRUN
type: data
lane: claude
scope:
  - convex/
depends_on: []
contract:
  - api.notes.listJournal(args: {periodType?: "daily"|"weekly"|"monthly"}) -> Doc<"notes">[]
  - api.search.global(args: {query: string, limit?: number}) -> {tasks: {_id: Id<"tasks">, title: string, status: string}[], notes: {_id: Id<"notes">, title: string, snippet: string, periodType: string}[], habits: {_id: Id<"habits">, name: string}[], goals: {_id: Id<"goals">, title: string}[], routines: {_id: Id<"routines">, name: string}[]}
  - api.routines.list(args: {}) -> {_id: Id<"routines">, name: string, habitCount: number, updatedAt: number}[]
  - api.routines.get(args: {routineId: Id<"routines">}) -> {_id: Id<"routines">, name: string, habits: {_id: Id<"habits">, name: string, cadence: "daily"|"weekly", currentStreak: number}[]} | null
  - api.routines.create(args: {name: string, habitIds: Id<"habits">[]}) -> Id<"routines">
  - api.routines.update(args: {routineId: Id<"routines">, name?: string, habitIds?: Id<"habits">[]}) -> Id<"routines">
  - api.routines.remove(args: {routineId: Id<"routines">}) -> {success: boolean}
  - api.rewards.getPebbles(args: {}) -> {pebbles: number, longestStreak: number, daysToNextPebble: number}
overlap_test: false
expected_merge: clean
hold: false
---

FOR: the component tickets of batch DRYRUN
WHEN: first in the batch; components depend on it
WHY: docs/PRD.md §3.6 Journal ("It lives in the notes table with periodType set, but the app routes it separately"); §3.14 Search ("Global search across tasks, notes, journal, library, routines"); §3.8 Habits and Routines ("Routine = ordered sequence of habits ('Morning', 'Wind-down')"); §3.13 Rewards ("Streaks earn 'pebbles' — tiny cosmetic unlocks").
GOAL: provide every function in docs/contracts/DRYRUN.md
SCOPE: convex/ only (schema, functions, and the regenerated convex/_generated/)
MUTATES:
- convex/schema.ts (add `routines` table: userId, name, habitIds: v.array(v.id("habits")), createdAt, updatedAt, deletedAt?; indexes by_userId, by_userId_deletedAt)
- convex/notes.ts (add `listJournal`)
- convex/routines.ts (new: list, get, create, update, remove)
- convex/search.ts (new: global)
- convex/rewards.ts (new: getPebbles)
- convex/routines.test.ts, convex/search.test.ts, convex/rewards.test.ts (new; pure helpers tested with bun:test, same style as convex/analytics.test.ts)
- convex/_generated/ (regenerated)
STEPS:
1. Query the Graphify graph for convex/ and the callers of the touched tables.
2. Add the `routines` table and indexes to convex/schema.ts.
3. `notes.listJournal`: `requireUser`, read by index `by_userId_updatedAt` descending, drop deleted rows and rows whose periodType is "none", apply the optional periodType filter.
4. convex/routines.ts: every function uses `requireUser` (convex/lib/requireUser.ts) and checks `routine.userId === user._id` and `deletedAt === undefined`. `create`/`update` reject habitIds that do not belong to the user and trim the name (non-empty). `get` returns habits in the stored habitIds order and skips deleted habits. `remove` soft-deletes (sets deletedAt).
5. convex/search.ts `global`: trim the query; an empty query returns empty arrays; case-insensitive substring match over tasks (title), notes (title + body, journal notes included; `snippet` is about 120 characters around the match), habits (name), goals (title), routines (name); skip soft-deleted rows; `limit` (default 5, max 20) applies per group. Put the matching in an exported pure helper so it can be unit tested.
6. convex/rewards.ts `getPebbles`: `pebbles` = sum over the user's habits of floor(longestStreak / 7); `longestStreak` = max longestStreak (0 if no habits); `daysToNextPebble` = 7 - (longestStreak % 7). Export the computation as a pure helper. The formula is an assumption (the PRD gives no pebble rate); state it in REPORT.
7. Regenerate and commit `convex/_generated/` (`bunx convex codegen`; needs Convex auth — see AGENTS.md §8.8; if you have no auth, say so in REPORT instead of hand-editing).
8. Tests for each new pure helper and the ownership checks that can be tested without a deployment; `bun run lint && bun run typecheck && bun run test`.
9. Note: it deploys to the TEST deployment (ceaseless-dog-617) only on merge, via convex-deploy-test. Never deploy yourself.
DONE: every contract name exists in convex/_generated/api.d.ts with the listed shapes; checks green.
EVIDENCE: test output; list of contract names → file:line.
DO NOT:
- don't change files outside convex/
- don't deploy; never touch the live deployment
- don't rename or remove existing functions other tickets use
REPORT: contract names created, the pebble formula assumption, anything that couldn't match the contract and why. The hot files the merge agent must edit are listed in docs/contracts/DRYRUN.md ("Hot files for the merge agent").
