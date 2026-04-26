# Tempo UI Integration Handoff — 2026-04-27

## Universal Prompt Header

- **Project:** Tempo
- **Agent:** Cursor Agent 2 — UI Integration Commander
- **Branch:** `cursor/ui-integration-matrix-05a9` (draft PR branch; `cursor/ui-integration-commander` was also pushed with the same commit for traceability)
- **Date prepared:** 2026-04-26
- **Scope:** integration matrix, merge order, conflict analysis, small compatibility guidance, final handoff docs
- **Hard constraints:** do not merge PRs, do not force-push, do not deploy production, do not change billing, do not change DNS/domain, do not publish legal pages as final, do not call Tempo shipped.
- **Environment separation:** local and preview evidence are not production evidence. Shipped/running requires production Vercel plus production Convex verification; insufficient evidence.

## What to review first tomorrow morning

1. **PR #25 — design references.**
   - Review before any frontend merge because it establishes the exact uploaded prototype/design-system archive.
   - It is reference-only. Do not paste the prototype wholesale into production.
   - Command: `gh pr view 25 --web`
2. **Current `master` route-shell state.**
   - `origin/master` now includes concrete beta-safe scaffold route shells from PR #26.
   - Smoke `/today`, `/tasks`, `/coach`, `/templates`, `/settings/preferences` before choosing a broader UI branch.
3. **PR #16 — T-0023 demo routes.**
   - Review as the likely richest full-screen demo baseline, but do not merge yet.
   - It has 271 changed files and conflicts in current high-traffic app files.
4. **PR #14 — Vercel env docs.**
   - Small conflict. If still needed, resolve by keeping both passkey and Polar/legal placeholder names.
5. **PR #18 — test script semantics.**
   - Decide whether root `test` should stay `bun test` or move to `turbo run test` with per-workspace test scripts.

## Risky PRs and branches

| Item | Risk | Morning action |
|---|---|---|
| PR #16 | Broad frontend mock/demo branch; conflicts with `today`, layout, auth, middleware, lockfile, `docs/brain`. | Review manually; do not merge until frontend baseline is chosen. |
| PR #15 | Older full frontend port overlaps with #16 and current master. | Treat as reference unless Amit explicitly chooses it over #16/current master. |
| PR #17 | Mixes devops, backend, auth, Convex generated files, UI, and submodule pointer. | Split or rebase intentionally; do not merge as a UI-design PR. |
| `feat/T-F001-frontend-design-port` | Superseded-looking token/shell branch with many add/add conflicts against current master. | Mine only missing intent; do not merge wholesale. |
| `cursor/mobile-lane-monorepo-prep-eb1c` | Smaller mobile prep branch but conflicts with web dashboard/date/types helpers. | Selective cherry-picks only after UI baseline decision. |

## What must be tested locally

Run these on any selected branch before asking for review:

```bash
git fetch origin
git switch master
git pull --ff-only origin master
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun test
git diff --check
```

For web UI branches:

```bash
bun run dev:web
```

Then smoke-test:

- `/`
- `/today`
- `/tasks`
- `/coach`
- `/templates`
- `/settings/preferences`
- `/sign-in`
- theme toggle and OpenDyslexic toggle if present in the selected branch
- Cmd+K if the selected branch changes the shell

For mobile branches:

```bash
bun run dev:mobile
```

Then smoke-test:

- authenticated redirect target
- `(tempo)/(tabs)/today`
- `(tempo)/(tabs)/tasks`
- `(tempo)/(tabs)/coach`
- `(tempo)/(tabs)/notes`
- `(tempo)/capture`
- `(tempo)/settings`

Mobile emulator/device evidence for the current conflicting branches: **insufficient evidence**.

## What needs Amit approval

- Selecting the canonical frontend baseline:
  - current `master` incremental route-shell approach,
  - PR #16 full demo route branch,
  - PR #15 older full-port branch,
  - or a cherry-pick stack from several branches.
- Any `docs/brain` submodule pointer movement.
- Whether root tests should be `bun test` or `turbo run test` (#18).
- Any billing-provider, legal, dashboard, DNS, or production-deployment decision.
- Whether PR #17 should be split into smaller devops/backend/UI PRs.

## Exact review commands for Amit or Codex desktop

Open PRs:

```bash
gh pr list --state open --limit 100
gh pr view 25 --web
gh pr view 16 --web
gh pr view 14 --web
gh pr view 18 --web
```

Inspect file lists:

```bash
gh pr diff 25 --name-only
gh pr diff 16 --name-only
gh pr diff 15 --name-only
gh pr diff 17 --name-only
```

Check conflict paths locally without merging:

```bash
git fetch origin
git merge-tree --write-tree --name-only origin/master origin/cursor/t-0023-long-session-prep-eb1c
git merge-tree --write-tree --name-only origin/master origin/feat/T-F000-full-port
git merge-tree --write-tree --name-only origin/master origin/feat/T-0007-biome-shared-config
git merge-tree --write-tree --name-only origin/master origin/feat/T-F001-frontend-design-port
git merge-tree --write-tree --name-only origin/master origin/cursor/mobile-lane-monorepo-prep-eb1c
```

Review PR #25 design-reference README without checkout:

```bash
gh api 'repos/Division6066/tempo-rhythm/contents/docs/design-references/tempo-flow-2026-04-18/README.md?ref=codex/design-reference-files-2026-04-26' --jq '.content' | base64 -d
```

## Do not merge yet — blocker list

- Do not merge #15/#16/#17 together. They overlap and conflict.
- Do not merge #17 as a UI integration PR; it crosses backend/devops/auth and Convex generated files.
- Do not merge any branch with a `docs/brain` conflict until the submodule owner reviews it.
- Do not merge #18 until the root test-script strategy is chosen.
- Do not treat #25's Vercel preview as production evidence.
- Do not call current UI work shipped or running in production. Current evidence only supports local/preview/code states; shipped/running evidence is insufficient.

## Evidence captured by this commander pass

- PR metadata refreshed with `gh pr list --json ...` on 2026-04-26.
- Conflict paths refreshed with `git merge-tree --write-tree --name-only origin/master <branch>` after fast-forwarding the work branch to `origin/master` (`f2b7b5a`).
- PR #25 README was read directly from the head branch via GitHub API.
- Current `origin/master` includes PR #26's scaffold-shell update.

## Insufficient evidence

- No current screenshot/video evidence for #15/#16/#17 after rebasing to `origin/master`.
- No proof that the mobile branches boot in Expo after conflict resolution.
- No proof that Vercel preview URLs for older PRs still represent their latest conflict-free state.
- No proof that any UI branch is production-shipped or safe to call shipped/running.
