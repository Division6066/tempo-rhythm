# RevenueCat setup (mobile)

RevenueCat handles in-app subscriptions on iOS and Android. Web checkout in this repo may use Polar separately — see the Phase 1 PRD for the long-term split.

## When you need this

RevenueCat is **optional for local development**. The app runs without API keys; paywall features stay disabled until keys are configured.

Enable RevenueCat when working on subscriptions, entitlements, or the billing settings screen.

## EAS project

| Field | Value |
|---|---|
| Expo slug | `tempi` |
| EAS owner | `amitlevin` |
| Project ID | `90dfac90-0baa-461b-946c-351d2306e607` |

Configured in `apps/mobile/app.json` under `expo.extra.eas.projectId`. Cloud builds use profiles in `apps/mobile/eas.json` (`development`, `preview`, `production`).

## Environment variables

Copy `apps/mobile/.env.example` → `apps/mobile/.env.local`. Keys are read in `apps/mobile/utils/revenueCatConfig.ts`:

| Variable | Prefix | Use |
|---|---|---|
| `EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY` | `test_...` | **Development only.** Takes priority when set. Must not ship in production builds. |
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | `appl_...` | iOS App Store |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | `goog_...` | Google Play |

Resolution order in code:

1. Test Store key (if set) — for dev/simulator testing
2. Platform-specific production key (`appl_` / `goog_`)
3. `null` — RevenueCat stays uninitialized; `isRevenueCatConfigured()` returns false

## Dashboard setup (human-amit / twin)

1. Create or open the RevenueCat project linked to bundle ID `com.temporhythm.app` (iOS) and package `com.temporhythm.app` (Android).
2. Create products and entitlements matching Tempo tier names in the PRD (Basic / Pro / Max).
3. Copy API keys into EAS secrets or local `.env.local` — never commit values.
4. Configure RevenueCat webhooks → Convex (server-side entitlement sync) when that integration lands; until then, mobile SDK state is client-only.

## Constraints

- **No Stripe SDK** in the mobile app — RevenueCat wraps store billing (HARD_RULES §2).
- **Test Store keys in production builds** will crash or alert at runtime — use platform keys for `production` EAS profile.
- Public `EXPO_PUBLIC_*` keys are safe in client bundles; secret keys belong only in Convex actions for webhook verification.

## Related docs

- [`docs/ENVIRONMENTS.md`](./ENVIRONMENTS.md) — four-mode contract (dev / test / preview / deployment)
- [`docs/HARD_RULES.md`](./HARD_RULES.md) §2 (payments) and §13 (secrets)
- [`apps/mobile/contexts/RevenueCatContext.tsx`](../apps/mobile/contexts/RevenueCatContext.tsx) — SDK initialization
