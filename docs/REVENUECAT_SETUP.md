# RevenueCat setup

RevenueCat is the subscription layer for iOS, Android, and (eventually) web. Server-side entitlement sync runs through a Convex HTTP webhook; client SDK keys are public and ship in app env vars.

**Ship state:** webhook handler is coded (`convex/revenuecat.ts`); dashboard products and client keys are not yet wired for production. See `docs/SHIP_STATE.md`.

## Architecture

```
Mobile / Web client
  → RevenueCat SDK (public API keys)
  → App Store / Play Store / web checkout

RevenueCat dashboard
  → POST https://<deployment>.convex.site/api/revenuecat-webhook
  → convex/revenuecat.ts (httpAction)
  → api.users.updateSubscriptionStatus (mutation)
```

The webhook validates `Authorization` against `REVENUECAT_WEBHOOK_SECRET` (Convex env var). On lifecycle events (`INITIAL_PURCHASE`, `RENEWAL`, `EXPIRATION`, etc.) it updates the user's `userType` and entitlement list in Convex.

## Environment variables

### Convex dashboard (server)

| Variable | Required | Purpose |
|---|---|---|
| `REVENUECAT_WEBHOOK_SECRET` | Yes (production) | Must match the Authorization header RevenueCat sends to the webhook |
| `REVENUECAT_API_KEY` | Deferred | Server-side RevenueCat REST calls (not yet used in code) |

Set in Convex → Settings → Environment Variables for each deployment (dev / prod).

### Web (`apps/web/.env.local` / Vercel)

Public client keys will live here when the web paywall ships. Root `.env.example` documents deferred `REVENUECAT_*` vars.

### Mobile (`apps/mobile/.env.local` / EAS secrets)

| Variable | Scope | Purpose |
|---|---|---|
| `EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY` | Dev only | RevenueCat Test Store |
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | iOS builds | `appl_…` public SDK key |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | Android builds | `goog_…` public SDK key |

See `apps/mobile/.env.example` for placeholders.

## Webhook configuration (RevenueCat dashboard)

1. Open your RevenueCat project (linked to Expo app slug `tempi`, owner `amitlevin`).
2. **Integrations → Webhooks → Add**.
3. **URL:** `https://<your-deployment>.convex.site/api/revenuecat-webhook`
   - Dev: use your `dev:*` deployment URL from `CONVEX_DEPLOYMENT`.
   - Prod: use the production Convex site URL.
4. **Authorization header:** generate a long random secret; set the same value as `REVENUECAT_WEBHOOK_SECRET` in Convex.
5. Enable events: `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`, `PRODUCT_CHANGE`, `UNCANCELLATION`.

The handler returns HTTP 200 even on internal mutation errors so RevenueCat does not retry indefinitely — check Convex logs for `[RevenueCat Webhook]` errors.

## App user ID

RevenueCat `app_user_id` should match the Convex user's email (or stable subject) so `api.users.updateSubscriptionStatus` can resolve the account. See `convex/users.ts` for the lookup path.

## Local development

- Without RevenueCat keys, the app runs in free-tier mode; paywall UI may be hidden or stubbed per feature flags.
- Test webhooks with RevenueCat's sandbox and a dev Convex deployment; never point sandbox webhooks at production Convex.

## Related docs

- `docs/MOBILE_EAS.md` — EAS build profiles and secrets
- `docs/ENVIRONMENTS.md` — four-mode env contract
- `docs/HARD_RULES.md` §6 (payments) — RevenueCat only; no Stripe direct SDK
