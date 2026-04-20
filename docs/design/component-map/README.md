# Component map — Claude export → PRD → pseudocode

Every screen in the design export is documented here with:

- **Tier A** — full `@action` / `@mutation` / `@query` / `@navigate` / `@prd` tags per interactive control (Flow + shared primitives + key mobile screens).
- **Tier B** — screen header + one-line list of interactive affordances (remaining screens).

**Manifest:** [`_INDEX.md`](_INDEX.md) (which files exist + counts)  
**Gap tracker (task 7):** [`MISSING-SCREENS.md`](MISSING-SCREENS.md) — list of every screen not yet mapped  
**Program ticket:** `docs/brain/tickets/T-0021-cluster.md` (seven tasks; **T-0021** = shipped slice, **T-0022** = remaining coverage)

**Conventions:** [`../pseudo-code-conventions.md`](../pseudo-code-conventions.md)  
**Routes + sources:** [`../screen-inventory.md`](../screen-inventory.md)  
**PRD:** [`../../brain/PRDs/PRD_Phase_1_MVP.md`](../../brain/PRDs/PRD_Phase_1_MVP.md)

**HTML:** Markdown remains the detailed control map. The bundled preview [`../claude-export/TempoFlow Prototype.html`](../claude-export/TempoFlow%20Prototype.html) includes an inline **`tempo-screen-manifest`** HTML comment (all web + mobile slugs + `@prd` refs) immediately after `<body>` — ship requirement for **T-0022** closeout.
