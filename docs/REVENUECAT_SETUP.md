# RevenueCat setup (mobile)

Tempo mobile uses RevenueCat for subscription entitlements. Web billing may use Polar separately — see `apps/web` checkout routes and the phase PRD.

## EAS project

Mobile builds are tied to the Expo Application Services (EAS) project configured in `apps/mobile/app.json`:

| Field | Value |
|---|---|
| **Owner** | `amitlevin` |
| **Slug** | `tempi` |
| **Project ID** | `90dfac90-0baa-461b-946c-351d2306e607` |
| **iOS bundle ID** | `com.temporhythm.app` |
| **Android package** | `com.temporhythm.app` |

Build profiles live in `apps/mobile/eas.json` (`development`, `preview`, `production`).

```bash
cd apps/mobile
bunx eas whoami          # must be @amitlevin or a collaborator
bunx eas build --profile preview --platform ios
```

EAS ownership changes are **RED-tier** per `docs/AGENT_AUTOMATION_RUNBOOK.md` — agents must not re-point the project without Amit.

## Environment variables

Copy `apps/mobile/.env.example` → `apps/mobile/.env.local`. Keys are **public** RevenueCat SDK keys (safe in client bundles). Server-side RevenueCat secret keys belong in Convex dashboard env vars only (see `docs/HARD_RULES.md` §13).

| Variable | When to set | Prefix |
|---|---|---|
| `EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY` | Local dev / internal builds only | `test_` |
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | iOS production / TestFlight | `appl_` |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | Android production / internal testing | `goog_` |

Resolution order is implemented in `apps/mobile/utils/revenueCatConfig.ts`:

1. Test Store key (if set) — **development only**; SDK will error if used in store builds.
2. Platform production key (`appl_` / `goog_`).
3. `null` — app runs without paywall (useful for UI-only work).

Convex connection vars (`EXPO_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT`) are required independently — see `apps/mobile/.env.example`.

## Runtime wiring

- `apps/mobile/contexts/RevenueCatContext.tsx` — SDK init and entitlement state.
- `apps/mobile/utils/revenueCatConfig.ts` — key selection per platform.
- Web entitlement mirror (when implemented) flows through Convex + RevenueCat webhooks per HARD_RULES §8.

## Local development without keys

Leave RevenueCat env vars unset. `isRevenueCatConfigured()` returns false and paywall UI should degrade gracefully. Do not commit real keys.

## Dashboard tasks (human / Twin)

Product catalog, App Store Connect linkage, Play Console linkage, and webhook URLs are dashboard operations — not repo changes. Track in `docs/brain/TASKS.md` with owner `twin` or `human-amit`.

## Related docs

- [`docs/ENVIRONMENTS.md`](./ENVIRONMENTS.md) — four-mode contract; EAS secrets for deployment mode
- [`docs/HARD_RULES.md`](./HARD_RULES.md) §8 payments, §13 secrets
- [`apps/mobile/.env.example`](../apps/mobile/.env.example)
