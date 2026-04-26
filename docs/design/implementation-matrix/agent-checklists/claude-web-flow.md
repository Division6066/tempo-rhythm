# `claude-web-flow` — Flow screens checklist

> **Owner of:** `today`, `daily-note`, `brain-dump`, `coach`, `plan`.
> **Source of truth:** [`../screens.json`](../screens.json) entries with `category: "Flow"`.

---

## Pre-flight

- [ ] Read `docs/design/pseudo-code-conventions.md` (annotation tag set).
- [ ] Read `docs/HARD_RULES.md` §1 (product posture), §6 (AI), §7 (UI), §9 (voice).
- [ ] Confirm Phase 0 (design-system foundation) and Phase 1 (app shell) merged.
- [ ] Confirm Phase 3 (`CoachDock`) is in progress before starting `coach` and `plan`.

## Owned screens

### `today` (P0, status: partial)

- Source: `screens-1.jsx#ScreenToday`
- Existing: `apps/web/components/today/TodayScreen.tsx` + sub-parts
- Acceptance:
  - [ ] Greeting matches prototype copy + time-of-day variants
  - [ ] Quick-add bar parity (slash-style? plain? confirm vs prototype)
  - [ ] Task list uses `TaskRow` from `@tempo/ui`
  - [ ] Schedule strip / time-block view present
  - [ ] Energy slider present
  - [ ] Brain-dump panel link/embed present
  - [ ] Reactive on `tasks.listToday` (Convex query annotation in place)
  - [ ] Optimistic complete on `tasks.complete`

### `daily-note` (P1, status: scaffold) — bare layout

- Source: **`screens-7.jsx#ScreenDailyNote`** (NOT `screens-1.jsx`).
- Target: `apps/web/app/(bare)/daily-note/page.tsx`
- Acceptance:
  - [ ] Single full-bleed textarea, no sidebar/topbar
  - [ ] Auto-saves to `journal.updateDaily` (debounced)
  - [ ] Esc / shortcut returns to `today`
  - [ ] Read-aloud `ListenBtn` available (depends on Phase 0 primitive)

### `brain-dump` (P0, status: scaffold)

- Source: `screens-1.jsx#ScreenBrainDump`
- Acceptance:
  - [ ] Free-form textarea capture
  - [ ] AI parse → list of proposals
  - [ ] Each proposal renders an `AcceptStrip` (Phase 0 primitive)
  - [ ] Confirm/edit/reject per HARD_RULES §6.2
  - [ ] Proposals via `convex/proposals.ts`, never direct mutations

### `coach` (P1, status: scaffold) — depends on Phase 3

- Source: `screens-1.jsx#ScreenCoach` + `coach-dock.jsx`
- Acceptance:
  - [ ] Thread list pane
  - [ ] Message stream with `CoachBubble` + `UserBubble`
  - [ ] Voice toggle: walkie-talkie vs live (HARD_RULES §9 budgets)
  - [ ] Confidence badges on AI-originating turns
  - [ ] Streamed reply via Convex action

### `plan` (P2, status: scaffold) — depends on coach

- Source: `screens-1.jsx#ScreenPlan`
- Acceptance:
  - [ ] Weekly grid
  - [ ] AI-suggested plan with accept/reject batch
  - [ ] Drag-to-reorder time blocks
  - [ ] `plan.commit` writes the accepted plan to tasks/calendar

## Deliverables

For each screen:
- Update `status` in `screens.json` (`scaffold` → `partial` → `ported` → `wired`)
- Keep `@source:`, `@queries:`, `@mutations:`, `@auth:` JSDoc in the page header.
- Render tests with `@testing-library/react` per HARD_RULES §11.

## Hand-off back to matrix owner

When all five screens are at `wired` status, ping `claude/ui-prototype-route-inventory`
to update `screens.json` and reflect coverage.
