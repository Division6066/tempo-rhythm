# Rules — Pointer

## Canonical sources (in precedence order)

1. **`docs/HARD_RULES.md`** — the one file that wins when anything conflicts. 17 sections, each flat and enforceable. Read before touching Convex, auth, payments, or AI.
2. **`.cursor/rules/*.mdc`** — Cursor-specific rule files that auto-attach to matching files or sessions. Each is a distillation of a HARD_RULES slice into what Cursor should do moment-to-moment.
3. **`docs/CURSOR_RULES.md`** — long-form rationale for the `.cursor/rules/` set.
4. **`docs/CURSOR_PROMPTS.md`** — reusable prompt snippets for common Cursor workflows.

## Tempo-specific Cursor rules (scaffolded in Phase 3)

All live in `.cursor/rules/` and each one references HARD_RULES with `@docs/HARD_RULES.md` rather than copying content.

| Rule file | Attach mode | What it enforces |
|---|---|---|
| `tempo-hard-rules.mdc` | `alwaysApply: true` | Top-of-session primer: shame-proof, accept-reject, undo, forbidden tech, Mistral via `convex/lib/ai_router.ts`. |
| `tempo-context.mdc` | `alwaysApply: true` | Repo layout, phase PRD pointer, owner tags. |
| `tempo-git-workflow.mdc` | `alwaysApply: true` | Branch naming, PR rules, never push to `master`. |
| `tempo-tickets.mdc` | `agentRequested` | How to read and execute atomic tickets. |
| `tempo-qa.mdc` | `agentRequested` | QA gate before marking work done. |
| `tempo-long-running.mdc` | `agentRequested` | Overnight / 8-hour cloud agent playbook. |
| `session-start.mdc` / `task-complete.mdc` | `agentRequested` | `/whats-next` and ticket status updates. |

## Precedence recap

```
HARD_RULES  >  .cursor/rules/  >  Ticket  >  PRD  >  Chat prompt  >  Skill default
```

A skill that recommends Firebase does not override HARD_RULES §2. The `tempo-skills.mdc` rule enumerates which skills are green-listed for Tempo; anything not green-listed is either red-listed or neutral (use with judgment).
