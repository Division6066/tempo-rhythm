# Claude design export — Tempo Flow

This directory holds the reference design system generated via Claude
artifacts in April 2026. The canonical source is `design-system/`.

## What's here

- `design-system/` — the unpacked design package: 42 web screens, 12 mobile
  screens, marketing site, token system, shared components. See
  `design-system/README.md` for a tour.
- `design-system/uploads/Tempo_Flow_Master_Document.md` — consolidated
  13k-line document (PRD, roadmap, rules). Historical reference only;
  canonical versions of those documents live under `docs/brain/`.
- `TempoFlow Prototype.html` — standalone bundler artefact (~2.7 MB). Open
  locally in a browser for a click-through preview. Tracked for reference
  alongside the unpacked JSX/CSS source.
- `Tempo Flow Design System.zip` — original archive of the export. Tracked
  for reproducibility and handoff.

## How this powers the port

- `docs/design/screen-inventory.md` maps every screen slug to a target
  route + the source JSX file/line range.
- `docs/design/pseudo-code-conventions.md` documents the `@action` /
  `@mutation` / `@query` tag set that every ported component uses.
- `docs/design/component-map/` — per-screen PRD + pseudocode labels (see
  `_INDEX.md`).
- Scaffold routes across `apps/web` + `apps/mobile` cite their origin via
  an `@generated-by: T-F004 scaffold` / `T-F008 scaffold` marker.

## Licensing

The design was produced for the Tempo Flow product and is covered by the
repo's root `LICENSE` (BSL 1.1). Third-party fonts referenced
(Newsreader, Inter, IBM Plex Mono, OpenDyslexic) carry their own OFL /
SIL licences; see each font's upstream source.
