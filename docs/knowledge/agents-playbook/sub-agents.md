# Tempo sub-agents — roles and invocation

**Sub-agents** are scoped, single-purpose agents invoked by the main Cursor agent or the orchestrator during a feature build. They do verification, not implementation. Each lives at `.cursor/agents/<name>/` (scaffolded in Phase 3).

## Roster

| Name | Readonly | Trigger | Job |
|---|---|---|---|
| `tempo-schema-checker` | yes | after any diff touching `convex/**/*.ts` | Confirms schema rules: `userId` optional, soft delete, indexes, no per-user tables, generic shape. |
| `tempo-design-token-validator` | yes | after any diff touching `packages/ui/**` or `apps/web/app/globals.css` or `apps/*/src/**/*.tsx` | Fails on arbitrary hex values, missing tokens, inconsistent spacing, forbidden Tailwind patterns. |
| `tempo-accept-reject-checker` | yes | after any diff that mentions `action`, `mutation`, AI calls, or `convex/proposals.ts` | Confirms no AI-originating mutation bypasses the proposals flow. |
| `tempo-hard-rules-auditor` | yes | on every PR | Runs through all 17 HARD_RULES sections against the diff. Produces a report. |
| `tempo-brand-validator` | yes | on diffs touching UI copy or components | Checks copy against `docs/brain/brand/voice.md` pattern library. Flags violations and proposes on-brand replacements. |
| `tempo-test-runner` | **no** | after build completes | Runs `pnpm typecheck`, `pnpm test`, `pnpm scan:forbidden-tech`, `pnpm scan:ram-only-audit`, `pnpm scan:design-tokens`. Reports pass/fail per suite. |

## How the orchestrator uses them

```
Build agent completes
    ↓
Stop hook runs tsc + lint
    ↓
Orchestrator invokes (in parallel):
    • tempo-hard-rules-auditor
    • tempo-schema-checker (if convex changed)
    • tempo-design-token-validator (if UI changed)
    • tempo-accept-reject-checker (if actions/mutations changed)
    • tempo-brand-validator (if UI copy changed)
    ↓
Orchestrator invokes tempo-test-runner
    ↓
If all green → build agent opens the PR
If any red  → build agent gets the report and iterates
```

## Sub-agent authoring rules

- **One file of context, one job.** Each sub-agent's prompt is under 200 lines, focused on its one domain.
- **Readonly unless test-runner.** Verification agents must never write code. If they would need to write, that is the build agent's job; surface the fix plan instead.
- **Output format is structured.** Each sub-agent returns either `PASS` with a one-line summary, or `FAIL` with a list of `{file, line, rule, suggested_fix}` objects.
- **No auto-merge.** A PASS from every sub-agent does not mean merge. Amit still reviews.

## How to add a new sub-agent

1. Pick a rule or HARD_RULES section that is currently enforced only by a human reviewer.
2. Author the sub-agent file at `.cursor/agents/<name>/instructions.md` using the `skill-creator` and `mcp-builder` patterns as guides.
3. Register it in `.cursor/hooks.json` under the appropriate hook (typically `stop` for post-completion verification).
4. Update this file with the new entry.
5. PR the change with a test case that proves the sub-agent catches a real violation.
