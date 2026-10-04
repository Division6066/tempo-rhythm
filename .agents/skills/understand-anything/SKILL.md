---
name: understand-anything
description: >-
  use this when regenerating or querying the Understand Anything knowledge
  graph for this repo (architecture map, dashboard, onboard guide)
---

# Understand Anything (project)

Cursor plugin: **understand-anything** (Egonex-AI). Installed at the user/account level.

## Artefact

Committed dashboard graph (when present):

`.ua/knowledge-graph.json`

Also mirror a copy under `docs/graphs/` only if `docs/TEMPLATE_STATE.md` names that path.

## Regenerate (local / agent machine)

1. Ensure the Cursor **understand-anything** plugin is enabled.
2. From repo root, run the `/understand` skill (or `understand` skill) against this project.
3. Confirm `.ua/knowledge-graph.json` exists.
4. Update `docs/TEMPLATE_STATE.md` Knowledge graph table: set Actual path + status **generated**.
5. Open a **draft** PR. Do not merge.

## Regenerate on merge

After any merge that changes source layout, regenerate this graph and the Graphify graph in the same PR follow-up (or the next W0/S8 pass):

1. `graphify update . --no-cluster` then copy `graphify-out/graph.json` → `docs/graphs/tempo-rhythm.json` (repo-relative paths only).
2. Run `/understand` (Cursor plugin **understand-anything**) to write `.ua/knowledge-graph.json`. Do not invent this file.
3. Update `docs/TEMPLATE_STATE.md` Knowledge graph table.

Ticket CONTEXT fields should point at the live paths in `docs/TEMPLATE_STATE.md`.

## Constraints

- No secrets in the graph or PR.
- Do not fetch unrelated corpora.
- Graphify structural facts win over semantic guesses when they disagree.
