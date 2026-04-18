# Sunday-morning workflow — 45-minute session

**Audience:** Amit (human), the orchestrator agent (Cursor Composer), and the three parallel build agents.
**Goal:** from "I have 45 minutes" to three merged tickets, with zero decision fatigue.

## The loop

```
┌────────────────────────────────────────────────────────────────┐
│ 1. Amit: "/whats-next I have 45 minutes"                       │
├────────────────────────────────────────────────────────────────┤
│ 2. Orchestrator reads tickets/_INDEX.md                        │
│    • filters tickets by time budget                            │
│    • picks 3 with disjoint files_touched                       │
│    • checks deps are met                                       │
│    • replies: "Propose T-0042, T-0057, T-0061. OK?"            │
├────────────────────────────────────────────────────────────────┤
│ 3. Amit: "yes"   ← hard checkpoint                              │
├────────────────────────────────────────────────────────────────┤
│ 4. Orchestrator spins up 3 cloud agents in isolated worktrees  │
│    • each receives one T-XXXX.md as full context               │
│    • each branches feat/T-XXXX-<short-kebab>                   │
├────────────────────────────────────────────────────────────────┤
│ 5. Build agents work in parallel                               │
│    • when each finishes, stop hook runs tsc + lint             │
│    • failures → agent retries up to N, then flags              │
├────────────────────────────────────────────────────────────────┤
│ 6. Verification sub-agents review each completed branch        │
│    • tempo-hard-rules-auditor  (readonly)                      │
│    • tempo-schema-checker      (readonly)                      │
│    • tempo-design-token-validator  (readonly)                  │
│    • tempo-accept-reject-checker   (readonly)                  │
│    • tempo-test-runner         (runs tsc + tests)              │
├────────────────────────────────────────────────────────────────┤
│ 7. Each agent opens a PR with the standard template            │
│    (summary, screenshots, test plan, acceptance criteria)      │
├────────────────────────────────────────────────────────────────┤
│ 8. Amit reviews diffs                                          │
│    • merges the good                                           │
│    • rejects / requests changes on the rest                    │
│    • `/tick-task T-0042` marks TASKS.md done                   │
├────────────────────────────────────────────────────────────────┤
│ 9. Next break → loop again with fresh budget                   │
└────────────────────────────────────────────────────────────────┘
```

## Pre-conditions for the loop to work

- `docs/TASKS.md` has at least three `todo` tasks whose ticket files exist at `docs/knowledge/tickets/T-XXXX.md`.
- Each ticket file has `estimated_time`, `files_touched`, `dependencies` populated by the generator.
- Stop hook (`.cursor/hooks.json`) runs `tsc` + `lint` + the project scan suite on agent completion.
- Verification sub-agents (`.cursor/agents/tempo-*`) are registered.
- `/whats-next` slash command is installed at `.cursor/commands/whats-next.md`.

## Time budgets → ticket counts

| Budget | Typical tickets | Notes |
|---|---|---|
| 30 min | 1 × 30 min | One small surface. Usually bug fix or copy edit. |
| 45 min | 1 × 45 min OR 2 × 30 min parallel | Start here for most sessions. |
| 60 min | 1 × 60 min OR 2 × 30-45 parallel | |
| 90 min | 1 × 90 min OR 3 × 30 parallel | |
| 120+ min | 1 × 120+ OR 2–3 parallel | Bigger parallel batches. |

## What makes tickets "parallel-safe"

Two tickets are parallel-safe iff their `files_touched` sets are disjoint AND neither depends on the other. The generator marks compatible sets in `_INDEX.md` so the orchestrator can pick without re-checking.

Edge cases:

- Both tickets touch `convex/schema.ts` — not parallel-safe; they must be serialized.
- Both tickets modify `packages/ui/src/tokens/` — not parallel-safe.
- Ticket A writes a new convex table, ticket B is UI that *reads* from that table — not parallel; serialize with A first.
- Ticket A is a new route, ticket B is a new unrelated route — parallel-safe if no shared `layout.tsx` changes.

## Failure modes the orchestrator must handle

- **Stop hook fails on an agent.** Orchestrator gets the failure, passes it back to the agent to fix. If still failing after 2 attempts, flag to Amit and pause.
- **Verification agent finds a HARD_RULES violation.** Reject the PR draft, pass the violation report to the build agent to fix.
- **Two agents' PRs have a semantic conflict even though files were disjoint** (e.g. both added a new export to a barrel file). Second merge fails; orchestrator asks Amit to rebase or reassigns.
- **Build agent hits an auth wall** (e.g. needs Vercel login). Agent pauses, emits a structured "needs auth" message; orchestrator surfaces to Amit.
