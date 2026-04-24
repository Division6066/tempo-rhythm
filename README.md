# Tempo Flow

**Your brain's operating system.**

Tempo Flow is an open-source, overwhelm-first AI daily planner and personal operating system. It unifies tasks, notes, journal, calendar, habits, routines, goals, projects, and an AI executive-function coach into one app. It is built for neurodivergent brains — people with ADHD, autism, anxiety, burnout, or just too many tabs open — and it is designed to make the overwhelming feel workable.

## Status

- **License:** Business Source License 1.1 (converts to Apache License 2.0 four years after each versioned release). See [`LICENSE`](./LICENSE).
- **Current phase:** Tempo 1.0 "Foundation" — active development.
- **Repository visibility:** public / source-available.
- **Production hosting:** reserved to the Licensor. Self-hosting for your own individual or internal organizational use is expressly permitted — see the Additional Use Grant in `LICENSE`.

## Tech stack (this repository — MVP target)

- **Web:** Next.js 16 (App Router, Turbopack) deployable on Vercel, Progressive Web App–ready
- **Mobile:** Expo SDK 53 (React Native) for iOS and Android, NativeWind 4
- **Backend:** Convex at repo root `convex/` (queries, mutations, actions, HTTP routes, scheduled jobs, file storage)
- **Auth:** Convex Auth (`@convex-dev/auth`)
- **Payments:** RevenueCat on mobile; Polar (`@polar-sh/nextjs`) for web checkout in this repo — align with PRD over time
- **AI routing (target):** OpenRouter — Gemma / Mistral per `docs/brain/PRDs/PRD_Phase_1_MVP.md` (router package planned)
- **Styling:** Tailwind CSS v4 + PostCSS in `apps/web`; NativeWind + Tailwind 3.x in `apps/mobile`
- **Shared packages:** `packages/types`, `packages/utils`, `packages/ui` (tokens and shared UI to grow here)
- **Typography (target):** Newsreader, Inter, IBM Plex Mono, OpenDyslexic toggle per PRD
- **Compliance (target):** GetTerms.io
- **Analytics (target):** PostHog (opt-in)
- **Observability (target):** Sentry + PostHog
- **Package manager:** pnpm
- **Monorepo:** Turborepo (`apps/*`, `packages/*`)

See [`docs/HARD_RULES.md`](./docs/HARD_RULES.md) for the full non-negotiables list and [`docs/brain/PRDs/PRD_Phase_1_MVP.md`](./docs/brain/PRDs/PRD_Phase_1_MVP.md) for the full MVP spec.

## Coding session workflow

Pick three tasks, implement, tick off — see [`docs/SESSION_WORKFLOW.md`](./docs/SESSION_WORKFLOW.md). In Cursor chat use **`/whats-next`** and **`/tick-task`** (defined under `.cursor/commands/`).

## Quick start

```bash
# 1. Clone
git clone https://github.com/<your-org>/tempo-flow.git
cd tempo-flow

# 2. Install dependencies
pnpm install

# 3. Start Convex dev backend (runs in a separate terminal; keep it running)
pnpm convex:dev

# 4. Start the web app (Next.js)
pnpm dev:web

# 5. (Optional) Start the mobile app
pnpm dev:mobile
```

Required environment variables are documented in `.env.example` at the repo root. Copy to `.env.local` and fill in values from your own Convex, Mistral, RevenueCat, and GetTerms accounts before running.
- See [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md) for the full four-mode contract and [docs/SHIP_STATE.md](docs/SHIP_STATE.md) for what's shipped vs planned.

## Documentation tree

All project documentation lives under [`./docs/`](./docs/).

- [`docs/HARD_RULES.md`](./docs/HARD_RULES.md) — non-negotiables. Read this first every session.
- [`docs/CURSOR_RULES.md`](./docs/CURSOR_RULES.md) — expanded rules with rationale.
- [`docs/CURSOR_PROMPTS.md`](./docs/CURSOR_PROMPTS.md) — prompt library for Cursor IDE and Cursor Cloud agents.
- [`docs/brain/TASKS.md`](./docs/brain/TASKS.md) — master task list, owner-tagged.
- [`docs/SESSION_WORKFLOW.md`](./docs/SESSION_WORKFLOW.md) — `/whats-next` / `/tick-task` session flow.
- [`docs/brain/PRDs/`](./docs/brain/PRDs/) — one PRD per public phase (1.0, 1.1, 1.5, 2.0, 3.0).
- [`docs/brain/AGENT_SETUP/`](./docs/brain/AGENT_SETUP/) — Tempo-specific setup guides for Zo Computer, Twin.so, Pokee AI, and the overall agent handoff map.

