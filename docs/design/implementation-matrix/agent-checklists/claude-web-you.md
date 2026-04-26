# `claude-web-you` — You-category screens checklist

> **Owner of:** `analytics` (Insights), `activity`, `search`, `command`, `empty-states`.
> Templates live with `claude-web-templates` (separate file).

---

## Pre-flight

- [ ] Read `docs/HARD_RULES.md` §10 (privacy/analytics — opt-in).
- [ ] Confirm Phase 0 + Phase 1 merged.

## Source-file fixes you'll see

| Slug | Correct source |
|---|---|
| analytics | `screens-3.jsx#ScreenAnalytics` (scaffold says `screens-5.jsx`) |
| activity | `screens-3.jsx#ScreenActivity` |
| search | `screens-3.jsx#ScreenSearch` |
| command | `screens-3.jsx#ScreenCommand` |
| empty-states | `screens-5.jsx#ScreenEmptyStates` (scaffold says `screens-6.jsx`) |

## Owned screens

### `search` (P2)
- Full-page search across tasks/notes/journal/library
- Acceptance: `search.global` query; result rows tagged by type; keyboard nav.

### `analytics` (P3)
- Streak / completion / mood charts
- Acceptance: `analytics.summary` query; only renders if `profiles.analyticsOptIn === true` (HARD_RULES §10).

### `activity` (P3)
- Recent activity feed (the user's own actions)
- Acceptance: `activity.list` query; pagination cursor.

### `command` (P3)
- Standalone command-bar **screen** (not the global ⌘K modal)
- Acceptance: shares filter logic with `CommandPalette` but as a full page (handy for keyboard-first users).

### `empty-states` (P4 — showcase)
- Internal dev tool showing every empty state
- Acceptance: not gated by auth; useful for visual regression testing.

## Hand-off

Update `screens.json` status. Coordinate with `claude-shell` if `command`
needs to share state with the modal palette.
