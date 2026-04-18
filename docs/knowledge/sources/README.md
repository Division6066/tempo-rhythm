# `sources/` — Raw input for the knowledge base

Drop raw source material into this folder under a named subfolder. A distillation agent reads from here and folds content up into `brand/`, `tickets/`, `agents-playbook/`, etc.

## How to drop source material

1. Create a subfolder named after the domain: `brand-input/`, `competitor-research/`, `figma-export-2026-04/`, etc.
2. Put the files in it: PDFs, markdown, screenshots, CSV, PPTX, Figma exports. Anything.
3. Add a short `README.md` at the root of the subfolder with:
   - What the material is
   - Where it came from
   - What you want distilled from it (brand voice? visual tokens? ticket tasks? playbook rules?)
   - Anything an agent should *ignore*
4. Tell the agent: "Ingest `docs/knowledge/sources/<subfolder>/` into the knowledge base."
5. The agent runs, distills, and proposes diffs to `brand/*`, `tickets/*`, `agents-playbook/*`. You accept / reject those in a standard PR review.

## What lives here long-term

- **Kept:** a brief `README.md` per subfolder with provenance, date, and distillation status.
- **Kept:** small source files that are still referenced by the distilled knowledge (style guide PDFs, brand books).
- **Moved to git-ignored archive:** large dumps (full Figma exports, old drafts) once distilled. Do not bloat the repo.

## Current sources

*(Empty — awaiting drops.)*

Suggested first drops:
- `brand-input/` — brand identity material, mood boards, style guides, old decks.
- `competitor-research/` — tone-of-voice exemplars from apps Tempo will contrast itself against.
- `prior-founder-writing/` — Amit's existing writing that captures on-brand voice.
