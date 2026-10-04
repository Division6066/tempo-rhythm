# Tempo Flow — TRD (Tech Stack & Architecture)

> **Copied verbatim, not rewritten (Phase 06 Step 1, 2026-10-03).** Source: `docs/design/claude-export/design-system/uploads/Tempo_Flow_Master_Document.md`
> (Amit's "Consolidated Master Document", generated 17 April 2026, integration @ 7f293e1).
> The canonical files live in the private submodule `docs/brain/` (agents can't read it), so this
> April copy may be OLDER than `docs/brain/`. Amit's new PRD/TRD replaces this file (Phase 06 Step 2).
> Precedence stays: HARD_RULES > ticket > PRD > chat prompt (docs/knowledge/prds/README.md).

Section: 2.3 Tech Stack & Architecture.

## 2.3 Tech Stack & Architecture

> **Source file:** `Tempo_Flow___Tech_Stack___Architecture.md`

**TEMPO FLOW**   —   Tech Stack & Architecture

**TEMPO FLOW**

*Tech Stack **&** Architecture*

*What is locked. What is deferred. What is banned.*

The one document Cursor, Zo, Twin, Pokee and future contributors must agree on before touching code.

**Version 1.0 — canonical tech stack**

# **0.  Reading rules**

This document is the contract. The PRD says what we build; this says what we build it with. Everything listed under “Locked” is not up for debate during MVP. Everything listed under “Deferred” is a future-phase candidate. Everything listed under “Banned” is actively forbidden — proposing them is fine; using them is not.

| **Hard rule** If a technology is not listed here, it is not in the stack. Adding a new library requires a proposal in GitHub Issues labelled proposal:stack, with Amit as final approver. |
| --- |

# **1.  The locked stack**

## **1.1  Frontend**

| **Area** | **Choice** |
| --- | --- |
| Web framework | Next.js 16+ App Router (React 19) as a PWA |
| Mobile framework | Expo SDK latest / React Native, shared Convex backend and style tokens |
| Monorepo | pnpm + Turborepo |
| Styling (web) | Tailwind CSS 3.3.2 (PINNED) |
| Styling (mobile) | NativeWind v4 (mirrors Tailwind tokens) |
| Component library | shadcn/ui (web) — ported primitives for mobile |
| Typography | Newsreader serif, Inter sans, IBM Plex Mono; OpenDyslexic toggle |
| Icons | Lucide |
| Motion | Framer Motion (web), Reanimated (mobile) |
| State management | Convex subscriptions + React local state; no Redux, no Zustand |
| Routing | Next.js App Router (web), Expo Router (mobile) |

## **1.2  Backend**

| **Area** | **Choice** |
| --- | --- |
| Database + functions | Convex (real-time, 23 tables, 3 deployments: dev / staging / prod) |
| Auth | Convex Auth (NOT Clerk, NOT Firebase, NOT Supabase) |
| Payments / subscriptions | RevenueCat across iOS + Android + Web (NOT Stripe direct) |
| File storage | Convex file storage |
| AI gateway | OpenRouter API (single integration) |
| AI models — fast | Gemma 4 26B |
| AI models — complex | Mistral Small 4 |
| Voice TTS | Kokoro (quantized), self-hosted |
| Voice STT | Whisper-small via OpenRouter endpoint |
| Analytics | PostHog, self-hosted, opt-in |
| Error reporting | Sentry |
| Compliance (ToS / privacy / cookies / DSR) | GetTerms.io |
| Hosting — web | Vercel (PWA) |
| Hosting — Convex | Convex managed cloud |
| Privacy-mode inference (Phase 1.5+) | Swiss cloud provider — Infomaniak AI shortlist (placeholder) |

## **1.3  Agent / automation layer**

- Cursor IDE: tight-loop coding, schema, debugging.

- Cursor Cloud: three parallel agents (Core Features / AI & Intelligence / Platform & Polish).

- Twin.so: GUI-bound SaaS tasks (Apple Developer, Play Console, RevenueCat, Vercel, Expo, GetTerms).

- Pokee AI: connected SaaS orchestration (social publishing, GitHub triage, analytics digests, founder newsletter).

- Zo Computer: long-running cloud jobs (overnight builds, asset batches, transcription).

- Human-Amit: physical devices, legal, financial, identity.

# **2.  The Convex schema (23 tables)**

This is the canonical schema for Phase 1.0. Schema is generic; AI personalization is applied on top via a user_ai_profile sidecar.

| **Table** | **Purpose** | **Notes** |
| --- | --- | --- |
| users | Account identity | Convex Auth integration |
| user_profiles | Public-ish profile info | Name, pronouns, timezone |
| user_preferences | Settings | Accessibility, coach defaults |
| user_ai_profile | AI personalization vector | Populated by Coach over time |
| tasks | Tasks | Includes energy_cost, est_minutes, confidence |
| notes | Notes | Periodic + ad-hoc, Markdown + XML links |
| journal_entries | Journal surface | Sits on notes w/ periodType |
| projects | Project containers | Link to goals |
| goals | Outcome-focused | Linked to projects, habits |
| habits | Atomic repeating actions | Completion log |
| routines | Ordered sequences of habits | Morning, wind-down, etc. |
| streaks | Aggregate streak state | Derived but materialized |
| calendar_events | Native + synced events | Google/Apple |
| templates | User templates | Includes picture-sketch layouts |
| library_items | Prompts / recipes / routines / formats / references | Typed items |
| ai_suggestions | Pending AI suggestions | Accept-reject queue |
| ai_runs | Log of AI runs | Confidence, model, tokens |
| agent_runs | Agent activity | Cursor/Zo/Twin/Pokee |
| agent_tasks | Agent task list | Refs GitHub issue # |
| agent_handoffs | Handoff records | From → to, state snapshot |
| agent_artifacts | Agent-produced files / links | Asset registry |
| tags | Tag vocabulary | Auto + manual |
| audit_events | Append-only audit log | Privacy-critical operations |

# **3.  AI routing**

## **3.1  The router**

Every AI call first hits the router. The router classifies the request and picks a model.

route(input) => { fast | complex } -> OpenRouter(Gemma 4 26B | Mistral Small 4)

- Fast: quick task extraction, Goblin Magic ToDo, estimator, formalizer, compiler, quick rewrites, one-line summaries.

- Complex: Executive Function Coach, weekly recap, plan generation, ambiguity negotiation, journal prompts.

## **3.2  The confidence-router**

- Every model response includes a self-reported confidence score [0.0 — 1.0].

- ≥ 0.85 — auto-apply; the change is journaled in ai_runs.

- 0.55 — 0.85 — confirm with a single-tap sheet.

- < 0.55 — interrogate: ask a clarifying question before acting.

- User can lower the auto-apply threshold in Settings; default is 0.85.

# **4.  The RAG layers**

## **4.1  Global RAG per user (Phase 1.0)**

- Scope: all of a user’s notes, tasks, journal, templates.

- Backed by pg-vector via Convex’s vector-store or a Convex-native embedding index.

- Re-embedded on write.

## **4.2  Scoped RAG (Phase 1.5)**

- NotebookLM-style: one scoped index per project or per study topic.

- Supports per-source citations.

- Global RAG can reference scoped indexes.

# **5.  Integrations architecture**

## **5.1  Calendar**

Google Calendar read-write in Phase 1.0 via the official Calendar API. Apple via CalDAV in Phase 1.1.

## **5.2  RAM-only scanners (Phase 2)**

- Scanner runs on a Convex scheduled function every 30 minutes.

- Pulls into ephemeral memory only; extracts features; writes only the extracted features back to Convex.

- Raw content is never written to disk.

- Audit log records the timestamp and feature count but never content.

# **6.  Environment variables**

The ten required variables for a Phase 1.0 deployment. Never commit these. Never share these in chat or documentation.

| **Name** | **Purpose** |
| --- | --- |
| CONVEX_DEPLOYMENT | Convex deployment URL |
| CONVEX_AUTH_KEY | Convex Auth signing key |
| OPENROUTER_API_KEY | OpenRouter gateway key |
| REVENUECAT_API_KEY_WEB | RevenueCat web platform |
| REVENUECAT_API_KEY_IOS | RevenueCat iOS |
| REVENUECAT_API_KEY_ANDROID | RevenueCat Android |
| GOOGLE_CALENDAR_CLIENT_ID | Google Calendar OAuth |
| GOOGLE_CALENDAR_CLIENT_SECRET | Google Calendar OAuth |
| POSTHOG_PROJECT_KEY | Self-hosted PostHog project |
| SENTRY_DSN | Sentry error reporting |

# **7.  Banned technologies**

The following are actively forbidden. If an agent proposes any of these, reject the proposal and point to this section.

- Firebase (any surface).

- Supabase (any surface).

- Prisma (we use Convex natively).

- Drizzle (we use Convex natively).

- Clerk (we use Convex Auth).

- Stripe direct (we use RevenueCat).

- Replit DB / Replit Auth / Replit Payments.

- Raw PostgreSQL / Redis / MongoDB.

- Express (no Node servers; Convex handles server logic).

- tRPC (redundant with Convex subscriptions).

- OpenAI SDK directly (route through OpenRouter).

- Qwen (model banned; use Gemma / Mistral).

- Notion / Linear / Airtable for anything — agent coordination spine is GitHub + Convex + Discord + TASKS.md.

# **8.  Deferred stack items (candidates for later phases)**

- BYOK (OpenAI, Anthropic, Pika, Runway, Luma, HeyGen, Claude Code / Codex) — Phase 1.5.

- Quantized Gemma 4 offline model — Phase 1.5.

- Obsidian two-way Markdown folder sync — Phase 1.5.

- NotePlan one-way import — Phase 1.5.

- Anki flashcard import — Phase 1.5.

- Swiss cloud provider for privacy-mode inference — Phase 1.5+.

- Email / WhatsApp / Telegram RAM-only scanners — Phase 2.

- Tauri desktop wrapper — Phase 2.

- VTuber avatar (BYOK pipeline) — Phase 2 (Max tier).

- Replit / Lovable bi-directional — Phase 2.

- Learning-platform integrations (Khan Academy / Udemy / Skool / Teachable) — Phase 3.

# **9.  Architecture diagrams (ASCII)**

## **9.1  Request flow**

User → Next.js PWA / Expo RN → Convex (auth + data) → OpenRouter (Gemma / Mistral)

                                           └→ RevenueCat (entitlement check)

## **9.2  Agent coordination**

GitHub Issues (source of truth, labels: agent:cursor-1/2/3, agent:zo, agent:twin, agent:pokee, human:amit)

        ↓

Convex tables (agent_runs, agent_tasks, agent_handoffs, agent_artifacts)

        ↓

Discord channels (#agent-cursor, #agent-zo, #agent-twin, #agent-pokee, #handoffs, #approvals, #blocked)

        ↓

TASKS.md in repo (Cursor agents read this every session)

# **10.  Release and deployment**

- Web: Vercel production + preview branches per PR.

- Mobile: Expo EAS Build, Expo Go for beta, App Store + Play Store for GA.

- Convex: three deployments (dev, staging, prod). No function ships to prod without 48 hours on staging.

- Release flags: LaunchDarkly alternative? For MVP, simple Convex feature_flags table gated by tier and userId.

- Rollback: every release has a version commit; rollback = redeploy previous Convex + Vercel build.

- Store-review bypass: during store review, the PWA is published publicly as the “Coming Soon” internal tool; authorized users get full access; SEO lives on the public marketing pages.

# **11.  Security and privacy architecture**

- Convex Auth with passwordless magic-link + passkey.

- Journal entries encrypted with a per-user key derived via Argon2 from a user secret.

- No third-party trackers. All analytics self-hosted.

- GetTerms generates privacy policy / ToS / cookie consent / DSR workflow.

- Audit events table is append-only. Writes are privileged.

- Intrusion surface: the only public write endpoints are Convex mutations, rate-limited via a per-user bucket.

# **12.  Open questions**

- Q1 — Swiss cloud provider: Infomaniak AI is the placeholder. Revisit before Phase 1.5.

- Q2 — Voice model quantization: Kokoro or Piper? Decision at Phase 1.5 kickoff.

- Q3 — Offline conflict resolution: CRDT (Automerge) vs. last-write-wins with user review? Decision at Phase 1.5 kickoff.

- Q4 — Plugin sandbox: WebAssembly worker vs. iframe + postMessage? Decision before Phase 1.5 plugin system v1.

- Q5 — Patent counsel: which firm? Decision at Phase 1.1 dogfood exit.

	Confidential — Tempo Flow, by Amit Levin	Page
