# Continuous integration

GitHub Actions workflows under `.github/workflows/` gate every PR to `master`. Local equivalents use **Bun** (`packageManager: bun@1.3.9` in root `package.json`).

## Workflows

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| **CI** | `.github/workflows/ci.yml` | PR to `master`, manual | Typecheck, lint, tests, policy scans |
| **Security** | `.github/workflows/security.yml` | PR to `master`, manual | Secret scanning |

## CI jobs (blocking vs notice-only)

| Job | Command | Blocks merge? | Notes |
|---|---|---|---|
| **Typecheck** | `bun run typecheck` | **Yes** | Turborepo across workspaces; `convex/_generated/` is committed so CI does not need `CONVEX_DEPLOYMENT`. |
| **Lint** | `bun run lint` | **Yes** | Biome via Turborepo (`apps/web`, `apps/mobile`, packages). |
| **Test** | `bun run test` | No (`continue-on-error: true`) | Root script runs `bun test`. Job is best-effort until the suite is stable enough to block. |
| **Forbidden-tech scan** | `bun run scan:forbidden-tech` | No | Script not yet in `package.json`; workflow logs `::notice::` and succeeds. |
| **RAM-only audit** | `bun run scan:ram-only-audit` | No | Planned per HARD_RULES §6.4. |
| **Design-tokens scan** | `bun run scan:design-tokens` | No | Planned per HARD_RULES §7. |
| **Gitleaks** | gitleaks-action | **Yes** | `.github/workflows/security.yml` |
| **TruffleHog** | trufflesecurity/trufflehog | **Yes** | Verified secrets only (`--only-verified`). |

When a planned scan script lands in `package.json`, the CI job will run it and fail on non-zero exit. Until then, missing scripts are intentionally non-blocking.

## Local pre-PR checklist

Run from repo root after `bun install`:

```bash
bun run typecheck
bun run lint
bun run test
bun run build   # optional but recommended before large UI changes
```

Do **not** use `bun run check` as a read-only verification command on CI agents — some workspaces run `biome check --write`, which mutates files.

## Package manager

CI installs with `bun install --frozen-lockfile`. Do not add `pnpm-lock.yaml` or switch lockfiles without an explicit migration task.

## Related

- [`docs/HARD_RULES.md`](./HARD_RULES.md) — §11 testing rules, forbidden tech
- [`docs/AGENT_AUTOMATION_RUNBOOK.md`](./AGENT_AUTOMATION_RUNBOOK.md) — batch checks before long agent runs
- [`README.md`](../README.md) — quick start and linting
