# Tempo Flow — Responsive HTML grind (agents)

**Phase:** −1 prototype  
**Output:** Static HTML only under `docs/design/screens/{screen-id}/`.

## Read first

1. `DESIGN_INVENTORY.md` — tokens, typography, layout rules
2. `COMPONENT_REGISTRY.json` — canonical `TF.*` component IDs
3. `SCREEN_MANIFEST.json` — screen list + `responsive` flag
4. Source JSX: `claude-export/design-system/screens-*.jsx`

## Per-screen deliverables

For each screen in the batch:

| File | Viewport |
|------|----------|
| `desktop.html` | ≥1280px — full sidebar, multi-column |
| `tablet.html` | 768–1023px — icon rail or drawer |
| `mobile.html` | ≤767px — single column, bottom nav or hamburger |

## Rules

- Reuse exact component IDs from `COMPONENT_REGISTRY.json` — no renames.
- Every component boundary: `<!-- @tfComponent TF.Component.Name -->`
- Link `../../tokens.css` and `../../responsive-shell.css`
- Preserve copy, hierarchy, and primary CTA from the JSX source.
- Mobile: primary action obvious in one tap; max 3–5 list items per section.
- Do **not** add React, TypeScript, Convex, or new colors/fonts outside tokens.

## Resize patterns

| Pattern | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| App shell | `TF.Shell.Sidebar` full | `TF.Shell.SidebarRail` | `TF.Shell.BottomNav` + drawer |
| Main grid | `grid-asym` 2-col | 1-col stack | 1-col stack |
| Task lists | all items | all items | first 5 items |
| Daily note | 3-pane | drawer calendar + editor | editor + bottom sheet rail |

## After each batch

Set `"responsive": true` in `SCREEN_MANIFEST.json` for completed screens.
