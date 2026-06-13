# Agent Automation Runbook

This is the clean handoff for "full steam ahead" agent work now that the
automation baseline has landed.

## Current decision

PR #31 landed the automation-readiness baseline. PR #39 landed the follow-up
Dependabot workspace cleanup. PR #32 was closed as superseded.

Current runtime status from the 2026-06-03 readiness pass:

- Cyrus local worker returns `{"status":"idle"}` at `http://127.0.0.1:3456/status`.
- Cyrus worker logs show an active Cloudflare tunnel.
- The `tempo-rhythm` repo is registered in Cyrus with Linear workspace `amit-levin`.
- Claude Code auth works from terminal.
- Vercel is linked to `tempo-rhythm-web` (Vercel project for `apps/web`).
- Convex local dev points at `dev:tremendous-bass-443`.

Remaining dashboard/secret items are tracked in the Cyrus handoff notes on the
host machine (see `C:\Users\User\.cyrus\handoffs\` on the Windows Cyrus worker).
Treat those as human-amit actions — do not embed secrets in the repo.

## Before starting a long agent run

1. Confirm the runtime switch or agent host is online.
2. Confirm GitHub remote access works with `git ls-remote origin master`.
3. Confirm the repo branch is clean with `git status --short`.
4. Confirm the correct base branch is `master`.
5. Confirm no dashboard-only action is being hidden inside a code task.
6. Confirm Convex local dev is bound with `bunx convex function-spec`.
7. Run the batch checks:

```powershell
bun install --frozen-lockfile
bun run lint
bun test
bun run typecheck
bun run build
```

Do not use `bun run check` as a verification-only command. The root `check`
script runs `turbo run check`, which delegates to each workspace:

- `apps/web`: `biome check .` (read-only)
- `apps/mobile`: `biome check --write .` (may modify files)

For verification, prefer the explicit batch below.

## Cyrus worktree setup

The repository root includes `cyrus-setup.sh` for Cyrus-created worktrees.
Cyrus runs this script after creating an isolated worktree for a Linear issue.

The script is intentionally small:

- sets `CI=1` and disables Next/Turbo telemetry;
- logs `LINEAR_ISSUE_IDENTIFIER` when Cyrus passes it;
- installs Bun `1.3.9` only when Bun is missing from the runner;
- runs `bun install --frozen-lockfile`;
- avoids secrets, dashboard writes, deploys, Convex dev, and long build steps.

Do not add API keys or production environment variables to this script. Those
belong in the owning dashboard or secret manager.

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

Example layout on a Cyrus host (paths vary by machine):

```text
~/.cyrus/worktrees/tempo-<lane>/     # one worktree per lane or ticket
~/.cyrus/handoffs/                   # human dashboard follow-ups
```

## Cursor agent roster

All agents live as flat markdown files under `.cursor/agents/`. There is no npm
package — the "automation agents package" is this directory plus the §13 prompts
in `docs/CURSOR_PROMPTS.md`.

| Agent file | Mutates? | Primary trigger |
|---|---|---|
| `tempo-merge-agent.md` | yes (reports, tickets) | Finished PR needs merge stewardship |
| `tempo-ci-fix-agent.md` | yes | GitHub check failure blocks a PR |
| `tempo-critical-bug-agent.md` | yes (fix PR) | High-severity correctness scan |
| `tempo-security-scan-agent.md` | yes (findings/fix PR) | Security-sensitive diff or scheduled scan |
| `tempo-dependency-remediation-agent.md` | yes (draft PR) | Dependency vulnerability review |
| `tempo-docs-generation-agent.md` | yes (docs only) | Setup/workflow/API doc drift |
| `tempo-test-coverage-agent.md` | yes (tests only) | Post-feature coverage gap |
| `tempo-docs-to-tickets.md` | yes (tickets only) | Decompose a source doc into atomic tickets |
| `tempo-reviewer.md` | no | Pre-merge PR review vs HARD_RULES + ticket AC |
| `tempo-pr-approval-advisor.md` | no | Merge readiness + risk tier |
| `tempo-qa.md` | no | `/run-qa` gate before marking a ticket done |
| `tempo-ticket-picker.md` | no | `/whats-next` session bootstrap |

## Cursor automation outlines

Use `/automation-outline` in Cursor, or paste one of the §13 prompts from
`docs/CURSOR_PROMPTS.md`:

- Bug scan: §13.8
- Test coverage gap finder: §13.9
- Docs generation: §13.10
- PR readiness check: §13.11
- Merge-agent checklist: §13.12

Specialized agents (see roster table above):

- PR approval advisor: `.cursor/agents/tempo-pr-approval-advisor.md`
- CI fix agent: `.cursor/agents/tempo-ci-fix-agent.md`
- Critical bug scan agent: `.cursor/agents/tempo-critical-bug-agent.md`
- Security scan agent: `.cursor/agents/tempo-security-scan-agent.md`
- Dependency remediation agent: `.cursor/agents/tempo-dependency-remediation-agent.md`
- QA gate: `.cursor/agents/tempo-qa.md`
- Reviewer: `.cursor/agents/tempo-reviewer.md`
- Ticket picker (`/whats-next`): `.cursor/agents/tempo-ticket-picker.md`
- Docs-to-tickets: `.cursor/agents/tempo-docs-to-tickets.md`

For the recurring merge/report loop, use `.cursor/agents/tempo-merge-agent.md`.
It defaults to Cursor Composer 2.5 for routine merge stewardship because this work is
mostly structured inspection, report consolidation, and follow-up ticket drafting.
The merge agent must:

- inspect the finished PR or branch,
- run the required checks when safe,
- write a report under `docs/QA/agent-runs/`,
- draft follow-up tickets when evidence supports them,
- never self-merge, deploy, rotate secrets, or undraft dependency PRs.

Risk policy for all background automations:

- GREEN: checks green, non-critical, no secrets/deploys/billing/auth policy,
  schema migration, dependency bundle, dashboard setting, or EAS ownership. The
  agent may continue and may hand off to the merge steward.
- YELLOW: shared architecture, CI/package config, Convex functions, merge order,
  pending/flaky checks, or superseded PRs. Notify Amit before the action and
  verify afterward.
- RED: secrets, OAuth, billing, production deploy, EAS ownership, destructive
  data/schema, auth/security model, or branch-protection bypass. Stop and ask
  Amit.

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
