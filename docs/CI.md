# Continuous integration

GitHub Actions workflows under `.github/workflows/` gate every PR to `master`.

## Workflows

| Workflow | File | Triggers | Purpose |
|---|---|---|---|
| **CI** | `ci.yml` | PR to `master`, manual | Typecheck, lint, test, policy scans |
| **Security** | `security.yml` | PR to `master`, manual | Secret scanning (Gitleaks + TruffleHog) |

All jobs use **Bun** (`packageManager: bun@1.3.9` in root `package.json`). Install step: `bun install --frozen-lockfile`.

## CI jobs (`ci.yml`)

| Job | Blocks merge? | Command | Notes |
|---|---|---|---|
| **Typecheck** | Yes | `bun run typecheck` | Turborepo across workspaces |
| **Lint** | Yes | `bun run lint` | Biome via Turborepo |
| **Test** | No (`continue-on-error: true`) | `bun run test` | Root `test` script exists; job stays best-effort until Phase 3 tightens gates |
| **Scans** | No (notice-only) | `scan:*` when scripts exist | See below |

### Scan job (notice-only today)

The **Scans** job probes for these root `package.json` scripts. If a script is missing, CI logs a GitHub notice and succeeds. When a script lands, the job runs it and fails on non-zero exit.

| Script | HARD_RULES | Status |
|---|---|---|
| `scan:forbidden-tech` | §2 forbidden dependencies | Not yet in `package.json` |
| `scan:ram-only-audit` | §6.4 RAM-only scanners | Not yet in `package.json` |
| `scan:design-tokens` | Design token enforcement | Not yet in `package.json` |
| `convex:schema-guard` | Schema invariants | Not yet in `package.json` |

Local pre-PR checks (from `docs/AGENT_AUTOMATION_RUNBOOK.md`):

```bash
bun install --frozen-lockfile
bun run lint
bun test
bun run typecheck
bun run build
```

Avoid `bun run check` for verification-only runs — some workspaces run Biome with `--write`, which can mutate files.

## Security job (`security.yml`)

| Step | Tool | Blocks merge? |
|---|---|---|
| Secret scan | Gitleaks | Yes (on verified findings) |
| Secret scan | TruffleHog (`--only-verified`) | Yes (on verified findings) |

This replaces the historical `pnpm scan:secrets` reference. There is no local npm script equivalent; rely on the Security workflow on PRs.

## Dependabot

`.github/dependabot.yml` opens grouped dependency PRs for the Bun workspace. Review YELLOW-tier automation policy in `docs/AGENT_AUTOMATION_RUNBOOK.md` before merging bulk updates.

## Related docs

- [`docs/HARD_RULES.md`](./HARD_RULES.md) §11–§12 — testing and git rules
- [`docs/AGENT_AUTOMATION_RUNBOOK.md`](./AGENT_AUTOMATION_RUNBOOK.md) — pre-flight batch checks, CI fix agent
- `.cursor/agents/tempo-ci-fix-agent.md` — automated investigation when checks fail
