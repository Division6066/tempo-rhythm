# Continuous Integration

GitHub Actions gates every pull request to `master`. Package manager is **Bun** (`bun@1.3.9` per root `package.json`; CI uses `oven-sh/setup-bun` with `latest`).

Source of truth: `.github/workflows/ci.yml` and `.github/workflows/security.yml`.

---

## Workflows

| Workflow | Trigger | Jobs |
|---|---|---|
| **CI** (`.github/workflows/ci.yml`) | PR to `master`, `workflow_dispatch` | typecheck, lint, test, scans |
| **Security** (`.github/workflows/security.yml`) | PR to `master`, `workflow_dispatch` | Gitleaks + TruffleHog secret scan |
| **Dependabot** (`.github/dependabot.yml`) | Weekly | npm workspaces + GitHub Actions |

Concurrency: one run per ref; newer pushes cancel in-progress runs.

---

## CI jobs (blocking)

### Typecheck

```bash
bun install --frozen-lockfile
bun run typecheck
```

Runs Turborepo `typecheck` across all workspaces.

### Lint

```bash
bun install --frozen-lockfile
bun run lint
```

Runs Biome via Turborepo `lint` in each workspace.

### Test

```bash
bun install --frozen-lockfile
bun run test   # root script: bun test
```

**Current status:** the test job uses `continue-on-error: true` while the suite grows. Treat a green test job as best-effort until that flag is removed.

### Scans (notice-only until scripts land)

The scan job checks whether these root scripts exist in `package.json`. If missing, it logs a GitHub notice and succeeds:

| Script | Purpose | Status |
|---|---|---|
| `scan:forbidden-tech` | Block forbidden dependencies | Not implemented |
| `scan:ram-only-audit` | RAM-only scanner rule | Not implemented |
| `scan:design-tokens` | Design-token enforcement | Not implemented |

When a script is added, CI will run it and fail on non-zero exit.

---

## Security workflow (blocking)

Runs on every PR to `master`:

- **Gitleaks** — pattern-based secret detection (`gitleaks/gitleaks-action@v2`)
- **TruffleHog** — verified-secret scan against the default branch diff

There is no `pnpm scan:secrets` or `bun run scan:secrets` script; secret scanning is workflow-based.

---

## Local pre-PR checks

Mirror CI locally from the repo root:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test
bun run build    # optional but recommended before large UI changes
```

**Caution:** `bun run check` runs Biome with `--write` in some workspaces and can mutate files. Use `bun run lint` for verification-only runs. See `docs/AGENT_AUTOMATION_RUNBOOK.md`.

---

## Target gates (not yet enforced)

`docs/HARD_RULES.md` §11 lists additional gates planned for Phase 3:

- `convex:schema-guard` — Convex schema validation script (not in `package.json` yet)
- Forbidden-tech, RAM-only, and design-token scans (stubbed in CI today)

When these scripts land, update this doc and remove the notice-only behavior in `ci.yml`.

---

## Related

- [docs/HARD_RULES.md](./HARD_RULES.md) — §11 testing rules, §12 git/PR rules
- [docs/AGENT_AUTOMATION_RUNBOOK.md](./AGENT_AUTOMATION_RUNBOOK.md) — agent batch checks before long runs
- [docs/SHIP_STATE.md](./SHIP_STATE.md) — which CI features are shipped vs planned
- `.cursor/rules/tempo-qa.mdc` — QA gate checklist for agents
