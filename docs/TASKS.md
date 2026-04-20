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

_(nothing in flight right now — waiting for tomorrow morning's 45-min + overnight test runs)_

---

## Next (top 3 — pick from here)

> Atomic 30-min tickets for Phase 0 + M0 + M1 now live in the private `docs/brain/tickets/` submodule (59 tickets, indexed at `docs/brain/tickets/_INDEX.md`). Use `/whats-next` in Cursor — it reads that index and surfaces candidates matching your time budget + assignee fallback ladder.

### 1. Execute one 30-min ticket from `docs/brain/tickets/` (dogfood the new flow)
- **Why:** The ticket-based flow, rules, and slash commands were scaffolded today. Tomorrow's 45-min test drives the "one ticket, full execute" path.
- **Shape:** open Cursor, say `/whats-next`, pick one, run `/start-ticket T-XXXX`, finish with `/run-qa` and `/pr`.
- **Exit:** one PR open, ticket flipped to `in-review`, QA line green, branch `feat/T-XXXX-<kebab>`.

### 2. Auto-fix + re-enable the style rules we muted in CI
- **Why:** PR #10 silenced `noImplicitBoolean` and `useBlockStatements` in `apps/web/biome.json` and `apps/mobile/biome.json` to unblock CI. Run `biome check --write` across web + mobile, re-enable, verify CI stays green.
- **Blocker on Windows:** `bun x @biomejs/biome` fails locally on Windows with `Cannot find module '@biomejs/cli-win32-x64/biome.exe'` (bun workspace + optional native dep bug). Run this on a Linux box or in a cloud agent.
- **Steps (Linux):**
  1. Branch `chore/biome-style-reenable`.
  2. In `apps/web/biome.json` and `apps/mobile/biome.json`, change `useBlockStatements` and `noImplicitBoolean` from `"off"` to `"warn"` (or `"error"`).
  3. `cd apps/web && bun x @biomejs/biome@2.3.8 check --write --unsafe .`
  4. `cd apps/mobile && bun x @biomejs/biome@2.3.8 check --write --unsafe .`
  5. Commit, open PR, merge.
- **Exit:** both biome.json files have the two rules back on, CI green, PR merged.

### 3. Run an overnight autonomous session (stress-test the long-running rails)
- **Why:** The 8-hour marathon exercises `tempo-long-running.mdc`, the `/long-session` slash command, worktree isolation, checkpoints, and block-escalation.
- **Shape:** Cursor Cloud agent, pick identity `cursor-cloud-1` or `cursor-cloud-3`, start from the earliest Root ticket in `tickets/_INDEX.md` "By dependency chain".
- **Exit:** a session report in chat listing closed / started / skipped / blocked tickets, plus N PRs open for review (no self-merges).

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

### 2026-04-20 — Design export + T-0021 closed
- **`T-0021` done** (`docs/brain/TASKS.md`, ticket file `docs/brain/tickets/T-0021.md`): tracked `docs/design/claude-export/TempoFlow Prototype.html` + `Tempo Flow Design System.zip`; added `docs/design/component-map/` (`README.md`, `web-flow.md` tier-A Flow pseudocode). Landed commit [`a526444`](https://github.com/Division6066/tempo-rhythm/commit/a526444) on branch `cursor/ticket-sweep-brain-bump-0f1a` (merge to `master` pending).

### 2026-04-18 — "Phase 3 rails" session (evening)
- **Atomic ticket queue generated:** 59 ticket files across 13 cluster parents covering Phase 0 + M0 + M1 in `docs/brain/tickets/`. Each ticket sized ~30 min, with `product` / `assignee` / `execution` / `cluster` / `parallelizable` / `blocked-by` / `blocks` frontmatter and full acceptance criteria + implementation guidance. See `docs/brain/tickets/_INDEX.md` (by time / parallelizability / dependency / cluster / assignee / fallback log) and `docs/brain/tickets/CLUSTERS.md` (parent → child split rationale).
- **Source ingestion:** all loose documents from yesterday copied into `docs/brain/sources/` under dated subfolders (build-pack 2026-04-05, replit-kit 2026-03-13, personal-os-prompts + bundle 2026-04-16, tempo-flow 2026-04-17, misc incl. the 610 KB `Tempo_Flow_Master_Document`). Provenance table + distillation status in `docs/brain/sources/README.md`.
- **Sub-agent playbooks:** `docs/brain/agents-playbook/` now has paste-ready prompts for `cursor-cloud-core`, `cursor-cloud-ai`, `cursor-cloud-platform`, `long-session`, `docs-to-tickets`, `qa-bot`, `reviewer`. Each enforces HARD_RULES and the ticket contract.
- **Cursor rules:** `.cursor/rules/` gained `tempo-hard-rules.mdc` (always-on quick reference), `tempo-tickets.mdc` (how to read/execute a ticket), `tempo-qa.mdc` (the QA gate), `tempo-long-running.mdc` (8-hour session playbook). `tempo-context.mdc`, `session-start.mdc`, `task-complete.mdc` upgraded to understand the ticket format + assignee fallback ladder.
- **Slash commands:** `.cursor/commands/` gained `/run-qa`, `/start-ticket`, `/long-session`. `/whats-next` upgraded to accept a time budget and filter by assignee fallback.
- **Fallback ladder applied:** Twin / Pokey / Zo tickets fall back to Cursor identities with `[<primary>-fallback]` commit tag until those external agents are configured. Today's fallback count: 1 (T-0015 Vercel bind).

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
