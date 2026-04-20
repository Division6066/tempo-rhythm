# Screen coverage — PRD inventory vs component-map

**Purpose (program task 7):** Checklist of every web + mobile slug from [`../screen-inventory.md`](../screen-inventory.md) with **where** it is documented and **depth** (tier A vs B). Use [`MISSING-SCREENS.md`](MISSING-SCREENS.md) to open follow-up tickets for **deeper** tier-A passes or **HTML** inline comments.

**Legend**

| Status | Meaning |
|--------|---------|
| **tier-A** | Full `@action` / `@mutation` / `@query` per control in `web-flow.md` (Flow) or `shared-primitives.md` (shell) |
| **tier-B** | Screen header + stub affordances in category `*.md` |
| **HTML optional** | Not duplicated inside `TempoFlow Prototype.html` comments — markdown is source of truth unless T-0022 HTML pass is done |

---

## Web (42 slugs)

| # | Slug | Category | Source (design-system) | Documented in | Status |
|---|------|----------|-------------------------|---------------|--------|
| 1 | `daily-note` | Flow | screens-7.jsx | [`web-flow.md`](web-flow.md) | **tier-A** |
| 2 | `today` | Flow | screens-1.jsx | [`web-flow.md`](web-flow.md) | **tier-A** |
| 3 | `brain-dump` | Flow | screens-1.jsx | [`web-flow.md`](web-flow.md) | **tier-A** |
| 4 | `coach` | Flow | screens-1.jsx, coach-dock.jsx | [`web-flow.md`](web-flow.md) | **tier-A** |
| 5 | `plan` | Flow | screens-1.jsx | [`web-flow.md`](web-flow.md) | **tier-A** |
| 6 | `tasks` | Library | screens-2.jsx | [`web-library.md`](web-library.md) | **tier-B** |
| 7 | `notes` | Library | screens-2.jsx | [`web-library.md`](web-library.md) | **tier-B** |
| 8 | `note-detail` | Library | screens-2.jsx | [`web-library.md`](web-library.md) | **tier-B** |
| 9 | `journal` | Library | screens-2.jsx | [`web-library.md`](web-library.md) | **tier-B** |
| 10 | `calendar` | Library | screens-3.jsx | [`web-library.md`](web-library.md) | **tier-B** |
| 11 | `habits` | Library | screens-3.jsx | [`web-library.md`](web-library.md) | **tier-B** |
| 12 | `habit-detail` | Library | screens-3.jsx | [`web-library.md`](web-library.md) | **tier-B** |
| 13 | `routines` | Library | screens-3.jsx | [`web-library.md`](web-library.md) | **tier-B** |
| 14 | `routine-detail` | Library | screens-3.jsx | [`web-library.md`](web-library.md) | **tier-B** |
| 15 | `goals` | Library | screens-4.jsx | [`web-library.md`](web-library.md) | **tier-B** |
| 16 | `goal-detail` | Library | screens-4.jsx | [`web-library.md`](web-library.md) | **tier-B** |
| 17 | `goals-progress` | Library | screens-4.jsx | [`web-library.md`](web-library.md) | **tier-B** |
| 18 | `projects` | Library | screens-4.jsx | [`web-library.md`](web-library.md) | **tier-B** |
| 19 | `project-detail` | Library | screens-4.jsx | [`web-library.md`](web-library.md) | **tier-B** |
| 20 | `project-kanban` | Library | screens-4.jsx | [`web-library.md`](web-library.md) | **tier-B** |
| 21 | `analytics` | You | screens-5.jsx | [`web-you.md`](web-you.md) | **tier-B** |
| 22 | `activity` | You | screens-5.jsx | [`web-you.md`](web-you.md) | **tier-B** |
| 23 | `templates` | You | screens-templates.jsx | [`web-you.md`](web-you.md) | **tier-B** |
| 24 | `template-builder` | You | screens-template-builder*.jsx | [`web-you.md`](web-you.md) | **tier-B** |
| 25 | `template-run` | You | screens-template-run.jsx | [`web-you.md`](web-you.md) | **tier-B** |
| 26 | `template-editor` | You | screens-5.jsx | [`web-you.md`](web-you.md) | **tier-B** |
| 27 | `template-sketch` | You | screens-5.jsx | [`web-you.md`](web-you.md) | **tier-B** |
| 28 | `search` | You | screens-5.jsx | [`web-you.md`](web-you.md) | **tier-B** |
| 29 | `command` | You | screens-5.jsx | [`web-you.md`](web-you.md) | **tier-B** |
| 30 | `empty-states` | You | screens-6.jsx | [`web-you.md`](web-you.md) | **tier-B** |
| 31 | `settings` | Settings | screens-6.jsx | [`web-settings.md`](web-settings.md) | **tier-B** |
| 32 | `settings-prefs` | Settings | screens-6.jsx | [`web-settings.md`](web-settings.md) | **tier-B** |
| 33 | `settings-integrations` | Settings | screens-6.jsx | [`web-settings.md`](web-settings.md) | **tier-B** |
| 34 | `billing` | Settings | screens-6.jsx | [`web-settings.md`](web-settings.md) | **tier-B** |
| 35 | `trial-end` | Settings | screens-6.jsx | [`web-settings.md`](web-settings.md) | **tier-B** |
| 36 | `ask-founder` | Settings | screens-6.jsx | [`web-settings.md`](web-settings.md) | **tier-B** |
| 37 | `notifications` | Settings | screens-6.jsx | [`web-settings.md`](web-settings.md) | **tier-B** |
| 38 | `landing` | Marketing | landing.html | [`web-marketing.md`](web-marketing.md) | **tier-B** |
| 39 | `about` | Marketing | about.html, screens-7.jsx | [`web-marketing.md`](web-marketing.md) | **tier-B** |
| 40 | `changelog` | Marketing | changelog.html, screens-7.jsx | [`web-marketing.md`](web-marketing.md) | **tier-B** |
| 41 | `sign-in` | Auth | screens-7.jsx | [`web-onboarding-auth.md`](web-onboarding-auth.md) | **tier-B** |
| 42 | `onboarding` | Auth | screens-7.jsx | [`web-onboarding-auth.md`](web-onboarding-auth.md) | **tier-B** |

