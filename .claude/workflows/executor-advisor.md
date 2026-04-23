# Executor / Advisor Workflow

Use this file when you want a cheap/fast lane to do the bulk of the work and a strong reasoning lane to weigh in on hard calls.

This is the local fallback pattern. The Claude Code extension does not expose a native "Advisor Tool" — the pattern is achieved with the existing `Agent` tool plus explicit escalation rules.

## 1. Capability verdict

- Native Advisor Tool: **not supported** in this Cursor + Claude Code extension setup.
- Equivalent pattern: **fully available today** via the `Agent` tool with `model` override and project-level workflow conventions.

This document is the convention. No new framework, no wrapper, no MCP server.

## 2. Who does what

Two lanes. The session model determines the default lane; delegation moves work between lanes.

### Executor lane (default, cheap)

- Runs in the main Claude Code thread.
- Prefer Sonnet. In this repo the user's global `CLAUDE.md` says "Opus plans, Sonnet executes" — so Opus sits in the main thread and delegates execution to Sonnet subagents via `Agent({ model: "sonnet", ... })`.
- Owns: writing and editing code, running tests, mechanical refactors, file scans, build/deploy steps, Convex codegen, smoke tests, doc edits.

### Advisor lane (escalation, strong)

- Opus (default Opus 4.7 in this repo) or an Opus subagent called from Sonnet via `Agent({ model: "opus", ... })`.
- Owns: architecture calls, ambiguous-requirement disambiguation, non-obvious debugging, cross-module trade-off analysis, security review, migration planning, any decision that will outlive the current PR.

## 3. When to escalate

Escalate to the advisor lane automatically when any of these fire:

1. Two failed attempts at the same local problem with no new information.
2. Requirements admit more than two plausible readings and "pick the reasonable one" would mis-fire half the time.
3. The change touches more than three modules or crosses a trust boundary (auth, proposals, RAM-only scanner, billing).
4. A security-sensitive decision: token handling, access checks, PII surfaces, secret rotation, data retention.
5. Performance trade-off where both options would work but have different long-term shape.
6. Convex schema change with live data, or any migration that widen-migrate-narrows.
7. The user has just said "I'm not sure" or "what do you think?" about a non-trivial call.

Do **not** escalate for:

- Known fix recipes already documented in the repo.
- Linter / typecheck errors with clear messages.
- Repetitive edits across files.
- Format, rename, move, delete of work the user already approved.

## 4. Manual escalation

Three ways to force the advisor lane:

1. Type `/advise` in the Claude Code thread. The slash command at [`.claude/commands/advise.md`](../commands/advise.md) wraps the current context into an Opus subagent call.
2. Say "get a second opinion" or "escalate to opus." The session recognizes this as a trigger.
3. Start a new Claude Code session with the Opus model selected when the problem is known to be hard before you begin.

## 5. Escalation prompt template

When spawning an advisor, give it enough to judge — not to re-execute. Keep it under ~200 words.

```
Role: advisor (opus). Do not write code. Return a recommendation.

Context:
- Goal: {one sentence}
- What's been tried: {1-3 bullets}
- What is ambiguous: {the specific decision you want advised}
- Constraints that matter: {repo rules, deadline, budget, user preference}

Question:
{exactly one question, phrased so the answer is a decision, not an essay}

Output shape:
- Recommendation (one sentence)
- Why (under 80 words)
- What would change your mind (one bullet)
- Risks you accept (one bullet)
```

The executor takes the recommendation and implements it. The executor does not re-debate the advisor's call unless new evidence appears.

## 6. Long-running coding-task template

For a task that should run while you are away (overnight, during a meeting, while you commute):

1. Pick a bounded slice. One ticket, one module, one acceptance test. Nothing open-ended.
2. Escalate once at the start (advisor lane) to lock the plan. Save the plan as a checklist in the chat.
3. Hand to the executor lane for build. Executor writes code, runs typecheck, runs the smoke test, commits on a feature branch (never on `master`).
4. Executor stops at the first of: acceptance test passes, three consecutive failed attempts, or an escalation trigger from §3.
5. On return: read the executor's report, then advise-only pass on any escalation notes before merging.

Anti-pattern: "run overnight, see what happens." The bounded slice is the whole point.

## 7. Anti-patterns

- Escalating every decision. Advisor calls cost context and user time; only escalate when the rule in §3 fires.
- Letting the advisor also execute. Advisor writes **no code** in this pattern. Mixing lanes wastes the reasoning.
- Skipping the plan when the work is long. A 2-hour executor run without an up-front advisor plan usually produces 2 hours of rework.
- Trusting the executor's self-report. Read the diff, not the summary.
- Hiding escalation triggers behind "I'll figure it out." If rule §3 fires, surface it — silence is the bug.
