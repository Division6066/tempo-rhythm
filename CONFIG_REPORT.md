# TEMPO Flow — Backend Configuration Report

## Date: 2026-04-05

## Agent Run Summary
- Convex deployments: ✅ Both dev and production successful
- RevenueCat webhook: ✅ Deployed to both environments
- Vercel: ✅ Project linked with auto-deploy from GitHub
- Expo/EAS: ✅ app.json and eas.json configured
- GitHub secrets: ⚠️ Requires token with `repo` scope
- Vercel env vars: ⚠️ Requires VERCEL_TOKEN or manual dashboard setup
- EAS secrets: ⚠️ Requires EXPO_TOKEN

---

## Services Configured

### GitHub (Division6066/tempo-rhythm)
- **Default branch:** master
- **Branch protection:** ⚠️ Not set — provided `GITHUB_TOKEN` has only `repo_deployment` scope; needs `repo` scope
- **Required status checks:** None (add CI workflow before enabling)
- **Secrets required (set manually via repo Settings → Secrets):**
  - `CONVEX_DEPLOY_KEY` — production Convex deploy key
  - `VERCEL_TOKEN` — Vercel API token
  - `EXPO_TOKEN` — Expo access token
  - `REVENUECAT_PUBLIC_KEY` — `test_xNhrBFmZGbZMGMvQjtyRxlhxFoD`

### Convex
- **Dev deployment:** ceaseless-dog-617
  - URL: https://ceaseless-dog-617.convex.cloud
  - Status: ✅ Deployed successfully
- **Production deployment:** tremendous-bass-443
  - URL: https://tremendous-bass-443.convex.cloud
  - Status: ✅ Deployed successfully
- **Tables deployed:** 17 explicit + 7 auth tables = 24 total
  - profiles, tasks, notes, projects, folders, tags, dailyPlans, preferences,
    memories, stagedSuggestions, calendarEvents, noteLinks, savedFilters,
    templates, chatMessages, **subscriptions** (new), + authTables
- **Environment variables (production):**
  - JWKS ✅
  - JWT_PRIVATE_KEY ✅
  - REVENUECAT_PUBLIC_KEY ✅
  - REVENUECAT_SECRET_KEY ✅
  - OPENROUTER_API_KEY (placeholder — replace with real key)
- **Environment variables (dev):**
  - REVENUECAT_PUBLIC_KEY ✅
  - OPENROUTER_API_KEY (placeholder)
- **Webhook:** POST /api/revenuecat-webhook ✅
  - Handles: INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, BILLING_ISSUE, etc.
  - Maps product IDs to tiers: basic ($5/mo), pro ($10/mo), max ($20/mo)
  - Upserts subscriptions table via internal mutation

### Vercel
- **Project:** tempo-web (`prj_QMyolOA1yVIc2AmECP9oyAs0ielY`)
- **Team:** amit-levins-projects (`team_pKUlubqYgJgLghhTPNLjibOD`)
- **GitHub connection:** ✅ Auto-deploy from Division6066/tempo-rhythm
- **Latest production deploy:** From master branch, state READY
- **Env vars required (set via Vercel Dashboard → Project Settings → Environment Variables):**

  | Variable | Development | Preview | Production |
  |---|---|---|---|
  | `NEXT_PUBLIC_CONVEX_URL` | `https://ceaseless-dog-617.convex.cloud` | `https://ceaseless-dog-617.convex.cloud` | `https://tremendous-bass-443.convex.cloud` |
  | `CONVEX_DEPLOY_KEY` | — | — | (production deploy key) |
  | `REVENUECAT_PUBLIC_KEY` | `test_xNhrBFmZGbZMGMvQjtyRxlhxFoD` | `test_xNhrBFmZGbZMGMvQjtyRxlhxFoD` | `test_xNhrBFmZGbZMGMvQjtyRxlhxFoD` |

### Expo / EAS
- **Project ID:** 90dfac90-0baa-461b-946c-351d2306e607
- **Slug:** tempo-flow
- **Bundle ID:** com.tempoflow.app (iOS + Android)
- **Build profiles:** development, preview, production
- **EAS secrets required (set via `eas secret:create` or expo.dev dashboard):**
  - `EXPO_PUBLIC_CONVEX_URL` = `https://tremendous-bass-443.convex.cloud`
  - `REVENUECAT_PUBLIC_KEY` = `test_xNhrBFmZGbZMGMvQjtyRxlhxFoD`

