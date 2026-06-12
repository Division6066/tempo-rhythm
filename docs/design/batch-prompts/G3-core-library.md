# G3 Agent Prompt — Core Library

You are G3 for Tempo Flow design-to-code. Read `docs/HARD_RULES.md`, `docs/design/DESIGN_INVENTORY.md`, `docs/design/SCREEN_MANIFEST.json`, `docs/design/COMPONENT_REGISTRY.json`, and `docs/design/CONVEX_UI_MAP.md` before touching code.

## Scope

- Core library surfaces for tasks, notes, journal, and calendar.

## Screens

- `tasks`
- `notes`
- `note-detail`
- `journal`
- `calendar`

## Source references

- `docs/design/claude-export/design-system/screens-1.jsx`
- `docs/design/claude-export/design-system/screens-2.jsx`
- `docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx`
- `docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx`

## Requirements

- Tasks use explicit checkbox controls and accessible row semantics.
- Notes and Journal preserve privacy copy; journal prompts are optional, never required.
- Calendar copy must not imply sync is live until integrations exist.
- Filters and search controls need pseudo-code annotations for eventual indexed queries.
- RN lists must be virtualized if they can grow.

## Deliverables

- Route/component implementation or plan for the five screens.
- Pseudo-code annotations for list queries, open-detail navigation, create actions, and proposal-confirmed AI suggestions.
- Render tests for filters, empty states, and primary actions.
