# Agent Run Merge Reports

This folder stores short merge reports produced by the Tempo merge agent after
Cyrus, Codex, Claude, or Cursor runs finish.

Use one file per PR or branch:

`<YYYY-MM-DD>-<pr-or-branch>-merge-report.md`

Each report should include:

- PR or branch
- Source agent
- Summary
- Checks run
- Failures or risks
- Human decisions needed
- Follow-up tickets proposed
- Next recommended agent lane

Reports are evidence records, not marketing summaries. If a check was not run,
write `not run`.

