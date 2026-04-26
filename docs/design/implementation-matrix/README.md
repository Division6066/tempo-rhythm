# Tempo Flow — UI Implementation Matrix

> **Purpose:** the canonical map of every screen, component, and design token between
> the **Tempo Flow design-system source** and the **`apps/web` + `apps/mobile`
> implementation**. Built so multiple parallel cloud agents can work on the UI
> port without duplicating effort or skipping screens.
>
> **Owner of this matrix:** `claude/ui-prototype-route-inventory` (Claude Code Web 1).
>
> **Generated:** 2026-04-26 from the design-reference branch
> `codex/design-reference-files-2026-04-26`.

---

## Files

| File | What it is |
|---|---|
| [`screens.json`](./screens.json) | Every prototype screen → repo route, with status, owner, queries, mutations, auth posture. Machine-readable. |
| [`components.json`](./components.json) | Every prototype component → repo target, status, owner. Grouped by primitives / shell / coach / voice / templates / mobile / marketing / payments. |
| [`tokens.json`](./tokens.json) | Every design token (colors, type, spacing, radii, shadows, motion, layout) → CSS variable + TS key + status. |
| [`merge-order.md`](./merge-order.md) | Required PR landing order so dependencies aren't violated, plus ownership boundaries. |
| [`screenshot-index.md`](./screenshot-index.md) | Index of every PNG screenshot in the design-system bundle, sorted by feature. |
| [`agent-checklists/`](./agent-checklists/) | One checklist per agent identity (`claude-web-flow`, `claude-web-library`, …) with their owned screens + acceptance criteria. |
| [`schema/`](./schema/) | JSON Schemas for `screens.json` / `components.json` / `tokens.json` so a CI guard can validate them. |

---

## How to use this matrix

**Before claiming a screen:**

