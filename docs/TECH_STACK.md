# Tech stack — tempo-rhythm

Honest snapshot from repo files on `integration` (2026-09-17). Names only; no env values.

## Runtime / apps

| Layer | Observed |
|-------|----------|
| Monorepo | bun `1.3.9` workspaces + turbo |
| Apps | `apps/web` (`tempo-rhythm-web` — Next.js `^16`, React 19, Turbopack), `apps/mobile` (`tempo-rhythm-mobile` — Expo `~54`, expo-router) |
| Packages | `packages/ui`, `packages/config`, `packages/types`, `packages/utils` |
| Styling / lint | Tailwind 4, Biome `2.3.8`, ultracite |
| Hosting names | Vercel (`tempo-web-delta.vercel.app` homepage), Expo / EAS |
| Billing names | Polar (`@polar-sh/nextjs` on web), RevenueCat (mobile docs) |

## Backend / data

| Layer | Observed |
|-------|----------|
| Convex | Root dependency `convex` `^1.32.0`, `@convex-dev/auth` `^0.0.91`; scripts `convex:dev` / `convex:deploy` / `convex:codegen` |
| Tests | bun test + Playwright |

## Factory / knowledge

| Tool | Path / status |
|------|----------------|
| Graphify | `docs/graphs/tempo-rhythm.json` — **generated** (9870 nodes / 11882 edges per `TEMPLATE_STATE.md`) |
| Understand Anything | `.ua/knowledge-graph.json` — **not generated** |
| Skills | `.agents/skills/graphify`, `.agents/skills/understand-anything` |
| Wiki tab | GitHub wiki **disabled**; use `docs/` only (in-tree `docs/wiki/` may exist but is not the Wiki tab) |

## Mid-tier model rule (product code)

Allowed: **GPT 5.6 Terra**, **GLM 5.3 Flash**, **DeepSeek V4.1 Flash**, **Claude Sonnet 5**, **Grok 4.5**, **Grok 4.6**.  
Never: Fable / Astra / Opus / Soul. Haiku / Luna unused.

## Bolt note

No Bolt prototypes as product code. Bolt shells are reference specs only.

Last synced: 2026-09-17
