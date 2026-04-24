# Phase 2 Localhost QA - 2026-04-24

## Purpose

Capture the actual localhost evidence for the Phase 2 route/auth slice after the gradual-commit review and the follow-up bug-fix pass.

## Branch and baseline

- Branch: `codex/friday-phase2-gradual-commit`
- Reviewed commits:
  - `d23d34e` - `docs(env): define Friday environment and ship-state contract`
  - `aca1de3` - `feat(web): make today the canonical daily route`

## Working-tree reality during QA

- The repo is not clean during this QA pass.
- Dirty tracked files included:
  - `.claude/settings.json`
  - `.github/workflows/ci.yml`
  - `apps/web/.env.example`
  - `apps/web/app/(auth)/layout.tsx`
  - `apps/web/app/sign-in/page.tsx`
  - `apps/web/app/sign-up/page.tsx`
  - `apps/web/components/auth/SignUpForm.tsx`
  - `apps/web/components/today/TodayScreen.tsx`
  - `apps/web/components/today/TodayTaskList.tsx`
  - `docs/SHIP_STATE.md`
- Untracked files included:
  - `.tmp/`
  - `apps/web/components/today/TodayBrainDumpPanel.tsx`
  - `apps/web/lib/brainDumpPrioritizer.ts`
  - `docs/PHASE2_LOCALHOST_QA_2026-04-24.md`

## Commands run

```powershell
git status --short
bun run typecheck
bun run lint
bun run build
python .agents\skills\webapp-testing\scripts\with_server.py --server ".tmp\phase2-qa-artifacts\start-web-3002.cmd" --port 3002 -- python .tmp\phase2-qa-artifacts\phase2_auth_today_qa.py http://127.0.0.1:3002 .tmp\phase2-qa-artifacts
bun x convex env get BETA_ALLOWLIST_EMAILS
bun x convex env get BETA_MAX_TESTERS
bun x convex env set BETA_ALLOWLIST_EMAILS "tempo-phase2-qa@example.com,tempo-phase2-qa-2@example.com"
bun x convex env set BETA_MAX_TESTERS 999
```

## Code changes validated in this pass

- `apps/web/app/(auth)/layout.tsx` no longer blocks auth pages behind the old loading gate.
- `apps/web/app/sign-in/page.tsx` and `apps/web/app/sign-up/page.tsx` redirect only when authenticated, with sanitized `next`.
- `apps/web/components/auth/SignUpForm.tsx` now uses a real checkbox for terms/privacy consent.
- `apps/web/components/today/TodayTaskList.tsx` now excludes `cancelled` rows from the open-task count and visible list.
- `convex/auth.config.ts` was restored to `process.env.CONVEX_SITE_URL` after a failed experiment; the Convex Auth scaffold expects the site URL there.

## Static validation

- `bun run typecheck` passed.
- `bun run lint` passed.
- `bun run build` passed.

## Browser QA artifacts

- Results JSON: `.tmp/phase2-qa-artifacts/phase2-qa-results.json`
- Screenshots:
  - `.tmp/phase2-qa-artifacts/phase2-unauth-today.png`
  - `.tmp/phase2-qa-artifacts/phase2-unauth-dashboard.png`
  - `.tmp/phase2-qa-artifacts/phase2-sign-up-before-submit.png`
  - `.tmp/phase2-qa-artifacts/phase2-sign-up-result.png`

## Verified results

- Unauthenticated `/today` redirected to `/sign-in?next=%2Ftoday`.
- Unauthenticated `/dashboard` redirected to `/sign-in?next=%2Fdashboard`.
- Production-style localhost build on `http://127.0.0.1:3002` served successfully for QA.

## Failed results (earlier pass — resolved)

- Earlier password sign-up/sign-in failed with HTTP `400` and body `{"error":""}` because `NEXT_PUBLIC_CONVEX_URL` pointed at a **legacy non-regional** `*.convex.cloud` host that returned an empty **404** from `POST /api/action`.
- After updating `NEXT_PUBLIC_CONVEX_URL` to the **regional** dashboard URL and restarting `next dev`, password sign-in returns `200` with tokens and the UI surfaces normal validation errors again.

## Support configuration applied during QA

- Dev Convex env only:
  - `BETA_ALLOWLIST_EMAILS=tempo-phase2-qa@example.com,tempo-phase2-qa-2@example.com`
  - `BETA_MAX_TESTERS=999`
- No deploy, merge, or production environment change was performed.

## Local-only environment findings

- `apps/web/.env.local` must set `NEXT_PUBLIC_CONVEX_URL` to the **full regional** deployment URL from the Convex dashboard (Settings → URL & Deploy Key), e.g. `https://<deployment>.<region>.convex.cloud`.
- A legacy non-regional `https://<deployment>.convex.cloud` host returned **HTTP 404 with an empty body** from `POST /api/action`, which Convex’s HTTP client surfaces as `Error` with an **empty `.message`**, and `@convex-dev/auth` then returns `400 {"error":""}` from `/api/auth`.
- `apps/web/components/providers/providers.tsx` now throws a clear startup error if the hostname looks like the legacy three-label `*.convex.cloud` pattern.
- `CONVEX_SITE_URL` on the Convex side is a built-in variable (issuer / HTTP actions); it cannot be overridden from the CLI.

## Current conclusion

- The route protection part of the Phase 2 slice remains locally verified.
- Password auth is locally verified end-to-end after switching `NEXT_PUBLIC_CONVEX_URL` to the regional `.convex.cloud` URL and restarting `next dev` (and `bun x convex dev` where applicable).
- Authenticated `/today`, `/dashboard` → `/today`, and sign-out were re-checked in the browser on this branch after the URL correction.
