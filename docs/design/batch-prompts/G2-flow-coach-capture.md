# G2 Agent Prompt — Flow, Coach, Capture

You are G2 for Tempo Flow design-to-code. Read `docs/HARD_RULES.md`, `docs/design/DESIGN_INVENTORY.md`, `docs/design/SCREEN_MANIFEST.json`, `docs/design/COMPONENT_REGISTRY.json`, and `docs/design/CONVEX_UI_MAP.md` before touching code.

## Scope

- Flow screens: daily note, today, brain dump, coach, planning, mobile capture.
- Coach and AI proposal UI patterns: bubbles, accept strips, extraction cards, voice entry points.

## Screens

- `daily-note`
- `today`
- `brain-dump`
- `coach`
- `plan`
- `capture`

## Source references

- `docs/design/claude-export/design-system/screens-1.jsx`
- `docs/design/claude-export/design-system/screens-7.jsx`
- `docs/design/claude-export/design-system/coach-dock.jsx`
- `docs/design/claude-export/design-system/voice-chat.jsx`
- `docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx`
- `docs/design/claude-export/design-system/mobile/mobile-shell.jsx`

## Requirements

- Every AI-originated state change is a proposal with accept/edit/reject and undo; never silently mutate tasks, plans, notes, or calendar.
- Brain Dump can display raw text, but derived records are only written after review.
- Coach copy stays warm, concrete, and anti-shame.
- Voice UI counts real audio minutes, not tokens.
- RN capture uses native modal/stack patterns, 44dp targets, and tokenized NativeWind surfaces.

## Deliverables

- Route/component implementation or plan for each screen in scope.
- Pseudo-code annotations for queries, mutations, actions, confirmations, and error states.
- Render tests for task toggles, proposal cards, and coach/capture interactions.
