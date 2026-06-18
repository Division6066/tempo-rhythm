# RevenueCat setup (mobile)

Tempo mobile entitlements flow through [RevenueCat](https://www.revenuecat.com/). Server-side verification for production should eventually write entitlements to Convex via RevenueCat webhooks (see `docs/HARD_RULES.md` §7).

This doc covers **client-side** setup in `apps/mobile`.

## EAS project

Mobile builds use Expo Application Services (EAS). Project metadata lives in `apps/mobile/app.json`:

| Field | Value |
|---|---|
| Expo slug | `tempi` |
| EAS owner | `amitlevin` |
| EAS project ID | `90dfac90-0baa-461b-946c-351d2306e607` |
| iOS bundle ID | `com.temporhythm.app` |
| Android package | `com.temporhythm.app` |

Build profiles: `apps/mobile/eas.json` (`development`, `preview`, `production`).

```bash
cd apps/mobile
bunx eas login          # once per machine
bunx eas build --profile preview --platform ios
```

Secrets for store builds belong in **EAS secrets**, not in git. See `docs/ENVIRONMENTS.md` for the four-mode contract.

## Environment variables

Copy `apps/mobile/.env.example` → `apps/mobile/.env.local`. RevenueCat keys are optional for local dev without purchases.

| Variable | When | Prefix |
|---|---|---|
| `EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY` | Local / dev testing only | `test_` |
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | iOS production builds | `appl_` |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | Android production builds | `goog_` |

**Critical:** Never ship a Test Store key (`test_…`) in a production or store build. RevenueCat SDK will error if misconfigured.

## Key resolution (code)

`apps/mobile/utils/revenueCatConfig.ts` picks the key in this order:

1. Test Store key (if set) — highest priority, dev only
2. Platform production key (`ios` → `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`, `android` → `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`)
3. `null` — app runs without purchases; `RevenueCatProvider` surfaces a Hebrew alert when purchase UI is invoked without keys

`isRevenueCatConfigured()` returns whether a key resolved for the current platform.

## Provider wiring

- `apps/mobile/contexts/RevenueCatContext.tsx` — initializes the SDK, exposes purchase helpers
- Wrap the app tree with `RevenueCatProvider` (see `apps/mobile/app/_layout.tsx`)

## Dashboard checklist (human-amit)

1. Create RevenueCat project linked to App Store Connect + Google Play.
2. Create entitlement identifiers matching Convex / product tiers (Basic / Pro / Max per PRD).
3. Copy public API keys into EAS secrets for each build profile.
4. Configure webhook → Convex HTTP action when server verification lands.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Alert: keys not configured | No env vars in `.env.local` or EAS secrets |
| Crash on production build | Test Store key left in production env |
| Purchases work in dev, not TestFlight | Preview/production profile missing `appl_` / `goog_` keys in EAS |
| SDK initializes but no offerings | RevenueCat dashboard products not linked to stores |

## Related docs

- [`apps/mobile/.env.example`](../apps/mobile/.env.example)
- [`docs/ENVIRONMENTS.md`](./ENVIRONMENTS.md)
- [`docs/HARD_RULES.md`](./HARD_RULES.md) §7 (payments)
