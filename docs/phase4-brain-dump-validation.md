# Phase 4 Browser/Product Validation - Brain Dump -> Plan Loop

Date: 2026-04-24  
Agent: cursor-ide (Phase 4.5 blocker-resolution + browser validation)  
Scope: Local validation + small auth fix + evidence update. No deploy, no merge.

## Preflight evidence

- Execution surface used for this run: clean worktree from `origin/codex/phase3-brain-dump-plan-loop`
- Branch under test: `codex/phase3-brain-dump-plan-loop`
- Start commit for this run: `eb3087a docs: Phase 4 QA validation + Phase 3 audit notes`
- Code fixes landed during this run before this evidence update:
  - `7e38cde fix(auth): use email provider for magic links`
  - `3a59b4b fix(tasks): resolve users from auth subject`
- PR #21: OPEN, `mergeStateStatus=BLOCKED`, `mergeable=MERGEABLE`, checks green, blocked by `REVIEW_REQUIRED`
- Current repo root mismatch from original prompt still exists outside the worktree (`master` + dirty `docs/brain` in the main workspace), so all execution/testing was isolated in the clean worktree

## Key blocker findings

### Root cause #1 — magic-link provider mismatch (fixed in code)

`apps/web/components/auth/SignInForm.tsx` was calling:

- `signIn("resend", { email })`

But `convex/auth.ts` configures:

- `Password`
- `Email(...)`

The Convex auth backend exposes the email provider as `email`, not `resend`.

Confirmed by local runtime logs before the fix:

- `Provider \`resend\` is not configured, available providers are \`password\`, \`email\``

### Root cause #2 — missing Convex auth env on fresh local backend (environment blocker, not committed)

On the local anonymous Convex backend created for this run, auth also needed:

- `SITE_URL`
- `JWT_PRIVATE_KEY`
- `JWKS`

Without them, local auth returned:

- `Missing environment variable \`SITE_URL\``
- `Missing environment variable \`JWT_PRIVATE_KEY\``

These were configured only on the local test backend to complete local validation. No secrets were committed.

### Root cause #3 — duplicate founder user rows in the local anonymous backend

The local anonymous backend ended up with multiple `users` rows for the founder email, which made `users.getProfile` email lookup ambiguous in one CLI check. Browser auth still reached `/today`, but this local-only duplication is noise from the anonymous ad-hoc environment, not evidence about preview/prod behavior.

### Root cause #4 — Add-to-Today auth bug (fixed in code)

After local auth succeeded, Add-to-Today still failed because:

- `tasks.createQuick` called `requireUser()`
- `requireUser()` depended on `identity.email`
- Convex auth session identity for mutations did not reliably provide `email`, while `users.getProfile` / `tasks.listToday` already had a more resilient user-resolution path

Observed local runtime error before the fix:

- `Uncaught Error: Not authenticated` from `convex/lib/requireUser.ts`

## Code changes made in this run

1. **Magic-link provider fix**
   - `apps/web/components/auth/SignInForm.tsx`
   - changed `signIn("resend", ...)` → `signIn("email", ...)`
   - also passes `redirectTo: nextPath` so magic-link completion preserves the `/today` destination

2. **Mutation auth-resolution fix**
   - `convex/lib/requireUser.ts`
   - now resolves the app user from `identity.subject` using `ctx.db.normalizeId("users", part)` across subject parts before falling back to email lookup
   - this aligns mutation auth behavior with the more resilient query-side identity handling already present in `users.getProfile` / `tasks.listToday`

## Targets and URLs tested

### Local

- `http://localhost:3000/today`
- `http://localhost:3000/sign-in?next=%2Ftoday`
- `http://localhost:3000/sign-up?next=%2Ftoday`
- `http://localhost:3000/dashboard`

### Preview

- `https://tempo-web-git-codex-phase3-brain-du-ad8017-amit-levins-projects.vercel.app/today`
- `https://tempo-web-git-codex-phase3-brain-du-ad8017-amit-levins-projects.vercel.app/sign-in?next=%2Ftoday`
- `https://tempo-web-git-codex-phase3-brain-du-ad8017-amit-levins-projects.vercel.app/dashboard`

## Browser QA checklist results

### Local

1. Open `/today` signed out  
   - PASS (`/today` -> `/sign-in?next=%2Ftoday`)

2. Confirm redirect to `/sign-in?next=%2Ftoday`  
   - PASS

3. Founder sign-up / auth bootstrap  
   - PASS locally after local auth env was configured
   - account created with founder email and redirected to `/today`

