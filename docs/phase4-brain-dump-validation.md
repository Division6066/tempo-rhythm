# Phase 4 Browser/Product Validation - Brain Dump -> Plan Loop

Date: 2026-04-24  
Agent: cursor-ide (Phase 4 browser/product validation)  
Scope: Validation only (no deploy, no merge, no product-code edits)

## Preflight evidence

- Branch/working tree: `codex/phase3-brain-dump-plan-loop`, tracking `origin/codex/phase3-brain-dump-plan-loop`, with untracked `.tmp/`.
- HEAD commit: `4e383b8 feat(today): complete brain dump planning loop`.
- PR #21: OPEN, not draft, `mergeStateStatus=BLOCKED`, `mergeable=MERGEABLE`, checks SUCCESS (Typecheck/Lint/Test/Scans/Vercel).
- Env availability (no secrets shown):
  - Root `.env.local`: `CONVEX_DEPLOYMENT=set`, `CONVEX_SITE_URL=set`, `CONVEX_DEPLOY_KEY=empty`, `MISTRAL_API_KEY=empty`, `NEXT_PUBLIC_POSTHOG_KEY=empty`, `NEXT_PUBLIC_POSTHOG_HOST=set`, `CONVEX_URL=set`
  - `apps/web/.env.local`: `NEXT_PUBLIC_CONVEX_URL=set`, `NEXT_PUBLIC_POSTHOG_KEY=empty`, `NEXT_PUBLIC_POSTHOG_HOST=set`

## Targets and URLs tested

- Local target: `http://localhost:3000`
  - `http://localhost:3000/today`
  - `http://localhost:3000/sign-in?next=%2Ftoday`
  - `http://localhost:3000/sign-up?next=%2Ftoday`
  - `http://localhost:3000/dashboard`
- Preview target:
  - Vercel deployment page: `https://vercel.com/amit-levins-projects/tempo-web/AT3icKB3nrKcFZj3frq8KWJdMno8`
  - Preview URL tested: `https://tempo-web-git-codex-phase3-brain-du-ad8017-amit-levins-projects.vercel.app`
  - `https://tempo-web-git-codex-phase3-brain-du-ad8017-amit-levins-projects.vercel.app/today`
  - `https://tempo-web-git-codex-phase3-brain-du-ad8017-amit-levins-projects.vercel.app/sign-in?next=%2Ftoday`
  - `https://tempo-web-git-codex-phase3-brain-du-ad8017-amit-levins-projects.vercel.app/dashboard`

## Account used

- Founder account identity used for auth attempts: `amitlevin65@protonmail.com`
- Credentials were not exposed in this note.

## Browser QA checklist results

1. Open `/today` signed out  
   - Local: PASS (`/today` -> `/sign-in?next=%2Ftoday`)
   - Preview: PASS (`/today` -> `/sign-in?next=%2Ftoday`)

2. Confirm redirect to `/sign-in?next=%2Ftoday`  
   - PASS (local + preview)

3. Sign in with valid allowlisted beta/founder account if available  
   - BLOCKED
   - Evidence:
     - Password attempt with founder email returns UI error: "That password doesn't match yet. Please try again."
     - Magic-link attempt returns UI error: "We couldn't send the link yet. Please check your email and try again."
     - Network shows `POST /api/auth` -> `400` on local and preview.

4. Confirm authenticated `/today` loads  
   - BLOCKED (auth blocker)

5. Confirm brain-dump panel visible  
   - BLOCKED (auth blocker)

6. Confirm quick-add remains visible and works  
   - BLOCKED (auth blocker)

7. Confirm Today task list remains visible and works  
   - BLOCKED (auth blocker)

8. Paste messy real brain dump  
   - BLOCKED (auth blocker)

9. Click AI planning action  
   - BLOCKED (auth blocker)

10. Confirm AI readable summary + prioritized items  
   - BLOCKED (auth blocker)

11. If AI fails, use local fallback and record exact AI failure  
   - BLOCKED (auth blocker before reaching planner)
   - `insufficient evidence`

12. Select at least two generated items  
   - BLOCKED (auth blocker)

13. Click Add to Today  
   - BLOCKED (auth blocker)

14. Confirm selected items appear in Today task list  
   - BLOCKED (auth blocker)

15. Confirm empty input handled  
   - BLOCKED (auth blocker)

16. Confirm long input near cap does not crash  
   - BLOCKED (auth blocker)

