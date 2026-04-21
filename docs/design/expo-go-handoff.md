# Expo Go + store handoff checklist (frontend-only)

This runbook covers how to validate the current frontend on device via Expo Go and what to prepare before EAS/app-store builds.

## Scope

- Frontend-only validation for mobile parity screens.
- No backend wiring is performed in this checklist.
- Backend requirements remain mapped in `docs/design/backend-wiring-spec.md`.

## Required environment variables (placeholder values only)

Set these before running Expo for meaningful end-to-end behavior:

- `EXPO_PUBLIC_CONVEX_URL=https://your-convex-dev-url`
- `EXPO_PUBLIC_OPENROUTER_API_KEY=placeholder` (used only after backend wiring)
- `EXPO_PUBLIC_REVENUECAT_API_KEY=placeholder` (used only after paywall wiring)
- `EXPO_PUBLIC_POSTHOG_KEY=placeholder` (optional; must remain consent-gated)

Do not commit real keys.

## Local preflight commands

Run from repository root:

- `bun run --filter tempo-rhythm-mobile typecheck`
- `bun run lint --filter tempo-rhythm-mobile`
- `bun run start --filter tempo-rhythm-mobile`

## Expo Go operator steps (Amit)

1. Install Expo Go on iOS/Android device.
2. From repo root, run:
   - `bun run start --filter tempo-rhythm-mobile`
3. Scan QR code from terminal with Expo Go.
4. Verify app opens in the Tempo shell and can navigate target routes.

## 12-screen parity smoke checklist

Validate these screens in Expo Go:

1. `(tempo)/(tabs)/today.tsx`
2. `(tempo)/capture.tsx`
3. `(tempo)/(tabs)/coach.tsx`
4. `(tempo)/(tabs)/tasks.tsx`
5. `(tempo)/(tabs)/notes.tsx`
6. `(tempo)/journal.tsx`
7. `(tempo)/habits.tsx`
8. `(tempo)/calendar.tsx`
9. `(tempo)/routines.tsx`
10. `(tempo)/templates.tsx`
11. `(tempo)/settings.tsx`
12. `(auth)/onboarding.tsx`

For each screen, confirm:

- screen loads without crash,
- major CTAs are visible and tappable,
- no severe text clipping/overlap in portrait viewport,
- pseudocode tags in source still map intended future backend behavior.

## Service readiness handoff

Before wiring tickets execute, confirm:

- Convex dev deployment is reachable.
- OpenRouter key is provisioned (for AI/voice actions).
- RevenueCat keys are provisioned (for paywall/entitlements).
- PostHog key remains optional and only active when user consent is enabled.

## Related tickets

- EAS/build profile setup: `T-0206`
- Production mobile build prep: `T-0709`
- TestFlight submission workflow: `T-0710`
- Play internal testing workflow: `T-0711`
