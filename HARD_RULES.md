# TEMPO Flow — HARD RULES

> These rules are non-negotiable. No automation, AI agent, or contributor may override them without explicit manual action.

## Rule 1 — Tech Stack (Non-Negotiable)

| Layer | Technology | Forbidden Alternatives |
|---|---|---|
| Web Frontend | Next.js 16+ (App Router) | Remix, Vite SPA, CRA |
| Mobile Frontend | Expo / React Native (Expo Router v4) | bare RN, Capacitor |
| Styling | NativeWind v4 + Tailwind 3.3.2 (PINNED) | styled-components, Emotion, Chakra |
| Backend | Convex (`tremendous-bass-443` for dev) | Firebase, Supabase, Prisma, Drizzle, Express, tRPC |
| Auth | Convex Auth (`@convex-dev/auth`) | Clerk, Auth0, NextAuth, Supabase Auth |
| Payments (Web) | Polar | Stripe, Paddle, LemonSqueezy |
| Payments (Mobile) | RevenueCat (`react-native-purchases`) | Stripe, in-house IAP |
| AI | Gemma 4 26B A4B + Mistral Small 4 via OpenRouter | OpenAI SDK directly |
| Monorepo | Turborepo + pnpm | Nx, Lerna, Yarn workspaces |

## Rule 2 — Forbidden Packages

The following must NEVER appear in any `package.json`:

```
firebase  supabase  prisma  drizzle  clerk  @clerk/*
stripe    express   trpc    openai   @auth/core  next-auth
```

Run `pnpm run check-forbidden` before every commit.

## Rule 3 — Convex Schema Conventions

- `userId` is always `v.optional(v.string())`, NOT `v.id("users")` for cross-auth compatibility.
- No `journals` table. Use `notes` with a `periodType` field.
- All timestamps are `v.number()` (Unix ms).
- All user-facing tables must have `createdAt` and `updatedAt` fields.

## Rule 4 — AI State Safety

- AI NEVER silently mutates user state.
- Every AI suggestion must go through an explicit accept/reject flow before any database write.
- AI-generated content is always marked with `aiGenerated: true` in the schema.

## Rule 5 — Templates

- Templates are finite, curated primitives defined in code.
- Templates are NEVER freeform user-created structures.
- New templates require a PR review.

## Rule 6 — Pricing Tiers

| Tier | Monthly | Annual |
|---|---|---|
| Basic | $5 | $50 |
| Pro | $10 | $100 |
| Max | $20 | $200 |

- No free tier.
- $1 trial only (RevenueCat introductory offer).
- Entitlements: `basic`, `pro`, `max`.

## Rule 7 — Environment Targets

| Deployment | Convex | URL |
|---|---|---|
| Dev (US) | `tremendous-bass-443` | https://tremendous-bass-443.convex.cloud |
| Staging (EU) | `ceaseless-dog-617` | https://ceaseless-dog-617.convex.cloud |
| Production (EU) | `precious-wildcat-890` | https://precious-wildcat-890.eu-west-1.convex.cloud |

## Rule 8 — Required Monorepo Structure

```
tempo-rhythm/
├── apps/
│   ├── web/          Next.js 16+ (App Router)
│   └── mobile/       Expo (React Native)
├── packages/
│   ├── ui/           Shared UI components
│   ├── types/        Shared TypeScript types
│   └── utils/        Shared utilities
├── convex/           Shared Convex backend
├── HARD_RULES.md     This file
├── .cursorrules      AI coding rules
├── turbo.json        Turborepo config
└── pnpm-workspace.yaml
```

## Rule 9 — Secrets Hygiene

- NEVER commit `.env`, `.env.local`, or any file containing API keys, tokens, or secrets.
- NEVER place `REVENUECAT_SECRET_KEY` or `CONVEX_DEPLOY_KEY` in client-visible code.
- `EXPO_PUBLIC_*` vars are visible to the client — only public keys go there.
- `NEXT_PUBLIC_*` vars are visible to the client — only public keys go there.

## Rule 10 — Design System ("Soft Editorial")

| Token | Value |
|---|---|
| Headline font | Newsreader (serif) |
| Body font | Inter (sans-serif) |
| Code font | IBM Plex Mono |
| Dark background | `#131312` |
| Light background | `#F3EBE2` |
| Primary accent | Orange gradient `#D97757 → #E8A87C` |
| Card treatment | Inner shadows, grain texture |

## Rule 11 — Critical Flags (Manual-Only)

The following flags in `config/appConfig.ts` must NEVER be changed by automation:

- `PAYMENT_SYSTEM_ENABLED` — requires manual intent
- `MOCK_PAYMENTS` — requires manual intent
- `PAYWALL_ENABLED` — requires manual intent
- `FORCE_PROD_MODE` — requires manual intent