17. Confirm loading/error/fallback/stale-result states  
   - PARTIAL/BLOCKED
   - Error state confirmed on auth forms (`/api/auth` 400 + visible UI errors).
   - Brain-dump loading/fallback/stale states not reachable without authenticated `/today`.
   - `insufficient evidence` for planner-specific states.

18. Confirm `/dashboard` redirects to `/today`  
   - BLOCKED for authenticated case.
   - Unauthenticated behavior observed: `/dashboard` -> `/sign-in?next=%2Fdashboard` (local + preview).
   - `insufficient evidence` for authenticated `/dashboard` -> `/today` runtime verification.

19. Confirm sign-out/auth gate still works  
   - PASS for auth gate (protected routes redirect to sign-in on both targets).
   - Sign-out itself not tested due never reaching authenticated state.
   - `insufficient evidence` for active sign-out flow.

## Console / network / Convex evidence

- Browser console (local + preview): warnings only (React DevTools/HMR/CursorBrowser dialog override), no fatal client exception surfaced in captured console output.
- Network failures:
  - Local: `POST http://localhost:3000/api/auth` -> `400`
  - Preview: `POST https://tempo-web-git-codex-phase3-brain-du-ad8017-amit-levins-projects.vercel.app/api/auth` -> `400`
- Convex-related evidence from active terminal logs:
  - Observed prior auth errors: `InvalidAccountId` and `Beta access is invite-only...` in auth flow logs.
  - Current founder magic-link failure did not expose backend error body in browser capture.
  - `insufficient evidence` to attribute current `400` to a single backend root cause without deeper server-side log correlation at the exact attempt timestamp.

## Screenshots captured

- `c:\Users\User\AppData\Local\Temp\cursor\screenshots\phase4-local-today-redirect-signin.png`
- `c:\Users\User\AppData\Local\Temp\cursor\screenshots\phase4-local-founder-password-fail-with-error.png`
- `c:\Users\User\AppData\Local\Temp\cursor\screenshots\phase4-local-dashboard-unauth-redirect.png`
- `c:\Users\User\AppData\Local\Temp\cursor\screenshots\phase4-preview-founder-magiclink-fail.png`
- `c:\Users\User\AppData\Local\Temp\cursor\screenshots\phase4-preview-dashboard-unauth-redirect.png`

## Commands run (evidence collection)

- `git status --short --branch`
- `git log --oneline --decorate -n 8`
- `gh pr view 21 --json number,title,state,isDraft,mergeStateStatus,mergeable,headRefName,baseRefName,url,statusCheckRollup`
- Env availability checks via `awk` on `.env.local` and `apps/web/.env.local` (keys + set/empty only)
- Browser MCP actions: tab listing, navigation, snapshotting, clicking/filling auth forms, console/network capture, screenshots

## Final report

- Branch/commit: `codex/phase3-brain-dump-plan-loop` @ `4e383b8`
- PR #21 state: OPEN, merge status `BLOCKED`, checks green
- Target tested: Local + Preview
- URL tested:
  - Local: `http://localhost:3000/today`, `http://localhost:3000/dashboard`
  - Preview: `https://tempo-web-git-codex-phase3-brain-du-ad8017-amit-levins-projects.vercel.app/today`, `.../dashboard`
- Authenticated `/today`: BLOCKED
- Brain dump input: BLOCKED
- AI prioritization: BLOCKED
- Local fallback: BLOCKED (not reachable)
- Add-to-Today: BLOCKED
- Quick-add regression: BLOCKED
- Today list regression: BLOCKED
- Empty/loading/error/stale states:
  - Auth error state: PASS (visible + reproducible)
  - Planner-specific states: `insufficient evidence` (auth-blocked)
- `/dashboard` redirect:
  - Unauth redirect-to-sign-in: PASS
  - Authenticated redirect-to-`/today`: `insufficient evidence` (auth-blocked)
- Console/network/Convex errors:
  - Network: `/api/auth` 400 on local + preview during founder auth attempts
  - Console: non-fatal warnings only
  - Convex: auth-related errors seen in logs (`InvalidAccountId`, invite-only), but current founder magic-link 400 root cause not directly exposed
- QA note path: `docs/phase4-brain-dump-validation.md`
- Exact blockers:
  1. Could not complete authentication for founder email (`password mismatch` + `magic-link send failed`).
  2. `POST /api/auth` returns 400 on both local and preview.
  3. Without authenticated session, `/today` planner loop is unreachable.
- Can Phase 4.5 start: NO
