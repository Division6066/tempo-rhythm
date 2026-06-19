# RevenueCat setup (mobile)

Tempo Flow uses [RevenueCat](https://www.revenuecat.com/) for mobile entitlements (iOS + Android). Web checkout in this repo currently uses Polar — see `apps/web/app/checkout/`.

**Implementation:** `apps/mobile/utils/revenueCatConfig.ts`, `apps/mobile/contexts/RevenueCatContext.tsx`.

---

## EAS / Expo project

Mobile builds target the Expo project configured in `apps/mobile/app.json`:

| Field | Value |
|---|---|
| Owner | `@amitlevin` |
| Slug | `tempi` |
| EAS project ID | `90dfac90-0baa-461b-946c-351d2306e607` |
| Bundle ID (iOS) | `com.temporhythm.app` |
| Package (Android) | `com.temporhythm.app` |

See `docs/ENVIRONMENTS.md` for the four-mode env contract and EAS secret scope.

---

## Client env vars (mobile)

Copy `apps/mobile/.env.example` → `apps/mobile/.env.local`. RevenueCat keys are **optional** for local dev — the app runs without them when no key is set.

| Variable | Prefix | When to use |
|---|---|---|
| `EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY` | `test_` | Development / Expo Go only. Takes priority over platform keys. **Never ship a production build with this key.** |
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | `appl_` | iOS production / TestFlight builds |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | `goog_` | Android production builds |

Key resolution order (from `getRevenueCatApiKey`):

1. Test Store key (if set)
2. Platform-specific iOS or Android key
3. `null` — RevenueCat disabled; paywall UI may show a setup message

---

## Server env vars (Convex)

Set in the **Convex dashboard** (not in client bundles):

| Variable | Purpose |
|---|---|
| `REVENUECAT_API_KEY` | Server-side RevenueCat REST API (entitlement verification) |
| `REVENUECAT_WEBHOOK_SECRET` | Validates incoming RevenueCat webhooks writing to Convex |

Placeholders are documented in root `.env.example`. Public SDK keys are safe client-side; secret keys stay server-side per `docs/HARD_RULES.md` §13.

---

## Local development without keys

If no `EXPO_PUBLIC_REVENUECAT_*` vars are set, `isRevenueCatConfigured()` returns `false` and the app skips SDK initialization. This is intentional — core planner features work without billing wired.

To test purchases locally:

1. Create a RevenueCat project linked to the `tempi` EAS app.
2. Add a **Test Store** API key to `apps/mobile/.env.local`.
3. Use a development build or Expo Go; confirm the key prefix is `test_`.

---

## Production checklist

- [ ] iOS `appl_` and Android `goog_` keys in EAS secrets (not committed)
- [ ] No `test_` key in production / preview EAS profiles
- [ ] `REVENUECAT_API_KEY` + `REVENUECAT_WEBHOOK_SECRET` in Convex production env
- [ ] Webhook endpoint registered in RevenueCat dashboard → Convex HTTP route

---

## Related

- [`apps/mobile/.env.example`](../apps/mobile/.env.example) — variable names
- [`docs/ENVIRONMENTS.md`](./ENVIRONMENTS.md) — `[EAS secrets]` scope
- [`docs/HARD_RULES.md`](./HARD_RULES.md) — §2 (no Stripe SDK), §13 (secret handling)
