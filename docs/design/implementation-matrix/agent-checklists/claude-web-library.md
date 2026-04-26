# `claude-web-library` — Library screens checklist

> **Owner of:** `tasks`, `notes` (+ detail), `journal`, `calendar`, `habits` (+ detail), `routines` (+ detail), `goals` (+ detail + progress), `projects` (+ detail + kanban).
> **Source of truth:** [`../screens.json`](../screens.json) entries with `category: "Library"`.

---

## Pre-flight

- [ ] Read `docs/design/pseudo-code-conventions.md`.
- [ ] Read `docs/HARD_RULES.md` §5 (schema), §7 (UI).
- [ ] Confirm Phase 0 and Phase 1 merged.
- [ ] Confirm `HabitRing`, `TaskRow`, `Pill`, `Ring` primitives exported from `@tempo/ui`.

## Source-file truth — read carefully

The pre-existing `@source:` comments in your scaffold pages are wrong.
Use this corrected mapping:

| Slug | Correct source |
|---|---|
| tasks | `screens-1.jsx` (NOT `screens-2.jsx`) |
| notes, note-detail, journal | `screens-2.jsx` |
| calendar, habits, habit-detail, routines, routine-detail | `screens-2.jsx` (NOT `screens-3.jsx`) |
| goals, goal-detail, goals-progress | `screens-3.jsx` (NOT `screens-4.jsx`) |
| projects, project-detail, project-kanban | `screens-3.jsx` (NOT `screens-4.jsx`) |

The fix-up commit in this run already updated the comments. If you see a
stale comment, re-pull from `master`.

## Owned screens (recommended order)

1. `tasks` — P0, the highest-traffic library
2. `notes` + `note-detail` — P1
3. `journal` — P1
4. `habits` + `habit-detail` — P1
5. `routines` + `routine-detail` — P2
6. `calendar` — P2
7. `goals` + `goal-detail` + `goals-progress` — P2/P3
8. `projects` + `project-detail` + `project-kanban` — P2/P3

## Acceptance per screen

For each screen:
- [ ] Source-of-truth body matches the prototype JSX (layout, sections, copy stub).
- [ ] Annotations on every interactive element (`@action`, `@query`, `@mutation`, `@navigate`, `@auth`).
- [ ] Reactive on the listed Convex `queries`.
- [ ] Mutations via `convex/proposals.ts` if AI-originated, else direct.
- [ ] Empty-state body uses anti-shame copy (HARD_RULES §1).
- [ ] Render test in `apps/web/components/<area>/__tests__/<Screen>.test.tsx`.

## Cross-cutting

- `HabitRing` lives in `@tempo/ui/primitives` — do not re-implement.
- `TaskRow` likewise — pass `task` + `onToggle`.
- Detail routes are dynamic (`[id]`); parent listings link via `@navigate: /<area>/{id}`.
- Kanban uses `Layout` icon. Insufficient evidence: confirm whether DnD lib is allowed before adding (HARD_RULES §2 forbidden tech list does not name a kanban lib).

## Hand-off

Update `status` in `screens.json` per merged PR. Notify `claude-web-1`
when category is at `wired` overall.