For project-agnostic agent workflow patterns that can be reused across other projects, see the separate `reusable-workflows/` folder distributed alongside this repo.

## Roadmap (public phases)

1. **Tempo 1.0 "Foundation"** — full MVP, all 42 screens, web PWA + iOS App Store + Google Play Store.
2. **Tempo 1.1 "Presence"** — polish, founder vlog embed, public `CONTRIBUTING`, community changelog, plugin SDK skeleton.
3. **Tempo 1.5 "Memory"** — bring-your-own-key providers, offline on-device inference, privacy modes, NotebookLM-style scoped retrieval, flashcards, spaced repetition, Anki export, RemNote sync, public plugin SDK.
4. **Tempo 2.0 "Connected"** — calendar and health integrations, chat history import, MCP server, CLI, browser extension, REST API, photo accountability, messaging bridges, Bluetooth sync, avatar body-double for the top tier.
5. **Tempo 3.0 "Ecosystem"** — learning-platform integrations, bi-directional builder sync, community template gallery, user-selectable EU/Swiss inference region, plugin marketplace.

See the full roadmap in the strategy `.docx` files distributed with this repo, and per-phase PRDs under `docs/brain/PRDs/`.

## Supporting the project

Tempo Flow is developed by one person. If it helps you, consider supporting development:

- **GitHub Sponsors** (tiered): `https://github.com/sponsors/<amit-handle>` (placeholder — update after launch)
  - **Supporter** — name in credits, GitHub Sponsor badge
  - **Beta Tester** — early access to closed-beta builds, Discord role gated access
  - **Founder's Circle** — beta access plus a monthly founder AMA, feature voting
- **Ko-fi:** `https://ko-fi.com/<amit-handle>` (placeholder)
- **Buy Me a Coffee:** `https://www.buymeacoffee.com/<amit-handle>` (placeholder)
- **Crypto donations** (from Tempo 2.0 onwards): BTC, ETH, SOL, XMR addresses will be published in Settings → Donate.

## Community

- **Discord:** `https://discord.gg/<invite>` (placeholder — joining unlocks the `#community` channels; GitHub Sponsor tiers unlock `#beta-testers` and `#founders-circle` role-gated channels)
- **Founder vlog:** `https://www.youtube.com/@<channel>` (placeholder — techno-optimism, future-proofing, building with AI)
- **Ask the Founder:** built into the app — Settings → Ask the Founder. Submissions land in a private queue; opt-in transcripts may be published as part of the 1.1 release.

## Linting

Tempo Flow is **Biome-only** — no ESLint, no Prettier anywhere in the repo.

### Shared config approach

A root shared config lives at [`packages/config/biome.json`](./packages/config/biome.json). Each app extends it:

| File | Extends | App-level overrides |
|------|---------|---------------------|
| `apps/web/biome.json` | `../../packages/config/biome.json` | CSS parser (`tailwindDirectives`, `cssModules`) |
| `apps/mobile/biome.json` | `../../packages/config/biome.json` | `lineWidth: 80`, `quoteStyle: "single"` |

### Common rule highlights

- `recommended: true` base + explicit error/warn escalations for key correctness and suspicious rules.
- `noConsole: "warn"` — console calls allowed during development, surfaced in CI.
- `noExplicitAny: "off"` — pragmatic; tighten per-file when possible.
- `useExhaustiveDependencies: "warn"` on all `.tsx/.ts/.jsx/.js` files.

### Tailwind class sorting

Tailwind class sorting is **intentionally disabled** in Biome. `apps/web` uses Tailwind v4 (shadcn/ui conventions) and `apps/mobile` uses NativeWind (different class ordering expectations). A shared sort order cannot be enforced without false positives across both targets.

### Running the linter

```bash
# Lint all workspaces via Turborepo
bun run lint

# Lint a single workspace
cd apps/web && bun run lint
cd apps/mobile && bun run lint
```

## Contributing

See `CONTRIBUTING.md` (published alongside the Tempo 1.1 release). Until then, open an issue before starting work on a significant change, and follow [`docs/HARD_RULES.md`](./docs/HARD_RULES.md) rigorously.

Third-party plugins built against the public plugin API (published in Tempo 1.5) may be monetized by their authors through GitHub Sponsors, Patreon, Ko-fi, Buy Me a Coffee, or similar patronage platforms. See the Additional Use Grant in `LICENSE` for the full wording.

## License

Business Source License 1.1. Converts to Apache License 2.0 four years after each versioned release. Full text in [`LICENSE`](./LICENSE).

Copyright © 2026 Amit Levin.