4. Confirm authenticated `/today` loads  
   - PASS

5. Confirm brain-dump panel visible  
   - PASS

6. Confirm quick-add visible  
   - PASS

7. Confirm Today list visible  
   - PASS

8. Paste messy real brain dump  
   - PASS

9. Click AI planning action  
   - FAIL as expected in current local env
   - exact visible error:
     - `Planning is not configured here yet. Use local sorting or try again later.`

10. If AI fails, use local fallback  
   - PASS
   - local fallback generated a 6-item prioritized list

11. Select generated items and Add to Today  
   - PASS after `requireUser` fix

12. Confirm selected items appear in Today list  
   - PASS
   - verified at least:
     - `Reply to Maya about Saturday`
     - `Pay phone bill tonight`

13. Confirm `/dashboard` redirects to `/today` while authenticated  
   - PASS

### Preview

1. Open `/today` signed out  
   - PASS (`/today` -> `/sign-in?next=%2Ftoday`)

2. Confirm redirect to `/sign-in?next=%2Ftoday`  
   - PASS

3. Preview founder auth  
   - still BLOCKED
   - prior validation + current runtime evidence indicate `POST /api/auth` 400 was the preview auth boundary before the new fixes
   - after this run, the preview deployment updated successfully for the new auth-fix commits, but preview auth was not re-driven interactively end-to-end in this environment
   - exact remaining preview blocker is therefore still unproven, but Resend/Convex auth env remains the highest-probability external dependency

4. Preview authenticated `/today` browser loop  
   - BLOCKED by preview auth boundary

## Console / network / Convex evidence

### Local runtime evidence captured during this run

- Before auth code fix:
  - `Provider \`resend\` is not configured, available providers are \`password\`, \`email\``
- Before local auth env setup:
  - `Missing environment variable \`SITE_URL\``
  - `Missing environment variable \`JWT_PRIVATE_KEY\``
- Before `requireUser` fix:
  - `tasks:createQuick` → `Not authenticated`
- After `requireUser` fix:
  - authenticated `/today` reachable
  - local fallback plan could be added to Today successfully

### Preview evidence

- Vercel runtime logs confirm repeated:
  - `POST /api/auth` -> `400`
- Preview `/today` signed-out redirect remains healthy
- Preview authenticated flow remains unproven in this run

## What is now proven

- The magic-link frontend had a real provider-id bug and it is fixed in code.
- The local browser loop is usable after auth:
  - `/today` auth gate
  - authenticated `/today`
  - brain dump input
  - AI failure state
  - local fallback
  - Add-to-Today
  - Today list update
  - authenticated `/dashboard` redirect

## What is still blocked / unproven

1. **Preview authenticated `/today` loop**
   - still blocked by preview auth boundary
   - needs one more browser pass after the pushed fix, or a valid preview session

2. **Preview magic-link/email sending**
   - still needs explicit confirmation of:
     - `RESEND_API_KEY` configured in the linked Convex deployment
     - `RESEND_FROM_EMAIL` configured in the linked Convex deployment
     - sender domain or sender address is valid in Resend

3. **Preview AI planning**
   - unproven until preview auth succeeds

## Commands run

- `git fetch origin codex/phase3-brain-dump-plan-loop`
- `git worktree add /tmp/tempo-pr21 -b phase45/pr21-local origin/codex/phase3-brain-dump-plan-loop`
- `bun install --frozen-lockfile`
- `bun run typecheck`
- `bun run lint`
- local `bun x convex dev`
- local `bun run dev:web`
- targeted `bun x convex run ...` checks against the local backend
- Vercel deployment/runtime inspection via MCP

## Final report

- Branch/commit under test:
  - started at `eb3087a`
  - code fixes validated locally in this run: `7e38cde`, `3a59b4b`
- PR #21 state: OPEN, merge status `BLOCKED`, checks were green before this run
- Local browser QA: PARTIAL PASS
  - auth + `/today` + fallback + Add-to-Today proven locally
- Preview browser QA: PARTIAL/BLOCKED
  - signed-out gate proven
  - authenticated preview loop still blocked/unproven
- Mistral text/API state (local): unavailable in current local env
  - visible error: `Planning is not configured here yet. Use local sorting or try again later.`
- Local fallback state: PASS
- Add-to-Today state: PASS locally after `requireUser` fix
- Exact remaining blockers:
  1. preview auth still needs re-test after the pushed auth fix
  2. preview/email sending still depends on Convex/Resend env correctness
  3. preview AI path remains blocked behind preview auth
