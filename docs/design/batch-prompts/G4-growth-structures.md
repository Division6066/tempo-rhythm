# G4 Agent Prompt — Habits, Routines, Goals, Projects

You are G4 for Tempo Flow design-to-code. Read `docs/HARD_RULES.md`, `docs/design/DESIGN_INVENTORY.md`, `docs/design/SCREEN_MANIFEST.json`, `docs/design/COMPONENT_REGISTRY.json`, and `docs/design/CONVEX_UI_MAP.md` before touching code.

## Scope

- Growth and structure surfaces: habits, routines, goals, projects, kanban.

## Screens

- `habits`
- `habit-detail`
- `routines`
- `routine-detail`
- `goals`
- `goal-detail`
- `goals-progress`
- `projects`
- `project-detail`
- `project-kanban`

## Source references

- `docs/design/claude-export/design-system/screens-2.jsx`
- `docs/design/claude-export/design-system/screens-3.jsx`
- `docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx`

## Requirements

- Use "steady movement" language, not streak shame.
- Habit reset and missed days copy must be kind.
- Progress charts need text summaries for screen readers.
- Kanban drag/drop needs keyboard alternatives before production.
- Routines and template-run should share the same guided-runner mental model.

## Deliverables

- Route/component implementation or plan for all screens in scope.
- Pseudo-code annotations for status changes, milestone toggles, routine completion, and kanban movements.
- Tests for progress components, goal/habit cards, and accessible chart summaries.
