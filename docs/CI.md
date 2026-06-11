# Continuous integration

Source of truth: `.github/workflows/ci.yml` and `.github/workflows/security.yml`. Package manager is **Bun** (`packageManager: "bun@1.3.9"` in root `package.json`).

## Workflows

| Workflow | Trigger | Jobs |
|---|---|---|
| **CI** | PR to `master`, `workflow_dispatch` | typecheck, lint, test, scans |
| **Security** | PR to `master`, `workflow_dispatch` | Gitleaks + TruffleHog secret scan |

Default branch is **`master`**, not `main`.

## CI jobs (blocking vs notice-only)

| Job | Command | Blocks merge? | Notes |
|---|---|---|---|
| Typecheck | `bun run typecheck` | Yes | Turborepo across workspaces |
| Lint | `bun run lint` | Yes | Biome via Turborepo |
| Test | `bun run test` | No (`continue-on-error: true`) | Root script runs `bun test`; job still marked best-effort until coverage grows |
| Scans | conditional `bun run scan:*` | No | Emits `::notice::` when scripts are missing |

### Scan scripts (planned, not yet in `package.json`)

Referenced by `docs/HARD_RULES.md` but implemented as notice-only stubs in CI until Phase 3 lands:

- `scan:forbidden-tech`
- `scan:ram-only-audit`
- `scan:design-tokens`
- `convex:schema-guard` (target; not wired in CI yet)

When a script is added to `package.json`, CI automatically runs it and fails on non-zero exit.

## Security workflow

Runs on every PR:

- **Gitleaks** — pattern-based secret detection
- **TruffleHog** — verified-secret scan against the PR diff

There is no root `scan:secrets` npm script; secret scanning is handled by this workflow, not `bun run`.

## Local pre-PR checks

Mirror what CI runs before opening a PR:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun test
```

Optional (when scripts exist):

```bash
bun run scan:forbidden-tech
bun run scan:ram-only-audit
bun run scan:design-tokens
```

**Caveat:** `bun run check` runs Biome with `--write` in some workspaces. Use it only when you intend to auto-fix formatting; prefer `bun run lint` for verification-only runs. See `docs/AGENT_AUTOMATION_RUNBOOK.md`.

## Agent mode (cloud agents)

Cloud coding agents should set `CONVEX_AGENT_MODE=anonymous` so `bun x convex dev` does not attach to a human's personal dev deployment. See Convex agent-mode docs and `.cursor/rules/tempo-hard-rules.mdc`.

## Related

- [`docs/HARD_RULES.md`](./HARD_RULES.md) — §11 testing rules (target gates)
- [`docs/ENVIRONMENTS.md`](./ENVIRONMENTS.md) — four-mode env contract
- [`docs/AGENT_AUTOMATION_RUNBOOK.md`](./AGENT_AUTOMATION_RUNBOOK.md) — long-run agent batch checks