1. Open `screens.json`, find the slug.
2. Confirm `status` and `owner` match what you intend to do.
3. If `owner` is set to a different agent, **do not** start work — leave a comment or hand off via the agent-checklist file.
4. Confirm `sourceFiles` against the actual file in `docs/design/claude-export/design-system/`. If a `@source` comment in the scaffold page disagrees, **the matrix wins** — see [Source-file truth table](#source-file-truth-table) below.

**Before merging a PR:**

1. Update the entry's `status` (`scaffold` → `partial` → `ported` → `wired`).
2. If you changed which file is the source of truth, update `sourceFiles`.
3. If you added a new screen / component / token, add a new entry — do not silently add a route file without registering it here.
4. Run `bun run scan:ui-matrix` (added by this run; see [Verification](#verification)).

---

## Source-file truth table

The pre-existing `docs/design/screen-inventory.md` and the `@source: …` comments
in several `apps/web/app/(tempo)/**/page.tsx` scaffold files have **drifted**
from the actual content of the prototype source. The corrected mapping is:

| Slug | Prototype export | File |
|---|---|---|
| daily-note | `ScreenDailyNote` | **`screens-7.jsx`** (scaffold says `screens-1.jsx`) |
| today | `ScreenToday` | `screens-1.jsx` |
| brain-dump | `ScreenBrainDump` | `screens-1.jsx` |
| coach | `ScreenCoach` | `screens-1.jsx` (+ `coach-dock.jsx`) |
| plan | `ScreenPlan` | `screens-1.jsx` |
| tasks | `ScreenTasks` | **`screens-1.jsx`** (scaffold says `screens-2.jsx`) |
| notes | `ScreenNotes` | `screens-2.jsx` |
| note-detail | `ScreenNoteDetail` | `screens-2.jsx` |
| journal | `ScreenJournal` | `screens-2.jsx` |
| calendar | `ScreenCalendar` | **`screens-2.jsx`** (scaffold says `screens-3.jsx`) |
| habits | `ScreenHabits` | **`screens-2.jsx`** (scaffold says `screens-3.jsx`) |
| habit-detail | `ScreenHabitDetail` | `screens-2.jsx` |
| routines | `ScreenRoutines` | **`screens-2.jsx`** (scaffold says `screens-3.jsx`) |
| routine-detail | `ScreenRoutineDetail` | `screens-2.jsx` |
| goals, goal-detail, goals-progress | `ScreenGoals*` | **`screens-3.jsx`** (scaffold says `screens-4.jsx`) |
| projects, project-detail, project-kanban | `ScreenProject*` | **`screens-3.jsx`** (scaffold says `screens-4.jsx`) |
| analytics | `ScreenAnalytics` | **`screens-3.jsx`** (scaffold says `screens-5.jsx`) |
| activity | `ScreenActivity` | **`screens-3.jsx`** (scaffold says `screens-5.jsx`) |
| templates | `ScreenTemplatesV2` | `screens-templates.jsx` (V2; the legacy `ScreenTemplates` in `screens-3.jsx` is deprecated) |
| template-builder | `ScreenTemplateBuilderV2` | `screens-template-builder-ui.jsx` (+ `screens-template-builder.jsx` registry + `screens-template-builder-slash.jsx` slash menu) |
| template-run | `ScreenTemplateRunV2` | `screens-template-run.jsx` |
| template-editor | `ScreenTemplateEditor` (legacy) | **`screens-3.jsx`** (scaffold says `screens-5.jsx`) — DO NOT INVEST |
| template-sketch | `ScreenTemplateSketch` | **`screens-3.jsx`** (scaffold says `screens-5.jsx`) |
| search | `ScreenSearch` | **`screens-3.jsx`** (scaffold says `screens-5.jsx`) |
| command | `ScreenCommand` | `screens-3.jsx` |
| empty-states | `ScreenEmptyStates` | **`screens-5.jsx`** (scaffold says `screens-6.jsx`) |
| settings · profile / prefs / sync | `ScreenSettings*` | **`screens-4.jsx`** (scaffold says `screens-6.jsx`) |
| billing, trial-end, ask-founder, notifications | … | **`screens-4.jsx`** (scaffold says `screens-6.jsx`) |
| sign-in, onboarding, empty-states | … | `screens-5.jsx` |
| about, changelog, mobile-today | … | `screens-6.jsx` |

The fix-up pass in this run updates the `@source:` comments inside scaffold
pages so future agents read the correct value. See `feat/T-F004 fix-source-comments`
section of the PR.

---

## Categories

Same as the prototype's `cat:` field on each `SCREENS` entry:

- **Flow** — daily, in-the-moment surfaces (today, daily-note, brain-dump, coach, plan).
- **Library** — long-lived collections (tasks, notes, journal, calendar, habits, routines, goals, projects).
- **You** — tools/configuration around the user (insights, activity, templates, search, command, empty-states).
- **Settings** — account, prefs, integrations, billing, trial-end, ask-founder, notifications.
- **Marketing** — public surfaces (landing, about, changelog).
- **Onboarding** — sign-in, onboarding flow, paywall (mobile).
- **Mobile** — Expo screens (tabs + modals).

---

## Verification

A CI guard script (added in a follow-up PR) walks every `page.tsx` and asserts:

1. Each route in `screens.json` resolves to a real file under `apps/web/app` or `apps/mobile/app`.
2. Each `@source:` comment in scaffold pages matches `sourceFiles[0]` for that slug.
3. Each `@screen:` slug appears as a key in `screens.json`.

Until then, the matrix is the human source of truth. Run a manual sanity pass
with:

```bash
node scripts/inventory-doctor.mjs
```

(also added by this run).

---

## What this matrix intentionally does NOT cover

- **Detailed copy / content.** The matrix tracks *which screens exist* and
  *who owns them*, not the literal copy. The brand-voice document
  (`docs/design/claude-export/design-system/brand-voice.md`) is the
  copy contract.
- **Per-component prop drift.** `components.json` flags `partial` so a
  component agent knows to look — but the prop-by-prop diff is left to that
  agent.
- **Backend wiring.** Each entry's `queries` / `mutations` / `actions` arrays
  are the *intent*; the actual Convex names + arg shapes live in
  `convex/<module>.ts`.
- **Live preview state.** `status: shipped` references
  `docs/SHIP_STATE.md`. Any claim of "shipped" without an entry there is
  **insufficient evidence** and should be downgraded back to `wired`.

---

## Conventions

- Slugs are kebab-case and globally unique across web + mobile (mobile
  variants are prefixed `mobile-`).
- Routes use Next.js / Expo Router syntax: `/today`, `/notes/[id]`,
  `(tabs)/today`.
- `priority`: `P0` = blocks Phase 1 launch, `P1` = high, `P2` = medium,
  `P3` = nice-to-have, `P4` = legacy / deprecated / showcase.
- `auth`: `public` | `required` | `owner` (per `docs/design/pseudo-code-conventions.md`).

---

## Update cadence

- **On every UI port PR:** the merging agent updates the `status` of the
  affected screens and components.
- **On every new screen:** add an entry to `screens.json` *in the same PR*
  that adds the route file. CI will refuse the PR otherwise (once the guard
  ships).
- **On every design-token change:** update `tokens.json` *and* CSS
  variables *and* TS constants in lockstep.