**Web summary:** 42 rows documented — 5 **tier-A**, 37 **tier-B**. None **missing** from markdown map.

---

## Mobile (12 slugs)

| # | Slug | Source | Documented in | Status |
|---|------|--------|---------------|--------|
| 1 | `today` | mobile-screens-a.jsx | [`mobile.md`](mobile.md) | **tier-B** |
| 2 | `capture` | mobile-screens-a.jsx | [`mobile.md`](mobile.md) | **tier-B** |
| 3 | `coach` | mobile-screens-b.jsx | [`mobile.md`](mobile.md) | **tier-B** |
| 4 | `tasks` | mobile-screens-a.jsx | [`mobile.md`](mobile.md) | **tier-B** |
| 5 | `notes` | mobile-screens-a.jsx | [`mobile.md`](mobile.md) | **tier-B** |
| 6 | `journal` | mobile-screens-b.jsx | [`mobile.md`](mobile.md) | **tier-B** |
| 7 | `habits` | mobile-screens-b.jsx | [`mobile.md`](mobile.md) | **tier-B** |
| 8 | `calendar` | mobile-screens-b.jsx | [`mobile.md`](mobile.md) | **tier-B** |
| 9 | `routines` | mobile-screens-b.jsx | [`mobile.md`](mobile.md) | **tier-B** |
| 10 | `templates` | mobile-screens-b.jsx | [`mobile.md`](mobile.md) | **tier-B** |
| 11 | `settings` | mobile-screens-b.jsx | [`mobile.md`](mobile.md) | **tier-B** |
| 12 | `onboarding` | mobile-screens-b.jsx | [`mobile.md`](mobile.md) | **tier-B** |

**Mobile shell:** `mobile-shell.jsx` — see [`mobile.md`](mobile.md) + [`shared-primitives.md`](shared-primitives.md).

**Mobile summary:** 12 **tier-B**; none **missing**.

---

## Shared primitives (not routes)

| Area | Documented in | Status |
|------|---------------|--------|
| components.jsx, coach-dock, voice-chat, ios-frame | [`shared-primitives.md`](shared-primitives.md) | **tier-A/B** |

---

## HTML labelling

- **Canonical:** Markdown under `component-map/` (grep-friendly).  
- **Bundled preview:** [`../claude-export/TempoFlow Prototype.html`](../claude-export/TempoFlow%20Prototype.html).  
- **Optional:** inject `<!-- @screen ... @prd ... -->` per route — track under **T-0022** if prioritized.

---

## Ticket mapping

| Workstream | Ticket |
|------------|--------|
| Program (7 tasks, incl. this gap list) | **T-0021-cluster** |
| Artefacts + Flow tier-A (done) | **T-0021** |
| Tier-B sweep + PRD index (this commit) | **T-0022** → set **in-review** / **done** when merged |
| Deeper tier-A per screen | Split into future `T-03xx` per vertical as needed |
