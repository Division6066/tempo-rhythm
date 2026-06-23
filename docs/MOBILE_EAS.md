# Mobile — Expo & EAS

The mobile app lives in `apps/mobile/` (Expo SDK 54, Expo Router, NativeWind). Production builds use **EAS Build**; local dev uses Expo Go or a dev client.

## EAS project

Configured in `apps/mobile/app.json`:

| Field | Value |
|---|---|
| **Owner** | `amitlevin` |
| **Slug** | `tempi` |
| **Project ID** | `90dfac90-0baa-461b-946c-351d2306e607` |
| **iOS bundle ID** | `com.temporhythm.app` |
| **Android package** | `com.temporhythm.app` |
| **Scheme** | `tempo-rhythm` |

The EAS project is `@amitlevin/tempi` on expo.dev. CI agents and cloud runners need access to this Expo account (or a team invite) to run `eas build`.

## Build profiles

`apps/mobile/eas.json`:

| Profile | Distribution | Notes |
|---|---|---|
| `development` | internal | `developmentClient: true` — dev client with native modules |
| `preview` | internal | Ad-hoc / internal testing APK/IPA |
| `production` | store | `autoIncrement: true` for store version codes |

CLI minimum version: `>= 16.28.0`. App version source: `remote` (EAS manages build numbers).

## Common commands

From `apps/mobile/` (after `bun install` at repo root):

```bash
# Local dev (Windows-safe wrapper)
bun run dev

# EAS login (once per machine)
bunx eas login

# Internal preview build
bunx eas build --profile preview --platform all

# Production build (requires store credentials)
bunx eas build --profile production --platform ios
```

Secrets (RevenueCat keys, Convex URL overrides) belong in **EAS Secrets**, not in the repo:

```bash
bunx eas secret:create --name EXPO_PUBLIC_CONVEX_URL --value https://...
```

## Environment variables

Mobile reads Convex via `EXPO_PUBLIC_CONVEX_URL` (not `NEXT_PUBLIC_*`). See `apps/mobile/.env.example`.

`bun x convex dev` at the repo root writes deployment URLs; copy the cloud URL into `apps/mobile/.env.local` as `EXPO_PUBLIC_CONVEX_URL`.

## Cyrus / cloud agent setup

`cyrus-setup.sh` at the repo root installs Bun and runs `bun install --frozen-lockfile` in Cyrus-created worktrees. It does **not** run EAS builds or write EAS secrets — those are `human-amit` / `twin` actions.

## Related

- `docs/ENVIRONMENTS.md` — EAS secrets scope and four-mode contract
- `docs/REVENUECAT_SETUP.md` — subscription keys for mobile builds
- `docs/LOCAL_DEV_WINDOWS.md` — Windows-specific Expo/Bun setup