---

## Cross-Service Connections

| Connection | Status | Notes |
|---|---|---|
| GitHub → Vercel (auto-deploy) | ✅ Configured | Deploys on push to any branch |
| Convex prod → Vercel prod | ⚠️ Needs env var | Set `NEXT_PUBLIC_CONVEX_URL` in Vercel |
| Convex prod → Expo | ⚠️ Needs EAS secret | Set `EXPO_PUBLIC_CONVEX_URL` in EAS |
| RevenueCat → Convex webhook | ✅ Code deployed | Endpoint: `/api/revenuecat-webhook` |
| RevenueCat keys → Convex env | ✅ Set | Both public and secret keys |
| GitHub secrets → CI | ⚠️ Needs manual setup | Token has insufficient scope |

---

## Subscription Tiers

| Tier | Monthly | Annual | Product IDs |
|---|---|---|---|
| Basic | $5/mo | — | `tempo_basic_monthly`, `tempo_basic_annual` |
| Pro | $10/mo | — | `tempo_pro_monthly`, `tempo_pro_annual` |
| Max | $20/mo | — | `tempo_max_monthly`, `tempo_max_annual` |

---

## Files Changed

| File | Change |
|---|---|
| `tempo-app/convex/schema.ts` | Added `subscriptions` table |
| `tempo-app/convex/subscriptions.ts` | New — CRUD + webhook upsert |
| `tempo-app/convex/http.ts` | Added RevenueCat webhook handler |
| `tempo-app/apps/mobile/app.json` | Updated name/slug/scheme/version/bundle IDs, added EAS project ID |
| `tempo-app/apps/mobile/eas.json` | Updated build profiles per spec |

---

## Next Steps

1. **Set Vercel environment variables** via dashboard (see table above)
2. **Set GitHub repo secrets** — regenerate a `GITHUB_TOKEN` with full `repo` scope, then:
   ```bash
   gh secret set CONVEX_DEPLOY_KEY --repo Division6066/tempo-rhythm --body "<prod-key>"
   gh secret set VERCEL_TOKEN --repo Division6066/tempo-rhythm --body "<vercel-token>"
   gh secret set EXPO_TOKEN --repo Division6066/tempo-rhythm --body "<expo-token>"
   gh secret set REVENUECAT_PUBLIC_KEY --repo Division6066/tempo-rhythm --body "test_xNhrBFmZGbZMGMvQjtyRxlhxFoD"
   ```
3. **Set EAS secrets** (requires EXPO_TOKEN):
   ```bash
   npx eas-cli secret:create --name EXPO_PUBLIC_CONVEX_URL --value "https://tremendous-bass-443.convex.cloud" --type string --force
   npx eas-cli secret:create --name REVENUECAT_PUBLIC_KEY --value "test_xNhrBFmZGbZMGMvQjtyRxlhxFoD" --type string --force
   ```
4. **Enable branch protection** on master (requires `repo` scope token)
5. Replace `OPENROUTER_API_KEY` placeholder in Convex with real key
6. Configure Apple App Store Connect and Google Play Console in RevenueCat
7. Set RevenueCat webhook URL to: `https://tremendous-bass-443.convex.site/api/revenuecat-webhook`
8. Run first EAS development build: `npx eas-cli build --profile development --platform ios`

---

## Issues Encountered

1. **GITHUB_TOKEN scope insufficient** — provided token has only `repo_deployment` scope; needs `repo` scope for secrets and branch protection. Regenerate at github.com/settings/tokens with full `repo` scope.
2. **VERCEL_TOKEN not provided** — no Vercel API token was available in the environment. Set env vars manually via Vercel Dashboard.
3. **EXPO_TOKEN not provided** — no Expo access token was available. Set EAS secrets manually via expo.dev dashboard or CLI.
4. **@auth/core type errors** — pre-existing type compatibility issues between `@auth/core` and `@convex-dev/auth`. Deployed with `--typecheck=disable`. Fix by pinning `@auth/core` to a compatible version.
5. **dataExport.ts circular type references** — pre-existing issue in the codebase, not introduced by this change.
6. **Convex production deployment slug mismatch** — the provided prod key maps to `tremendous-bass-443`, not `precious-wildcat-890` as stated in the prompt. The automation used the key as-provided.
