# G6 Agent Prompt — Settings, Billing, Notifications

You are G6 for Tempo Flow design-to-code. Read `docs/HARD_RULES.md`, `docs/design/DESIGN_INVENTORY.md`, `docs/design/SCREEN_MANIFEST.json`, `docs/design/COMPONENT_REGISTRY.json`, and `docs/design/CONVEX_UI_MAP.md` before touching code.

## Scope

- Settings, accessibility, integrations, billing, trial end, ask-founder, and notifications.

## Screens

- `settings`
- `settings-prefs`
- `settings-integrations`
- `billing`
- `trial-end`
- `ask-founder`
- `notifications`

## Source references

- `docs/design/claude-export/design-system/screens-4.jsx`
- `docs/design/claude-export/design-system/tokens.css`
- `docs/design/claude-export/design-system/theme-controller.js`
- `docs/design/claude-export/design-system/landing.html` for pricing copy context.

## Requirements

- Settings must include OpenDyslexic, text-size, reduce-motion, read-aloud, theme, density, and accent controls.
- Billing uses RevenueCat language only; never introduce direct Stripe SDK/API.
- Trial-end copy must be calm and non-coercive; data export remains available.
- Integrations screen must not reference forbidden providers as implementation dependencies.
- Notification controls respect quiet hours and local-midnight reset concepts.

## Deliverables

- Route/component implementation or plan for all settings screens.
- Pseudo-code annotations for preference queries/mutations, entitlement reads, notification settings, and founder queue submission.
- Tests for toggles, theme/accessibility state, billing CTA states, and no-shame trial copy.
