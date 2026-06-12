# Design HTML agents — read first

## Scope

Responsive static HTML reference screens for Tempo Flow phase −1. **No React, TypeScript, or Convex.**

## Read before each batch

1. `docs/design/DESIGN_INVENTORY.md` — tokens, batches, breakpoints
2. `docs/design/COMPONENT_REGISTRY.json` — exact `TF.*` component IDs
3. `docs/design/SCREEN_MANIFEST.json` — screen list + responsive status
4. Source JSX in `docs/design/claude-export/design-system/screens-*.jsx`

## Output per screen

```
docs/design/screens/{screen-id}/desktop.html   # ≥1280px
docs/design/screens/{screen-id}/tablet.html    # 768–1023px
docs/design/screens/{screen-id}/mobile.html    # ≤767px
```

## Rules

- Reuse exact component IDs from `COMPONENT_REGISTRY.json` — no renames
- Link `../../tokens.css`, `../../shell.css`, `../../responsive-layout.css`
- Add `<!-- @tfComponent TF.Component.Name -->` on every component boundary
- Preserve all copy, hierarchy, and primary CTA from the JSX source
- Desktop: full sidebar + multi-column where designed
- Tablet: sidebar → icon rail; 2-column → 1-column
- Mobile: single column; bottom nav or hamburger; max 3–5 list items per section
- Primary action must be one tap on mobile

## After a batch

Set `"responsive": true` for each screen in `SCREEN_MANIFEST.json`.
