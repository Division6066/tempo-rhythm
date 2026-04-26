# `claude-mobile` + `claude-mobile-ui` — Mobile checklist

> **Owners:** mobile screens (`claude-mobile`) and mobile-only primitives (`claude-mobile-ui`).
> **Source of truth:** `docs/design/claude-export/design-system/mobile/`.

---

## Pre-flight

- [ ] Read `docs/HARD_RULES.md` §7 (web vs mobile split: NativeWind 4 / Tailwind 3.x), §8 (a11y), §9 (voice).
- [ ] Confirm `@tempo/ui/native/*` exports are shipped by `claude-ui-pkg`.

## Source files

| File | Exports |
|---|---|
| `mobile/mobile-shell.jsx` | `PhoneShell`, `TabBar`, `ChatBall`, `CoachPanel`, plus iOS chrome (`DynamicIsland`, `HomeBar`, `TimeLabel`) — chrome is preview-only |
| `mobile/mobile-screens-a.jsx` | `MobileToday`, `MobileTasks`, `MobileBrainDump`, `MobilePlan`, `TaskRow` (mobile variant) |
| `mobile/mobile-screens-b.jsx` | `MobileCoachScreen`, `MobileLibrary`, `MobileJournal`, `MobileTemplateEditor`, `MobileSettings`, `MobileOnboarding`, `MobileHabits`, `CBubble` |

## Routes (matrix → repo)

| Slug | Route | File |
|---|---|---|
| `mobile-today` | `(tabs)/today` | `apps/mobile/app/(tempo)/(tabs)/today.tsx` |
| `mobile-tasks` | `(tabs)/tasks` | `… /tasks.tsx` |
| `mobile-notes` | `(tabs)/notes` | `… /notes.tsx` |
| `mobile-coach` | `(tabs)/coach` | `… /coach.tsx` |
| `mobile-capture` | `capture` | `… /capture.tsx` (modal) |
| `mobile-journal` | `journal` | `apps/mobile/app/(tempo)/journal.tsx` |
| `mobile-habits` | `habits` | `… /habits.tsx` |
| `mobile-calendar` | `calendar` | `… /calendar.tsx` |
| `mobile-routines` | `routines` | `… /routines.tsx` |
| `mobile-templates` | `templates` | `… /templates.tsx` |
| `mobile-settings` | `settings` | `… /settings.tsx` |
| `mobile-onboarding` | `(auth)/onboarding` | `apps/mobile/app/(auth)/onboarding.tsx` |
| `mobile-paywall` | `(auth)/paywall` | `apps/mobile/app/(auth)/paywall/index.tsx` |

## Acceptance

- [ ] NativeWind classes only — no inline RN `StyleSheet` for new code.
- [ ] Tokens via `tempoColors` etc from `@tempo/ui/theme` — no hardcoded hex.
- [ ] Screen-reader labels on every interactive element (HARD_RULES §8).
- [ ] Touch targets ≥ 44x44 dp.
- [ ] Voice components proxy to the same Convex actions as web.

## Insufficient evidence

- `MobileCalendar`, `MobileRoutines` exports were not located in
  `mobile-screens-b.jsx`. Confirm whether those were intentionally
  omitted from the design system or live elsewhere.
- Mobile paywall has no prototype source — RevenueCat-driven UX TBD.
  Insufficient evidence to start.

## Don't port

The iOS chrome components in `mobile-shell.jsx` (`DynamicIsland`,
`HomeBar`, `TimeLabel`, `PhoneShell`) are **preview-only**. Expo provides
real status bar, dynamic island, and safe-area handling — do not port
this chrome into runtime mobile code.

## Hand-off

Update `screens.json` per merged PR. Coordinate with `claude-coach` for
voice / coach UX parity.
