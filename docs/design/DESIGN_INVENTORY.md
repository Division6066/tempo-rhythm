# Tempo Flow — Design Inventory

**Phase:** −1 prototype (responsive HTML reference)  
**Source:** `docs/design/claude-export/design-system/` (Design System v1.0, April 2026)  
**Prototype:** `docs/design-references/tempo-flow-2026-04-18/TempoFlow Prototype.html` (on branch `codex/design-reference-files-2026-04-26`)

## Tokens (extracted only)

All colors, type, spacing, radii, shadows, and motion come from `docs/design/tokens.css`. Do not invent values outside this file.

| Token group | Key variables |
|---|---|
| Core palette | `--ink`, `--cream`, `--tempo-orange`, `--soft-orange`, `--dust-grey`, `--line` |
| Semantic | `--moss`, `--brick`, `--amber`, `--slate-blue` (+ `-bg` variants) |
| Surfaces | `--surface-page`, `--surface-card`, `--surface-sunken` |
| Typography | `--font-serif`, `--font-sans`, `--font-mono`, `--size-h1`…`--size-caption` |
| Spacing | `--space-1`…`--space-24` (8-pt grid) |
| Layout | `--sidebar-w`, `--topbar-h`, `--container` |
| Motion | `--ease`, `--dur-snap`, `--dur-default` |

## Component registry

Machine-readable IDs: `docs/design/COMPONENT_REGISTRY.json`  
HTML boundary comments: `<!-- @tfComponent TF.Component.Name -->`

## Screen manifest

All screens: `docs/design/SCREEN_MANIFEST.json`  
Responsive HTML variants: `docs/design/screens/{screen-id}/{desktop,tablet,mobile}.html`

## Breakpoints

| Variant | Width | Shell behavior |
|---|---|---|
| `desktop.html` | ≥1280px | Full sidebar (256px) + multi-column grids |
| `tablet.html` | 768–1023px | Icon rail (64px) or drawer; 2-col → 1-col |
| `mobile.html` | ≤767px | Single column; bottom nav; hamburger drawer |

## Screen batches (responsive grind)

| Batch | Screen IDs | Status |
|---|---|---|
| `flow-01` | `daily-note`, `today`, `brain-dump`, `coach`, `plan` | responsive HTML complete |
| `library-01` | `tasks`, `notes`, `note-detail`, `journal`, `calendar` | pending |
| `library-02` | `habits`, `habit-detail`, `routines`, `routine-detail`, `goals` | pending |
| `library-03` | `goal-detail`, `goals-progress`, `projects`, `project-detail`, `project-kanban` | pending |
| `you-01` | `analytics`, `activity`, `templates`, `search`, `command` | pending |
| `settings-01` | `settings`, `settings-prefs`, `settings-integrations`, `billing`, `notifications` | pending |
| `onboarding-01` | `sign-in`, `onboarding`, `landing`, `about`, `changelog` | pending |

## Shared styles

- `tokens.css` — design tokens only
- `shell.css` — app chrome + component primitives (from Claude export)
- `responsive-layout.css` — breakpoint-specific shell overrides
