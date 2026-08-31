# Merge runbook

How changes land in `tempo-rhythm`. Source of truth for branch flow; if this
document and `AGENTS.md` disagree, `AGENTS.md` wins.

## Branch topology

```
feature branches  ──PR──▶  integration  ──(Amit, batched)──▶  master
```

- **`master`** is Amit's. Nothing merges into it except by Amit, roughly every
  2 days, by merging `integration`. `master` is protected by the
  `protect-master` ruleset. It must always be deployable.
- **`integration`** is where agents land. Branch **from** `integration`, open
  the PR **against** `integration`.
- Branch names: `feat/T-XXXX-<kebab>` · `fix/T-XXXX-<kebab>` ·
  `chore/<scope>-<kebab>` · `docs/<scope>-<kebab>` (Cursor cloud agents use
  their assigned `cursor/<slug>` prefix).

## The three gates (agents merging into `integration`)

An agent may merge its own PR into `integration` only when **all three** hold:

1. **CI is green** — and green means something: the `Test`, `Scans`, `Notices`,
   and `Security` jobs are enforcing (no `continue-on-error`, no no-op steps).
2. **No conflicts** with `integration` at merge time.
3. **Every changed file is inside the ticket's declared file scope.**

If any gate fails: stop, leave the PR open, report branch name + PR number +
which gate failed. Never force-push or rebase away someone else's work.

## Sequential-merge rule

Merges into `integration` happen **one at a time**. After each merge, the next
PR must be up to date with `integration` (re-run CI if it wasn't). When two
open PRs collide on the same file (`convex/schema.ts` is the usual suspect),
the PR that lands first wins the file; the second PR rebases and reconciles —
resolve from **commit-message intent**, not from whichever hunk is easier.

## Required checks

| Check | Job | What red means |
| --- | --- | --- |
| Typecheck | `ci.yml` | TS errors somewhere in the workspaces |
| Lint | `ci.yml` | Biome violations |
| Test | `ci.yml` | `bun run test` failed — a real regression |
| Scans | `ci.yml` | Forbidden tech, RAM-only/soft-delete, or design-token ratchet violation |
| Third-party notices | `ci.yml` | A runtime dependency has no `THIRD-PARTY-NOTICES.md` entry |
| Secret scan | `security.yml` | gitleaks or trufflehog found a credential — treat as an incident |

None of these jobs may carry `continue-on-error` or silently no-op when a
script is missing. If a script must be temporarily disabled, that is a PR to
this runbook plus an issue explaining why, not a quiet YAML edit.

## Ratchet baselines

`scripts/scan-baselines.json` records pre-existing debt (hard-delete calls,
one-off hex values). Counts may only go **down**. Lower the baseline in the
same PR that removes a violation.

## When a secret leaks

1. Rotate the credential immediately — assume it is compromised.
2. Purge it from history only after rotation (history rewrite is Amit's call).
3. Add a gitleaks rule or fixture if the pattern was missed.

## Dependabot + `bun.lock`

Dependabot is configured with `package-ecosystem: bun` (not `npm`) in
`.github/dependabot.yml`. The npm updater used to bump workspace
`package.json` files and leave `bun.lock` unchanged, which made
`bun install --frozen-lockfile` fail before lint/typecheck/test ran.

If a Dependabot PR still arrives without a lockfile update, do not merge it.
Regenerate with bun@1.3.9 (`bun install`), commit `bun.lock`, and only then
re-run CI. Do not paste an older `bun.lock` from a stacked branch — that
desyncs the lockfile from the manifests on `integration`.

## Convex deployments

Schema/function changes do not deploy from CI. After merging a `convex/`
change into `integration`, deploy explicitly (`bun x convex deploy`) with the
deploy key for the target deployment, and record schema changes in
`convex/MIGRATIONS.md`.
