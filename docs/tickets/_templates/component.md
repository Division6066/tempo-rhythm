---
ticket: TEMPO-Bxx-NN
batch: Bxx
type: component
lane: auto               # auto | claude | codex | cursor
scope:                   # this ticket's OWN folder; no other component in the batch shares it
  - apps/web/components/<feature>/
depends_on: [TEMPO-Bxx-01]   # the batch's data ticket, if the contract needs new functions
contract:                # the API names it calls, exactly as in docs/contracts/<batch>.md
  - api.<module>.<name>(args: {...}) -> <ReturnType>
overlap_test: false
expected_merge: clean
hold: false
---

FOR: <who uses this>
WHEN: <batch / after which ticket>
WHY: <PRD section it comes from, e.g. docs/PRD.md §3.1 ...>
GOAL: <one sentence, the user-visible result>
SCOPE: <the folder(s) above>. Size: about 3 files plus 1 test.
MUTATES: <the exact files to create/change, all inside scope>
STEPS:
1. Query the Graphify graph (`graphify query/explain/affected`, graphify-out/graph.json) for the MUTATES files and their dependents; adjust the plan to the current code.
2. <concrete step>
3. <concrete step>
4. Add or extend one test for the behaviour.
5. `bun run lint && bun run typecheck && bun run test`.
DONE: <observable checks>
EVIDENCE: <what to paste in the PR: test output, screenshot path>
DO NOT:
- don't change convex/ or the database folder (the data ticket owns it; anything missing goes in REPORT)
- don't change files outside scope (shared hot files, package.json, lockfiles, routes, config)
- don't change .github/, scripts/factory/, .cursor/, AGENTS.md, docs/tickets/, docs/contracts/
REPORT: what changed, what was verified, anything missing from the contract.
