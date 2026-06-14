# Continuous integration

GitHub Actions workflows under `.github/workflows/` gate every pull request to `master`. Package manager for all jobs is **Bun** (`bun@1.3.9` in root `package.json`; `bun.lock` is committed).

## Workflows

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| **CI** | `.github/workflows/ci.yml` | PR to `master`, `workflow_dispatch` | Typecheck, lint, tests, policy scans |
| **Security** | `.github/workflows/security.yml` | PR to `master`, `workflow_dispatch` | Secret scanning (Gitleaks + TruffleHog) |

Concurrency: one run per ref; newer pushes cancel in-progress runs on the same branch.

## CI jobs (blocking)

These jobs **must pass** before merge:

| Job | Command | Notes |
|---|---|---|
| **Typecheck** | `bun install --frozen-lockfile` then `bun run typecheck` | Turborepo across workspaces |
| **Lint** | `bun install --frozen-lockfile` then `bun run lint` | Biome via Turborepo |

## CI jobs (non-blocking today)

| Job | Command | Current behavior |
|---|---|---|
| **Test** | `bun run test` | `continue-on-error: true`. Root script runs `bun test`. Job succeeds even when tests fail until this flag is removed. |
| **Scans** | `scan:forbidden-tech`, `scan:ram-only-audit`, `scan:design-tokens` | Each script is run only if present in root `package.json`. Missing scripts log a `::notice::` and succeed. |

Target state (HARD_RULES §11): all scan scripts implemented and blocking. Track in `docs/TASKS.md` (T-0020).

## Security job (blocking)

| Step | Tool | Notes |
|---|---|---|
| Secret scan | Gitleaks | `gitleaks/gitleaks-action@v2` |
| Secret scan | TruffleHog | Verified secrets only (`--only-verified`) |

There is no root `scan:secrets` npm script; secret scanning lives in the **Security** workflow, not the CI scan job.

## Local pre-PR checklist

Match what agents run in `docs/AGENT_AUTOMATION_RUNBOOK.md`:

```bash
bun install --frozen-lockfile
bun run lint
bun test
bun run typecheck
bun run build
```

Avoid `bun run check` for verification-only passes: some workspaces run `biome check --write`, which mutates files.

## Related

- [`docs/HARD_RULES.md`](./HARD_RULES.md) — §11 testing, §12 git/PR rules
- [`docs/AGENT_AUTOMATION_RUNBOOK.md`](./AGENT_AUTOMATION_RUNBOOK.md) — agent batch checks before long runs
- [`docs/SHIP_STATE.md`](./SHIP_STATE.md) — what is actually shipped vs planned in CI
