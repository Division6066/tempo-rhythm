# CI and security workflows

GitHub Actions run on every pull request targeting `master` and on manual `workflow_dispatch`. Package manager is **Bun** (`bun@1.3.9` in root `package.json`; `bun.lock` is committed).

## Workflows

| Workflow | File | Blocking? | What it runs |
|---|---|---|---|
| **CI** | `.github/workflows/ci.yml` | Partial | `typecheck`, `lint`, `test` (best-effort), policy scans |
| **Security** | `.github/workflows/security.yml` | Yes | Gitleaks + TruffleHog secret scans |

## CI jobs (`.github/workflows/ci.yml`)

### Typecheck — blocking

```bash
bun install --frozen-lockfile
bun run typecheck
```

Runs Turborepo `typecheck` across workspaces (`apps/web`, `apps/mobile`, `packages/*`, `convex/`).

### Lint — blocking

```bash
bun install --frozen-lockfile
bun run lint
```

Runs Biome lint per workspace.

### Test — non-blocking (for now)

`continue-on-error: true`. When root `package.json` defines a `test` script, CI runs `bun run test`. Until then it logs a notice and succeeds.

Local equivalent:

```bash
bun test
```

### Scans — notice-only until scripts land

The **scan** job checks whether these root scripts exist before running them:

| Script | HARD_RULES ref | Status |
|---|---|---|
| `scan:forbidden-tech` | §2 | Not in `package.json` yet — notice only |
| `scan:ram-only-audit` | §5 scanners | Not in `package.json` yet — notice only |
| `scan:design-tokens` | §7 | Not in `package.json` yet — notice only |

When a script is missing, CI emits `::notice::` and succeeds. When present, a non-zero exit fails the job.

**Planned but not wired in CI yet:** `convex:schema-guard`, `scan:secrets` (secret scanning is covered by the Security workflow instead).

## Security workflow (`.github/workflows/security.yml`)

Runs on the same PR triggers as CI:

- **Gitleaks** — pattern-based secret detection across the full git history (`fetch-depth: 0`).
- **TruffleHog** — verified-secret scan against the PR diff (`--only-verified`).

Both must pass before merge when branch protection requires the Security check.

## Local pre-PR checklist

Match what CI enforces today:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun test          # when tests exist for your change
bun run build     # optional but recommended before large UI changes
```

Do **not** rely on `bun run check` as a read-only gate — in some workspaces it runs Biome with `--write` and may mutate files.

## Branch and concurrency

- Base branch: **`master`** (not `main`).
- Concurrency: one run per ref; newer pushes cancel in-progress runs on the same PR.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `bun install --frozen-lockfile` fails | `bun.lock` out of date | Run `bun install` locally and commit the lockfile |
| Typecheck passes locally, fails in CI | Different Node/Bun version | CI uses Node 24 + latest Bun from `oven-sh/setup-bun` |
| Lint fails only on CI | Uncommitted formatter output | Run `bun run lint` (or workspace `check:fix`) locally |
| Secret scan fires on docs/example | Placeholder looks like a real key | Use obvious placeholders in `.env.example`; never commit real secrets |
| Scan job shows notices | Policy scripts not implemented yet | Expected until Phase 3 tooling lands — not a merge blocker |

## Related docs

- [`docs/HARD_RULES.md`](./HARD_RULES.md) — §11 testing rules, §12 git/PR rules
- [`docs/AGENT_AUTOMATION_RUNBOOK.md`](./AGENT_AUTOMATION_RUNBOOK.md) — long agent-run verification batch
- [`docs/SHIP_STATE.md`](./SHIP_STATE.md) — what is verified vs planned in production
