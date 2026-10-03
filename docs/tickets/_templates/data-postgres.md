---
ticket: <REPO>-Bxx-01
batch: Bxx
type: data
lane: claude             # data tickets are always claude
scope:                   # the schema file, the migrations folder, the data-access folder (see AGENTS.md)
  - <schema path>
  - <migrations folder>/
  - <data-access folder>/
depends_on: []
contract:                # EVERY data-access function the batch's components call (= docs/contracts/<batch>.md)
  - <module>.<function>(args) -> <ReturnType>
overlap_test: false
expected_merge: clean
hold: false              # data tickets are never held
---

FOR: the component tickets of batch Bxx
WHEN: first in the batch; components depend on it
WHY: <PRD section(s)>
GOAL: provide every data-access function in docs/contracts/Bxx.md
SCOPE: schema, migrations and data-access folders only
MUTATES: <schema file, new migration file, data-access files>
STEPS:
1. Query the Graphify graph for the data-access folder and its callers.
2. Change the schema and write ONE new migration (never edit an applied migration).
3. Implement each contract function with exactly the args and return shapes listed.
4. Tests against the CI Postgres service (postgres:16, DATABASE_URL from CI) with the migration applied.
5. Run the repo's lint, typecheck and test commands.
DONE: migration applies cleanly on an empty DB; every contract function exists and is tested; checks green.
EVIDENCE: migration name, test output.
DO NOT:
- don't change files outside the data folders
- don't touch any shared or hosted database; tests use the CI container only
- don't change Railway or any production setting
REPORT: contract names created, migration name, anything that couldn't match the contract.
