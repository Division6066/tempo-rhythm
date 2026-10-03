---
ticket: TEMPO-Bxx-01
batch: Bxx
type: data
lane: claude             # data tickets are always claude
scope:
  - convex/
depends_on: []
contract:                # EVERY query and mutation the batch's components call (= docs/contracts/<batch>.md)
  - api.<module>.<name>(args: {...}) -> <ReturnType>
overlap_test: false
expected_merge: clean
hold: false              # data tickets are never held
---

FOR: the component tickets of batch Bxx
WHEN: first in the batch; components depend on it
WHY: <PRD section(s)>
GOAL: provide every function in docs/contracts/Bxx.md
SCOPE: convex/ only (schema, functions, and the regenerated convex/_generated/)
MUTATES: <schema.ts tables/indexes, convex/<module>.ts files>
STEPS:
1. Query the Graphify graph for convex/ and the callers of the touched tables.
2. Add/extend the schema and indexes.
3. Implement each contract function with exactly the args and return shapes listed.
4. Regenerate and commit `convex/_generated/` (`bunx convex codegen`; needs Convex auth — see AGENTS.md §8.8).
5. Tests for each function; `bun run lint && bun run typecheck && bun run test`.
6. Note: it deploys to the TEST deployment (ceaseless-dog-617) only on merge, via convex-deploy-test. Never deploy yourself.
DONE: every contract name exists in convex/_generated/api.d.ts with the listed shapes; checks green.
EVIDENCE: test output; list of contract names → file:line.
DO NOT:
- don't change files outside convex/
- don't deploy; never touch the live deployment
- don't rename or remove existing functions other tickets use
REPORT: contract names created, anything that couldn't match the contract and why.
