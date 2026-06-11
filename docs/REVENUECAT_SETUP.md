# RevenueCat setup

Mobile subscriptions flow through RevenueCat. Server-side entitlement updates arrive via a Convex HTTP webhook. Web checkout may use Polar separately — see `docs/HARD_RULES.md` and the phase PRD.

## EAS / Expo project

Resolved 2026-06-04 (PR #43):

| Field | Value |
|---|---|
| Expo owner | `@amitlevin` |
| Project slug | `tempi` (historical spelling in Expo dashboard) |
| Project ID | `90dfac90-0baa-461b-946c-351d2306e607` |
| Display name | Tempo Rhythm |
| iOS bundle ID | `com.temporhythm.app` |
| Android package | `com.temporhythm.app` |
| URL scheme | `tempo-rhythm` |

Configured in `apps/mobile/app.json` (`expo.extra.eas.projectId`).

## Mobile client keys

Copy `apps/mobile/.env.example` → `apps/mobile/.env.local`.

| Variable | Scope | Notes |
|---|---|---|
| `EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY` | Dev only | Prefix `test_…`. Takes priority when set. **Never** ship to production builds. |
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | iOS store | Prefix `appl_…` |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | Play Store | Prefix `goog_…` |

Key resolution lives in `apps/mobile/utils/revenueCatConfig.ts`. The SDK context is `apps/mobile/contexts/RevenueCatContext.tsx`.

Payments are optional in dev: if no key is set, the app runs in preview/mock mode (`PAYMENT_SYSTEM_ENABLED` / `MOCK_PAYMENTS` in `apps/mobile/config/appConfig.ts`).

## Convex webhook (server)

HTTP route: `POST /api/revenuecat-webhook` (`convex/http.ts` → `convex/revenuecat.ts`).

| Convex env var | Purpose |
|---|---|
| `REVENUECAT_WEBHOOK_SECRET` | Must match the `Authorization` header RevenueCat sends |

In RevenueCat dashboard → Project → Integrations → Webhooks:

1. URL: `https://<your-deployment>.convex.site/api/revenuecat-webhook`
2. Authorization header: same value as `REVENUECAT_WEBHOOK_SECRET`
3. Enable lifecycle events you care about (`INITIAL_PURCHASE`, `RENEWAL`, `EXPIRATION`, `CANCELLATION`, …)

The handler calls `api.users.updateSubscriptionStatus` with `app_user_id` from the event payload. Map RevenueCat `app_user_id` to your Convex user identity in production.

## What not to do

- Do not add the Stripe SDK directly (forbidden — use RevenueCat).
- Do not commit API keys; public `EXPO_PUBLIC_*` keys are store-safe, webhook secret is server-only.
- Do not use a Test Store key in release builds — RevenueCat will alert or crash.

## Related

- [`docs/ENVIRONMENTS.md`](./ENVIRONMENTS.md) — `[EAS secrets]` scope
- [`.env.example`](../.env.example) — `REVENUECAT_WEBHOOK_SECRET` placeholder
- [`apps/mobile/.env.example`](../apps/mobile/.env.example) — client key placeholders
