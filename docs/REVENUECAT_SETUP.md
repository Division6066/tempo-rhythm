# RevenueCat setup

Tempo Flow uses RevenueCat for mobile subscription entitlements. Server-side state is updated via a Convex HTTP webhook. Web checkout may use Polar separately — see `docs/SHIP_STATE.md` for what is shipped vs planned.

---

## Architecture

```
Mobile app (Expo)
  └─ RevenueCat SDK via RevenueCatContext
       └─ EXPO_PUBLIC_REVENUECAT_* API keys (client)

RevenueCat dashboard
  └─ Webhook → POST {CONVEX_URL}/api/revenuecat-webhook
       └─ convex/revenuecat.ts validates REVENUECAT_WEBHOOK_SECRET
            └─ updates user subscription tier in Convex
```

Key files:

| Path | Role |
|---|---|
| `apps/mobile/utils/revenueCatConfig.ts` | Resolves platform API key from env |
| `apps/mobile/contexts/RevenueCatContext.tsx` | SDK init, packages, premium state |
| `apps/mobile/app/(auth)/paywall/index.tsx` | Paywall UI |
| `convex/revenuecat.ts` | Webhook handler |
| `convex/http.ts` | Registers `/api/revenuecat-webhook` |

---

## Mobile env vars

Copy `apps/mobile/.env.example` to `apps/mobile/.env.local`. RevenueCat keys are **optional** for local dev — the app runs in preview/mock mode when no key is set.

| Variable | Scope | Prefix | When to use |
|---|---|---|---|
| `EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY` | Client | `test_` | Local dev / Test Store only. **Never** ship to production builds. |
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | Client | `appl_` | iOS production / TestFlight |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | Client | `goog_` | Android production |

Key resolution order (see `getRevenueCatApiKey`):

1. Test Store key, if set (wins over platform keys)
2. Platform-specific iOS or Android key

`PAYMENT_SYSTEM_ENABLED` and `MOCK_PAYMENTS` in `apps/mobile/config/appConfig.ts` control whether purchases are live or mocked.

---

## Convex webhook

Set in the **Convex dashboard** for each deployment (not in `.env.local`):

| Variable | Purpose |
|---|---|
| `REVENUECAT_WEBHOOK_SECRET` | Must match the `Authorization` header RevenueCat sends |

Webhook URL pattern:

```
https://<your-deployment>.convex.site/api/revenuecat-webhook
```

Configure in RevenueCat → Project → Integrations → Webhooks. The handler in `convex/revenuecat.ts` maps lifecycle events (`INITIAL_PURCHASE`, `RENEWAL`, `EXPIRATION`, etc.) to `free` / `paid` user type.

---

## EAS project

Expo/EAS project: `@amitlevin/tempi` (project ID `90dfac90-0baa-461b-946c-351d2306e607`). See `docs/ENVIRONMENTS.md` for the four-mode env contract and EAS secret scope.

Production API keys for store builds belong in **EAS secrets**, not committed env files.

---

## Local development without keys

1. Set `CONVEX_DEPLOYMENT` and `EXPO_PUBLIC_CONVEX_URL` (required).
2. Omit RevenueCat keys — `isRevenueCatConfigured()` returns false and the paywall degrades gracefully.
3. Use `MOCK_PAYMENTS=true` in app config when testing purchase flows without StoreKit / Play Billing.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| SDK crash on production build | Test Store key (`test_`) in a release build | Use `appl_` / `goog_` keys for store builds |
| Webhook 401 | `REVENUECAT_WEBHOOK_SECRET` mismatch | Align Convex env and RevenueCat webhook auth header |
| Premium state not updating | Webhook URL points at wrong deployment | Confirm URL uses `.convex.site` for the target deployment |
| Paywall shows but purchase fails | Expo Go limitation | Use dev client or EAS build for native purchases |

---

## Related

- [`docs/ENVIRONMENTS.md`](./ENVIRONMENTS.md) — env precedence and EAS scope
- [`docs/HARD_RULES.md`](./HARD_RULES.md) — §8 (payments; RevenueCat only, no Stripe SDK)
