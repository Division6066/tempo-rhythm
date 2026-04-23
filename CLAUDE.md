# Tempo Flow — Claude Code Workflow

Use this file as the repo-level operating contract for Claude Code in Cursor.

Cursor-specific rules still live in `.cursor/`.
This file exists so Claude Code has an equivalent instruction surface.

## Read First

Before non-trivial work:

1. Read [docs/HARD_RULES.md](./docs/HARD_RULES.md).
2. Read [docs/brain/TASKS.md](./docs/brain/TASKS.md).
3. Read [docs/SESSION_WORKFLOW.md](./docs/SESSION_WORKFLOW.md).
4. If the user pasted a nightly run summary or cloud-agent report, read [./.claude/workflows/nightly-run-intake.md](./.claude/workflows/nightly-run-intake.md) before acting on it.

## Repo Priorities

- Tempo stays first.
- Prefer bounded vertical slices over broad platform work.
- Do not trust cloud or overnight summaries blindly. Reconcile them against the current local checkout first.
- Respect the owner tags in `docs/brain/TASKS.md`.
- If a task is clearly `twin`, `pokee`, `zo`, or `human-amit`, do not pretend Claude Code can complete it locally.

## Working Rules

- Use Bun and the existing monorepo structure.
- Do not add forbidden tech from `docs/HARD_RULES.md`.
- Treat Convex, auth, and AI wiring as high-discipline areas.
- If the user asks for planning only, do not make code changes.
- If the user asks to update planning/triage state, update the Planning Hub and keep the output human-readable first.

## Claude-Specific Workflow Triggers

Use the nightly-run workflow when the user:

- pastes a Cursor overnight summary
- pastes a PR/result summary and asks what is real locally
- asks to install or test a workflow around cloud-agent output
- asks what to do next after a long-running run

Use the executor/advisor workflow ([.claude/workflows/executor-advisor.md](./.claude/workflows/executor-advisor.md)) as the default operating pattern for any non-trivial work:

- Opus sits in the main thread for planning and orchestration.
- Sonnet subagents execute via `Agent({ model: "sonnet", ... })`.
- Escalate back to an Opus advisor when a trigger from §3 fires, or when the user types `/advise`.
- For long-running or cross-surface work, see [.claude/workflows/cross-surface-guide.md](./.claude/workflows/cross-surface-guide.md).

## Output Rule

When reconciling cloud output:

- say what is confirmed locally
- say what is contradicted locally
- say what is still unverified
- then give the smallest useful next move
