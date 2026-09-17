# Tech stack — this repository

Factory map of what `tempo-rhythm` actually runs. Intent (PRDs, tickets, README
quick-start) can drift; this file follows the committed manifests. If a ticket
disagrees with `package.json` / `convex/` / `apps/*`, **the code wins** — say
so in the PR instead of installing the ticket's stack.

Related: [`HARD_RULES.md`](./HARD_RULES.md), [`CI.md`](./CI.md),
[`TEMPLATE_STATE.md`](./TEMPLATE_STATE.md), [`HARNESS.md`](./HARNESS.md),
[`HOW_TO_ADD_A_FEATURE.md`](./HOW_TO_ADD_A_FEATURE.md).

Documentation lives under [`docs/`](./) (including [`docs/wiki/`](./wiki/)).
`tempo-rhythm` has **no GitHub Wiki tab**. Do not open or sync a GitHub Wiki.

---

## Package manager and monorepo

| Item | This repo |
|---|---|
| Package manager | **Bun `1.3.9`** (`packageManager` in root `package.json`, `bun.lock`) |
| Workspaces | `apps/*`, `packages/*` via Turborepo `^2.3.3` |
| Lint / format | **Biome 2.3.8** only — no ESLint, no Prettier |
| Root scripts | `dev`, `dev:web`, `dev:mobile`, `build`, `typecheck`, `lint`, `test`, scans |

The README quick-start still says `pnpm` in places. **That line is wrong.** Use
Bun. Do not add npm / pnpm / yarn lockfiles.

---

## Surfaces

| Surface | Path | Stack (as shipped) |
|---|---|---|
| Web | `apps/web` (`tempo-rhythm-web`) | Next.js `^16`, React `19.2.3`, App Router, Turbopack, Tailwind CSS **v4** + `@tailwindcss/postcss` |
| Mobile | `apps/mobile` (`tempo-rhythm-mobile`) | Expo `~54`, Expo Router `~6`, React Native `0.81.5`, NativeWind `^4.2` on Tailwind **3.4.x** |
| Backend | `convex/` at repo root | Convex `^1.32.0` — queries, mutations, actions, HTTP, scheduled jobs |
| Auth | `convex/auth.ts`, `@convex-dev/auth` | **Convex Auth only** |
| Shared types | `packages/types` | TypeScript types, no runtime deps |
| Shared UI / tokens | `packages/ui` | Web + native exports (`./native`, `./theme`, `./brand`) |
| Shared utils | `packages/utils` | Pure helpers |
| Shared Biome | `packages/config` | Root Biome preset the apps extend |

Web and mobile **intentionally** use different Tailwind majors. Do not downgrade
web to v3 or add a second global utility-CSS framework on web.

---

## Data, auth, payments, AI (product)

| Concern | Use | Do not use |
|---|---|---|
| Database / API | Convex `v.*` validators + `defineSchema` | Firebase, Supabase, Prisma, Drizzle, TypeORM, direct `pg` / `mongodb` |
| Auth | Convex Auth | Clerk, Auth0, NextAuth, BetterAuth |
| App state | Convex reactive queries; local UI state in React | Redux, Zustand, Jotai, Recoil, MobX |
| HTTP | Native `fetch` | Axios, ky, got |
| Mobile payments | RevenueCat (`react-native-purchases`) | Direct Stripe SDK |
| Web checkout (this repo) | Polar (`@polar-sh/nextjs`) — align with PRD over time | Pasting Stripe secret keys into the client |
| Product LLM | Mistral API via native `fetch` in Convex actions (`convex/lib/ai_router.ts`) | `openai`, `@anthropic-ai/*`, `@google/generative-ai`, `@mistralai/mistralai`, OpenRouter |

Product model tiers (HARD_RULES §6): `fast` → `mistral-small-latest`,
`balanced` → `mistral-medium-latest`, `deep` → `mistral-large-latest`. Every
AI-originated write is a **proposal** (accept / edit / reject), never a silent
mutation.

**Factory / coding-agent models** (who writes this repo) are a different
allowlist — see [`HARNESS.md`](./HARNESS.md). Do not confuse the two.

---

## Quality gates (no extra frameworks)

Root `package.json` already wires:

```bash
bun run typecheck
bun run lint
bun run test          # bun test convex apps/web/lib tests/unit
bun run scan:forbidden-tech
bun run scan:ram-only-audit
bun run scan:design-tokens
bun run check:notices
```

Playwright (`@playwright/test`) runs in CI. There is **no**
`convex:schema-guard` script in root `package.json` today. See [`CI.md`](./CI.md).

---

## Knowledge graph

| Artefact | Status |
|---|---|
| Graphify snapshot `docs/graphs/tempo-rhythm.json` | **generated** (see [`TEMPLATE_STATE.md`](./TEMPLATE_STATE.md)) |
| Live Graphify `graphify-out/graph.json` | gitignored; rebuild with `graphifyy` (`graphify update . --no-cluster`) |
| Understand Anything `.ua/knowledge-graph.json` | **not generated** — do not invent `.ua/` |

The graph is ground truth for "what exists in code." Docs and tickets are
intent.

---

## Bolt shells

Bolt.new / bolt.diy (and similar) starter shells that appear in planning packs
or design exports are **reference specs only**. They are not a second
implementation, not a deploy target for this repo, and not a reason to add
Vite, Firebase, or a competing CSS stack. Land features in `apps/web`,
`apps/mobile`, and `convex/`.

---

## Secrets

This file names **products**, not credentials. Env names and the four-mode
contract live in [`ENVIRONMENTS.md`](./ENVIRONMENTS.md). Never paste values,
tokens, or `.env` contents into docs, PRs, or logs.
