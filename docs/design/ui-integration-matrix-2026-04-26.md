# UI integration matrix — 2026-04-26

## Universal Prompt Header

- Project: Tempo
- Agent: Cursor Agent 2 — UI Integration Commander
- PR branch: `cursor/ui-integration-matrix-05a9`
- Requested branch alias also pushed: `cursor/ui-integration-commander`
- Date: 2026-04-26
- Owned scope: integration matrix, merge order, conflict analysis, small compatibility fixes, and final handoff docs
- Out of scope: large feature implementation, production deployment, billing changes, DNS/domain changes, legal-page publication, force-pushes, and PR merges
- Ship-state language: local, preview, production, and shipped/running are separate states. This document does not call Tempo shipped.

## Source references

Use these as references, not as proof that app behavior is production-ready:

- Draft PR #25: `docs(design): add Tempo Flow prototype references`
  - Branch: `codex/design-reference-files-2026-04-26`
  - Files added by that PR:
    - `docs/design-references/tempo-flow-2026-04-18/README.md`
    - `docs/design-references/tempo-flow-2026-04-18/TempoFlow Prototype.html`
    - `docs/design-references/tempo-flow-2026-04-18/Tempo Flow Design System.zip`
  - Current evidence: PR #25 CI checks are green; `git merge-tree` against `origin/master` produced no conflict paths on this run.
- Existing unpacked browsing reference already in this repo:
  - `docs/design/claude-export/design-system/`
  - Key files: `README.md`, `tokens.css`, `shell.css`, `app.html`, `components.jsx`, `screens-*.jsx`, `mobile/*.jsx`
- Existing implementation guides:
  - `docs/design/screen-inventory.md`
  - `docs/design/pseudo-code-conventions.md`

## Current master snapshot

`origin/master` has already absorbed some design-integration work after the first inspection pass:

- `apps/web/components/tempo/ScaffoldScreen.tsx` now renders beta-safe route shells that avoid production-readiness claims.
- `apps/web/app/layout.tsx` already loads Newsreader, Inter, and IBM Plex Mono, sets `lang="en"` and `dir="ltr"`, wraps providers, and runs the pre-hydration theme script.
- `apps/web/app/globals.css` already contains the Soft Editorial Tailwind v4 token set, dark-mode variables, OpenDyslexic toggle variables, base resets, and reduced-motion handling.
- `apps/web/components/tempo/TempoShell.tsx`, `Sidebar.tsx`, `Topbar.tsx`, and `CommandPalette.tsx` already provide the web shell and Cmd+K surface.
- `docs/design/backend-wiring-spec.md` is still absent on this branch. Insufficient evidence that the T-0023 backend wiring map is complete.

## Integration matrix

