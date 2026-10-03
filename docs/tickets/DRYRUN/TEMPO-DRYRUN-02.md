---
ticket: TEMPO-DRYRUN-02
batch: DRYRUN
type: component
lane: auto
scope:
  - apps/web/components/journal/
depends_on: [TEMPO-DRYRUN-01]
contract:
  - api.notes.listJournal(args: {periodType?: "daily"|"weekly"|"monthly"}) -> Doc<"notes">[]
  - api.notes.create(args: {title: string, body: string, pinned?: boolean, periodType?: "daily"|"weekly"|"monthly"|"none"}) -> Id<"notes">
  - api.notes.update(args: {noteId: Id<"notes">, title?: string, body?: string, pinned?: boolean, periodType?: "daily"|"weekly"|"monthly"|"none"}) -> Id<"notes">
overlap_test: false
expected_merge: clean
hold: false
---

FOR: people who journal in Tempo
WHEN: after TEMPO-DRYRUN-01 (needs notes.listJournal)
WHY: docs/PRD.md §3.6 Journal: "Journal is a first-class surface, not a subview of Notes. It lives in the notes table with periodType set, but the app routes it separately. Templates for daily, weekly, monthly reflection. Gentle prompts from the Coach if the user is blank for more than ninety seconds."
GOAL: A user opens Journal, sees past daily/weekly/monthly entries, and writes a new one from a reflection template.
SCOPE: apps/web/components/journal/. Size: about 3 files plus 1 test.
MUTATES:
- apps/web/components/journal/JournalScreen.tsx (client component: period tabs, entry list, editor)
- apps/web/components/journal/journalTemplates.ts (`JOURNAL_TEMPLATES` per period and `nextEntryTitle(periodType, date)`)
- apps/web/components/journal/useBlankPrompt.ts (hook: true after 90 s with an empty body and no typing)
- apps/web/components/journal/journalTemplates.test.ts
STEPS:
1. Query the Graphify graph (`graphify query/explain/affected`, graphify-out/graph.json) for the MUTATES files and their dependents; adjust the plan to the current code.
2. Build `journalTemplates.ts`: templates for "daily", "weekly", "monthly" (3-4 gentle plain-markdown reflection prompts each) and `nextEntryTitle`, e.g. "Daily — 3 Oct 2026".
3. Build `useBlankPrompt.ts`: after 90 seconds blank, show one static gentle prompt line (no AI call; Coach wiring is not in this ticket).
4. Build `JournalScreen.tsx`: `useQuery(api.notes.listJournal, ...)` with tabs All/Daily/Weekly/Monthly (All passes no periodType); "New entry" calls `api.notes.create` with the chosen periodType and the template as body; selecting an entry edits title/body and saves with `api.notes.update`. Show loading, empty and error states; reuse `SoftCard` and `Button` from existing components.
5. Add or extend one test for the behaviour (`bun:test`, `*.test.ts` inside scope).
6. `bun run lint && bun run typecheck && bun run test`.
DONE: `JournalScreen` is exported and renders the three states; creating an entry calls `notes.create` with periodType set; `nextEntryTitle` and the templates are covered by the test; checks green.
EVIDENCE: bun test output for journalTemplates.test.ts and the lint/typecheck/test summary.
DO NOT:
- don't change convex/ or the database folder (the data ticket owns it; anything missing goes in REPORT)
- don't change files outside scope (shared hot files, package.json, lockfiles, routes, config)
- don't change .github/, scripts/factory/, .cursor/, AGENTS.md, docs/tickets/, docs/contracts/
- don't wire the component into apps/web/app/(tempo)/journal/page.tsx (hot file, listed in the contract)
REPORT: what changed, what was verified, anything missing from the contract. Say that the journal route page still needs wiring by the merge agent.
