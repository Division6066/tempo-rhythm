# `claude-web-settings` — Settings checklist

> **Owner of:** `settings` (profile), `settings-prefs`, `settings-integrations`, `billing`, `trial-end`, `ask-founder`, `notifications`.

---

## Pre-flight

- [ ] Read `docs/HARD_RULES.md` §7.2 (typography incl. OpenDyslexic toggle), §9 (voice budgets), §10 (privacy & DSR).

## Source-file fixes you'll see

All seven screens have scaffolds claiming `screens-6.jsx`. Real source is `screens-4.jsx`.

## Screens

### `settings` — profile (P2)
- Source: `screens-4.jsx#ScreenSettingsProfile`
- Fields: name, email, avatar, timezone, locale.
- Mutations: `users.updateProfile`.

### `settings-prefs` — preferences (P2)
- Source: `screens-4.jsx#ScreenSettingsPreferences`
- **Theme controls** (light / dark / system).
- **OpenDyslexic toggle** — body + optional headings.
- **Read-aloud toggle** — global setting.
- Mutations: `users.updatePreferences`.

### `settings-integrations` — sync (P3)
- Source: `screens-4.jsx#ScreenSettingsIntegrations`
- Calendar, contacts, etc.
- Insufficient evidence: provider list not yet locked. Confirm with Amit before scaffolding rows.

### `billing` (P1) + `trial-end` (P2, bare)
- Source: `screens-4.jsx#ScreenBilling` and `#ScreenTrialEnd`
- Acceptance: drives RevenueCat (HARD_RULES §2 — no Stripe SDK direct).
- `trial-end` is bare (no shell) — confirm `(bare)` group used.
- Action call: `billing.startCheckout` (Convex action; opens RevenueCat hosted URL).

### `ask-founder` (P3)
- Source: `screens-4.jsx#ScreenAskFounder`
- Mutation: `feedback.create`.

### `notifications` (P3)
- Source: `screens-4.jsx#ScreenNotifications`
- Acceptance: list + mark-read; integrate with `notifications.list`.

## Privacy / DSR (cross-cutting)

Per HARD_RULES §10, the **DSR button** must live at Settings → Account → Privacy.
That's `settings` profile screen, not a separate page. Confirm presence
of the export + delete buttons; both call Convex actions
(`convex/dsr.ts:requestDataExport` and `requestAccountDeletion`).

## Hand-off

Update `screens.json`. Coordinate `billing` with payments owner if changes
to `PaywallModal` are needed.
