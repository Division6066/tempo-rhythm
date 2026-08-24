# Orca GitHub-first control plane

This is a schema and dry-run foundation. It does not dispatch an agent.

## Canonical ticket and identity model

- A GitHub Issue in `Division6066/tempo-rhythm` is the canonical ticket.
- A GitHub Project ordered view is the queue presentation assumption.
- Linear is excluded.
- `🎫 ` marks tickets, `🧭 ` marks roles, and `🤖 ` marks provider accounts.
- Ticket, role, provider, and account identities are separate.

Each ticket records `runId`, `parentTicket`, `sequence`, `stage`, `roleId`,
provider/account selection (`auto` or `explicit`), `billingLane`, `status`,
`dependsOn`, `branch`, `baseCommit`, `resultCommit`, `attempt`, evidence URLs,
and `approvalRequired`. Stages are `build`, `integration`, `ci`, `security`,
`ux`, `preview`, `human-gate`, and `repair`.

## Roles and provider accounts

The role records are: orchestrator, builder, integrator, CI, security, UX/UI,
preview deployer, and human gate. The human gate is the only production-facing
approval role; preview remains preview-only.

Provider accounts carry an alias, provider ID, auth mode, secret-reference-only
`authRef`, concurrency, hourly/weekly/monthly remaining usage (number or
unknown), routing state, and billing policy. The fixture includes Claude Code
Max as an OAuth subscription lane. Hermes is a built-in Orca agent; a
Featherless endpoint routed through Hermes is a future fixed-subscription lane,
not a native custom-provider endpoint in Orca 1.4.188. No secret value is
stored.

Fixed-subscription lanes fail closed at their allowance boundary. Metered APIs
are manual-approval-only and never an automatic fallback. Unknown billing is
blocked.

## Runs, builders, and gates

A run records ordered tickets, maximum parallel builders, active builders, an
integration ticket, and the sequential chain. Parallel builder branches are
represented as state only; this foundation dispatches no real agents.

The chain is integration → CI → security → UX → automated preview → separate
human approval. Every result is bound to the run's commit SHA. A code-changing
repair invalidates all later results and restarts CI.

The workflow is manual `workflow_dispatch` with a required dry-run flag. It has
no schedules, no `workflow_run`, no `pull_request_target`, no agent invocation,
no auto-merge, no force-push, and no production deployment. Master and
production remain human-controlled.
