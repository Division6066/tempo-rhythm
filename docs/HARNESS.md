# Harness — factory verify

How a coding agent proves a change without leaking secrets, inventing graphs,
or shipping product by accident. Pair with [`CI.md`](./CI.md),
[`TECH_STACK.md`](./TECH_STACK.md), and [`HOW_TO_ADD_A_FEATURE.md`](./HOW_TO_ADD_A_FEATURE.md).

`tempo-rhythm` documentation is **`docs/` only** (this tree plus
[`docs/wiki/`](./wiki/)). There is no GitHub Wiki tab to update.

---

## What this harness is

| Layer | Purpose |
|---|---|
| Local commands | Same checks CI will run |
| Graphify | AST ground truth (`graphifyy`, no LLM, no key) |
| Understand Anything | Semantic dashboard graph — **optional, plugin-written** |
| CI | Typecheck, lint, test, policy scans, notices, Playwright, secret scan |
| Draft PR | Human review surface. Agents stop here. |

This file does **not** authorize product feature code, dashboard clicks,
deploys, or env-value edits.

---

## Factory coding-agent MODEL allowlist (mid-tier only)

Who **writes the repo** (Cursor Cloud / Composer / similar). Separate from
product inference (Mistral via `convex/lib/ai_router.ts`).

**Allowed**

- GPT 5.6 Terra
- GLM 5.3 Flash
- DeepSeek V4.1 Flash
- Claude Sonnet 5
- Grok 4.5 / Grok 4.6

**Never**

- Fable
- Astra
- Opus
- Soul

If the session is on a forbidden model, stop and say so. Do not "just this
once."

---

## Hard constraints (every factory pass)

- **No secrets / ENV values.** Do not print, commit, or paste tokens, cookies,
  deploy keys, or `.env*` contents. Point at [`ENVIRONMENTS.md`](./ENVIRONMENTS.md)
  for names and modes only.
- **Never `agent:ready`.** Do not add that label to issues or PRs. Do not close
  issues as a side effect of a docs or verify pass.
- **No product feature code** in a factory-docs PR. Schema, routes, and UI stay
  untouched unless the ticket is a product ticket.
- **Draft PR only** unless Amit explicitly asks otherwise. Do not merge.
- **Bolt shells are reference specs only.** Do not treat bolt.new / bolt.diy
  (or Lovable / v0 / Replit starters) as the app.
- **Do not invent `.ua/`.** Understand Anything writes
  `.ua/knowledge-graph.json` via the Cursor plugin. If it is absent, record
  "not generated" in [`TEMPLATE_STATE.md`](./TEMPLATE_STATE.md).

---

## Local verify (docs or code)

From repo root:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test
bun run scan:forbidden-tech
bun run scan:ram-only-audit
bun run scan:design-tokens
bun run check:notices
```

Avoid `bun run check` as a read-only step — mobile/web `check` scripts may
`--write`.

Docs-only PRs still run the scans they can (forbidden-tech / notices) so a
doc does not reintroduce a forbidden product name as a "use this" dependency.

Web smoke (dev server already up, no secrets in the log):

```bash
bash ./scripts/smoke-local-web.sh
```

See [`CURSOR_BROWSER_SMOKE.md`](./CURSOR_BROWSER_SMOKE.md). A single screenshot
is not verification for a UI change.

---

## Graphify (already part of W0)

```bash
pip install 'graphifyy==0.9.40'   # double-y; `graphify` is the wrong package
graphify update . --no-cluster
graphify query "how does auth work"
graphify affected "<symbol>" --depth 2
```

- Live graph: `graphify-out/graph.json` (gitignored).
- Committed snapshot: `docs/graphs/tempo-rhythm.json`.
- Registry: [`TEMPLATE_STATE.md`](./TEMPLATE_STATE.md).
- `graphify hook install` is **not** enabled (parallel agents).

After a merge that changes source layout, rebuild, strip absolute machine
paths, update the registry table, and open a **draft** PR. Do not fabricate
Understand Anything output.

---

## CI mapping

| Job | Command / workflow | Blocks merge? |
|---|---|---|
| Typecheck | `bun run typecheck` | yes |
| Lint | `bun run lint` | yes |
| Test | `bun run test` | yes |
| Scans | forbidden-tech, ram-only, design-tokens | yes |
| Notices | `bun run check:notices` | yes |
| E2E | Playwright Chromium | yes |
| Secret scan | Gitleaks + TruffleHog (`.github/workflows/security.yml`) | yes |

Agents open PRs against **`integration`**. Amit promotes `integration` →
`master`. See [`merge-runbook.md`](./merge-runbook.md).

---

## Exit report (agent)

When the factory pass is done, report:

- Branch name
- PR number (draft)
- Files changed
- Anything refused, and why
- Anything the graph contradicted
- Graphify: generated / skipped (counts if generated)
- Understand Anything: **not generated** unless the plugin actually wrote `.ua/`

Do not claim `ready`, `done`, or `shipped` unless [`SHIP_STATE.md`](./SHIP_STATE.md)
says `shipped-and-running` and production matches.
