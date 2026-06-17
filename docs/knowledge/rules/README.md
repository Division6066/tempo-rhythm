# Rules — Pointer

## Canonical sources (in precedence order)

1. **`docs/HARD_RULES.md`** — the one file that wins when anything conflicts. 17 sections, each flat and enforceable. Read before touching Convex, auth, payments, or AI.
2. **`.cursor/rules/*.mdc`** — Cursor-specific rule files that auto-attach to matching files or sessions. Each is a distillation of a HARD_RULES slice into what Cursor should do moment-to-moment.
3. **`docs/CURSOR_RULES.md`** — long-form rationale for the `.cursor/rules/` set.
4. **`docs/CURSOR_PROMPTS.md`** — reusable prompt snippets for common Cursor workflows.

## Tempo-specific Cursor rules (current set)

All live in `.cursor/rules/` and each one references HARD_RULES with `@docs/HARD_RULES.md` rather than copying content.

| Rule file | Attach mode | What it enforces |
|---|---|---|
| `tempo-hard-rules.mdc` | `alwaysApply: true` | The top-of-session primer: shame-proof, accept-reject, undo, forbidden tech. |
| `tempo-context.mdc` | `alwaysApply: true` | Product context, task sources, agent identities. |
| `tempo-git-workflow.mdc` | `alwaysApply: true` | Branch naming, PR workflow, owner-tag discipline. |
| `tempo-tickets.mdc` | `agentRequested` | How to read and execute atomic tickets. |
| `tempo-qa.mdc` | `agentRequested` | QA gate before marking work done. |
| `tempo-long-running.mdc` | `agentRequested` | Overnight / long cloud-agent sessions. |
| `session-start.mdc` | `agentRequested` | `/whats-next` session picker. |
| `task-complete.mdc` | `agentRequested` | Tick off tickets when work lands. |

## AI provider rule (HARD_RULES §2)

All LLM calls go through **`convex/lib/ai_router.ts`**, which uses native `fetch` against the Mistral API (`https://api.mistral.ai/v1/chat/completions`). Do **not** add direct provider SDKs (`openai`, `@anthropic-ai/*`, `@mistralai/mistralai`) or OpenRouter.

Runtime secret: `MISTRAL_API_KEY` in the Convex dashboard (see root `.env.example`).

## Precedence recap

```
HARD_RULES  >  .cursor/rules/  >  Ticket  >  PRD  >  Chat prompt  >  Skill default
```

A skill that recommends Firebase does not override HARD_RULES §2. Review third-party skill guidance against `docs/HARD_RULES.md` before applying it to Tempo code.
