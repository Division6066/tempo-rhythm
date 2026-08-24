# Orca GitHub-first control plane

This is a schema and dry-run foundation. It does not dispatch an agent.

## Canonical work

- A GitHub Issue in `Division6066/tempo-rhythm` is the canonical ticket.
- A GitHub Project ordered view is the queue presentation assumption.
- Linear is deliberately excluded.
- The title prefix `🎫 ` identifies ticket records.

## Separate identities

The manifest keeps three concepts separate:

- `role`: what the worker is allowed to do (`🧭 ` prefix).
- `providerAccount`: which agent/provider account is used (`🤖 ` prefix).
- `ticket`: the GitHub Issue being handled (`🎫 ` prefix).

An account is not a role. A role is not a ticket owner. Provider billing is
explicit: fixed-subscription routes may be considered; metered or unknown
routes require manual approval. Overage behavior is fail-closed by default.

## Run and gate model

Every run records a full 40-character commit SHA. Every gate result is bound to
that same SHA. A code-changing repair invalidates downstream results and
restarts CI; it never silently reuses an earlier result.

The intended sequence is:

1. Integration gate.
2. CI gate.
3. Security gate.
4. Playwright UX/UI gate.
5. Preview gate.

Builder branches may be represented in a manifest as planned parallel work,
but this foundation does not dispatch real agents. Integration remains a
sequential gate after builder results. Preview is not production deployment.
Master and production approval remain human-only.

## Operational boundaries

- Manual dispatch only; no schedules.
- Dry-run validation only; no paid provider invocation.
- No auto-merge, force-push, production deploy, or Linear integration.
- No `workflow_run` or `pull_request_target` triggers.
- Secrets and credential values never belong in the manifest or logs.
- Future metered exceptions must be documented as explicit rules and manually approved.

The example manifest uses a zero SHA intentionally because it is a dry-run
fixture, not a claim about a real commit.
