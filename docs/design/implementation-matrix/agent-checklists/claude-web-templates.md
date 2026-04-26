# `claude-web-templates` — Templates checklist

> **Owner of:** `templates`, `template-builder`, `template-run`, `template-editor` (legacy), `template-sketch`.

---

## Pre-flight

- [ ] Read prototype source carefully — three files compose the builder
  (registry, UI, slash menu), not one.
- [ ] Confirm Phase 0 (design-system) merged.

## Sources of truth

| Slug | Source |
|---|---|
| `templates` | `screens-templates.jsx#ScreenTemplatesV2` (V2 — replaces v1) |
| `template-builder` | `screens-template-builder-ui.jsx#ScreenTemplateBuilderV2` |
| `template-builder` (block registry) | `screens-template-builder.jsx#TB_BLOCK_TYPES` |
| `template-builder` (slash menu) | `screens-template-builder-slash.jsx#TB_SLASH_SHORTCUTS` |
| `template-run` | `screens-template-run.jsx#ScreenTemplateRunV2` |
| `template-editor` | `screens-3.jsx#ScreenTemplateEditor` (legacy — deprecated) |
| `template-sketch` | `screens-3.jsx#ScreenTemplateSketch` (showcase) |

## Block-type registry — extract first

`TB_BLOCK_TYPES` defines the schema for every block in a template. Port
this to `apps/web/components/templates/blockTypes.ts` **before** the
builder UI:

- `heading`, `paragraph`, `checklist`, `subtasks`, `prompt`, `energy`,
  `rating`, `habit`, `timeblock`, `callout`, `divider`, …

Each block has `type`, `label`, `icon`, `desc`, `defaults`. Keep that
shape — the builder, run mode, and Convex schema all reference it.

## Order of work

1. `apps/web/components/templates/blockTypes.ts` (registry).
2. `templates` index — list / pick / start / edit.
3. `template-builder` — bare layout, canvas + palette + inspector.
4. `template-builder` slash menu — typed picker inside any block.
5. `template-run` — bare layout, guided execution.
6. **Skip** `template-editor` and `template-sketch` for Phase 1 launch.

## Acceptance

- [ ] Block registry typed (`type Block = …`).
- [ ] DnD: insufficient evidence — confirm allowed lib (HARD_RULES §2 lists no DnD lib explicitly forbidden, but discuss with `claude-ui-pkg` first).
- [ ] Slash inside any block opens picker; arrow keys + enter to insert.
- [ ] Run mode advances through blocks with progress bar.
- [ ] Convex: `templates.list`, `templates.get`, `templates.create`,
      `templates.update`, `templates.startRun`, `templates.completeRun`.

## Hand-off

Update `screens.json`. Mark legacy `template-editor` as `deprecated: true`
permanently — do not lift to `wired`.
