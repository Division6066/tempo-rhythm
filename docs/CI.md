# CI and security checks

GitHub Actions workflows for pull requests targeting `master`. Source of truth: `.github/workflows/ci.yml` and `.github/workflows/security.yml`.

## Package manager

All CI jobs use **Bun** (`oven-sh/setup-bun@v2`) with `bun install --frozen-lockfile`. Root `package.json` pins `packageManager: "bun@1.3.9"`.

Local parity before opening a PR:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test          # root script exists; CI job is still best-effort
```

## CI workflow (`ci.yml`)

| Job | Blocking? | Command | Notes |
|---|---|---|---|
| **Typecheck** | Yes | `bun run typecheck` | Turbo runs `typecheck` across workspaces |
| **Lint** | Yes | `bun run lint` | Biome via Turbo |
| **Test** | No (`continue-on-error: true`) | `bun run test` if script exists | Root `test` script runs `bun test`; job kept non-blocking until coverage stabilizes |
| **Scans** | Notice-only | `scan:forbidden-tech`, `scan:ram-only-audit`, `scan:design-tokens` | Each script is skipped with a GitHub notice when not yet defined in `package.json` |

### Scan scripts (Phase 3 target)

HARD_RULES §2, §5, and §7 reference these guards. When implemented, add them to root `package.json` and CI will fail the job on non-zero exit:

- `scan:forbidden-tech` — no Firebase, Supabase, Prisma, direct AI SDKs, etc.
- `scan:ram-only-audit` — scanner modules must not persist raw third-party content
- `scan:design-tokens` — no arbitrary hex outside design tokens (web UI)
- `convex:schema-guard` — schema validation (not yet wired in CI; add when script lands)

## Security workflow (`security.yml`)

| Job | Blocking? | Tool |
|---|---|---|
| **Secret scan** | Yes | Gitleaks + TruffleHog (`--only-verified`) on every PR |

No dependency on Bun — checkout with full history (`fetch-depth: 0`) for diff-based scanning.

## What agents should run locally

Minimum before marking a PR ready:

1. `bun run typecheck`
2. `bun run lint`

Optional but recommended when touching Convex, AI, or UI:

3. `bun run test`
4. Any scan script that exists in `package.json`

Do **not** use `bun run check` as a read-only verification command — it may run Biome with `--write` in some packages.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Typecheck passes locally, fails in CI | Different Node/Bun version | Match CI: Node 24, Bun latest from setup action |
| Lint fails only on web | Biome config drift | Run `bun run lint` from repo root (Turbo fans out) |
| Test job green but empty | Script missing or skipped | Check workflow logs for `::notice::` lines |
| Scan job always succeeds | Script not in `package.json` yet | Expected until Phase 3; do not treat as enforcement |

## Related docs

- [`docs/HARD_RULES.md`](./HARD_RULES.md) §11 (testing) and §12 (git/PR)
- [`docs/AGENT_AUTOMATION_RUNBOOK.md`](./AGENT_AUTOMATION_RUNBOOK.md) — pre-flight batch checks for long agent runs
- [`.github/pull_request_template.md`](../.github/pull_request_template.md) — PR body requirements
