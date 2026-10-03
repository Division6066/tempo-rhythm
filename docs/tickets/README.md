# docs/tickets — factory tickets

- One folder per batch: `docs/tickets/<batch>/`, one file per ticket: `<ticket id>.md`
  (front-matter from AGENTS.md §8.1, then the 11 fields).
- Written by the ticket writer (`factory-write-tickets`) as ONE `config` PR "Tickets <batch>".
  Amit reviews and merges it; then `factory-promote` creates/updates one issue per file.
- Templates: `_templates/component.md`, `_templates/data-convex.md`, `_templates/data-postgres.md`.
- Changes here go only through `config` PRs that change nothing outside `docs/tickets/` and
  `docs/contracts/` (config-guard rule 2).
