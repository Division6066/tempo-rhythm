# Continuous integration

GitHub Actions workflows live under `.github/workflows/`. All jobs use **Bun** (`bun install --frozen-lockfile`, `bun run …`) per root `package.json` (`packageManager: "bun@1.3.9"`).

## Workflows

| Workflow | File | Triggers | Purpose |
|---|---|---|---|
| **CI** | `.github/workflows/ci.yml` | PR → `master`, `workflow_dispatch` | Typecheck, lint, tests, policy scans |
| **Security** | `.github/workflows/security.yml` | PR → `master`, `workflow_dispatch` | Secret scanning (Gitleaks + TruffleHog) |

Default branch is **`master`** (not `main`). Branch protection requires PRs to pass CI before merge.

## CI jobs (blocking)

These jobs **must pass** on every PR:

| Job | Command | Notes |
|---|---|---|
| **Typecheck** | `bun run typecheck` | Turborepo across `apps/*` and `packages/*` |
| **Lint** | `bun run lint` | Biome via Turborepo |
| **Secret scan** | Gitleaks + TruffleHog | Security workflow; verified secrets fail the build |

## CI jobs (non-blocking today)

| Job | Command | Status |
|---|---|---|
| **Test** | `bun run test` | `continue-on-error: true` — root `test` script exists (`bun test`) but CI tolerates failures until the suite is stable |

## Scan jobs (notice-only until scripts land)

The **Scans** job in `ci.yml` checks whether these scripts exist in root `package.json`. If missing, it logs a GitHub notice and succeeds. When a script is added, CI runs it and fails on non-zero exit.

| Script | HARD_RULES | Purpose |
|---|---|---|
| `scan:forbidden-tech` | §2 | Block forbidden dependencies (Firebase, Prisma, Clerk, etc.) |
| `scan:ram-only-audit` | §6.4 | Ensure scanner actions never persist raw third-party content |
| `scan:design-tokens` | §7 | Block arbitrary hex colors in new UI |

Secret scanning is covered by the separate Security workflow (Gitleaks / TruffleHog), not the Scans job.

## Local pre-PR checklist

Run the same commands CI uses before opening a PR:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test
```

Optional (when scripts exist):

```bash
bun run scan:forbidden-tech
bun run scan:ram-only-audit
bun run scan:design-tokens
```

**Avoid** `bun run check` as a read-only verification step on mobile — some workspaces run `biome check --write`, which mutates files.

## Convex in CI

Convex functions are typechecked as part of the monorepo `typecheck` task. There is no separate `convex deploy` step in CI today; preview/production deploys happen via Vercel + Convex dashboard keys (see `docs/ENVIRONMENTS.md`).

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Typecheck fails only in CI | Lockfile drift | Run `bun install` locally, commit `bun.lock` |
| Lint fails on Tailwind class order | Biome does not sort Tailwind classes (intentional) | Fix real Biome errors; ignore cross-app sort conflicts |
| Scans job passes but HARD_RULES says scan required | Script not implemented yet | Notice-only until `package.json` gains the script |
| Secret scan fails | Real or test credential in diff | Remove secret, rotate if it was ever real, use env vars |

## Related

- `docs/HARD_RULES.md` §11 (testing) and §12 (git + PR)
- `docs/AGENT_AUTOMATION_RUNBOOK.md` — pre-flight batch checks for long agent runs
