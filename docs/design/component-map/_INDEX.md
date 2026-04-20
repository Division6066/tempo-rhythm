# Component map — screen manifest

**Conventions:** [`../pseudo-code-conventions.md`](../pseudo-code-conventions.md)  
**Coverage gap audit (task 7):** [`MISSING-SCREENS.md`](MISSING-SCREENS.md)  
**PRD:** [`../../brain/PRDs/PRD_Phase_1_MVP.md`](../../brain/PRDs/PRD_Phase_1_MVP.md) (submodule)

## Files in this folder

| File | Scope | Depth |
|------|--------|------|
| [`README.md`](README.md) | Purpose + pointers | done |
| [`web-flow.md`](web-flow.md) | Flow (5 web) | **Tier A** |
| [`web-library.md`](web-library.md) | Library (15) | Tier B |
| [`web-you.md`](web-you.md) | You (9) | Tier B |
| [`web-settings.md`](web-settings.md) | Settings (7) | Tier B |
| [`web-marketing.md`](web-marketing.md) | Marketing (3) | Tier B |
| [`web-onboarding-auth.md`](web-onboarding-auth.md) | Sign-in, onboarding (2) | Tier B |
| [`mobile.md`](mobile.md) | Mobile (12) | Tier B |
| [`shared-primitives.md`](shared-primitives.md) | Shell, TaskRow, CoachDock, voice | Tier A/B |
| [`MISSING-SCREENS.md`](MISSING-SCREENS.md) | Audit table + optional HTML follow-up | done |

## Counts

| Bucket | Total slugs | Tier A | Tier B only |
|--------|-------------|--------|-------------|
| Web | 42 | 5 (Flow) | 37 |
| Mobile | 12 | 0 | 12 |
| Primitives | 1 doc | partial | — |

## PRD section → screens (reverse index)

Use this when wiring Convex or tracing acceptance criteria.

| PRD section | Topics | Where it shows up in component-map |
|-------------|--------|-------------------------------------|
| §4 42 Screens | All product routes | Every `web-*.md`, `mobile.md`, `web-flow.md` |
| §6 AI Integration | Coach, templates, brain-dump sort | `web-flow.md` (brain-dump, coach), `web-you.md` (templates, command) |
| §7 Goblin features | Magic ToDo, flags on tasks | `web-flow.md` (today TaskRow), `web-library.md` (tasks) |
| §8 Coach Personality | Dial, tone | `web-flow.md` (coach), `shared-primitives.md` (CoachDock) |
| §9 Voice | Walkie, hands-free | `web-flow.md`, `shared-primitives.md`, `mobile.md` (coach) |
| §10 Template System | Builder, run, sketch | `web-you.md` |
| §11 RAG / memory | Search, backlinks | `web-you.md` (search), `web-flow.md` (daily-note backlinks in ScreenDailyNote) |
| §12 Tagging | Tags on tasks, filters | `web-library.md` (tasks), `mobile.md` (tasks) |
| §13 Library | Notes, projects, routines types | `web-library.md`, `mobile.md` (library-adjacent) |
| §14 Design system | Tokens, Soft Editorial | `shared-primitives.md`; PRD §14 |
| §15 Pricing / paywall | Trial, billing | `web-settings.md` |
| §16 Compliance | Privacy, DSR, encryption copy | `web-settings.md`, `web-onboarding-auth.md`, `mobile.md` (journal) |
| §17 Analytics | PostHog opt-in | `web-you.md` (analytics, activity) |
| §18 Launch surfaces | Marketing | `web-marketing.md` |

## Tickets

| ID | Role |
|----|------|
| **T-0021-cluster** | Program: 7 tasks (design upload → map → gap list) |
| **T-0021** | Shipped: HTML zip + Flow tier-A |
| **T-0022** | Optional: deepen tier-A on hot paths; HTML `<!-- -->` pass in `TempoFlow Prototype.html` |
