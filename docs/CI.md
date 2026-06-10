# Continuous integration

This document describes what GitHub Actions actually runs today. When this file disagrees with `docs/HARD_RULES.md` §11 on *intent*, trust the workflow YAML; when a script is missing from `package.json`, the workflow logs a notice and succeeds until Phase 3 lands the script.

**Package manager:** Bun (`packageManager: bun@1.3.9` in root `package.json`, lockfile `bun.lock`).

---

## Workflows

| Workflow | File | Trigger | Blocking? |
|---|---|---|---|
| CI | `.github/workflows/ci.yml` | PR to `master`, `workflow_dispatch` | typecheck + lint yes; test + scans best-effort |
| Security | `.github/workflows/security.yml` | PR to `master`, `workflow_dispatch` | yes (Gitleaks + TruffleHog) |

Concurrency: one run per ref; newer pushes cancel in-progress jobs.

---

## CI job matrix

### Typecheck (blocking)

```bash
bun install --frozen-lockfile
bun run typecheck
```

Runs Turborepo `typecheck` across workspaces (`apps/web`, `apps/mobile`, `packages/*`, `convex/`).

### Lint (blocking)

```bash
bun install --frozen-lockfile
bun run lint
```

Biome lint via Turborepo. See `README.md` → Linting for per-app config.

### Test (non-blocking today)

```bash
bun run test   # when root package.json defines "test"
```

The job uses `continue-on-error: true`. Root `package.json` defines `"test": "bun test"`, so tests run but failures do not block merge until the `continue-on-error` flag is removed.

### Scans (notice-only until scripts land)

Each scan checks whether the script exists in root `package.json`. If missing, CI logs `::notice::… not yet implemented` and succeeds.

| Script | HARD_RULES ref | Status |
|---|---|---|
| `scan:forbidden-tech` | §2 forbidden tech | not in `package.json` |
| `scan:ram-only-audit` | §5 RAM-only scanners | not in `package.json` |
| `scan:design-tokens` | §7 design tokens | not in `package.json` |
| `convex:schema-guard` | §4 schema | not in `package.json` |

When a script is added, CI will run it and fail on non-zero exit.

---

## Security workflow

Runs on every PR to `master`:

1. **Gitleaks** (`gitleaks/gitleaks-action@v2`) — secret patterns in diff.
2. **TruffleHog** (`trufflesecurity/trufflehog@main`, `--only-verified`) — verified secrets vs default branch.

Neither step uses Bun; they scan the git tree directly.

---

## Local pre-PR checklist

Match what agents run in `docs/AGENT_AUTOMATION_RUNBOOK.md`:

```bash
bun install --frozen-lockfile
bun run lint
bun test
bun run typecheck
bun run build
```

Avoid `bun run check` as a read-only verification command — the mobile workspace runs `biome check --write`, which can mutate files.

---

## Target state (HARD_RULES §11)

When Phase 3 scan scripts land, CI should block on:

- `bun run lint`
- `bun run typecheck`
- `bun test`
- `bun run scan:forbidden-tech`
- `bun run convex:schema-guard`
- `bun run scan:ram-only-audit`
- `bun run scan:design-tokens`

Secret scanning is already blocking via `.github/workflows/security.yml` (not a Bun script).

---

## Related

- [`docs/HARD_RULES.md`](./HARD_RULES.md) — §11 testing, §2 forbidden tech
- [`docs/AGENT_AUTOMATION_RUNBOOK.md`](./AGENT_AUTOMATION_RUNBOOK.md) — agent batch checks
- [`docs/SHIP_STATE.md`](./SHIP_STATE.md) — shipped vs planned verification ladder
