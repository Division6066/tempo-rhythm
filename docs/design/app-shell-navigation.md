# Tempo Flow app shell navigation

This is the integration guide for app-shell work. Feature agents should be able
to add or fill screens without editing the shell components directly.

## Source of truth

Web shell navigation is defined in `apps/web/lib/tempo-nav.ts`.

That registry feeds:

- desktop sidebar sections
- topbar breadcrumb/title context
- mobile web bottom tabs and drawer
- Cmd/Ctrl+K screen picker
- route-metadata tests

If a screen needs to appear in the app shell, add or update its `TempoScreen`
entry first. Avoid hard-coding route lists inside `Sidebar`, `Topbar`,
`MobileNav`, or `CommandPalette`.

## Metadata fields

Required:

- `slug` — stable machine-readable screen id.
- `title` — page title shown in the topbar and picker.
- `route` — route users should navigate to.
- `category` — one of the primary shell groups.
- `summary` — one calm sentence used by the picker and docs.

Optional:

- `keywords` — local-only search helpers for Cmd/Ctrl+K.
- `navLabel` — shorter label for cramped chrome.
- `bare` — route intentionally renders outside the app shell.
- `showInSidebar: false` — route is searchable/openable but not primary nav.
- `showInPalette: false` — metadata exists, but Cmd/Ctrl+K should hide it.
- `mobileTab: true` — route is one of the five primary mobile destinations.
- `icon` — key from `@tempo/ui/icons`'s `TempoIcon` lookup.

## Shell vs feature ownership

App-shell agents own:

- route grouping
- sidebar/topbar/mobile navigation chrome
- screen-picker shell
- inert scaffold pages
- app-shell docs and registry tests

Feature agents own:

- page internals
- Convex queries/mutations/actions
- form behavior
- AI proposal flows
- feature-specific empty/error/loading states

Do not add feature logic to shell components. If a route needs a place to live
before feature logic exists, add a scaffold page that uses
`ScaffoldScreen`.

## Bare routes

Use `bare: true` for focused or pre-auth surfaces that should not show the
sidebar/topbar:

- sign-in / onboarding
- focused daily note
- template builder/run flows
- public marketing pages

Bare routes can still have metadata for route matching, but the screen picker
usually hides pre-auth and marketing pages with `showInPalette: false`.

## Scaffold expectations

Scaffold pages should:

- start with a pseudo-code header block (`@screen`, `@category`, `@source`,
  `@summary`, `@queries`, `@mutations`, `@auth`, and notes/routes as useful)
- render `ScaffoldScreen`
- use shame-proof copy
- import no Convex feature functions
- import no AI/provider SDKs

## Mobile primary tabs

Tempo's primary mobile navigation is:

1. Today
2. Tasks
3. Coach
4. Library
5. Settings

Secondary screens (Notes, Journal, Calendar, Habits, Routines, Templates, and
similar) should remain reachable from the Library or Settings tab homes unless
a later product decision promotes them.
