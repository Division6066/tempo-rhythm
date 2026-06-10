# Cursor Automation Contracts

This is the B13 inventory for the eight recurring Cursor automations used in the
Tempo loop. The automation docs live in `.cursor/agents/`, `.cursor/commands/`,
and this `docs/` folder.

Composer 2.5 default: all B13 background automations should run on
`model: composer-2.5` unless a task enters a RED risk tier: secrets, OAuth,
billing, production deploy, EAS ownership, destructive data/schema work,
auth/security-model changes, or branch-protection bypass. In those cases the
agent stops and asks Amit.

Keep agent PRs draft/open by default. No automation may self-merge, bypass branch
protection, rotate secrets, deploy production, or change dashboard-only settings.

## Contract Table

| Automation | Trigger | Checks | Pass/fail criteria | On fail | Composer 2.5 change applied |
| --- | --- | --- | --- | --- | --- |
| Critical bug scan | Scheduled every 12 hours and after merge bursts | Recent commits, open PRs, changed routes, Convex functions, shared UI primitives, package config, `bun install --frozen-lockfile`, `bun run lint`, `bun test`, `bun run typecheck`, `bun run build` | Pass when no high-severity correctness bug is proven and safe checks pass or unrelated failures are documented | Open one narrow draft fix PR for proven GREEN bugs; otherwise draft a bug report and block merge recommendations for affected PRs | Pinned to Composer 2.5 for long-horizon inspection; explicit escalation only for schema/auth/security/billing/deploy ambiguity |
| CI fix | Scheduled every 12 hours and whenever GitHub checks fail | `gh pr checks`, failed run logs, exact failing command locally, then lint/test/typecheck/build | Pass when the failing check is reproduced or explained and a narrow fix PR has green relevant checks | Open/update one draft fix PR; comment/report root cause and exact failing check; never merge | Pinned to Composer 2.5 for log triage and small fix loops; requires one-check-to-one-fix discipline |
| Security scan | Scheduled every 24 hours and on security-sensitive diffs | Secret-looking strings, auth/session diffs, Convex authorization, provider calls, dependency vulnerabilities, CI/deploy/OAuth/billing changes, `bun run scan:forbidden-tech` when present | Pass when no BLOCKER/CHANGE security finding remains unhandled and evidence is concrete | BLOCKER blocks merge; CHANGE requests fix; NOTE is tracked; secrets/dashboards stop for Amit | Pinned to Composer 2.5 for broad scan synthesis; RED categories force human escalation |
| Test coverage | Scheduled every 24 hours and after feature/risky bug PRs | PR/local diff, nearby existing tests, public behavior, Convex functions, route handlers, shared UI logic, narrow test command, root `bun test` | Pass when top risk has 1-3 focused regression tests or there is a documented reason not to add tests | Add tests in a draft PR; if tests expose a product bug, stop unless the fix is tiny and in scope | Pinned to Composer 2.5 for focused test selection; capped at 1-3 tests to avoid broad rewrites |
| Docs generation | Scheduled every 24 hours and after setup/API/workflow/automation changes | Merged PR/current diff, nearest existing docs, ship-state evidence, secret redaction | Pass when required developer docs/runbooks are updated without overstating shipped/running state | Open a docs-only draft PR or report no-docs-needed evidence | Pinned to Composer 2.5 for report consolidation and doc updates; explicitly forbids shipped claims without `docs/SHIP_STATE.md` proof |
| PR readiness review | On PR open/update/ready and before asking Amit to merge | HARD_RULES, ticket acceptance criteria, changed files, Convex patterns, brand voice, tests, PR hygiene, status checks | Pass only when no blockers, acceptance criteria are met, and CI is green or non-applicable with evidence | Request changes or block; never posts comments or mutates GitHub directly | Composer 2.5 allowed for routine review; reviewer inherits stronger model only when configured by parent for deep code review |
| PR approval advisor | On approval, merge-readiness, or "can this merge?" questions | PR metadata, checks, reviews, branch rules, risk tier, local checks when clean | Pass when PR is GREEN: non-draft, checks green, review satisfied or not required, narrow diff, no RED/YELLOW risks | `ASK_BEFORE_MERGE` for YELLOW; `NEEDS_HUMAN` for RED; insufficient evidence stays blocking | Pinned to Composer 2.5 for low-noise readiness classification and handoff |
| Merge steward | On finished agent PRs or merge-order planning | PR metadata, draft state, dependency status, status checks, secret/deploy/payment diff scan, safe local checks, merge report | Pass when recommendation is evidence-backed and branch protection remains intact | `REQUEST_CHANGES` or `BLOCKED`; write `docs/QA/agent-runs/<date>-<target>-merge-report.md`; never self-merge | Pinned to Composer 2.5 for cost-efficient merge/report loops; may recommend merge only after green evidence |

## Required GitHub Gates

The merge gate is load-bearing. Branch protection for `master` must require the
CI and security checks that protect Tempo PRs. The expected required checks are:

- `Typecheck`
- `Lint`
- `Test`
- `Scans (forbidden-tech, ram-only-audit, design-tokens)`
- `Secret scan`

Proof for B13 requires a deliberately failing test PR that cannot merge while a
required check is red. Close the proof PR after verification and record the PR
URL plus blocked check in `docs/QA/agent-runs/`.

If branch protection cannot be inspected from the current machine, report
`insufficient evidence` rather than claiming the merge gate is proven.

## Schedule Summary

| Cadence | Automations |
| --- | --- |
| Every 12 hours | Critical bug scan, CI fix |
| Every 24 hours | Security scan, test coverage, docs generation |
| PR event | PR readiness review, PR approval advisor |
| Finished PR / merge queue | Merge steward |

