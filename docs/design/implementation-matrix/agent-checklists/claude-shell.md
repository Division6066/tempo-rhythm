# `claude-shell` — App shell checklist

> **Owner of:** `apps/web/components/tempo/Sidebar.tsx`, `Topbar.tsx`,
> `TempoShell.tsx`, `CommandPalette.tsx`, `ScaffoldScreen.tsx`,
> `apps/web/components/providers/`, and the `(tempo)`, `(bare)`, `(app)`,
> `(auth)` route groups.

---

## Pre-flight

- [ ] Read [`../README.md`](../README.md).
- [ ] Phase 0 must be merged.

## Phase 1 deliverables

1. **Re-verify Sidebar / Topbar / CommandPalette** against the
   prototype:
   - Sidebar reads `CATEGORIES` + `screensByCategory` from
     `apps/web/lib/tempo-nav.ts`. Confirm new entries added in this run
     (`note-detail`, `habit-detail`, etc) flow through correctly without
     showing detail routes in the sidebar (filter `bare === true` and
     filter dynamic routes).
   - Topbar emits the right title from `findScreen`.
   - `CommandPalette` searches all screens including dynamic ones.

2. **Add a script to regen `tempo-nav.ts` from `screens.json`**:
   - Path: `scripts/regen-tempo-nav.mjs`.
   - Reads `docs/design/implementation-matrix/screens.json`.
   - Emits `apps/web/lib/tempo-nav.ts` deterministic content.
   - CI guard: fail if regenerated content drifts.
   *(scaffolded by this matrix run; verify the generated file matches.)*

3. **Confirm bare layouts**:
   - `(bare)` routes: `daily-note`, `templates/builder`, `templates/run`,
     `billing/trial-end`, `onboarding`. None of these should leak the
     sidebar.

4. **Providers**:
   - `apps/web/components/providers/providers.tsx` mounts the theme
     provider. Confirm theme + dyslexia + read-aloud all surface a
     hook/state.

## Acceptance

- [ ] Sidebar matches prototype hierarchy (Flow / Library / You / Settings sections).
- [ ] ⌘K opens / closes; arrow keys + enter navigate.
- [ ] Bare routes are bare.
- [ ] All Phase 0 missing primitives consumed where the prototype uses them.

## Hand-off

This is a foundation phase — once done, every other agent unblocks.
Mark complete in `merge-order.md` Phase 1 section.
