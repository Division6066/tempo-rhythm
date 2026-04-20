# Missing screens — component-map coverage vs PRD inventory

**Purpose (task 7):** Single checklist of every web + mobile screen from [`../screen-inventory.md`](../screen-inventory.md) that still needs a **component-map** entry (at minimum: `@screen`, `@prd`, one-line affordance list). Use this to open follow-up tickets or track progress.

**Legend**

| Status | Meaning |
|--------|---------|
| **mapped** | Covered in a `component-map/*.md` file with screen header + PRD refs |
| **tier-A** | Full `@action` / `@mutation` / `@navigate` per control (target for Flow + shell) |
| **missing** | No dedicated section in `component-map/` yet |

---

## Web (42 slugs)

| # | Slug | Category | Source (design-system) | Status |
|---|------|----------|-------------------------|--------|
| 1 | `daily-note` | Flow | screens-7.jsx | **tier-A** → [`web-flow.md`](web-flow.md) |
| 2 | `today` | Flow | screens-1.jsx | **tier-A** → [`web-flow.md`](web-flow.md) |
| 3 | `brain-dump` | Flow | screens-1.jsx | **tier-A** → [`web-flow.md`](web-flow.md) |
| 4 | `coach` | Flow | screens-1.jsx, coach-dock.jsx | **tier-A** → [`web-flow.md`](web-flow.md) |
| 5 | `plan` | Flow | screens-1.jsx | **tier-A** → [`web-flow.md`](web-flow.md) |
| 6 | `tasks` | Library | screens-2.jsx | **missing** |
| 7 | `notes` | Library | screens-2.jsx | **missing** |
| 8 | `note-detail` | Library | screens-2.jsx | **missing** |
| 9 | `journal` | Library | screens-2.jsx | **missing** |
| 10 | `calendar` | Library | screens-3.jsx | **missing** |
| 11 | `habits` | Library | screens-3.jsx | **missing** |
| 12 | `habit-detail` | Library | screens-3.jsx | **missing** |
| 13 | `routines` | Library | screens-3.jsx | **missing** |
| 14 | `routine-detail` | Library | screens-3.jsx | **missing** |
| 15 | `goals` | Library | screens-4.jsx | **missing** |
| 16 | `goal-detail` | Library | screens-4.jsx | **missing** |
| 17 | `goals-progress` | Library | screens-4.jsx | **missing** |
| 18 | `projects` | Library | screens-4.jsx | **missing** |
| 19 | `project-detail` | Library | screens-4.jsx | **missing** |
| 20 | `project-kanban` | Library | screens-4.jsx | **missing** |
| 21 | `analytics` | You | screens-5.jsx | **missing** |
| 22 | `activity` | You | screens-5.jsx | **missing** |
| 23 | `templates` | You | screens-templates.jsx | **missing** |
| 24 | `template-builder` | You | screens-template-builder*.jsx | **missing** |
| 25 | `template-run` | You | screens-template-run.jsx | **missing** |
| 26 | `template-editor` | You | screens-5.jsx | **missing** |
| 27 | `template-sketch` | You | screens-5.jsx | **missing** |
| 28 | `search` | You | screens-5.jsx | **missing** |
| 29 | `command` | You | screens-5.jsx | **missing** |
| 30 | `empty-states` | You | screens-6.jsx | **missing** |
| 31 | `settings` | Settings | screens-6.jsx | **missing** |
| 32 | `settings-prefs` | Settings | screens-6.jsx | **missing** |
| 33 | `settings-integrations` | Settings | screens-6.jsx | **missing** |
| 34 | `billing` | Settings | screens-6.jsx | **missing** |
| 35 | `trial-end` | Settings | screens-6.jsx | **missing** |
| 36 | `ask-founder` | Settings | screens-6.jsx | **missing** |
| 37 | `notifications` | Settings | screens-6.jsx | **missing** |
| 38 | `landing` | Marketing | landing.html | **missing** |
| 39 | `about` | Marketing | about.html, screens-7.jsx | **missing** |
| 40 | `changelog` | Marketing | changelog.html, screens-7.jsx | **missing** |
| 41 | `sign-in` | Auth | screens-7.jsx | **missing** |
| 42 | `onboarding` | Auth | screens-7.jsx | **missing** |

**Web summary:** 5 **tier-A mapped**, **37 missing** component-map entries.

---

## Mobile (12 slugs)

| # | Slug | Source | Status |
|---|------|--------|--------|
| 1 | `today` | mobile-screens-a.jsx (`MobileToday`) | **missing** |
| 2 | `capture` | mobile-screens-a.jsx (composer; align with route) | **missing** |
| 3 | `coach` | mobile-screens-b.jsx (`MobileCoachScreen`) | **missing** |
| 4 | `tasks` | mobile-screens-a.jsx | **missing** |
| 5 | `notes` | mobile-screens-a.jsx | **missing** |
| 6 | `journal` | mobile-screens-b.jsx | **missing** |
| 7 | `habits` | mobile-screens-b.jsx | **missing** |
| 8 | `calendar` | mobile-screens-b.jsx | **missing** |
| 9 | `routines` | mobile-screens-b.jsx | **missing** |
| 10 | `templates` | mobile-screens-b.jsx | **missing** |
| 11 | `settings` | mobile-screens-b.jsx | **missing** |
| 12 | `onboarding` | mobile-screens-b.jsx | **missing** |

**Mobile shell / FAB:** `mobile-shell.jsx` (tabs, `CoachPanel`, `ChatBall`) — document under shared/mobile shell when mapping.

**Mobile summary:** **12 missing** dedicated component-map sections.

---

## Shared primitives (not screens)

| Area | Source | Status |
|------|--------|--------|
| Icons, BrandMark, Wordmark, App shell | components.jsx | **missing** → future [`shared-primitives.md`](shared-primitives.md) |
| CoachDock, voice triggers | coach-dock.jsx | **missing** |
| Walkie / voice overlays | voice-chat.jsx | **missing** |
| Preview-only | ios-frame.jsx | **missing** |

---

## HTML labelling note

PRD + pseudocode labels are maintained in **markdown** under `component-map/` for grep and review. The monolithic [`../claude-export/TempoFlow Prototype.html`](../claude-export/TempoFlow%20Prototype.html) is the bundled click-through preview; optional follow-up is to inject `<!-- @screen @prd -->` comments there—track under **T-0022** (or split) when prioritized.

---

## Ticket mapping

| Workstream | Ticket |
|------------|--------|
| Program overview + 7 tasks | **T-0021-cluster** |
| Artefacts + Flow tier-A (shipped) | **T-0021** (done) |
| Fill gaps: stubs, primitives, PRD index, HTML pass | **T-0022** |
