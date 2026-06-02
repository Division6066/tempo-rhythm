# Agent Automation Runbook

This is the clean handoff for "full steam ahead" agent work once the always-on
runtime is healthy again.

## Current decision

PR #31 is the preferred path. It includes the current `master` typecheck/build
fix from PR #32 and adds automation readiness. PR #32 is still useful as the
minimal baseline fix, but it should be treated as superseded if PR #31 is
accepted.

Do not merge either PR automatically. A human should review PR #31 first, then
close PR #32 after #31 lands.

Current always-on runtime blocker: Cyrus cloud switch support ticket `CYHOST-1030`.
Until that is resolved, keep agent work local or cloud-IDE based and avoid
pretending a 24-hour Cyrus runtime is available.

## Before starting a long agent run

1. Confirm the runtime switch or agent host is online.
2. Confirm GitHub auth works with `gh auth status`.
3. Confirm the repo branch is clean with `git status --short`.
4. Confirm the correct base branch is `master`.
5. Confirm no dashboard-only action is being hidden inside a code task.
6. Run the batch checks:

```powershell
bun install --frozen-lockfile
bun run lint
bun test
bun run typecheck
bun run build
```

Do not use `bun run check` as a verification-only command until the repo fixes
that script. On 2026-06-02 it was observed to run `biome check --write` in the
mobile package and to fail on pre-existing web formatter diagnostics.

## Worktree pattern

Use one worktree per independent task:

```powershell
git fetch origin
git worktree add ..\tempo-wt\<ticket-or-lane> -b codex/<ticket-or-lane> origin/master
```

Recommended lanes:

- `bug-scan` — read-only first, then one small fix branch if approved.
- `test-coverage` — add focused regression tests for changed code only.
- `docs-generation` — update the nearest existing developer doc.
- `pr-readiness` — verify the branch and PR body before human review.
- `merge-steward` — recommend merge order, never self-merge.

## Cursor automation outlines

Use `/automation-outline` in Cursor, or paste one of the §13 prompts from
`docs/CURSOR_PROMPTS.md`:

- Bug scan: §13.8
- Test coverage gap finder: §13.9
- Docs generation: §13.10
- PR readiness check: §13.11
- Merge-agent checklist: §13.12

## Stop conditions

Stop and ask Amit when:

- A task requires a secret, token, payment, or OAuth approval.
- A task requires changing production dashboard settings.
- The agent cannot prove whether it is touching dev, preview, or production.
- The branch needs a merge, deploy, or force-push.
- Batch checks fail for a reason unrelated to the current task.

## End-of-run report

End every long run with:

```text
Closed PRs ready for review:
Started but not closed:
Blocked:
Checks run:
Human decisions needed:
Recommended next move:
```
