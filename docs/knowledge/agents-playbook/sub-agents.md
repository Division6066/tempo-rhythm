# Tempo sub-agents — roles and invocation

**Sub-agents** are scoped, single-purpose agents invoked by the main Cursor agent,
Cyrus, or scheduled automations. They live as flat markdown files under
`.cursor/agents/<name>.md` (not subdirectories).

Canonical roster and triggers: `docs/AGENT_AUTOMATION_RUNBOOK.md` → "Cursor agent
roster". This file describes how they fit together.

## Roster (current)

| Name | Readonly | Trigger | Job |
|---|---|---|---|
| `tempo-qa` | yes | `/run-qa`, before marking a ticket done | Runs `bun run typecheck`, `bun run lint`, `bun test`, forbidden-tech/schema spot checks; returns pass/fail report. |
| `tempo-reviewer` | yes | Pre-merge PR review | Checks diff against HARD_RULES, ticket AC, brand voice, Convex patterns. |
| `tempo-pr-approval-advisor` | yes | PR opened/updated | Merge readiness + GREEN/YELLOW/RED risk tier. |
| `tempo-ticket-picker` | yes | `/whats-next` | Suggests three tickets for a time budget from `docs/brain/tickets/_INDEX.md`. |
| `tempo-merge-agent` | no | Finished PR needs stewardship | Consolidates fix reports, drafts follow-up tickets, never self-merges. |
| `tempo-ci-fix-agent` | no | GitHub check failure | Investigates CI, opens smallest safe fix PR. |
| `tempo-critical-bug-agent` | no | Scheduled or post-merge burst | Scans for high-severity correctness bugs; fix PR only with strong evidence. |
| `tempo-security-scan-agent` | no | Security-sensitive diff | Validates auth/secrets patterns; findings or narrow fix PR. |
| `tempo-dependency-remediation-agent` | no | Vulnerability scan | Prepares dependency update PRs (approval-first). |
| `tempo-test-coverage-agent` | no | Post-feature PR | Adds high-value tests using `bun test` (not Vitest/Jest). |
| `tempo-docs-generation-agent` | no | Doc drift / cron | Updates nearest existing developer doc; docs-only mutations. |
| `tempo-docs-to-tickets` | no | New source doc under `docs/brain/sources/` | Decomposes docs into atomic tickets under `docs/brain/tickets/`. |

## How the orchestrator uses them

```
Build agent completes
    ↓
Run batch checks (bun run lint, bun test, bun run typecheck)
    ↓
Orchestrator invokes (in parallel, as applicable):
    • tempo-reviewer or tempo-pr-approval-advisor
    • tempo-qa (before marking in-review / done)
    • tempo-security-scan-agent (if auth/secrets touched)
    ↓
If GREEN and checks pass → open PR; tempo-merge-agent may steward follow-up
If YELLOW/RED → stop and ask human-amit
```

## Sub-agent authoring rules

- **One file, one job.** Each agent prompt stays focused on a single domain.
- **Readonly unless the agent mutates.** Verification agents must not write code.
  Docs/test/CI agents may write only in their declared scope.
- **Output format is structured.** Prefer PASS/FAIL reports with file + rule refs.
- **No auto-merge.** A PASS from every sub-agent does not mean merge. Amit still reviews.

## How to add a new sub-agent

1. Pick a rule or HARD_RULES section that is currently enforced only by a human reviewer.
2. Author `.cursor/agents/<name>.md` following the frontmatter pattern in existing agents.
3. Register the trigger in `docs/AGENT_AUTOMATION_RUNBOOK.md` and `docs/CURSOR_PROMPTS.md` §13 if scheduled.
4. Update this file with the new entry.
5. PR the change with a test case that proves the agent catches a real violation.
