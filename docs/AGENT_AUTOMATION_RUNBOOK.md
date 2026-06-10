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
- Vercel is linked to `amit-levins-projects/tempo-web`.
- Convex local dev points at `dev:tremendous-bass-443`.

Remaining dashboard/secret items are listed in
`C:\Users\User\.cyrus\handoffs\tempo-full-speed-readiness-2026-06-03.md`.

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

Do not use `bun run check` as a verification-only command until the repo fixes
that script. On 2026-06-02 it was observed to run `biome check --write` in the
mobile package and to fail on pre-existing web formatter diagnostics.

## Cyrus worktree setup

The repository root includes `cyrus-setup.sh` for Cyrus-created worktrees.
Cyrus runs this script after creating an isolated worktree for a Linear issue.

The script is intentionally small:

- disables common telemetry in CI-style agent runs;
- installs Bun `1.3.9` only when Bun is missing from the runner;
- runs `bun install --frozen-lockfile`;
- avoids secrets, dashboard writes, deploys, and long build steps.

Do not add API keys or production environment variables to this script. Those
belong in the owning dashboard or secret manager.

## Slack -> Cyrus trigger contract

Target Slack channels for the Tempo loop:

- `#tempo-control` (`C0BAJVAHMFA`) for human control messages and throwaway
  dry-run requests.
- `#tempo-prs` (`C0B9M9D6LRK`) for PR-opened / PR-ready notifications.
- `#tempo-alerts` (`C0B9M9C6EDT`) for failed checks, blocked agents, and
  auth/tunnel failures.
- `#tempo-log` (`C0B9QLWG1M0`) for low-noise execution logs.

Expected event path:

1. Amit posts a bounded request in `#tempo-control`.
2. Slack sends the event to the Cyrus Slack webhook.
3. Cyrus creates or updates the matching Linear issue in workspace `amit-levin`.
4. Cyrus routes the issue to the active `tempo-rhythm` repo config.
5. Cyrus creates an isolated worktree from `master`, runs `cyrus-setup.sh`, and
   executes the issue.
6. Cyrus pushes a branch and opens a PR against `master`.
7. Agents or notifications post the PR link and status to `#tempo-prs`; failures
   go to `#tempo-alerts`; routine run notes go to `#tempo-log`.

Current checked state on 2026-06-10:

- Cyrus config has `tempo-rhythm` active with Linear workspace `amit-levin`.
- `cyrus start` registers `/slack-webhook`, `/linear-webhook`,
  `/github-webhook`, `/mcp/cyrus-tools`, and status endpoints.
- The local Cyrus worker returns `{"status":"idle"}` at
  `http://127.0.0.1:3456/status`.
- The public Cyrus tunnel returns `{"status":"idle"}` at
  `https://team-4e899e98.atcyrus.com/status`.
- The active tunnel process is Cyrus-managed through the bundled `cloudflared`
  binary under the global `cyrus-ai` package.
- Slack connector access created the four public target channels above.
- Slack connector user search does not expose a `Cyrus` user/app, so inviting
  the Cyrus Slack app/bot still needs dashboard or Slack UI verification.
- The local Cyrus process warns that `LINEAR_CLIENT_ID` and
  `LINEAR_CLIENT_SECRET` are not set, so Linear token refresh is disabled.

The worker and tunnel are live, but the Slack -> Cyrus dry run is still not
verified. Do not mark autonomous Slack triggers ON without a successful Slack
message -> Linear issue -> Cyrus branch -> PR proof.

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
- `tempo-merge-agent` — Cursor Composer 2.5 merge/report steward for finished PRs.

Prepared local worktrees on this Windows machine:

- `C:\Users\User\.cyrus\worktrees\tempo-bug-scan` on `codex/bug-scan`
- `C:\Users\User\.cyrus\worktrees\tempo-test-coverage` on `codex/test-coverage`
- `C:\Users\User\.cyrus\worktrees\tempo-docs-generation` on `codex/docs-generation`
- `C:\Users\User\.cyrus\worktrees\tempo-pr-readiness` on `codex/pr-readiness`
- `C:\Users\User\.cyrus\worktrees\tempo-merge-steward` on `codex/merge-steward`
- `C:\Users\User\.cyrus\worktrees\tempo-merge-agent` on `codex/tempo-merge-agent`

Ticket lanes prepared from latest `master` on 2026-06-03:

- `C:\Users\User\.cyrus\worktrees\tempo-TEMPO-72-a1`
- `C:\Users\User\.cyrus\worktrees\tempo-TEMPO-75-a4`
- `C:\Users\User\.cyrus\worktrees\tempo-TEMPO-79-b1`
- `C:\Users\User\.cyrus\worktrees\tempo-TEMPO-86-c1`
- `C:\Users\User\.cyrus\worktrees\tempo-TEMPO-90-d1`
- `C:\Users\User\.cyrus\worktrees\tempo-TEMPO-94-d5`
- `C:\Users\User\.cyrus\worktrees\tempo-TEMPO-97-e3`
- `C:\Users\User\.cyrus\worktrees\tempo-TEMPO-98-g1`
- `C:\Users\User\.cyrus\worktrees\tempo-TEMPO-101-h1`
- `C:\Users\User\.cyrus\worktrees\tempo-TEMPO-104-i2`

## Cursor automation outlines

The B13 contract inventory lives at `docs/CURSOR_AUTOMATION_CONTRACTS.md`.
Use `/automation-outline` in Cursor, or paste one of the §13 prompts from
`docs/CURSOR_PROMPTS.md`.

The eight B13 lanes are:

- Critical bug scan: `.cursor/agents/tempo-critical-bug-agent.md`, §13.8
- CI fix: `.cursor/agents/tempo-ci-fix-agent.md`, §13.9
- Security scan: `.cursor/agents/tempo-security-scan-agent.md`, §13.10
- Test coverage gap finder: `.cursor/agents/tempo-test-coverage-agent.md`, §13.11
- Docs generation: `.cursor/agents/tempo-docs-generation-agent.md`, §13.12
- PR readiness review: `.cursor/agents/tempo-reviewer.md`, §13.13
- PR approval advisor: `.cursor/agents/tempo-pr-approval-advisor.md`, §13.14
- Merge steward: `.cursor/agents/tempo-merge-agent.md`, §13.15

Extra utility agents such as dependency remediation and docs-to-tickets remain
available, but they are outside the B13 eight-automation baseline.

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