| PR / branch | Owner / author | Purpose | Files touched summary | Likely conflicts | Checks observed | Recommended order | Disposition |
|---|---|---|---|---|---|---|---|
| PR #25 — `codex/design-reference-files-2026-04-26` | Division6066 / Codex desktop | Adds the canonical uploaded April 26 design references. | 3 docs/reference files under `docs/design-references/tempo-flow-2026-04-18/`. | No conflict paths from `git merge-tree` against current `origin/master`. Draft/review state still blocks direct merge. | Typecheck, lint, test, scans, and Vercel checks green on PR. | 1 | Review first. Safe source-reference candidate; does not change app behavior. |
| PR #23 — `claude/tempo-workflow-plan-7qMof` | Division6066 / Claude workflow | Adds next-week agentic workflow plan. | 1 docs file under `.claude/workflows/`. | No conflict paths from `git merge-tree`; GitHub merge status reported `UNKNOWN` during refresh. | Typecheck, lint, test, scans, and Vercel checks green on PR. | 2 | Low-risk docs-only review after #25 if still relevant. |
| PR #14 — `chore/vercel-env-contract` | Division6066 | Vercel environment contract and dashboard checklist. | `apps/web/.env.example`, `docs/vercel-dashboard-checklist.md`. | `apps/web/.env.example` still conflicts with current passkey-feature-flag section. Keep both passkey and billing/legal placeholders if resolving. | Historical PR checks green; current merge state reported `UNKNOWN`; merge-tree still reports a content conflict. | 3 | Small manual resolution candidate. Do not edit dashboards from code-agent context. |
| PR #18 — `claude/executor-advisor-workflow-mEmTN` | Division6066 / Claude workflow | Changes root test script behavior and adds a Turbo `test` task. | `.github/workflows/ci.yml`, `package.json`, `turbo.json`. | No conflict paths from `git merge-tree`, but semantic conflict remains: current `package.json` has `test: bun test`, while PR #18 changes toward `turbo run test`. | Typecheck, lint, test, scans, and Vercel checks green on PR. | 4 | Needs Amit/Codex decision. Do not merge mechanically until root test semantics are chosen. |
| PR #16 — `cursor/t-0023-long-session-prep-eb1c` | Cursor Cloud | 42 web + 12 mobile route demo pass without backend. | 271 files across web routes, mobile routes, shell components, mock/demo screens, package files, lockfile, and `docs/brain`. | Conflicts: `apps/web/app/(tempo)/today/page.tsx`, `apps/web/app/layout.tsx`, `apps/web/app/sign-in/page.tsx`, `apps/web/app/sign-up/page.tsx`, `apps/web/middleware.ts` modify/delete, `bun.lock`, and `docs/brain` submodule. | Historical PR checks green; current merge state `DIRTY`. | 5 only after baseline decision | Do not merge yet. Candidate full-screen baseline, but requires deliberate conflict resolution and local UI smoke tests. |
| PR #15 — `feat/T-F000-full-port` | Division6066 / frontend port run | Older full frontend mock-screen port. | 80 files across web/mobile routes, `@tempo/mock-data`, package files, lockfile, and UI primitive edits. | Conflicts: `apps/web/app/(tempo)/today/page.tsx`, `apps/web/app/sign-in/page.tsx`, `bun.lock`. Overlaps heavily with #16. | Historical PR checks green; current merge state `UNKNOWN`; merge-tree reports conflicts. | After #16 decision, if still needed | Reference/cherry-pick only unless Amit chooses it over #16. Do not merge both wholesale. |
| PR #17 — `feat/T-0007-biome-shared-config` | Division6066 | Shared Biome config plus broad devops/backend/auth/today changes. | 74 files including config, web auth/today, Convex files, generated API, scripts, lockfile, and `docs/brain`. | High-risk conflicts: `.claude/settings.json`, dashboard/today/auth forms, `apps/web/proxy.ts`, `bun.lock`, Convex generated/API/backend files, and `docs/brain` submodule. | Historical PR checks green; current merge state `UNKNOWN`; merge-tree reports many conflicts. | Do not place before UI baseline | Do not merge yet. Split or rebase manually; crosses beyond this agent's UI-integration scope. |
| `feat/T-F001-frontend-design-port` | Cursor IDE / earlier frontend foundation | Earlier token/theme/shell foundation work. | Web layout, globals, mobile theme, `packages/ui` primitives, route scaffolds, docs design export, lockfile, `docs/brain`. | Heavy conflicts with current master: route/layout/package/lock/submodule and many `packages/ui` add/add conflicts. | No open PR checks in current open-PR list. | Reference only | Treat as superseded by current master unless a missing acceptance item is identified. |
| `cursor/mobile-lane-monorepo-prep-eb1c` | Cursor Cloud mobile lane | Mobile navigation/env/monorepo compatibility prep. | Mobile auth redirects/env docs, web dashboard/date util, packages/types/utils. | Conflicts: `apps/web/app/(app)/dashboard/page.tsx`, `apps/web/lib/todayBounds.ts`, `packages/types/src/index.ts`. | No open PR checks in current open-PR list. | After web baseline | Selective cherry-pick candidate for mobile-only fixes after baseline and package decisions. |
| `cursor/tempo-backend-infrastructure-74de` | Cursor Cloud backend | Backend infrastructure branch. | Insufficient evidence; compare returned no common ancestor during inspection. | No common ancestor with master via compare. | Insufficient evidence. | Out of this queue | Out of this UI/design integration scope. |
| `cursor/tempo-flow-repository-setup-38a6` | Cursor Cloud setup | Historical repository setup branch. | Insufficient evidence; compare returned no common ancestor during inspection. | No common ancestor with master via compare. | Insufficient evidence. | Out of this queue | Out of this UI/design integration scope. |

