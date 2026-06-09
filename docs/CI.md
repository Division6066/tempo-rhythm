# Continuous Integration

GitHub Actions run on every pull request targeting `master`. Package manager for all jobs is **Bun** (`packageManager: bun@1.3.9` in root `package.json`; `bun.lock` is committed).

Workflow files:

- `.github/workflows/ci.yml` — typecheck, lint, test, policy scans
- `.github/workflows/security.yml` — secret scanning

---

## Blocking jobs (must pass to merge)

| Job | Workflow | Command | Notes |
|---|---|---|---|
| Typecheck | `ci.yml` | `bun run typecheck` | Turborepo across `apps/*` and `packages/*` |
| Lint | `ci.yml` | `bun run lint` | Biome via Turborepo |
| Secret scan | `security.yml` | Gitleaks + TruffleHog | Fails on verified secrets in the diff |

Run the same checks locally before opening a PR:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun test
```

---

## Notice-only / best-effort jobs

These jobs exist in CI but do **not** block merges today.

| Job | Workflow | Behavior |
|---|---|---|
| Test | `ci.yml` | `continue-on-error: true`. Runs `bun test` when the root `test` script exists. |
| Scans | `ci.yml` | Emits `::notice::` when `scan:forbidden-tech`, `scan:ram-only-audit`, or `scan:design-tokens` scripts are missing from `package.json`. Succeeds without running. |

When a scan script lands in `package.json`, CI will run it and fail on non-zero exit. Until then, run forbidden-tech and design-token checks manually when touching Convex, AI, or UI code.

---

## Planned scripts (referenced in HARD_RULES, not yet in package.json)

| Script | HARD_RULES | Purpose |
|---|---|---|
| `scan:forbidden-tech` | §2 | Block Firebase, Prisma, Clerk, direct AI SDKs, etc. |
| `scan:ram-only-audit` | §6.4 | Ensure scanner functions do not persist raw content |
| `scan:design-tokens` | §7 | Fail on arbitrary Tailwind hex / off-token colors |
| `convex:schema-guard` | §5 | Schema shape validation |

Target PR gate (when all scripts exist):

```bash
bun run lint && bun run typecheck && bun test \
  && bun run scan:forbidden-tech \
  && bun run convex:schema-guard \
  && bun run scan:ram-only-audit \
  && bun run scan:design-tokens
```

---

## Common pitfalls

- **`bun run check` mutates files.** The mobile package runs `biome check --write`. Do not use it as a read-only verification command. Prefer `bun run lint` and `bun run typecheck`.
- **Convex codegen in CI.** `convex/_generated/` is committed so typecheck does not need `CONVEX_DEPLOYMENT` credentials. Re-run `bun run convex:codegen` after schema changes and commit the diff.
- **Default branch is `master`.** PRs target `master`, not `main`.

---

## Related

- [`docs/HARD_RULES.md`](./HARD_RULES.md) — §12 (git + PR rules)
- [`docs/AGENT_AUTOMATION_RUNBOOK.md`](./AGENT_AUTOMATION_RUNBOOK.md) — pre-flight batch checks for long agent runs
