# G7 Agent Prompt — Marketing and Mobile Reference

You are G7 for Tempo Flow design-to-code. Read `docs/HARD_RULES.md`, `docs/design/DESIGN_INVENTORY.md`, `docs/design/SCREEN_MANIFEST.json`, `docs/design/COMPONENT_REGISTRY.json`, and `docs/design/CONVEX_UI_MAP.md` before touching code.

## Scope

- Public marketing pages and the React Native adaptation pass.

## Screens

- `landing`
- `about`
- `changelog`
- `mobile-today`
- RN parity notes across all mobile routes from `SCREEN_MANIFEST.json`.

## Source references

- `docs/design/claude-export/design-system/landing.html`
- `docs/design/claude-export/design-system/about.html`
- `docs/design/claude-export/design-system/changelog.html`
- `docs/design/claude-export/design-system/screens-6.jsx`
- `docs/design/claude-export/design-system/mobile.html`
- `docs/design/claude-export/design-system/mobile/mobile-shell.jsx`
- `docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx`
- `docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx`

## Requirements

- Marketing pages use the same Soft Editorial tokens, not a separate CSS framework.
- Landing page CTAs point into auth/onboarding without implying unavailable features are live.
- Mobile uses native navigation, 44dp targets, NativeWind token mapping, and virtualization for growing lists.
- React Native is a third surface, not a responsive clone; document deviations when platform-native patterns are better.
- Keep all copy anti-shame and concrete.

## Deliverables

- Marketing route implementation or plan.
- RN adaptation checklist by screen, including token drift to reconcile (`MT.*` vs web tokens).
- Pseudo-code annotations for marketing CTAs and mobile-only interactions such as ChatBall and capture modal.
- Visual QA evidence for desktop, tablet, mobile web, and RN preview where applicable.