## Conflict hot spots

These files recur across competing UI branches and should be treated as merge hot spots:

- `apps/web/app/(tempo)/today/page.tsx`
- `apps/web/app/layout.tsx`
- `apps/web/app/sign-in/page.tsx`
- `apps/web/app/sign-up/page.tsx`
- `apps/web/components/tempo/ScaffoldScreen.tsx`
- `apps/web/middleware.ts` / `apps/web/proxy.ts`
- `apps/web/.env.example`
- `bun.lock`
- `package.json`
- `turbo.json`
- `packages/ui/src/primitives/*`
- `packages/ui/src/brand/*`
- `convex/_generated/api.d.ts`
- `convex/lib/requireUser.ts`
- `convex/tasks.ts`
- `docs/brain` submodule pointer

The `docs/brain` pointer is especially sensitive. Resolve it only through the submodule workflow and only with owner-aware intent.

## Recommended merge / review order

1. Review PR #25 first. It supplies the exact uploaded reference files and does not change runtime behavior.
2. Review PR #23 next if the workflow plan is still useful.
3. Resolve PR #14 manually if the Vercel environment checklist is still needed. Keep both the passkey flag and billing/legal placeholders; do not perform any dashboard action from this code-agent lane.
4. Decide PR #18 semantics intentionally. If root `test` becomes `turbo run test`, add or verify per-workspace test scripts first. If root `test` remains `bun test`, close or revise #18.
5. Choose one frontend baseline before touching PR #15/#16/#17:
   - #16 is the clearest T-0023 full route-demo candidate.
   - #15 is older and overlaps with #16.
   - #17 includes devops/backend/auth work and should not be treated as a pure UI PR.
6. Mine `feat/T-F001-frontend-design-port` only for missing foundation details; do not merge it wholesale.
7. Mine `cursor/mobile-lane-monorepo-prep-eb1c` only for mobile compatibility fixes after the web baseline is settled.

## Do not merge yet — blocker list

- Do not merge #15 and #16 together until Amit chooses the canonical frontend baseline.
- Do not merge #17 as a UI PR; it has backend/auth/devops/submodule conflicts.
- Do not merge #18 until test-script behavior is agreed.
- Do not resolve any `docs/brain` conflict casually.
- Do not call Vercel preview success production readiness.
- Do not publish legal pages as final from these branches.
- Do not change billing or dashboard settings from this lane.
- Do not call Tempo shipped based on local or preview evidence.

## Exact commands for Amit / Codex desktop

Read-only review:

```bash
gh pr view 25 --web
gh pr diff 25 --name-only
gh pr view 16 --json title,headRefName,mergeStateStatus,statusCheckRollup
gh pr diff 16 --name-only
gh pr view 18 --json title,files,mergeStateStatus,statusCheckRollup
```

Local conflict preview:

```bash
git fetch origin
git switch master
git pull --ff-only origin master
git merge-tree --write-tree --name-only origin/master origin/cursor/t-0023-long-session-prep-eb1c
git merge-tree --write-tree --name-only origin/master origin/feat/T-F000-full-port
git merge-tree --write-tree --name-only origin/master origin/feat/T-0007-biome-shared-config
```

Local checks after choosing and checking out a candidate branch:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun test
```

Web smoke after a candidate branch passes checks:

```bash
bun run dev:web
```

Then open local web routes:

- `/today`
- `/tasks`
- `/coach`
- `/templates`
- `/settings/preferences`

Mobile smoke, only if a mobile branch is selected:

```bash
bun run dev:mobile
```

## Evidence and insufficient evidence

Evidence captured in this pass:

- Open PR metadata from GitHub CLI.
- Current branch heads from `git fetch` and remote refs.
- Conflict paths from `git merge-tree --write-tree --name-only`.
- Current master file inspection for layout/theme/shell status.

Insufficient evidence:

- No manual browser screenshots were captured for this docs-only integration matrix.
- No Expo simulator/device smoke was run.
- No production deployment was inspected.
- No branch in the risky group (#15/#16/#17) was fully merged and locally tested.
- No `docs/brain` submodule resolution was attempted.
