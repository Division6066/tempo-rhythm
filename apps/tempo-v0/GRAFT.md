# Graft notes (not a stack README)

This folder is a sibling of `apps/web`. Do not delete or rewrite `apps/web`.
Turbo has no `build` / `typecheck` scripts here on purpose — CI should skip this package.

Swap points, env names, and the first route live in the PR body under **FOR CURSOR**.

## What this v0 now contains

Marketing: `/` landing, `/about`, `/changelog`, `/privacy`, `/terms` (markdown pages).
Auth UI: `/login`, `/sign-up`, `/sign-in` (preview uses Grok Better Auth; graft onto existing `apps/web` auth — do not add a second auth stack).
Intake: `/onboarding` (5 steps).
App: `/today`, `/daily-note`, `/notes`, `/journal`, `/brain-dump`, `/plan`, `/coach` (chat + walkie / hands-free voice), `/tasks`, `/habits`, `/dashboard`, `/memory`, `/settings`.
Later surfaces in this same folder: `/study`, `/map`, `/review`, `/templates`.

`DATA_ADAPTER=mock` is still the only Tempo data switch. Planner data is localStorage. Do not wire Convex from this folder until the graft ticket.

Brand tokens match `docs/design/claude-export/design-system/tokens.css` (cream `#F3EBE2`, ink `#131312`, tempo-orange `#D97757`, Newsreader + Inter).
