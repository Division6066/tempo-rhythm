# HARNESS

Canonical factory harness for Division6066 product and template repos.
Agents read this before opening a ticket or a PR. Product-local copies may
add a **Last synced** footer; do not fork the rules.

## Agent roles

| Role | Does | Does not |
|------|------|----------|
| **Scout** | Lists open issues, checks the seven fields, proposes the next safe batch | Merge, flip `agent:ready`, invent tickets |
| **Builder** | Implements one ticket on a branch, opens a **draft** PR | Merge, touch Secrets/ENV dashboards, invent UA graphs |
| **Janitor** | Labels, comments, closes/rewrites noise, keeps wiki mirrors tidy | Ship product code, apply `agent:ready` |
| **Checker** | PREFLIGHT line on the PR (checks, file count, secret-scan), stop-code honesty | Merge, rewrite the Builder's diff |

Roster mapping (Week-0): Scout · Janitor · Checker on Grok; Builder on Claude Code / Cursor Cloud. Nobody gets Full admin for routine work.

## Ticket format (GOAL first)

Issue body uses the seven fields **in this order**. Header metadata
(`product` · `lane` · `executor` · `stage` · `version`) may sit above GOAL.

1. **GOAL** — one outcome sentence
2. **CONTEXT** — point at `docs/TEMPLATE_STATE.md` and the live Graphify
   path recorded there (never invent Understand Anything / `.ua/` graphs)
3. **ACCEPTANCE** — observable done criteria
4. **CONSTRAINTS** — draft PR only; MIT; no secrets; never `agent:ready` here
5. **BUDGET** — `budget: $N`
6. **STOP** — one of `BLOCKED_DEPENDENCY` · `BLOCKED_PATH_DRIFT` ·
   `BLOCKED_VERIFICATION` · `needs-amit` (or empty if none)
7. **EVIDENCE** — PR URL · CI names+states · files touched · secret-scan

Also include a **MODEL** line for product-code tickets (mid-tier only):

```
MODEL: GPT 5.6 Terra | GLM 5.3 Flash | DeepSeek V4.1 Flash | Claude Sonnet 5 | Grok 4.5 | Grok 4.6
```

Never pin Fable / Astra / Opus / Soul. Haiku / Luna stay unused.

## Stop codes

| Code | Meaning |
|------|---------|
| `BLOCKED_DEPENDENCY` | Missing key, tool, or SET env name |
| `BLOCKED_PATH_DRIFT` | Tree no longer matches TEMPLATE_STATE / ticket CONTEXT |
| `BLOCKED_VERIFICATION` | Stop-ticket or verifier failed; do not greenwash |
| `needs-amit` | Product / identity / money / legal decision |

On stop: leave the issue labeled honestly, continue with independent work,
and report the stop in the daily 10:00 / 18:00 note.

## Graphify on merge

After any merge that changes source layout:

1. From repo root: `graphify update . --no-cluster` (`graphifyy` 0.9.40+)
2. Path-sanitize and write the durable snapshot under `docs/graphs/`
3. Update counts in `docs/TEMPLATE_STATE.md`
4. Run Understand Anything `/understand` **only** when the plugin can produce
   a real `.ua/knowledge-graph.json` — never invent UA semantics
5. Open a **draft** follow-up PR; a human merges

## Hard rules (short)

- **Draft PRs only.** Agents never merge.
- **Never apply `agent:ready`.** Amit (or an explicit Gate 1 routine he
  owns) flips that label.
- **No secrets in chat, issues, PRs, graphs, or wiki mirrors.** Names only.
- **No Secrets / ENV / Convex / Vercel dashboard mutations** from docs or
  harness work.
- **No Bolt prototypes as product code.** Bolt shells are reference specs
  only; graft via an explicit ticket.
- MIT. Prefer mid-tier models for product code.

## Related docs

- `docs/TECH_STACK.md` — honest current stack
- `docs/HOW_TO_ADD_A_FEATURE.md` — operator checklist
- `docs/TEMPLATE_STATE.md` — Graphify / UA truth + layout

Last synced: 2026-09-17 (tempo-rhythm copy; canonical authored on monorepo-template)
