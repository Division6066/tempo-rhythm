# Vercel dashboard checklist — `apps/web` (tempo-rhythm)

Use this after any monorepo or env change so Preview/Production stay aligned with [apps/web/vercel.json](../apps/web/vercel.json) and [apps/web/.env.example](../apps/web/.env.example).

## Project linkage

- [ ] **Git** → Project is linked to the correct repo (`Division6066/tempo-rhythm` or your canonical org fork).
- [ ] **Production branch** = `master`.
- [ ] No orphan Vercel projects still subscribed to the same repo (avoids duplicate failing builds per PR).

## Build & deploy settings

- [ ] **Root Directory** = `apps/web`.
- [ ] **Include files outside Root Directory** = **ON** (required: install runs `cd ../.. && bun install --frozen-lockfile`).
- [ ] **Framework preset** = Next.js.
- [ ] **Install / Build / Output / Development commands** = **empty** in the dashboard so values come from `vercel.json` (avoids "dashboard overrides file" drift).
  - Expected effective commands: install `cd ../.. && bun install --frozen-lockfile`, build `next build`, output `.next`, ignore `bun x turbo-ignore tempo-rhythm-web || exit 1`.
- [ ] **Node.js** = 22.x (or any version ≥ 20.19 for Next 16).

## Environment variables (names only — set values in dashboard)

Scope each var for **Production**, **Preview**, and **Development** as needed. Never commit secrets.

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_CONVEX_URL` | Required for client + middleware. |
| `NEXT_PUBLIC_POSTHOG_KEY` | Optional (analytics). |
| `NEXT_PUBLIC_POSTHOG_HOST` | Optional; default in `.env.example`. |
| `NEXT_PUBLIC_POLAR_MONTHLY_PRODUCT_ID` | Billing UI. |
| `NEXT_PUBLIC_POLAR_YEARLY_PRODUCT_ID` | Billing UI. |
| `POLAR_ACCESS_TOKEN` | Server-only checkout route. |
| `POLAR_SUCCESS_URL` | Server-only checkout redirect. |

Optional overrides (defaults exist in code):

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_TERMS_URL` | Optional. |
| `NEXT_PUBLIC_PRIVACY_URL` | Optional. |

### Convex deploy key

- [ ] **`CONVEX_DEPLOY_KEY`**: remove from Vercel unless you intentionally run `convex deploy` from the Vercel build. Current repo contract keeps Convex deploys **outside** Vercel (`bun x convex deploy` / CI); the build does not need this key and leaving it increases rotation/footgun risk.

## After a PR

1. Open the PR → wait for the Vercel check.
2. Open the **Preview URL** → confirm app loads and auth/Convex works against the configured `NEXT_PUBLIC_CONVEX_URL`.
3. If build fails: map log lines → wrong root / missing "include outside root" / missing env / workspace install not running from repo root.

## Preview vs production Convex (policy)

If Preview uses the **same** Convex deployment as Production, design QA can write to prod-shaped data. When you add a dev/staging Convex deployment, set Preview-only `NEXT_PUBLIC_CONVEX_URL` in Vercel (Preview scope) and keep Production on prod.
