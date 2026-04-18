# Tempo — Tasks (source of truth)

> Single-source-of-truth task board.
>
> Rules:
> - Update status in the **same PR/commit** that finishes the work. No async drift.
> - New work starts as `backlog`, moves to `next` once scoped, then `doing` once you start.
> - Blocked work moves to `blocked:<reason>` with the blocker called out.
> - When done, move under `## Done (by date)`.
> - Link PRs / commits / issues inline.

---

## Doing

_(nothing in flight right now)_

---

## Next (top 3 — pick from here)

### 1. Generate tickets from PRDs + brain notes
- **Why:** Today `docs/PRDs/` is empty and `docs/brain/` only has `AGENTS.md`; we have no written backlog. The session needs an ingestion pass that reads whatever lands in `docs/brain/sources/` and emits actionable tickets under `docs/tickets/*.md`.
- **Shape:** one sub-agent does a one-shot run, produces 10–30 tickets (id, title, 2–3 bullet AC, estimate, dependency graph), then appends them to the **Backlog** section below.
- **Exit:** `docs/tickets/*.md` exists, Backlog lists the new tickets, nothing committed outside those paths.

### 2. Auto-fix + re-enable the style rules we muted in CI
- **Why:** PR #10 silenced `noImplicitBoolean` and `useBlockStatements` in `apps/web/biome.json` and `apps/mobile/biome.json` to unblock CI. We should run `biome check --write` across web + mobile, re-enable the rules, and verify CI stays green.
- **Blocker on Windows:** `bun x @biomejs/biome` fails locally on Windows with `Cannot find module '@biomejs/cli-win32-x64/biome.exe'` (bun workspace + optional native dep bug). Run this on a Linux box or in a cloud agent.
- **Steps (Linux):**
  1. Branch `chore/biome-style-reenable`.
  2. In `apps/web/biome.json` and `apps/mobile/biome.json`, change `useBlockStatements` and `noImplicitBoolean` from `"off"` to `"warn"` (or `"error"` if you want hard CI fail).
  3. `cd apps/web && bun x @biomejs/biome@2.3.8 check --write --unsafe .`
  4. `cd apps/mobile && bun x @biomejs/biome@2.3.8 check --write --unsafe .`
  5. Review the diff — all machine-applied. Commit.
  6. Open PR, wait for CI green, merge.
- **Exit:** both biome.json files have the two rules back on, diff is machine-applied only, CI is green, PR merged.

### 3. Phase 3 — `.cursor/` rules, sub-agents, slash commands, hooks
- **Why:** Tomorrow's parallel cloud agents need shared guardrails (`.cursor/rules/tempo-*.mdc`), verification sub-agents (`.cursor/agents/tempo-*`), the `/whats-next` and `/run-qa` slash commands, and a stop-hook.
- **Exit:** all files exist, `/whats-next` returns 3 items from this TASKS.md, stop-hook runs without error in a fresh clone.

---

## Backlog (unordered, groomed as capacity allows)

### Platform / infra
- **Backfill + tighten `users` schema.** Today (`convex/schema.ts`) the `role`, `isActive`, `createdAt`, `updatedAt` fields on `users` are `v.optional(...)` so prod could accept pre-existing test users (`beta2@tempo.app`, `beta3@tempo.app`). Backfill those rows, then make the fields required again. Also decide the final shape of `name` vs `fullName` (currently both exist).
- **Delete or migrate `tempo-marketing` Vercel project.** Unlinked from GitHub (PR #10 session, 2026-04-18) so it stops failing every PR. Still exists as an empty project pointing at a nonexistent `artifacts/tempo-marketing` root dir — either wire it to a real marketing site or delete the project via Vercel dashboard.
- **Remove orphaned `C:/Projects/tempo-worktrees`** directory on this Windows box (leftover from earlier worktree experiments; Windows long-path issues make it annoying to delete).
- **Re-run `convex codegen` on every schema change** and re-commit `convex/_generated/`. Decide whether to add a pre-commit hook or a CI check.
- **Promote `tempo-web` Vercel env vars into Convex dashboard** so prod and dashboard share one source of truth (currently set via `vercel env` + `.local.vercel.env`).

### Mobile
- **Run `bun x eas login`** on this workstation so EAS builds work without interactive auth.
- **Fix `apps/mobile` Biome style rules** (currently muted in `apps/mobile/biome.json`).

### RAG / brain
- **Design the ingestion pipeline** for `docs/brain/sources/`: folder drop → Convex `documents` table → OpenRouter embeddings → retrieval action usable from the coach and planner agents.
- **Decide storage boundary:** what lives in public `tempo-rhythm` vs private `tempo-brain` submodule.

### Tests
- **Add a root `test` script.** CI currently emits `::notice::root 'test' script not yet implemented — Phase 3 will add it` and skips; replace with real unit tests (convex + packages).

---

## Done (by date)

### 2026-04-18 — "CI green + prod wiring" session
- PR [#10](https://github.com/Division6066/tempo-rhythm/pull/10) merged (squash). Makes every CI job green on `master`:
  - Root `tsconfig.base.json` + per-package `tsconfig.json` for `@tempo/{types,utils,ui}`.
  - Pinned `@biomejs/biome@2.3.8` in internal packages (was resolving to an unrelated npm package).
  - `apps/mobile` lint narrowed to `biome lint` (no formatter) to match web.
  - Committed `convex/_generated/` so CI can typecheck without `CONVEX_DEPLOYMENT` credentials.
  - Simplified `apps/web/vercel.json` (dropped pnpm-era build command + convex codegen step).
  - Removed duplicate `/dashboard` route (kept the one inside `(app)` group).
  - Demoted `noImplicitBoolean` + `useBlockStatements` to `off` (see Next #2 for the re-enable).
- Convex production deployment created: `https://precious-wildcat-890.eu-west-1.convex.cloud`. Schema + functions pushed.
- Vercel `tempo-web` wired up:
  - Linked to `amit-levins-projects/tempo-web`.
  - `NEXT_PUBLIC_CONVEX_URL` set for Production / Preview / Development.
  - `CONVEX_DEPLOY_KEY` rotated for Production.
  - Root Directory fixed to `apps/web`.
  - First green prod deploy.
- Orphan `tempo-marketing` Vercel project unlinked from GitHub so it stops failing every PR.
- Stale PR [#5](https://github.com/Division6066/tempo-rhythm/pull/5) closed (founder control loop skill; will be re-packaged in Phase 3).
- `docs/brain/` submodule tracked on `main` with `update = merge`; `CODEOWNERS`, `.gitignore`, `AGENTS.md` added inside the private repo.
