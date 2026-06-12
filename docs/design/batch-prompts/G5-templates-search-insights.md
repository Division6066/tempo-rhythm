# G5 Agent Prompt — Templates, Search, Command, Insights

You are G5 for Tempo Flow design-to-code. Read `docs/HARD_RULES.md`, `docs/design/DESIGN_INVENTORY.md`, `docs/design/SCREEN_MANIFEST.json`, `docs/design/COMPONENT_REGISTRY.json`, and `docs/design/CONVEX_UI_MAP.md` before touching code.

## Scope

- Templates v2, builder, runner, legacy/sketch surfaces, search, command palette, insights, activity, and empty-state gallery.

## Screens

- `templates`
- `template-builder`
- `template-run`
- `template-editor`
- `template-sketch`
- `search`
- `command`
- `analytics`
- `activity`
- `empty-states`

## Source references

- `docs/design/claude-export/design-system/screens-3.jsx`
- `docs/design/claude-export/design-system/screens-5.jsx`
- `docs/design/claude-export/design-system/screens-templates.jsx`
- `docs/design/claude-export/design-system/screens-template-builder.jsx`
- `docs/design/claude-export/design-system/screens-template-builder-ui.jsx`
- `docs/design/claude-export/design-system/screens-template-builder-slash.jsx`
- `docs/design/claude-export/design-system/screens-template-run.jsx`

## Requirements

- Template content remains generic JSON/content, not custom per-template schema columns.
- AI-generated template blocks or picture-sketch parsing use proposal UI before persistence.
- Search and command surfaces must be keyboard-first on web.
- Insights show aggregated, opt-out-safe numbers and never shame the user.
- Empty-state copy is a reusable QA source for other batches.

## Deliverables

- Route/component implementation or plan for all screens in scope.
- Pseudo-code annotations for template actions, search queries, command actions, activity feeds, and analytics opt-out.
- Tests for keyboard navigation, builder mode switches, and template-run step progression.
