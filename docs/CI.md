# Continuous integration

GitHub Actions run on every pull request targeting `master` and on manual `workflow_dispatch`.

**Package manager:** Bun (`bun@1.3.9` in root `package.json`). CI installs with `bun install --frozen-lockfile`.

## Workflows

| Workflow | File | Trigger |
|---|---|---|
| CI | `.github/workflows/ci.yml` | PR → `master`, manual |
| Security | `.github/workflows/security.yml` | PR → `master`, manual |

## CI jobs (`.github/workflows/ci.yml`)

| Job | Blocking? | Command | Notes |
|---|---|---|---|
| **Typecheck** | Yes | `bun run typecheck` | Turborepo across workspaces |
| **Lint** | Yes | `bun run lint` | Biome via Turborepo |
| **Test** | No (`continue-on-error: true`) | `bun run test` when script exists | Root `test` script exists; job stays best-effort until coverage stabilizes |
| **Scans** | Notice-only for missing scripts | `scan:forbidden-tech`, `scan:ram-only-audit`, `scan:design-tokens` | Each script is run only if present in root `package.json`; missing scripts log a notice and succeed |

### Scan scripts (planned)

`docs/HARD_RULES.md` references these guard scripts. They are **not all implemented** in `package.json` yet. When a script lands, the CI scan job will start failing on violations automatically.

| Script | Purpose |
|---|---|
| `scan:forbidden-tech` | Block Firebase, Supabase, ORMs, Clerk, direct AI SDKs, etc. |
| `scan:ram-only-audit` | Ensure scanner entry points never persist raw third-party content |
| `scan:design-tokens` | Fail on arbitrary hex / off-token styling in UI |
| `convex:schema-guard` | Schema shape checks (referenced in HARD_RULES; add to CI when implemented) |

## Security jobs (`.github/workflows/security.yml`)

| Job | Blocking? | Tool |
|---|---|---|
| **Secret scan** | Yes | Gitleaks + TruffleHog (`--only-verified`) |

Never merge a PR where secret scanning reports verified leaks.

## Local pre-PR checklist

Run the same commands agents use in `docs/AGENT_AUTOMATION_RUNBOOK.md`:

```bash
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun test
bun run build
```

Avoid `bun run check` as a read-only verification command on some workspaces — mobile's `check` script runs Biome with `--write` and may mutate files.

## Branch protection

- Default branch: **`master`** (not `main`).
- All changes land through PR; agents never self-merge.
- See `docs/HARD_RULES.md` §12 and `.cursor/rules/tempo-git-workflow.mdc`.

## Related docs

- [`docs/HARD_RULES.md`](./HARD_RULES.md) — full non-negotiables
- [`docs/AGENT_AUTOMATION_RUNBOOK.md`](./AGENT_AUTOMATION_RUNBOOK.md) — cloud-agent preflight
- [`docs/ENVIRONMENTS.md`](./ENVIRONMENTS.md) — dev / test / preview / deployment
