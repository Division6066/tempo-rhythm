# Continuous Integration

GitHub Actions workflows under `.github/workflows/` run on every pull request targeting `master` and on manual `workflow_dispatch`.

**Package manager:** Bun (`bun@1.3.9` in root `package.json`; `bun.lock` is committed). All CI steps use `bun install --frozen-lockfile` and `bun run <script>`.

---

## Workflows

| Workflow | File | Trigger |
|---|---|---|
| CI | `.github/workflows/ci.yml` | PR → `master`, manual |
| Security | `.github/workflows/security.yml` | PR → `master`, manual |

---

## CI jobs (`.github/workflows/ci.yml`)

| Job | Blocking? | What it runs |
|---|---|---|
| **Typecheck** | Yes | `bun run typecheck` (Turbo across workspaces) |
| **Lint** | Yes | `bun run lint` (Biome per package) |
| **Test** | No (`continue-on-error: true`) | `bun run test` when the root `test` script exists; otherwise logs a notice and succeeds |
| **Scans** | No (notice-only until scripts land) | `scan:forbidden-tech`, `scan:ram-only-audit`, `scan:design-tokens` — each runs only if defined in root `package.json`; missing scripts log `::notice::` and succeed |

### Scan job behavior

The scan job is intentionally non-blocking while Phase 3 tooling is still landing. When a script is present in `package.json`, the job runs it and **fails on non-zero exit**. When absent, it prints a GitHub notice and continues.

Planned scripts (referenced in `docs/HARD_RULES.md` §11):

- `scan:forbidden-tech` — forbidden dependency / import guard
- `scan:ram-only-audit` — scanner functions must not persist raw content
- `scan:design-tokens` — no arbitrary hex in UI
- `convex:schema-guard` — schema invariant checks (not yet wired in CI)

---

## Security jobs (`.github/workflows/security.yml`)

| Job | Blocking? | What it runs |
|---|---|---|
| **Secret scan** | Yes | Gitleaks + TruffleHog (`--only-verified`) on the PR diff |

Never merge a PR where secret scanning fires. Rotate any exposed credential immediately.

---

## Local pre-PR checklist

Run the same blocking checks locally before opening a PR:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test          # when implemented
```

**Avoid** `bun run check` as a verification-only command until the repo fixes that script — on some workspaces it runs `biome check --write` and may mutate files.

See also `docs/AGENT_AUTOMATION_RUNBOOK.md` for agent batch-check guidance.

---

## Related

- [`docs/HARD_RULES.md`](./HARD_RULES.md) — §11 testing rules, §12 git/PR rules
- [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) — source of truth for job definitions
- [`.github/workflows/security.yml`](../.github/workflows/security.yml) — secret scanning
