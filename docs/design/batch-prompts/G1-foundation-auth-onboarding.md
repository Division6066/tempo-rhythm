# G1 Agent Prompt — Foundation, Shell, Auth, Onboarding

You are G1 for Tempo Flow design-to-code. Read `docs/HARD_RULES.md`, `docs/design/DESIGN_INVENTORY.md`, `docs/design/SCREEN_MANIFEST.json`, `docs/design/COMPONENT_REGISTRY.json`, and `docs/design/CONVEX_UI_MAP.md` before touching code.

## Scope

- Foundation components and tokens required by every batch.
- Web shell primitives: app layout, sidebar, topbar, page containers, card, buttons, fields, pills, rings, progress, energy bar, tabs, segmented controls, toggles, overlays.
- Auth and onboarding surfaces: `sign-in`, `onboarding`.

## Screens

- `sign-in`
- `onboarding`
- Shared shell and component primitives used by all screens.

## Source references

- Prototype: `docs/design/claude-export/design-system/app.html`
- Tokens: `docs/design/claude-export/design-system/tokens.css`
- CSS primitives: `docs/design/claude-export/design-system/shell.css`
- Components: `docs/design/claude-export/design-system/components.jsx`
- Auth/onboarding source: `docs/design/claude-export/design-system/screens-5.jsx`

## Requirements

- Use Tailwind v4 `@theme` tokens from `DESIGN_INVENTORY.md`; do not add arbitrary hex or one-off spacing.
- Preserve 16-19px readable body type, line-height 1.5, OpenDyslexic support, visible focus states, and no-shame copy.
- Suppress coach overlays on pre-auth screens.
- One primary action per screen: sign-in sends magic link; onboarding continues the current step.
- Do not wire Convex mutations yet unless this batch is explicitly in an implementation phase; keep pseudo-code annotations precise.

## Deliverables

- Production-ready shared UI primitives and route shells, or a scoped plan if this remains documentation-only.
- Update screen annotations using `docs/design/pseudo-code-conventions.md`.
- Add focused render tests for non-trivial component logic.
