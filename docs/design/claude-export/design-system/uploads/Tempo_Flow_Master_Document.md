# Tempo Flow — Consolidated Master Document

> **Single-file merge of the full Tempo Flow documentation bundle.**
> Generated Friday, 17 April 2026.
> All 26 source files are included verbatim. Each file is preceded by a `---` rule and a `> **Source file:**` attribution line so you can trace any section back to its origin.

## Organization

Files are grouped into seven parts in a logical reading order:

1. **Project Overview** — entry points for anyone arriving at the repo (`README.md`, `LICENSE`).
2. **Strategy & Vision** — the master PRD, brand identity, tech stack, and roadmap (the four `.docx` strategy files, extracted to markdown).
3. **Phase PRDs** — one document per public phase, 1.0 → 3.0.
4. **Rules & Governance** — hard non-negotiables, expanded rationale, and the repo-root `.cursorrules`.
5. **Task Management & Prompts** — the owner-tagged task list and the Cursor prompt library.
6. **Tempo-Specific Agent Setup** — the agent handoff map plus per-agent setup guides (Zo, Twin, Pokee) wired for this project.
7. **Reusable Agent Playbooks** — the project-agnostic playbook library that can be forked into other projects.

## Table of contents

### Part 1 — Project Overview
- 1.1 `README.md` (Tempo Flow)
- 1.2 `LICENSE`

### Part 2 — Strategy & Vision
- 2.1 `Tempo_Flow___PRD_v4__Master_.docx`
- 2.2 `Tempo_Flow___Brand_Identity___Style_Guide.docx`
- 2.3 `Tempo_Flow___Tech_Stack___Architecture.docx`
- 2.4 `Tempo_Flow___Roadmap.docx`

### Part 3 — Phase PRDs
- 3.1 `PRD_Phase_1_MVP.md`
- 3.2 `PRD_Phase_1_1_Presence.md`
- 3.3 `PRD_Phase_1_5_Memory.md`
- 3.4 `PRD_Phase_2_Connected.md`
- 3.5 `PRD_Phase_3_Ecosystem.md`

### Part 4 — Rules & Governance
- 4.1 `HARD_RULES.md`
- 4.2 `CURSOR_RULES.md`
- 4.3 `.cursorrules`

### Part 5 — Task Management & Prompts
- 5.1 `TASKS.md`
- 5.2 `CURSOR_PROMPTS.md`

### Part 6 — Tempo-Specific Agent Setup
- 6.1 `agent_handoff_map.md`
- 6.2 `zo_setup.md`
- 6.3 `twin_setup.md`
- 6.4 `pokee_setup.md`

### Part 7 — Reusable Agent Playbooks
- 7.1 `README.md` (Reusable Playbooks)
- 7.2 `AGENT_ORCHESTRATION_PATTERNS.md`
- 7.3 `CURSOR_AGENT_PATTERNS.md`
- 7.4 `ZO_PLAYBOOK.md`
- 7.5 `TWIN_PLAYBOOK.md`
- 7.6 `POKEE_PLAYBOOK.md`

---


# Part 1 — Project Overview


---

## 1.1 README.md (Tempo Flow)

> **Source file:** `README_tempo_flow.md`

# Tempo Flow

**Your brain's operating system.**

Tempo Flow is an open-source, overwhelm-first AI daily planner and personal operating system. It unifies tasks, notes, journal, calendar, habits, routines, goals, projects, and an AI executive-function coach into one app. It is built for neurodivergent brains — people with ADHD, autism, anxiety, burnout, or just too many tabs open — and it is designed to make the overwhelming feel workable.

## Status

- **License:** Business Source License 1.1 (converts to Apache License 2.0 four years after each versioned release). See [`LICENSE`](./LICENSE).
- **Current phase:** Tempo 1.0 "Foundation" — active development.
- **Repository visibility:** public / source-available.
- **Production hosting:** reserved to the Licensor. Self-hosting for your own individual or internal organizational use is expressly permitted — see the Additional Use Grant in `LICENSE`.

## Tech stack (locked for MVP)

- **Web:** Next.js 15 (App Router) deployed on Vercel, served as an installable Progressive Web App
- **Mobile:** Expo SDK 52+ (React Native) for iOS and Android, shared styling via NativeWind
- **Backend:** Convex (reactive database, queries, mutations, actions, HTTP endpoints, scheduled jobs, file storage)
- **Auth:** Convex Auth
- **Payments:** RevenueCat (handles App Store, Play Store, and web subscriptions)
- **AI routing:** OpenRouter — Gemma 4 26B for fast inference, Mistral Small 4 for complex reasoning
- **Styling:** Tailwind 3.3.2 + shadcn/ui (web), NativeWind + shared tokens (mobile)
- **Typography:** Newsreader (serif), Inter (sans), IBM Plex Mono (mono), OpenDyslexic (user toggle)
- **Compliance:** GetTerms.io (privacy policy, terms, cookie policy, DSR workflows)
- **Analytics:** PostHog (self-hosted, opt-in)
- **Observability:** Sentry (errors), PostHog (product analytics)
- **Package manager:** pnpm
- **Monorepo:** Turborepo

See [`docs/HARD_RULES.md`](./docs/HARD_RULES.md) for the full non-negotiables list and [`docs/PRDs/PRD_Phase_1_MVP.md`](./docs/PRDs/PRD_Phase_1_MVP.md) for the full MVP spec.

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
pnpm --filter @tempo/web dev

# 5. (Optional) Start the mobile app
pnpm --filter @tempo/mobile start
```

Required environment variables are documented in `.env.example` at the repo root. Copy to `.env.local` and fill in values from your own Convex, OpenRouter, RevenueCat, and GetTerms accounts before running.

## Documentation tree

All project documentation lives under [`./docs/`](./docs/).

- [`docs/HARD_RULES.md`](./docs/HARD_RULES.md) — non-negotiables. Read this first every session.
- [`docs/CURSOR_RULES.md`](./docs/CURSOR_RULES.md) — expanded rules with rationale.
- [`docs/CURSOR_PROMPTS.md`](./docs/CURSOR_PROMPTS.md) — prompt library for Cursor IDE and Cursor Cloud agents.
- [`docs/TASKS.md`](./docs/TASKS.md) — master task list, owner-tagged.
- [`docs/PRDs/`](./docs/PRDs/) — one PRD per public phase (1.0, 1.1, 1.5, 2.0, 3.0).
- [`docs/AGENT_SETUP/`](./docs/AGENT_SETUP/) — Tempo-specific setup guides for Zo Computer, Twin.so, Pokee AI, and the overall agent handoff map.

For project-agnostic agent workflow patterns that can be reused across other projects, see the separate `reusable-workflows/` folder distributed alongside this repo.

## Roadmap (public phases)

1. **Tempo 1.0 "Foundation"** — full MVP, all 42 screens, web PWA + iOS App Store + Google Play Store.
2. **Tempo 1.1 "Presence"** — polish, founder vlog embed, public `CONTRIBUTING`, community changelog, plugin SDK skeleton.
3. **Tempo 1.5 "Memory"** — bring-your-own-key providers, offline on-device inference, privacy modes, NotebookLM-style scoped retrieval, flashcards, spaced repetition, Anki export, RemNote sync, public plugin SDK.
4. **Tempo 2.0 "Connected"** — calendar and health integrations, chat history import, MCP server, CLI, browser extension, REST API, photo accountability, messaging bridges, Bluetooth sync, avatar body-double for the top tier.
5. **Tempo 3.0 "Ecosystem"** — learning-platform integrations, bi-directional builder sync, community template gallery, user-selectable EU/Swiss inference region, plugin marketplace.

See the full roadmap in the strategy `.docx` files distributed with this repo, and per-phase PRDs under `docs/PRDs/`.

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

## Contributing

See `CONTRIBUTING.md` (published alongside the Tempo 1.1 release). Until then, open an issue before starting work on a significant change, and follow [`docs/HARD_RULES.md`](./docs/HARD_RULES.md) rigorously.

Third-party plugins built against the public plugin API (published in Tempo 1.5) may be monetized by their authors through GitHub Sponsors, Patreon, Ko-fi, Buy Me a Coffee, or similar patronage platforms. See the Additional Use Grant in `LICENSE` for the full wording.

## License

Business Source License 1.1. Converts to Apache License 2.0 four years after each versioned release. Full text in [`LICENSE`](./LICENSE).

Copyright © 2026 Amit Levin.


---

## 1.2 LICENSE

> **Source file:** `LICENSE`

```
Business Source License 1.1

License text copyright (c) 2020 MariaDB Corporation Ab, All Rights Reserved.
"Business Source License" is a trademark of MariaDB Corporation Ab.

-----------------------------------------------------------------------------

Parameters

Licensor:             Amit Levin
Licensed Work:        Tempo Flow
                      The Licensed Work is (c) 2026 Amit Levin.

Additional Use Grant: You may use, copy, modify, and redistribute the
                      Licensed Work, and create derivative works of the
                      Licensed Work, for any purpose other than a
                      Commercial Hosted Offering.

                      A "Commercial Hosted Offering" means offering the
                      Licensed Work (or a derivative work thereof) as a
                      hosted or managed service to third parties for a
                      fee, or in exchange for any other form of
                      consideration, where the service substantially
                      provides the functionality of the Licensed Work.

                      Notwithstanding the above, the following uses are
                      expressly permitted:

                      (a) Self-hosting the Licensed Work for your own
                          individual use or for your own internal
                          organizational use, at any scale.

                      (b) Offering one-click installers, deployment
                          templates, or similar tooling that allows end
                          users to self-host the Licensed Work on their
                          own infrastructure (VPS providers, self-host
                          platforms such as those modeled after Mautic,
                          Matomo, Coolify, Umbrel, Easypanel, Dokploy,
                          Pikapods, and similar), provided that:
                          (i)   The end user retains full control and
                                ownership of the installed instance.
                          (ii)  The Licensed Work is not rebranded.
                          (iii) The one-click installer is not itself
                                operated as a hosted service providing
                                the functionality of the Licensed Work
                                under a different name or the same name.

                      (c) Developing, distributing, and monetizing
                          third-party plugins that integrate with the
                          Licensed Work through its published plugin
                          API. Plugin authors may monetize their plugins
                          via patronage platforms (including but not
                          limited to Patreon, Ko-fi, Buy Me a Coffee,
                          GitHub Sponsors, Liberapay, OpenCollective) at
                          the plugin author's sole discretion.

                      For clarity: running a commercial, multi-tenant,
                      hosted instance of the Licensed Work for third
                      parties under a different brand or the Tempo Flow
                      brand without written permission from the Licensor
                      is NOT permitted under this Additional Use Grant.

Change Date:          Four years from the date the Licensed Work is
                      published. For each subsequent versioned release
                      of the Licensed Work, the Change Date for that
                      release is four years from the date that release
                      is published.

Change License:       Apache License, Version 2.0

-----------------------------------------------------------------------------

Terms

The Licensor hereby grants you the right to copy, modify, create
derivative works, redistribute, and make non-production use of the
Licensed Work. The Licensor may make an Additional Use Grant, above,
permitting limited production use.

Effective on the Change Date, or the fourth anniversary of the first
publicly available distribution of a specific version of the Licensed
Work under this License, whichever comes first, the Licensor hereby
grants you rights under the terms of the Change License, and the rights
granted in the paragraph above terminate.

If your use of the Licensed Work does not comply with the requirements
currently in effect as described in this License, you must purchase a
commercial license from the Licensor, its affiliated entities, or
authorized resellers, or you must refrain from using the Licensed Work.

All copies of the original and modified Licensed Work, and derivative
works of the Licensed Work, are subject to this License. This License
applies separately for each version of the Licensed Work and the Change
Date may vary for each version of the Licensed Work released by
Licensor.

You must conspicuously display this License on each original or
modified copy of the Licensed Work. If you receive the Licensed Work in
original or modified form from a third party, the terms and conditions
set forth in this License apply to your use of that work.

Any use of the Licensed Work in violation of this License will
automatically terminate your rights under this License for the current
and all other versions of the Licensed Work.

This License does not grant you any right in any trademark or logo of
Licensor or its affiliates (provided that you may use a trademark or
logo of Licensor as expressly required by this License).

TO THE EXTENT PERMITTED BY APPLICABLE LAW, THE LICENSED WORK IS PROVIDED
ON AN "AS IS" BASIS. LICENSOR HEREBY DISCLAIMS ALL WARRANTIES AND
CONDITIONS, EXPRESS OR IMPLIED, INCLUDING (WITHOUT LIMITATION)
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
NON-INFRINGEMENT, AND TITLE.

-----------------------------------------------------------------------------

Covenants of Licensor

In consideration of the right to use this License's text and the
"Business Source License" name and trademark, Licensor covenants to
MariaDB, and to all other recipients of the Licensed Work to be
provided by Licensor:

1. To specify as the Change License the GPL Version 2.0 or any later
   version, or a license that is compatible with GPL Version 2.0 or a
   later version, where "compatible" means that software provided under
   the Change License can be included in a program with software
   provided under GPL Version 2.0 or a later version. Licensor may
   specify additional Change Licenses without limitation.

2. To either: (a) specify an additional grant of rights to use that
   does not impose any additional restriction on the right granted in
   this License, as the Additional Use Grant; or (b) insert the text
   "None".

3. To specify a Change Date.

4. Not to modify this License in any other way.

-----------------------------------------------------------------------------

Notice

The Business Source License (this document, or the "License") is not an
Open Source license. However, the Licensed Work will eventually be made
available under an Open Source License, as stated in this License.
```


---

# Part 2 — Strategy & Vision


---

## 2.1 PRD v4 — Master

> **Source file:** `Tempo_Flow___PRD_v4__Master_.md`

**TEMPO FLOW**   —   PRD v4 — Master

**TEMPO FLOW**

*Product Requirements Document v4*

*An ADHD-first AI daily planner and personal operating system.*

Built by Amit Levin.  Dogfooded before shipped.  Open source by design.

**Version 4.0 — Master Product Requirements Document**

Status: Living document — updated every phase gate.

Owner: Amit Levin  ·  amitlevin65@protonmail.com

# **0.  How to read this document**

This PRD is the single source of truth for what Tempo Flow is, what it must do, and what is deferred. It is written to be read by three kinds of reader at once:

- Amit, the founder, so he can make product decisions against a stable reference.

- Cursor agents (IDE + Cloud), so they can implement without guessing.

- External agents (Zo, Twin, Pokee), so they know what they own and what they do not.

Every feature is tagged with a phase label. Phase labels follow the ChatGPT-style public versioning: 1.0, 1.1, 1.5, 2.0, 3.0. Internal versioning is more granular and lives in the Roadmap document.

| **Hard rule** If a feature is not in this document, it is not in Tempo Flow. Proposals live in the Ideas backlog on GitHub. Nothing ships without being added here first. |
| --- |

# **1.  Vision and first principles**

## **1.1  The one-line pitch**

Tempo Flow is the planner the neurodivergent brain actually wants to open — a warm, editorial-looking AI operating system that turns overwhelm into a sequence of small, winnable moments.

## **1.2  Who it is for**

- People with ADHD, autism, CPTSD, or chronic overwhelm who bounce off traditional productivity apps.

- People who love Obsidian and NotePlan for the portability, but drown in blank pages.

- People who want an AI co-pilot that does not silently rewrite their life behind their back.

## **1.3  First principles (non-negotiable)**

- Overwhelm-first, not productivity-first. If a feature creates more anxiety than it removes, it is cut.

- Accept-reject flow. The AI never silently mutates state. Every AI-originated change is proposed, confirmed, or rejected by the user.

- Portability by default. Everything the user writes is exportable as Markdown with frontmatter at any time.

- Radical warmth. Copy, design and tone borrow from Anthropic, Craft and NotePlan — not from Slack or Asana.

- Dogfood before ship. Amit uses every feature daily for at least seven days before it leaves staging.

- Open core, patent-held. Code is open; the intent-based workflows are patent-flagged.

- No free tier, $1 trial. Commitment is a filter. The people we want are the people who pay a dollar.

# **2.  Product surface area**

## **2.1  Platforms at launch**

| **Platform** | **Form factor** | **Phase 1.0** |
| --- | --- | --- |
| Web (PWA) | Desktop + tablet + mobile installable | Required — dogfooded first |
| iOS | React Native / Expo, IPA via Expo Go for beta, App Store for GA | Required |
| Android | React Native / Expo, APK via Expo Go for beta, Play Store for GA | Required |
| Desktop native | Tauri wrapper of PWA | Phase 2 (optional) |
| Voice-only device | Read-aloud + walkie-talkie | Phase 3 (exploration) |

## **2.2  The 42 MVP screens, at a glance**

The MVP spans fifteen feature areas. Each area has a web screen and a mobile screen; shared components live in packages/ui. The full list:

- Authentication (2): sign-in, sign-up.

- Dashboard / Today (3): web Today, mobile Today, notification center.

- Tasks (3): list, detail, quick-capture drawer.

- Notes (3): library, editor, backlinks panel.

- Calendar (3): month, week, day.

- Journal (3): daily, weekly, monthly.

- AI Coach (3): chat, walkie-talkie, live-voice.

- Habits & Routines (3): habits, routines, streaks.

- Goals (3): list, detail, progress.

- Projects (3): list, detail, kanban.

- Analytics (2): personal, library-usage.

- Settings (3): profile, preferences, integrations.

- Templates (3): library, editor, picture-sketch generator.

- Rewards (2): streak shop, unlocks.

- Search (1): global.

Every screen is defined in the Design System document. This PRD only specifies behaviour, not pixels.

# **3.  Feature specifications (Phase 1.0 — MVP)**

## **3.1  Authentication and onboarding**

- Passwordless email sign-in via Convex Auth (NOT Clerk, NOT Firebase, NOT Supabase).

- Magic-link primary, passkey secondary, optional email-OTP fallback.

- $1 seven-day trial at sign-up via RevenueCat (NOT Stripe). No free tier.

- Onboarding is a five-minute conversation with the Coach that captures: name, preferred pronouns, one wobble (the thing that overwhelms them), two daily anchors, one thing they want to feel in thirty days.

- Onboarding writes into the user profile AND creates the first three library items (a daily template, a brain-dump note, and a gentle morning routine).

## **3.2  Dashboard / Today**

Today is the front door. Every other screen is reachable from here in two taps.

- Header: greeting + weather + single sentence from the Coach (“Today feels like a low-spoons day. Let us start small.”).

- Time spine: a scrollable hour-by-hour rail showing calendar events, scheduled tasks, routines, and body anchors (meals, meds, movement).

- Next three card: three items the Coach believes are the highest-leverage for the next two hours.

- Magic ToDo entry: a single “dump here” field that expands into Goblin Magic ToDo output.

- Adaptive layout: AI re-orders sections based on what the user interacts with most.

## **3.3  Tasks**

- Data model: tasks table with user_id, title, notes, status, priority, est_minutes, energy_cost, due_at, parent_id, project_id, tags, ritual_id, source, confidence.

- Goblin Magic ToDo: paste anything, get a decomposed list. Universal across all tiers.

- Goblin Estimator: each task gets an AI-suggested time estimate the user can accept or override.

- Goblin Formalizer: a single long sentence becomes a clean task with title, notes and tags.

- Goblin Compiler: many small notes fold into one structured task tree.

- Accountability Buddy: any task can have a cron-style reminder and a paired human (self, or later a friend).

- Energy-aware sort: when a user has set an energy level for today, tasks re-sort by est_minutes and energy_cost.

## **3.4  Notes**

- Markdown + XML/HTML backlinks, modelled on Obsidian and NotePlan.

- A note can be typed, dictated, or grown from a Coach conversation.

- Periodic notes via periodType field: daily, weekly, monthly, quarterly, yearly.

- Folders AND tags. Tags can be hidden via a UI toggle; the backend always auto-tags for search.

- All notes export as Markdown with YAML frontmatter at any time.

## **3.5  Calendar**

- Single unified calendar that merges Google Calendar (via integration, Phase 1.0) + native events.

- Calendar-aware adaptive templates: the template engine knows that Tuesdays are D&D and Sundays are family dinners, but respects one-off overrides (cousin Mitch’s wedding on a Tuesday).

- Drag-and-drop scheduling into the Time Spine.

- Conflicts surface as a gentle Coach nudge (“You have two things stacked at 6pm — want me to move one?”).

## **3.6  Journal**

Journal is a first-class surface, not a subview of Notes. It lives in the notes table with periodType set, but the app routes it separately.

- Templates for daily, weekly, monthly reflection.

- Gentle prompts from the Coach if the user is blank for more than ninety seconds.

- End-of-week AI-assisted recap that the user can accept or reject into their weekly journal.

## **3.7  AI Coach**

- Three modes: Chat, Walkie-Talkie (PTT voice, all tiers), Live Voice (streaming; time-limited by tier).

- Personality dial: Uncle Iroh ↔ Drill Sergeant. Defaults to the warm end; user can slide at any time.

- Accountability Coach scales its nudging intensity per user (drill sergeant for perfectionists who never push themselves, Uncle Iroh for users who are already self-critical).

- Executive Function Coach is gated to Pro + Max tiers.

- Accept-reject flow on every suggestion.

- Confidence-router semantic permissions: AI classifies its own confidence on every write — high confidence auto-applies, mid confirms, low interrogates. (“Cake for John: auto-fills. Study for the test on the 20th: asks which subject and which textbook.”)

## **3.8  Habits and Routines**

- Habit = repeating atomic action (take meds, 10 min walk).

- Routine = ordered sequence of habits (“Morning”, “Wind-down”).

- Streaks are celebrated, but broken streaks are never punished in copy.

- Routine-aware Coach: if the user skipped the morning routine three days in a row, the Coach gently asks why rather than shaming.

## **3.9  Goals and Projects**

- Goals are outcome-focused; Projects are delivery-focused. A project can be linked to one or more goals.

- Projects support a kanban-style detail view (Backlog / Now / Done) and task grouping.

- Both surfaces allow free-form notes, linked library items, and Coach-suggested decompositions.

## **3.10  Analytics**

- Personal analytics: streaks, completion rate, energy trend, most-productive hours.

- Library-usage analytics: which prompts / recipes / templates get used vs. ignored.

- Opt-in aggregate analytics via self-hosted PostHog (see Tech Stack).

## **3.11  Settings**

- Profile: name, pronouns, time zone, preferred anchors.

- Preferences: accessibility (OpenDyslexic toggle, color-blind default, reduced motion, TTS/STT), personality dial default, coach intensity default.

- Integrations (Phase 1.0): Google Calendar read-write.

- Data: export everything (Markdown + JSON bundle), delete account, download DSR package (GetTerms-driven).

## **3.12  Templates and Library**

- Library items are typed: prompt, recipe, routine, format, reference. All user-owned.

- Templates support variables ({goal}, {energy}, {date}) and calendar context.

- Picture-Sketch template generator: user draws rectangles on a canvas, labels regions, AI generates the layout as a reusable template.

## **3.13  Rewards**

- Streaks earn “pebbles” — tiny cosmetic unlocks (theme accents, avatar backgrounds).

- No gambling mechanics. No variable-ratio dopamine traps.

## **3.14  Search**

- Global search across tasks, notes, journal, library, routines.

- Backed by a scoped RAG index per user.

- Keyboard shortcut CMD/CTRL-K on web, long-press-center-tab on mobile.

# **4.  Feature deferrals (the things people will ask for)**

| **Feature** | **Deferred to** | **Why** |
| --- | --- | --- |
| Bring-Your-Own-Key (OpenAI, Anthropic, Pika, etc.) | Phase 1.5 | Complex billing and trust model; MVP ships with OpenRouter only. |
| Offline mode via quantized Gemma | Phase 1.5 | Quantization + sync conflict resolution is a project of its own. |
| NotebookLM-style scoped RAG | Phase 1.5 | Needs the global RAG foundation first. |
| RemNote-style spaced recall + flashcards | Phase 1.5 | Anki-style import. MVP has no flashcards. |
| Email and WhatsApp scanners (RAM-only, 30-min flush) | Phase 2 | Privacy pattern needs audit before shipping. |
| Photo-accountability (take a photo to verify completion) | Phase 2 | Optional; requires camera permission UX. |
| VTuber avatar (BYOK Pika / Runway / Luma / HeyGen) | Phase 2 — Max tier only | BYOK dependency. |
| Learning platform integrations (Khan Academy, Udemy, Skool, Teachable) | Phase 3 | Huge surface area, needs its own PRD. |
| Crypto donations (BTC / ETH / SOL / Monero) | Phase 2 | Legal + tax clarity first. |
| Connectivity modes (online / offline / privacy / Bluetooth-sync) | Phase 2 | Depends on offline + Swiss-cloud inference. |

# **5.  Non-functional requirements**

## **5.1  Accessibility**

- WCAG 2.2 AA on every screen.

- OpenDyslexic font toggle in Settings.

- Color-blind safe palette is the default, not an option.

- Every primary action has a keyboard shortcut and a voice equivalent.

- Reduced-motion respected system-wide.

## **5.2  Performance**

- P95 Time-to-Interactive on the Today screen: < 1.5 s on a mid-range Android (Pixel 6a).

- AI first-token latency for Coach chat: < 700 ms on the Gemma route, < 1.2 s on Mistral.

- Offline-tolerant optimistic UI for task create / edit.

## **5.3  Privacy**

- Zero-knowledge for journal entries: encrypted at rest with per-user key.

- RAM-only scanners for email / WhatsApp (Phase 2): every 30 minutes, in-memory only, flushed immediately after extraction.

- No third-party trackers. Analytics is self-hosted PostHog, opt-in.

- Full DSR pipeline via GetTerms.io.

## **5.4  Compliance**

- GetTerms.io generates and updates privacy policy, terms of service, cookie policy, and DSR workflows.

- GDPR-ready at launch; CCPA at launch; more as markets demand.

- Patent-candidate features flagged inline in this PRD using [PATENT-CANDIDATE].

## **5.5  Observability**

- Error reporting via Sentry.

- Self-hosted PostHog for product analytics.

- Uptime monitoring via BetterStack or similar; public status page.

# **6.  Tiers and pricing**

| **Tier** | **Price** | **Trial** | **Coach intensity** | **Voice time** |
| --- | --- | --- | --- | --- |
| Trial | $1 / 7 days | n/a | default | 30 min total |
| Basic | $5 / mo | upgrades from trial | default | 30 min / day |
| Pro | $10 / mo | upgrades from trial | default + EF Coach | 90 min / day |
| Max | $20 / mo | upgrades from trial | default + EF Coach + Avatar | 3 hr / day |

Goblin features — Magic ToDo, Formalizer, Estimator, Compiler, Accountability Buddy with cron reminders — are universal across all tiers. Walkie-talkie voice is universal. Executive Function Coach and VTuber Avatar are the only gated-by-tier Coach features.

# **7.  Integrations matrix**

| **Integration** | **Role** | **Phase** |
| --- | --- | --- |
| Google Calendar | Read-write sync | 1.0 |
| Apple Calendar (via CalDAV) | Read-write sync | 1.1 |
| Email (Gmail first) | RAM-only scanner, 30-min flush | 2.0 |
| WhatsApp | RAM-only scanner, 30-min flush | 2.0 |
| Telegram | RAM-only scanner, 30-min flush | 2.0 |
| Obsidian | Two-way Markdown sync via folder | 1.5 |
| NotePlan | One-way import | 1.5 |
| Anki | Flashcard import (spaced recall) | 1.5 |
| Replit / Lovable | Project-spine bi-directional for builders | 2.0 |
| ChatGPT / Claude history | One-time import, global RAG bootstrap | 2.0 |
| Khan Academy / Udemy / Skool / Teachable | Learning tracker | 3.0 |
| GitHub Sponsors | Discord tier access | 1.1 |
| Ko-fi / Buy Me a Coffee / GitHub Sponsors (donate button) | Support the founder | 1.0 |
| BTC / ETH / SOL / Monero | Crypto donations | 2.0 |

# **8.  Division of labor across agentic tools**

Tempo Flow is built by one human and four agents. Each agent has a clearly bounded role; the boundaries matter more than the tools.

### **8.1  Cursor IDE**

- Owner: Amit, in the loop.

- Scope: tight-loop coding, schema design, quick spikes, debug sessions, anything where Amit wants to read every diff.

### **8.2  Cursor Cloud — three parallel agents**

- Agent 1 — Core Features: tasks, notes, calendar, journal, dashboard.

- Agent 2 — AI & Intelligence: Coach, routing, Goblin features, RAG, templates.

- Agent 3 — Platform & Polish: auth, settings, tier gating, analytics, accessibility, perf.

### **8.3  Twin.so**

- Scope: GUI / browser automation for third-party dashboards that have no sane API — Apple Developer, Google Play Console, RevenueCat, Vercel, Expo, GetTerms.

### **8.4  Pokee AI**

- Scope: SaaS orchestration — social publishing, GitHub issue triage, analytics digests, founder newsletter.

### **8.5  Zo Computer**

- Scope: long-running cloud jobs — overnight builds, asset batches (icons, illustrations), transcription, media pipelines.

### **8.6  Human-Amit**

- Scope: physical device testing, patent filings, payment input, identity verification, anything with legal or financial consequence.

| **Source of truth** Agent coordination happens through GitHub Issues (labels: agent:cursor-1/2/3, agent:zo, agent:twin, agent:pokee, human:amit), Convex tables for runtime state (agent_runs, agent_tasks, agent_handoffs, agent_artifacts), Discord channels for human-in-the-loop, and a file-based TASKS.md in the repo. No Notion. No Linear. No Airtable. |
| --- |

# **9.  Success metrics**

| **Metric** | **Phase 1.0 target** | **How we measure** |
| --- | --- | --- |
| Activation (new user completes onboarding + creates 3 items in day 1) | 70% | PostHog funnel |
| D7 retention | 40% | PostHog cohort |
| D30 retention | 25% | PostHog cohort |
| Trial-to-paid conversion | 35% | RevenueCat dashboard |
| NPS (in-app, monthly) | 50+ | In-app survey |
| P95 Today TTI on Pixel 6a | < 1.5 s | RUM via PostHog |
| Accept rate on AI suggestions | > 65% | Convex event log |
| Founder dogfood streak (Amit uses daily) | 60+ consecutive days before public GA | Own streaks table |

# **10.  Risks and mitigations**

- R1 — Scope creep. Mitigation: this PRD is the gate. Nothing outside it ships.

- R2 — Agent handoff chaos. Mitigation: the spine is GitHub + Convex + Discord + TASKS.md — see the Agent Handoff Map doc.

- R3 — Accept-reject fatigue. Mitigation: confidence-router auto-applies anything above the high-confidence threshold.

- R4 — Privacy regression when scanners launch. Mitigation: RAM-only pattern audited before ship; no scanner in MVP.

- R5 — Founder burnout. Mitigation: internal milestones are weekly, not daily; every Friday is a full reflection day.

- R6 — Open-source forks doing commercial SaaS. Mitigation: BSL 1.1 → Apache 2.0 with Additional Use Grant allowing self-host + VPS one-click installers, prohibiting rebranded commercial SaaS.

# **11.  Road to 1.0 — internal milestones**

- PWA skeleton dogfooded by Amit on phone + laptop.

- React Native skeleton (Expo) with shared Convex backend and shared style tokens.

- Feature complete: all 15 areas, 42 screens.

- Beta testers (mom, sister, a handful of friends) receive Expo Go builds (IPA for iOS friends, APK for Android friends).

- Polish pass — copy, motion, accessibility audit.

- Payments: RevenueCat wired, $1 trial live.

- Compliance: GetTerms privacy / terms / cookies / DSR live.

- Submission: App Store + Play Store review.

- “Coming Soon” website: PWA published as an internal tool for authorized users while stores review. Builds SEO and credibility.

- Launch: public GA, open-source repo public at 1.1.

# **12.  Glossary**

- Goblin features — universal productivity spells: Magic ToDo, Formalizer, Estimator, Compiler, Accountability Buddy.

- Executive Function Coach — Pro+Max gated Coach mode that scaffolds planning, starting, switching, and stopping.

- Accept-reject flow — the rule that the AI never silently mutates state.

- Confidence-router — AI self-assessment of confidence that gates auto-apply vs. confirm vs. interrogate.

- RAM-only scanner — integration pattern that pulls data every 30 min, processes in memory, flushes immediately.

- Ask-the-Founder queue — a channel where users can submit questions the founder personally answers.

# **13.  Document history**

- v1 — initial brain-dump of Tempo concept.

- v2 — added phases, tiers, Goblin features.

- v3 — uploaded by Amit as the source document.

- v4 — this version. Adds: confidence-router, calendar-aware templates, Journal as first-class, BYOK+offline moved to 1.5, GitHub+Convex+Discord+TASKS.md agent spine, Swiss-cloud placeholder, testing-flow PWA-first then Expo RN, BSL → Apache 2.0 with Additional Use Grant.

	Confidential — Tempo Flow, by Amit Levin	Page

---

## 2.2 Brand Identity & Style Guide

> **Source file:** `Tempo_Flow___Brand_Identity___Style_Guide.md`

**TEMPO FLOW**   —   Brand Identity & Style Guide

**TEMPO FLOW**

*Brand Identity **&** Style Guide*

*Soft editorial warmth. Never corporate. Never childish.*

A style guide for a planner that feels like a letter, not a form.

**Version 1.0 — canonical brand**

# **1.  Brand essence**

Tempo Flow is a warm editorial companion — a planner that feels like a letter from a thoughtful friend, not a form to fill. The brand is Anthropic-adjacent (orange, serif, cream), NotePlan-adjacent (calm, portable), and Craft-adjacent (spacious, typographic). It is never Slack. It is never Asana. It is never a “fun” app with rainbow confetti and bouncing cartoons.

| **One-sentence personality** If Tempo Flow were a human, it would be Uncle Iroh with a notebook: warm, unhurried, competent, and gently curious. |
| --- |

# **2.  Voice and tone**

## **2.1  Voice principles (always true)**

- Warm. We choose words that lower shoulders, not raise them.

- Direct. We say things once. No corporate padding. No exclamation clutter.

- Kind without being saccharine. No “You’ve got this, champ!” No medals for brushing teeth.

- Specific. “10 minute walk” beats “some movement.”

- Never shame. A broken streak is never punished in copy. Ever.

## **2.2  Tone varies by surface**

| **Surface** | **Tone** | **Example** |
| --- | --- | --- |
| Onboarding | Calm, curious, inviting | “Let’s start small. What does today want to be?” |
| Empty states | Gentle, non-pressuring | “Nothing here yet. We can start with a brain dump when you’re ready.” |
| Coach suggestions | Confident but offering | “Three things look doable this afternoon. Want me to stage them?” |
| Errors | Honest, brief, helpful | “Couldn’t reach Google Calendar. Trying again in a minute.” |
| Celebrations | Warm, understated | “Five days in a row. Nice.” |
| Broken streak | Accepting, never shaming | “You missed yesterday. That’s allowed. Back in the chair?” |

## **2.3  Words we use and avoid**

| **Use** | **Avoid** |
| --- | --- |
| small, gentle, anchor, tempo, nudge, arrive, settle, steady | crush, smash, hustle, win, beast, dominate, level up, ninja |
| notice, try, offer, suggest, allow | must, required, mandatory, failed |
| slow down, take a breath, low-spoons day | grind, 10x, optimize, maximize |

# **3.  Color system**

## **3.1  Core palette**

| **Swatch** | **Hex** | **Name** | **Role** |
| --- | --- | --- | --- |
|  | **#131312** | **Ink** | Primary text and dark-mode background |
|  | **#F3EBE2** | **Cream** | Light-mode background |
|  | **#D97757** | **Tempo Orange** | Primary accent — logo, CTAs, active states |
|  | **#E8A87C** | **Soft Orange** | Secondary accent, gradient end |
|  | **#6B6864** | **Dust Grey** | Secondary text, metadata, helper copy |
|  | **#D7CEC2** | **Line** | Hairline borders, card outlines |

## **3.2  Semantic colors**

| **Swatch** | **Hex** | **Name** | **Role** |
| --- | --- | --- | --- |
|  | **#4A7C59** | **Moss** | Success, streaks, confirmations |
|  | **#C8553D** | **Brick** | Errors (still warm, never fire-engine red) |
|  | **#D4A44C** | **Amber** | Warnings, near-due nudges |
|  | **#6E88A7** | **Slate Blue** | Info, neutral badges |

## **3.3  Usage rules**

- Ink and Cream are the page backgrounds. Never invert without a reason.

- Tempo Orange is used for one primary action per screen. Not decoration. Not filler.

- Gradient (Tempo Orange → Soft Orange) is reserved for hero surfaces, the logo mark, and the primary CTA.

- Semantic colors are functional. Never use Brick for decoration.

- Color-blind safe palette is the default. We test every new color combination against Protanopia, Deuteranopia, and Tritanopia simulators.

# **4.  Typography**

## **4.1  Type families**

| **Family** | **Role** | **Notes** |
| --- | --- | --- |
| Newsreader (serif) | Display, H1, H2, pull quotes | Warm, editorial, legible at large sizes |
| Inter (sans-serif) | Body, UI, buttons, labels | Neutral, highly legible at small sizes |
| IBM Plex Mono | Code, timestamps, numeric data | Even rhythm, distinct from Inter |
| OpenDyslexic | Opt-in accessibility font | Whole-app replacement when toggled |

## **4.2  Scale**

| **Token** | **Size (px / DXA)** | **Usage** |
| --- | --- | --- |
| display | 56 / 1120 | Hero only; one per screen |
| h1 | 32 / 640 | Page title |
| h2 | 24 / 480 | Section title |
| h3 | 20 / 400 | Subsection |
| body | 16 / 320 | Default body |
| small | 14 / 280 | Metadata, helpers |
| caption | 12 / 240 | Footnotes, source attributions |

## **4.3  Rules**

- Line-height is 1.5 for body, 1.2 for display.

- Body copy never goes below 16 px.

- Avoid all-caps except in tiny metadata labels (e.g., section eyebrows).

- Never use italic serif for body — reserve for pull quotes and editorial beats.

# **5.  Logo and mark**

The wordmark sets TEMPO in the serif display face, FLOW in the sans. A hairline underline in Tempo Orange sits beneath the wordmark at 25% of the cap height. The icon is the letter T cradling a small O, set in the gradient from Tempo Orange to Soft Orange.

| **Don’t** Don’t italicize the wordmark. Don’t recolor the gradient. Don’t place the mark on imagery without a 16 px padding shield. Don’t use the mark smaller than 24 px. |
| --- |

# **6.  Motion**

- Default easing: cubic-bezier(0.4, 0, 0.2, 1) — the “Apple” ease.

- Durations: 120 ms (snap), 220 ms (default), 420 ms (hero).

- Respect prefers-reduced-motion system-wide. Replace translate/scale with opacity-only transitions.

- Motion has meaning: arriving content slides up 8 px with 120 ms fade; dismissed content slides down 4 px with 80 ms fade.

- Never bounce. Never spring past 1.0. Tempo Flow does not jiggle.

# **7.  Iconography**

- Lucide is the default icon library.

- Stroke width: 1.5 px at 16 / 20 px sizes; 2 px at 24+.

- Icons never substitute for text labels on primary actions.

- Avoid decorative icons. Every icon earns its place.

# **8.  Imagery and illustration**

- Illustrations are quiet: soft edges, cream backgrounds, single-line strokes with a touch of Tempo Orange.

- Never stock photography of office workers high-fiving.

- Photography, if used, is natural light, objects over people, never staged.

- Avoid AI-generated imagery in launch materials unless the prompt and artist are credited.

# **9.  Spacing system**

We use an 8-point rhythm. Everything snaps to multiples of 4 (for tight UI) or 8 (for layout).

| **Token** | **Value** | **Usage** |
| --- | --- | --- |
| space-1 | 4 px | Icon-to-label gap |
| space-2 | 8 px | Tight groupings |
| space-3 | 12 px | Form field internal padding |
| space-4 | 16 px | Card internal padding, standard stack |
| space-6 | 24 px | Section gap within a card |
| space-8 | 32 px | Card-to-card gap |
| space-12 | 48 px | Section boundary |
| space-16 | 64 px | Hero top-bottom |

# **10.  Components — guiding principles**

- Buttons: rounded-xl (12 px radius). Primary is filled Tempo Orange; secondary is Ink outline on Cream; tertiary is text-only.

- Cards: Cream surface, 1 px Line hairline, 16 px radius, 24 px internal padding, no shadows beyond a very soft 0 1 1 0 rgba(19,19,18,0.04).

- Inputs: Line border, Tempo Orange focus ring, Ink label above (not placeholder-as-label).

- Modals and sheets: full-bleed on mobile with a drag handle; edge-to-edge on web with a Cream backdrop at 92% opacity.

- Coach messages: serif for the Coach’s words, sans for user. Coach avatar is a small T-mark, not a person.

# **11.  Copy patterns (ready-made)**

Use these verbatim or as starting points. Everything here passes the voice rules in section 2.

- Sign-up CTA: “Start your seven-day walk with Tempo Flow — $1.”

- Empty task list: “Nothing planned yet. Want me to suggest three things based on yesterday?”

- AI accept-reject sheet: “I think I can add this. Accept, tweak, or skip?”

- Missed streak: “You missed yesterday. That’s allowed. Small step today?”

- Error: “Couldn’t reach Google Calendar. I’ll try again in a minute.”

- Trial ending: “Your seven days end tomorrow. Keep going, pause, or walk away — all are fine.”

# **12.  Accessibility (the non-negotiable layer)**

- WCAG 2.2 AA on every screen.

- All text passes 4.5:1 contrast on its surface (7:1 for display on Cream).

- Every interactive element has a visible focus ring in Tempo Orange.

- Motion respects prefers-reduced-motion system-wide.

- OpenDyslexic is a single toggle in Settings; it swaps all typography globally.

- Voice UI: every screen that accepts text input also accepts dictation.

# **13.  Examples of what we don’t do**

- No confetti celebrations. No trophies. No “streak saviour” dramatic copy.

- No dark patterns. No fake scarcity. No “Last chance!” banners.

- No over-gamification. Pebbles, yes. Leaderboards, no.

- No military, hustle, or war metaphors. We do not “crush tasks.” We arrive at them.

- No infantilizing emoji-speak on serious surfaces. A gentle pebble icon is fine; a cartoon brain with a muscle is not.

# **14.  Governance**

- Brand decisions are made by Amit. Disagreements resolve toward warmth.

- Any new component, color, or word pattern is added to this document before it ships.

- This guide is versioned with the repo (strategy/). Changes require a PR with “brand:” label.

	Confidential — Tempo Flow, by Amit Levin	Page

---

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

---

## 2.4 Roadmap

> **Source file:** `Tempo_Flow___Roadmap.md`

**TEMPO FLOW**   —   Roadmap

**TEMPO FLOW**

*Roadmap*

*From PWA skeleton to open-source launch — phased, no fixed dates.*

Milestone-driven, not calendar-driven. Ships when it is worthy.

**Version 1.0 — canonical roadmap**

Read alongside the PRD v4 (Master).

# **0.  How to read the roadmap**

This roadmap is milestone-driven, not calendar-driven. Tempo Flow ships when a milestone is worthy of shipping — not when a date arrives. Public phase names match the ChatGPT-style versioning so that users can follow along: 1.0, 1.1, 1.5, 2.0, 3.0. Internal milestones are more granular and live inside each phase below.

| **Cadence** Each phase ends with a dogfood week: Amit uses the new scope exclusively for seven days before the phase is considered shipped. If the founder will not use it, the user will not either. |
| --- |

# **1.  Tempo 1.0  —  MVP  (“The planner I can actually open.”)**

## **1.1  Goal**

Ship the full 42-screen MVP as a PWA, then port to React Native via Expo, then publish to both stores. Tempo Flow becomes Amit’s daily driver before anyone else touches it.

## **1.2  In scope**

- All fifteen feature areas in the PRD v4 (Auth, Dashboard, Tasks, Notes, Calendar, Journal, AI Coach, Habits & Routines, Goals, Projects, Analytics, Settings, Templates, Rewards, Search).

- Google Calendar read-write integration.

- All Goblin features (Magic ToDo, Formalizer, Estimator, Compiler, Accountability Buddy with cron reminders).

- Walkie-talkie voice on all tiers; live voice rate-limited by tier.

- Confidence-router semantic permissions.

- Accept-reject flow across every AI write.

- RevenueCat tiers: $1 trial, $5 Basic, $10 Pro, $20 Max.

- Donate button (Ko-fi / Buy Me a Coffee / GitHub Sponsors).

- GetTerms.io compliance live (privacy, terms, cookies, DSR).

- Self-hosted PostHog, opt-in.

## **1.3  Explicitly out of scope**

- BYOK, offline mode, scoped RAG, flashcards, email/WhatsApp scanners, VTuber avatar, crypto donations, desktop native app, learning-platform integrations.

## **1.4  Internal milestones (in order)**

- M1 — PWA skeleton. Dogfooded by Amit on phone + laptop for 7 days.

- M2 — Core features (Dashboard, Tasks, Notes, Calendar).

- M3 — AI layer (Coach chat, routing, Goblin features, accept-reject).

- M4 — Journal, Habits, Goals, Projects, Analytics, Templates, Rewards, Search.

- M5 — React Native via Expo: same Convex backend, same style tokens, parallel codebase.

- M6 — Beta testers receive Expo Go builds (APK for Android friends, IPA for iOS friends; primary testers: mom, sister, a few friends).

- M7 — Polish pass: copy, motion, accessibility audit.

- M8 — Payments wired: RevenueCat live, $1 trial flow end-to-end.

- M9 — Compliance live: GetTerms package shipped.

- M10 — Submission: App Store + Play Store review.

- M11 — “Coming Soon” website: the PWA published publicly as an internal tool for authorized users. Builds SEO and credibility while the stores review.

- M12 — Public GA: stores approved, PWA flips from internal to public, press kit goes live.

## **1.5  Exit criteria**

- Amit has used Tempo Flow daily for 60+ consecutive days.

- Beta testers report P95 satisfaction ≥ 4/5.

- Activation funnel ≥ 70% on beta users.

- All 42 screens render on iOS, Android, and web with no regressions against the design system.

# **2.  Tempo 1.1  —  Presence  (“The planner that follows you.”)**

## **2.1  Goal**

Deepen presence and personalization. The repository goes open source publicly at this phase. GitHub Sponsors and Discord tiers go live.

## **2.2  In scope**

- Apple Calendar (CalDAV) read-write.

- Home screen personalization: the Today screen re-orders sections per user behaviour.

- Ask-the-Founder queue: a first-class channel where users submit questions Amit personally answers.

- GitHub Sponsors tiered Discord access: Supporter → Beta Tester → Founder’s Circle.

- Open source repo publicly launched under BSL 1.1 (converts to Apache 2.0 in 4 years) with Additional Use Grant: permits self-host and VPS one-click installers; forbids rebranded commercial SaaS.

- Vlog presence split from political commentary.

- Patent filings on intent-based workflow primitives (confidence-router, accept-reject, calendar-aware templates).

# **3.  Tempo 1.5  —  Memory  (“The planner that remembers what matters.”)**

## **3.1  Goal**

Give every user a memory layer they trust. Turn Tempo Flow into the single place a user’s context lives.

## **3.2  In scope**

- Bring-Your-Own-Key for OpenAI, Anthropic, Pika, Claude Code / Codex login, Runway, Luma, HeyGen.

- Offline mode via quantized Gemma 4. Sync reconciliation on reconnect.

- Global per-user RAG (already scaffolded in 1.0) and NotebookLM-style scoped RAG (one per project / one per study topic).

- RemNote-style spaced recall + flashcards.

- Obsidian two-way Markdown folder sync.

- NotePlan one-way import.

- Anki flashcard import.

- Plugin system v1 (plugins = community-authored packages; plugin authors monetize via Patreon / Ko-fi / BMC).

- Swiss cloud privacy-mode inference placeholder resolved (Infomaniak AI shortlist or similar).

# **4.  Tempo 2.0  —  Connected  (“The planner that talks to your life.”)**

## **4.1  Goal**

Connect Tempo Flow to the messy outside world — email, messaging, photos — without ever compromising privacy.

## **4.2  In scope**

- Email scanner (Gmail first): RAM-only, every 30 min, flushed after extraction.

- WhatsApp scanner: RAM-only, every 30 min, flushed.

- Telegram scanner: RAM-only, every 30 min, flushed.

- Photo-accountability: take a photo to verify completion of a task (optional, per-user).

- VTuber avatar for the Coach, Max tier only, via BYOK Pika / Runway / Luma / HeyGen.

- Crypto donations: BTC / ETH / SOL / Monero.

- Connectivity modes: online / offline / privacy (Swiss cloud inference) / Bluetooth peer-sync.

- Replit / Lovable bi-directional project spine for builders.

- ChatGPT / Claude history one-time import seeds the global RAG.

- Desktop native app via Tauri (optional).

# **5.  Tempo 3.0  —  Ecosystem  (“The planner that grows with your craft.”)**

## **5.1  Goal**

Tempo Flow becomes the hub for a user’s learning and creative life. Integrations and communities around it thrive.

## **5.2  In scope**

- Learning platform integrations: Khan Academy, Udemy, Skool, Teachable.

- Voice-only device mode (Alexa / Google Assistant / Siri Shortcut / Raspberry-Pi companion).

- Plugin marketplace v2: discoverable, searchable, rated.

- Public API for third-party developers (read-only first, then write).

- Team / family / cohort modes (shared rituals and accountability).

- Mentor mode: a user can be a mentor for someone in the same community, with consent on both sides.

# **6.  Phase gate checklist**

Every phase ends with the same checklist before it is called “shipped.”

| **#** | **Item** | **Owner** |
| --- | --- | --- |
| 1 | All PRD v4 items for this phase are merged and behind feature flags. | Cursor Cloud |
| 2 | Accessibility regression suite passes. | Cursor Cloud |
| 3 | Performance budget holds (P95 TTI < 1.5 s on Pixel 6a). | Cursor Cloud |
| 4 | Founder dogfood week complete. | Amit |
| 5 | Beta group signs off. | Amit + Discord |
| 6 | Support runbooks updated. | Pokee AI |
| 7 | Docs and changelog updated. | Pokee AI |
| 8 | Public release notes drafted. | Pokee AI |
| 9 | Store submissions (if binary changes). | Twin.so |
| 10 | Amit flips the release flag. | Amit |

# **7.  Sequencing principle**

| **Depth before breadth** Tempo 1.0 is the full planner at depth-1. Tempo 1.1 adds presence (community + opening the source). Tempo 1.5 adds memory (the layer that compounds). Tempo 2.0 opens the outside world. Tempo 3.0 opens the ecosystem. Each phase builds on the previous; no phase can be reordered without breaking assumptions downstream. |
| --- |

# **8.  What we will say no to, and why**

- “Add a free tier” — No. Commitment is a filter. $1 trial is already generous.

- “Use Stripe.” — No. RevenueCat handles three stores. Do not double-maintain.

- “Add Clerk for auth.” — No. Convex Auth is native; no extra surface area.

- “Switch to Firebase / Supabase.” — No. Convex is the locked backend.

- “Add Notion / Linear / Airtable to coordinate agents.” — No. The spine is GitHub + Convex + Discord + TASKS.md.

- “Ship before the founder dogfoods.” — No. If Amit will not use it, we do not ship it.

	Confidential — Tempo Flow, by Amit Levin	Page

---

# Part 3 — Phase PRDs


---

## 3.1 PRD Phase 1.0 — MVP (Foundation)

> **Source file:** `PRD_Phase_1_MVP.md`

# PRD: Tempo Flow 1.0 "Foundation" — Full MVP

**Document status:** Draft v1.0  
**Phase:** 1.0  
**Target launch:** End of M8 milestone  
**North-star metric:** Activation rate — percentage of users who complete onboarding AND create their first plan within 24 hours of account creation.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals and Non-Goals](#2-goals-and-non-goals)
3. [Target Users](#3-target-users)
4. [42 Screens](#4-42-screens)
5. [Convex Schema (23+ tables)](#5-convex-schema)
6. [AI Integration Strategy](#6-ai-integration-strategy)
7. [Goblin Features Spec](#7-goblin-features-spec)
8. [Coach Personality Dial](#8-coach-personality-dial)
9. [Voice Feature Spec](#9-voice-feature-spec)
10. [Template System](#10-template-system)
11. [RAG and Contextual Memory](#11-rag-and-contextual-memory)
12. [Tagging Engine](#12-tagging-engine)
13. [Library System](#13-library-system)
14. [Design System Summary](#14-design-system-summary)
15. [Pricing and Paywall UX](#15-pricing-and-paywall-ux)
16. [Compliance](#16-compliance)
17. [Analytics](#17-analytics)
18. [Launch Surfaces](#18-launch-surfaces)
19. [Road-to-1.0 Milestones M0–M8](#19-road-to-10-milestones)
20. [Success Criteria](#20-success-criteria)
21. [Out of Scope](#21-out-of-scope)

---

## 1. Overview

Tempo Flow 1.0 "Foundation" ships the complete MVP: every screen, every core feature, and the full AI executive-function coaching stack — deployed simultaneously to the Vercel PWA, iOS App Store, and Google Play Store.

The product is built for neurodivergent users who experience executive dysfunction and overwhelm as a primary barrier to daily life. It is not a productivity tool for people who are already productive. It is a brain operating system for people whose brain resists conventional systems.

What ships in 1.0:

- All 42 defined screens across web PWA (Next.js 15) and mobile apps (Expo SDK 52+)
- Shared Convex backend with 23+ tables, real-time sync
- Full AI pipeline: OpenRouter routing to Gemma 4 26B (default heavy tasks) and Mistral Small 4 (default fast tasks)
- Coach with personality dial (0–10 scale)
- All Goblin features (Magic ToDo, Formalizer, Estimator, Compiler, Accountability Buddy)
- Voice: walkie-talkie universal, live voice with per-tier minute caps
- Template system: natural-language generator + picture-sketch generator
- RAG and contextual memory (global per user)
- Tagging engine (backend-always-on, UI-togglable)
- Library system (typed items: prompts, recipes, routines, formats, references)
- Full pricing stack: $1 seven-day paid trial, Basic $5/mo, Pro $10/mo, Max $20/mo
- RevenueCat subscription management
- GetTerms.io compliance integration, DSR button
- PostHog self-hosted analytics (opt-in)
- Ask-the-Founder queue (async, founder reviews and responds within 48h)

The north-star metric is activation rate. All product decisions in 1.0 are subordinate to whether they help a user who just signed up go from overwhelmed and blank to having a plan within 24 hours.

---

## 2. Goals and Non-Goals

### Goals

- **Ship a complete, usable product.** No locked screens, no placeholder features, no "coming soon" behind a paywall the user has already paid for.
- **Activate users within 24 hours.** Onboarding must produce a real plan, not a tutorial. The first Brain Dump → Coach planning session → today view loop must be completable in under 10 minutes.
- **Earn trust from neurodivergent users.** Every UI decision, copy line, and AI response must pass the "does this make an ADHD/autistic/anxious person feel safe and understood, not judged" test.
- **Achieve D7 retention >= 30%.** The app must be genuinely useful for daily use, not just novel.
- **Launch simultaneously on Web, iOS, and Android.** No phased-by-platform rollout in 1.0.
- **Establish the founder feedback loop.** Ask-the-Founder queue is live and the founder (Amit) responds within 48 hours to every message in the first month.
- **Pay the compliance cost upfront.** Privacy policy, terms of service, data subject request (DSR) button, and cookie handling are complete at launch — not retrofitted later.

### Non-Goals for 1.0

- Google Calendar or Apple Calendar sync (Phase 2.0)
- Apple Health or Google Fit integration (Phase 2.0)
- ChatGPT or Claude conversation import (Phase 2.0)
- Cursor/Claude Code MCP server (Phase 2.0)
- tempo-cli or browser extension (Phase 2.0)
- Offline quantized inference (Phase 1.5)
- BYOK text providers (Phase 1.5)
- Flashcards, spaced repetition, recall quizzing (Phase 1.5)
- Anki export or RemNote sync (Phase 1.5)
- Public plugin SDK (Phase 1.5)
- WhatsApp or Telegram bridges (Phase 2.0)
- VTuber avatar (Phase 2.0)
- Crypto donations (Phase 2.0)
- Community template gallery (Phase 3.0)
- Plugin marketplace (Phase 3.0)
- Learning platform integrations (Phase 3.0)
- Swiss/EU-hosted inference region (Phase 1.5 placeholder, Phase 3.0 launch)
- Notion, Linear, or Airtable integration (forbidden — never)

---

## 3. Target Users

### Primary Persona: Amit (Founder Dogfood)

Amit is the primary user. He is building this app because he cannot function with any existing productivity tool. He has ADHD, experiences significant executive dysfunction, and has tried and abandoned dozens of apps. He uses Tempo Flow as his actual daily OS. Every feature is validated against whether Amit personally uses it and whether it reduces his daily friction.

This is not a marketing persona. This is the founder dogfooding his own product. If Amit would not use a feature, it does not ship.

### Secondary Personas

**"The Overwhelmed Student"**  
University student with ADHD + anxiety. Has 12 tabs open, three unread syllabi, and a deadline they forgot about. Needs to turn a panic spiral into a manageable task list in under five minutes. Will not use a tool that feels like homework.

**"The Burned-Out Professional"**  
Mid-career knowledge worker with undiagnosed or late-diagnosed ADHD. Has tried Notion, Todoist, Asana, and ClickUp. Each one became a system maintenance burden. Needs a planner that plans *with* them, not one they have to maintain.

**"The Autistic Routine-Builder"**  
Autistic adult who thrives on predictability but struggles when routines break down. Needs the routine and habit systems. Needs the coach to be non-judgmental and literal. Needs the OpenDyslexic toggle and high-contrast options.

**"The Anxious Goal-Setter"**  
Person with generalized anxiety who sets ambitious goals and then catastrophizes when they fall behind. Needs the coach on the warm/peer side of the dial (0–5). Needs the rewards system to validate effort, not just completion.

### What These Users Have in Common

- Executive dysfunction as a daily barrier
- History of abandoning productivity tools
- Sensitivity to shame or judgment in UI copy and AI responses
- Benefit from external structure (coach, routines, plans) because internal structure is unreliable
- Strong preferences about sensory experience (font, contrast, layout density)
- Need for flexible task metadata (effort, energy, context, mood) because "just write the task" is not enough

---

## 4. 42 Screens

### Navigation Structure

Web PWA: sidebar nav. Mobile: bottom tab bar (Today, Tasks, Coach, Library, Settings) with deep-link modals for detail screens.

---

### Screen 1: Dashboard / Today

The daily command center. Shows the plan for today (ordered tasks pulled from the active plan), coach greeting, habit rings, quick-capture button, energy level prompt, and a motivational nudge card. Adapts layout based on time of day (morning overview, afternoon focus mode, evening review prompt). Founder vlog card placeholder (activated in 1.1).

### Screen 2: Tasks

Filterable, sortable master task list. Views: list, grouped by project, grouped by energy level. Filter bar: due date, tag, project, energy, effort, status. Bulk actions: reschedule, tag, move to project, delete. Swipe-to-complete on mobile.

### Screen 3: Task Detail

Full metadata view for a single task. Fields: title, description (rich text), due date, start date, recurrence, project, tags, effort estimate (AI-suggested), energy level (low/medium/high), mood context, blocking/blocked-by relations, sub-tasks (inline), linked note, linked journal entry, linked habit. AI actions sidebar: Estimator, Formalizer, Compiler. Comment thread (user + coach).

### Screen 4: Notes

Grid or list of all notes. Filter by folder, tag, type (plain, meeting, research, idea). Quick-note creation from FAB. Search bar with instant results. Pinned notes section at top.

### Screen 5: Note Detail

Full-screen rich text editor. Supports: markdown shortcuts, code blocks (IBM Plex Mono), inline tags (#tag), task embedding (!task), image paste, table of contents auto-generated from H2/H3 headings. AI actions: summarize, extract tasks, formalize, generate flashcards (Phase 1.5). Linked items panel (tasks, journal entries, goals) in right sidebar on web.

### Screen 6: Journal

Chronological journal feed. Daily entry prompt cards based on time of day (morning intention, midday check-in, evening reflection). Streak counter. Mood tag selector per entry. Quick-entry mode (one-tap "how are you feeling" card).

### Screen 7: Journal Entry Detail

Full editor for a journal entry. Prompt shown at top (can be dismissed). Mood tags, energy level, tags. Word count. AI actions: "extract tasks from this entry", "what patterns do I see?", "coach response to this entry". Privacy indicator: journal is always end-to-end encrypted at rest, coach queries are processed in-memory only.

### Screen 8: Calendar — Week View

7-day week view. Drag-and-drop task scheduling. All-day events at top. Tapping a time slot opens quick-task create. Color-coded by project. Energy level heatmap overlay (optional, togglable). Navigation: swipe left/right for prev/next week.

### Screen 9: Calendar — Month View

Month grid. Task dots per day with overflow count. Tap a day to expand to day detail. Habit completion shown as colored dots. Goal milestone markers.

### Screen 10: Calendar — Day View

Hour-by-hour schedule for one day. Time-blocks created by planning session shown as filled blocks. Tasks without a time shown in the "unscheduled" lane on the right. Current time indicator line. Quick rescheduling by drag.

### Screen 11: Brain Dump

A frictionless capture surface. Large text input area. No structure required. User types or dictates everything in their head. On submit, AI processes the dump: extracts tasks, identifies themes, flags urgent items, suggests a plan. Confidence-scored extracted items are shown for user approval (each item can be accepted, edited, or rejected). Processed Brain Dumps are stored and searchable.

### Screen 12: Coach Chat

Persistent conversation with the AI coach. Each conversation has a topic/goal label set on creation. Coach uses the personality setting, full RAG context, and current plan state. Input area has: text entry, voice push-to-talk button, scope switcher (Phase 1.5), suggested prompts. Conversation thread shows user and coach turns. Coach messages can be starred (saved to Library as prompts). Actions can be extracted from coach messages directly into tasks.

### Screen 13: Planning Session

A guided, structured flow for creating or revising today's (or this week's) plan. Steps: review brain dump / open items, energy check-in, coach proposes draft plan, user reviews and adjusts, plan is committed. Planning sessions create a time-blocked calendar view. Can be triggered from Dashboard, or opened manually. Recurring scheduling optional (e.g., every Sunday evening for weekly planning).

### Screen 14: Habits

Grid or list of habits. Each shows: habit name, frequency (daily / specific days / interval), current streak, longest streak, completion ring for today. Tap to log completion. Long press to edit. Sort by: streak, recently added, frequency.

### Screen 15: Goals

Card-based goal list. Each goal card shows: title, category (personal, work, health, creative, learning), due date, progress bar (auto-calculated from linked tasks or milestones), and effort estimate. Goals can be decomposed by the AI into milestones → tasks. Tap to open Goal Detail (sub-screen, reuses Task Detail pattern with milestone layer).

### Screen 16: Rewards

Gamified reward system. User defines rewards (e.g., "watch one episode", "buy myself coffee"). Rewards cost XP. XP earned by: completing tasks (weighted by effort), logging habits, completing planning sessions, consistent journal streak. Reward history log. No artificial daily caps — the system trusts the user to define their own reinforcers.

### Screen 17: Projects

Grid or list view of all projects. Each project card: title, color tag, task count (open / total), due date, progress ring, linked goals. Filter: active / archived / all. Sort: due date, last activity, creation date. Tap to open Project Detail.

### Screen 18: Project Detail

Project header (title, description, color, tags, due date). Three tabs: Tasks (full task list for project, same filters as Tasks screen), Notes (notes linked to project), Timeline (Gantt-lite view of milestones and due dates). AI action: "generate project plan" — produces a milestone breakdown as tasks. Coach sidebar available.

### Screen 19: Folders

Hierarchical folder tree for organizing notes, library items, and templates. Drag-and-drop reorder. Folder can be colored. "Smart folders" are saved filter combinations (e.g., "all notes tagged #research created this week"). Folders are a presentation layer, not a schema constraint.

### Screen 20: Library

Typed item repository. Tabs: All, Prompts, Recipes, Routines, Formats, References. Sort by: recently used, recently added, most used. Search with tag filter. Quick-add button opens Library Item Create flow with type selector.

### Screen 21: Library Item Detail

Full view of a Library item. Displays type badge, content (rich text or code block depending on type), tags, linked items, usage count, last used date. Edit mode for all fields. AI actions available per type (e.g., for Prompt: "refine this prompt", for Routine: "turn this into a recurring habit chain").

### Screen 22: Templates

Template gallery. Tabs: My Templates, Suggested (curated by Tempo team). Each template card: title, preview, type (task list, project, journal format, note structure), last used. Tap to preview, long press to use or duplicate.

### Screen 23: Template Editor

Dual-mode editor. Mode 1: Natural Language — user describes what they want ("weekly review template with energy check-in and three priority slots"), AI generates the template structure. Mode 2: Picture Sketch — user uploads or draws a sketch of a layout, AI interprets and generates a structured template. Calendar-aware: templates can reference "next Monday", "end of week", "first day of month" and resolve dynamically at use time. Output is a structured template stored in the `templates` table.

### Screen 24: Search

Full-text and semantic search across all content. Results grouped by type (tasks, notes, journal, library, templates). Filters: type, date range, tag, project. Recent searches saved. Semantic mode (AI-powered similarity) toggle in search bar. Highlights matching text in results.

### Screen 25: Settings

Root settings screen. Sections: Account, Appearance, Accessibility, Notifications, AI & Coach, Voice, Integrations (Phase 2), Privacy, About, Subscription. Each section links to its dedicated settings screen.

### Screen 26: Account

User profile data: display name, email, avatar. Change email (requires re-auth). Change password (if using Convex Auth email/password). Delete account (with GDPR-compliant data export first). Connected providers (OAuth).

### Screen 27: Subscription

Current plan display (Basic / Pro / Max / Trial). Billing cycle. Plan comparison table. Upgrade / downgrade flow. Cancel flow (with retention offer). Manage billing via RevenueCat customer portal. Restore purchases (mobile).

### Screen 28: Paywall

Shown when a user attempts to access a Pro or Max feature without the required plan tier. Displays: feature name, which tiers include it, plan comparison, "Start 7-day trial" CTA (if trial unused), "Upgrade" CTA (if trial used). Never interrupts mid-task. Triggered at feature entry point only.

### Screen 29: Integrations

Placeholder screen in 1.0 showing "Integrations coming in 2.0" with a category preview (Calendar, Health, Messaging, Dev Tools). Users can join a waitlist per category. Integration waitlist responses feed into Phase 2 priority ordering.

### Screen 30: Privacy

Data privacy controls: PostHog analytics opt-in/out toggle. Data export request (generates JSON/CSV of all user data). Data Subject Request (DSR) button (powered by GetTerms.io). Session data retention settings. Journal encryption status indicator.

### Screen 31: Profile

Public-facing (optional) profile. User display name, avatar, a short "about me" string, public template count, and coach session count. Profile is private by default. Sharing generates a public link with no sensitive data. Used for Ask-the-Founder transcript opt-in (1.1).

### Screen 32: Accessibility

Font settings: default (Inter body + Newsreader headings), OpenDyslexic toggle (replaces both), font size scale (90% / 100% / 115% / 130%). Contrast: default, high contrast, ultra-high contrast. Motion: reduce motion toggle (disables all transitions and animations). Focus indicators: always-on toggle. Haptic feedback toggle (mobile). Screen reader mode optimization toggle.

### Screen 33: Appearance

Theme: light / dark / system. Accent color: orange (default), seven accessible alternatives. Layout density: compact / default / comfortable. Card border radius: sharp / rounded / soft. Background texture: none / subtle grain. Dashboard widget customization (reorder, show/hide).

### Screen 34: Voice Settings

Default voice mode: walkie-talkie (universal) / live voice (if plan supports). Voice language: select from supported languages. Voice speed playback: 0.75× / 1× / 1.25× / 1.5×. Push-to-talk button position (mobile): bottom-left / bottom-right / floating center. Live voice minute cap display (Basic: 30/day, Pro: 90/day, Max: 180/day). BYOK TTS/STT (Phase 2).

### Screen 35: Ask the Founder

A direct async message queue to Amit. User types a message (question, feedback, bug, idea). Message is queued in `askFounderQueue` table. Amit receives a digest email and responds via admin panel. Response appears in this screen as a threaded reply. Estimated response time displayed (targeting 48h in month 1). Opt-in to public transcript (1.1).

### Screen 36: Notifications

Notification preference center. Notification types: daily planning reminder, habit check-in, streak at-risk warning, coach follow-up, plan review reminder, overdue task nudge, Ask-the-Founder reply. Per-type: toggle on/off, timing, channel (push / in-app / email). Quiet hours setting (mobile only).

### Screens 37–41: Onboarding (5 screens)

**Screen 37: Onboarding — Welcome**  
Full-screen brand-forward welcome. Headline: "Your brain's operating system." Sub-copy explains the core promise in 2–3 sentences. "Get started" CTA. No sign-in yet (sign-in deferred to after intent is established).

**Screen 38: Onboarding — Personalization**  
Multi-select checklist: "What describes you?" (ADHD, Autism, Anxiety, Dyslexia, Burnout, Executive dysfunction, None of the above — I just want a better system). Energy pattern selector (morning person / evening person / unpredictable). Work style (deep focus / lots of short tasks / mixed). These answers shape the initial coach personality dial position, template suggestions, and UI density default.

**Screen 39: Onboarding — Template Pick**  
Three template options presented as large cards with preview illustrations: "Student" (course tracking + assignment deadlines), "Builder" (project-based + code context), "Daily Life" (routines + habits + general tasks). User picks one (or "Start blank"). Selection pre-populates the first planning session context.

**Screen 40: Onboarding — First Brain Dump**  
First-time Brain Dump screen. Simplified UI with coaching copy at top: "Tell me everything that's on your mind. Don't organize it. Just type." AI processes in real time with a "thinking" animation. Result preview shown inline. User approves extracted items.

**Screen 41: Onboarding — First Task + Plan**  
Coach proposes a minimal plan based on the Brain Dump output: "Here are your top 3 things for today." User confirms, adjusts, or adds. This creates the first plan and triggers the activation event. After confirmation, user lands on Dashboard/Today. Account creation (email or OAuth) happens at this step if not already completed.

### Screen 42: Routines

List of defined routines (morning routine, shutdown sequence, weekly review, etc.). Each routine card: name, schedule (time + days), step count, last run date, completion rate. Tap to open Routine Detail. "Start now" button triggers a step-by-step guided run.

**Routine Detail (sub-screen of Screen 42)**  
Step list (ordered, reorderable). Each step: title, description, duration estimate, linked task (optional), linked habit (optional). Run mode: full-screen step-by-step with timer, progress bar, and done/skip per step. Edit mode allows adding/removing/reordering steps.

### Screen 43: Analytics / Insights

(Counted as screen 42 in the 42-screen list — internally labeled screen 43 but shipped in MVP.)  
Charts and summaries: task completion rate (7d / 30d), habit streak history, planning session frequency, coach conversation count, word count per journal (weekly trend), energy level distribution, time-of-day productivity heatmap. All charts use PostHog aggregated data. No raw event data is shown to the user — only computed summaries.

### Screen 44: Recent Activity

(Also within the 42 MVP count — included as a tab or section within Dashboard.)  
Chronological feed of all user actions: tasks completed, notes created, journal entries, habits logged, plans created, coach conversations started. Filter by type. Useful for reviewing "what did I actually do today?"

---

## 5. Convex Schema

All tables use Convex's validator syntax. `v.id("tableName")` for foreign keys. All tables include implicit `_id` and `_creationTime` Convex fields.

```typescript
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  // ── Users & Auth ──────────────────────────────────────────────────

  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")),
    onboardingComplete: v.boolean(),
    onboardingStep: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    energyPattern: v.optional(
      v.union(v.literal("morning"), v.literal("evening"), v.literal("variable"))
    ),
    workStyle: v.optional(
      v.union(v.literal("deep"), v.literal("sprint"), v.literal("mixed"))
    ),
    neurodivergentTags: v.optional(v.array(v.string())),
    coachPersonality: v.number(), // 0–10
    openDyslexicEnabled: v.boolean(),
    fontScale: v.number(), // 0.9 | 1.0 | 1.15 | 1.3
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    accentColor: v.optional(v.string()),
    reduceMotion: v.boolean(),
    layoutDensity: v.union(v.literal("compact"), v.literal("default"), v.literal("comfortable")),
    analyticsOptIn: v.boolean(),
    publicProfileEnabled: v.boolean(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  subscriptionStates: defineTable({
    userId: v.id("users"),
    revenueCatCustomerId: v.optional(v.string()),
    plan: v.union(
      v.literal("trial"),
      v.literal("basic"),
      v.literal("pro"),
      v.literal("max"),
      v.literal("none")
    ),
    billingCycle: v.union(v.literal("monthly"), v.literal("annual"), v.literal("none")),
    trialStartedAt: v.optional(v.number()),
    trialUsed: v.boolean(),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.boolean(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ── Core Content ─────────────────────────────────────────────────

  tasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("cancelled"),
      v.literal("deferred")
    ),
    dueDate: v.optional(v.number()),
    startDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    effortEstimate: v.optional(v.number()), // minutes, AI-suggested
    effortActual: v.optional(v.number()),   // minutes, user-logged
    energyLevel: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    moodContext: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    parentTaskId: v.optional(v.id("tasks")), // for sub-tasks
    planId: v.optional(v.id("plans")),
    recurrence: v.optional(v.object({
      frequency: v.union(
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("custom")
      ),
      interval: v.optional(v.number()),
      daysOfWeek: v.optional(v.array(v.number())),
      endDate: v.optional(v.number()),
    })),
    tags: v.array(v.string()),
    isArchived: v.boolean(),
    scheduledStart: v.optional(v.number()), // time-block start
    scheduledEnd: v.optional(v.number()),   // time-block end
    sourceType: v.optional(
      v.union(
        v.literal("manual"),
        v.literal("brain_dump"),
        v.literal("coach"),
        v.literal("template"),
        v.literal("routine")
      )
    ),
    sourceId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_userId_dueDate", ["userId", "dueDate"])
    .index("by_projectId", ["projectId"])
    .index("by_parentTaskId", ["parentTaskId"]),

  notes: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    content: v.string(), // rich text / markdown
    type: v.union(
      v.literal("plain"),
      v.literal("meeting"),
      v.literal("research"),
      v.literal("idea"),
      v.literal("template_output")
    ),
    folderId: v.optional(v.id("folders")),
    projectId: v.optional(v.id("projects")),
    tags: v.array(v.string()),
    isPinned: v.boolean(),
    isArchived: v.boolean(),
    wordCount: v.optional(v.number()),
    embeddingId: v.optional(v.string()), // vector store reference
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_folderId", ["userId", "folderId"])
    .index("by_userId_projectId", ["userId", "projectId"])
    .searchIndex("search_notes", {
      searchField: "content",
      filterFields: ["userId", "tags", "type"],
    }),

  journalEntries: defineTable({
    userId: v.id("users"),
    content: v.string(), // encrypted at rest
    prompt: v.optional(v.string()),
    promptType: v.optional(
      v.union(v.literal("morning"), v.literal("midday"), v.literal("evening"), v.literal("free"))
    ),
    moodTags: v.optional(v.array(v.string())),
    energyLevel: v.optional(v.number()), // 1–5
    tags: v.array(v.string()),
    wordCount: v.optional(v.number()),
    encryptionKeyRef: v.optional(v.string()), // client-side key reference
    entryDate: v.number(), // calendar date as unix timestamp (midnight)
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_entryDate", ["userId", "entryDate"]),

  calendarEvents: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    allDay: v.boolean(),
    type: v.union(
      v.literal("task_block"),
      v.literal("habit_block"),
      v.literal("routine_block"),
      v.literal("manual"),
      v.literal("external") // Phase 2: synced from Google/Apple
    ),
    linkedTaskId: v.optional(v.id("tasks")),
    linkedHabitId: v.optional(v.id("habits")),
    linkedRoutineId: v.optional(v.id("routines")),
    projectId: v.optional(v.id("projects")),
    color: v.optional(v.string()),
    recurrence: v.optional(v.object({
      frequency: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
      until: v.optional(v.number()),
    })),
    externalId: v.optional(v.string()), // Phase 2: external calendar event ID
    externalSource: v.optional(v.string()), // Phase 2: "google" | "apple"
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_startTime", ["userId", "startTime"]),

  // ── Brain Dump ────────────────────────────────────────────────────

  brainDumps: defineTable({
    userId: v.id("users"),
    rawText: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("processed"),
      v.literal("error")
    ),
    extractedItems: v.optional(v.array(v.object({
      id: v.string(),
      text: v.string(),
      type: v.union(
        v.literal("task"),
        v.literal("idea"),
        v.literal("worry"),
        v.literal("reminder"),
        v.literal("note")
      ),
      confidence: v.number(),    // 0–1
      approved: v.optional(v.boolean()),
      linkedTaskId: v.optional(v.id("tasks")),
      linkedNoteId: v.optional(v.id("notes")),
    }))),
    processingDurationMs: v.optional(v.number()),
    modelUsed: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ── Coach ─────────────────────────────────────────────────────────

  coachConversations: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    goal: v.optional(v.string()),
    personalitySnapshot: v.number(), // 0–10 at conversation start
    ragScope: v.optional(v.object({
      noteIds: v.optional(v.array(v.id("notes"))),
      projectIds: v.optional(v.array(v.id("projects"))),
      folderIds: v.optional(v.array(v.id("folders"))),
      tags: v.optional(v.array(v.string())),
    })), // Phase 1.5 full implementation; stored here for forward compat
    messageCount: v.number(),
    isArchived: v.boolean(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  coachMessages: defineTable({
    conversationId: v.id("coachConversations"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    toolCalls: v.optional(v.array(v.object({
      name: v.string(),
      input: v.string(),  // JSON string
      output: v.optional(v.string()), // JSON string
    }))),
    ragChunksUsed: v.optional(v.array(v.string())), // chunk IDs for auditability
    modelUsed: v.optional(v.string()),
    latencyMs: v.optional(v.number()),
    starred: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_userId", ["userId"]),

  // ── Planning ──────────────────────────────────────────────────────

  plans: defineTable({
    userId: v.id("users"),
    date: v.number(),         // target date as unix timestamp (midnight)
    scope: v.union(v.literal("day"), v.literal("week")),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("completed")),
    taskIds: v.array(v.id("tasks")),
    timeBlocks: v.optional(v.array(v.object({
      taskId: v.id("tasks"),
      startTime: v.number(),
      endTime: v.number(),
    }))),
    energyCheckIn: v.optional(v.object({
      level: v.number(),      // 1–5
      note: v.optional(v.string()),
    })),
    coachConversationId: v.optional(v.id("coachConversations")),
    generatedByAI: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_date", ["userId", "date"]),

  // ── Habits ────────────────────────────────────────────────────────

  habits: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    frequency: v.union(
      v.literal("daily"),
      v.literal("weekdays"),
      v.literal("weekends"),
      v.literal("custom")
    ),
    customDays: v.optional(v.array(v.number())), // 0=Sun … 6=Sat
    targetCount: v.number(),  // completions per period (usually 1)
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    currentStreak: v.number(),
    longestStreak: v.number(),
    isArchived: v.boolean(),
    linkedRoutineId: v.optional(v.id("routines")),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  habitCompletions: defineTable({
    habitId: v.id("habits"),
    userId: v.id("users"),
    completedAt: v.number(),
    note: v.optional(v.string()),
    count: v.number(), // default 1, can be > 1 for countable habits
  })
    .index("by_habitId", ["habitId"])
    .index("by_userId_completedAt", ["userId", "completedAt"]),

  // ── Goals ─────────────────────────────────────────────────────────

  goals: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("personal"),
      v.literal("work"),
      v.literal("health"),
      v.literal("creative"),
      v.literal("learning"),
      v.literal("financial"),
      v.literal("other")
    ),
    dueDate: v.optional(v.number()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("paused"),
      v.literal("cancelled")
    ),
    progressPercent: v.number(), // 0–100, auto-calculated or manual
    linkedTaskIds: v.optional(v.array(v.id("tasks"))),
    milestones: v.optional(v.array(v.object({
      id: v.string(),
      title: v.string(),
      dueDate: v.optional(v.number()),
      completed: v.boolean(),
    }))),
    tags: v.array(v.string()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ── Rewards ───────────────────────────────────────────────────────

  rewards: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    xpCost: v.number(),
    category: v.optional(v.string()),
    isRedeemed: v.boolean(),
    redeemedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ── Projects ──────────────────────────────────────────────────────

  projects: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("archived")),
    dueDate: v.optional(v.number()),
    linkedGoalId: v.optional(v.id("goals")),
    tags: v.array(v.string()),
    isArchived: v.boolean(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ── Folders ───────────────────────────────────────────────────────

  folders: defineTable({
    userId: v.id("users"),
    title: v.string(),
    parentFolderId: v.optional(v.id("folders")),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    isSmartFolder: v.boolean(),
    smartFolderFilter: v.optional(v.object({
      tags: v.optional(v.array(v.string())),
      types: v.optional(v.array(v.string())),
      dateRange: v.optional(v.object({
        start: v.optional(v.number()),
        end: v.optional(v.number()),
      })),
    })),
    sortOrder: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ── Library ───────────────────────────────────────────────────────

  libraryItems: defineTable({
    userId: v.id("users"),
    title: v.string(),
    type: v.union(
      v.literal("prompt"),
      v.literal("recipe"),
      v.literal("routine"),
      v.literal("format"),
      v.literal("reference")
    ),
    content: v.string(),
    tags: v.array(v.string()),
    folderId: v.optional(v.id("folders")),
    usageCount: v.number(),
    lastUsedAt: v.optional(v.number()),
    isPublic: v.boolean(), // Phase 3: community gallery
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_type", ["userId", "type"]),

  // ── Templates ─────────────────────────────────────────────────────

  templates: defineTable({
    userId: v.id("users"),
    title: v.string(),
    type: v.union(
      v.literal("task_list"),
      v.literal("project"),
      v.literal("journal_format"),
      v.literal("note_structure"),
      v.literal("routine"),
      v.literal("planning_session")
    ),
    content: v.string(), // JSON or markdown structure
    generationMethod: v.union(
      v.literal("natural_language"),
      v.literal("picture_sketch"),
      v.literal("manual")
    ),
    sourcePrompt: v.optional(v.string()),
    isCalendarAware: v.boolean(),
    tags: v.array(v.string()),
    usageCount: v.number(),
    lastUsedAt: v.optional(v.number()),
    isPublic: v.boolean(), // Phase 3
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ── Routines ──────────────────────────────────────────────────────

  routines: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    schedule: v.optional(v.object({
      time: v.optional(v.string()), // "HH:MM"
      days: v.optional(v.array(v.number())), // 0=Sun…6=Sat
    })),
    steps: v.array(v.object({
      id: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      durationMinutes: v.optional(v.number()),
      linkedHabitId: v.optional(v.id("habits")),
      linkedTaskTemplateTitle: v.optional(v.string()),
      order: v.number(),
    })),
    lastRunAt: v.optional(v.number()),
    completionRate: v.optional(v.number()), // 0–1
    isArchived: v.boolean(),
    tags: v.array(v.string()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ── Search ────────────────────────────────────────────────────────

  searchIndex: defineTable({
    userId: v.id("users"),
    sourceType: v.union(
      v.literal("task"),
      v.literal("note"),
      v.literal("journal"),
      v.literal("library_item"),
      v.literal("template"),
      v.literal("brain_dump")
    ),
    sourceId: v.string(),
    textChunk: v.string(),
    embedding: v.optional(v.array(v.number())), // vector embedding
    tags: v.array(v.string()),
    updatedAt: v.number(),
  })
    .index("by_userId_sourceType", ["userId", "sourceType"])
    .searchIndex("search_all", {
      searchField: "textChunk",
      filterFields: ["userId", "sourceType", "tags"],
    }),

  // ── Integrations (Phase 2 placeholder) ───────────────────────────

  integrations: defineTable({
    userId: v.id("users"),
    provider: v.string(), // "google_calendar" | "apple_calendar" | etc.
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("error"),
      v.literal("revoked")
    ),
    accessTokenEncrypted: v.optional(v.string()),
    refreshTokenEncrypted: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    scopes: v.optional(v.array(v.string())),
    metadata: v.optional(v.string()), // JSON string
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ── Ask the Founder ───────────────────────────────────────────────

  askFounderQueue: defineTable({
    userId: v.id("users"),
    message: v.string(),
    category: v.optional(
      v.union(
        v.literal("bug"),
        v.literal("feature"),
        v.literal("question"),
        v.literal("feedback"),
        v.literal("other")
      )
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("read"),
      v.literal("responded"),
      v.literal("closed")
    ),
    response: v.optional(v.string()),
    respondedAt: v.optional(v.number()),
    isPublicTranscript: v.boolean(), // Phase 1.1 opt-in
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ── Voice ─────────────────────────────────────────────────────────

  voiceSessions: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("walkie_talkie"), v.literal("live")),
    durationSeconds: v.optional(v.number()),
    transcript: v.optional(v.string()),
    coachConversationId: v.optional(v.id("coachConversations")),
    minutesConsumed: v.optional(v.number()),
    date: v.number(), // date of session (midnight unix)
    createdAt: v.number(),
  }).index("by_userId_date", ["userId", "date"]),

  // ── AI Agent Orchestration ────────────────────────────────────────

  agent_runs: defineTable({
    userId: v.id("users"),
    type: v.string(), // "brain_dump", "plan_generation", "template_gen", etc.
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    inputRef: v.optional(v.string()),    // source document ID
    outputRef: v.optional(v.string()),   // result document ID
    modelUsed: v.optional(v.string()),
    latencyMs: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  agent_tasks: defineTable({
    runId: v.id("agent_runs"),
    stepName: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("done"),
      v.literal("error")
    ),
    input: v.optional(v.string()),  // JSON string
    output: v.optional(v.string()), // JSON string
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_runId", ["runId"]),

  agent_handoffs: defineTable({
    runId: v.id("agent_runs"),
    fromStep: v.string(),
    toStep: v.string(),
    payload: v.optional(v.string()), // JSON string
    createdAt: v.number(),
  }).index("by_runId", ["runId"]),

  agent_artifacts: defineTable({
    runId: v.id("agent_runs"),
    artifactType: v.string(),
    content: v.string(), // JSON or text
    consumed: v.boolean(),
    createdAt: v.number(),
  }).index("by_runId", ["runId"]),

});
```

---

## 6. AI Integration Strategy

### Provider

All AI calls route through **OpenRouter**. No direct SDK calls to OpenAI, Anthropic, or Google. This is non-negotiable (see forbidden tech list).

### Models

| Model | Size | Use case |
|---|---|---|
| `google/gemma-3-27b-it` (Gemma 4 26B equivalent on OpenRouter) | 26B | Heavy reasoning, planning, RAG synthesis, long document tasks |
| `mistralai/mistral-small-3.2-24b-instruct` (Mistral Small 4) | 24B | Fast tasks, extraction, classification, short coach turns |

### Routing Logic

Implemented in `convex/lib/router.ts` as a deterministic rule set, not a model-calls-model pattern.

```
Feature → Model assignment (default):

Brain Dump processing        → Gemma (needs multi-step reasoning)
Planning session generation  → Gemma (long context, structured output)
Coach long-form response     → Gemma (nuanced, persona-aware)
Coach quick replies          → Mistral (low latency)
Task extraction (from note)  → Mistral (structured extraction)
Formalizer                   → Mistral (transform, not reason)
Estimator                    → Mistral (classification)
Template generation (NL)     → Gemma (creative, structured)
Template generation (sketch) → Gemma (visual reasoning from description)
Tag suggestion               → Mistral (fast classification)
Embedding generation         → Mistral text-embedding-3 via OpenRouter
Semantic search rerank       → Mistral
```

### Confidence Router

Every model output that affects user data includes a `confidence` field (0–1). Confidence thresholds:

- `>= 0.85`: auto-apply (e.g., tag suggestions, effort estimates shown inline)
- `0.65–0.84`: show with confirmation chip ("AI suggests: 45 min — accept?")
- `< 0.65`: show as suggestion only, never auto-apply

### Context Window Management

Gemma 4 26B has a 128K context window. RAG chunks are top-k retrieved (k=8 by default, configurable) and injected before user messages. System prompt is templated with coach personality dial value and user profile. Total prompt budget: system (800 tokens) + RAG (3200 tokens) + conversation history (4000 tokens rolling window) + user message.

### Error Handling

All AI calls have a 30-second timeout. On timeout or OpenRouter 5xx, the system falls back to a degraded-but-useful state (e.g., Brain Dump shows raw extraction without AI post-processing). Users are never left with a spinner that never resolves.

---

## 7. Goblin Features Spec

Goblin features are universally available to all paying users. They are not tier-gated. They can be accessed from Task Detail, Note Detail, or via Cmd-K / the AI palette.

### 7.1 Magic ToDo

Takes a vague or high-level task description and expands it into a structured, actionable sub-task list.

**Input:** Task title (e.g., "prepare for job interview")  
**Output:** Ordered sub-task list with effort estimates per sub-task  
**Model:** Gemma (structured expansion reasoning)  
**UX:** Button in Task Detail sidebar. Result shown in a slide-over panel for review before being applied. User can edit or delete any generated sub-task before confirming.

### 7.2 Formalizer

Takes informal notes, stream-of-consciousness text, or rough writing and transforms it into clean, structured prose without changing the meaning.

**Input:** Selected text or full note content  
**Output:** Reformatted text (same content, improved structure + grammar)  
**Model:** Mistral (fast transform)  
**UX:** Available in Note Detail and Journal Entry Detail via the AI actions menu. Shows diff view (before/after) with accept/reject per paragraph. Never auto-applies without user confirmation.

### 7.3 Estimator

Takes a task title and description and suggests a realistic effort estimate in minutes.

**Input:** Task title + description + (optionally) similar completed tasks from user history  
**Output:** Estimated minutes, confidence score, reasoning  
**Model:** Mistral (classification + retrieval)  
**UX:** Shows as a chip below the effort field in Task Detail: "AI suggests: 45 min [Accept]". Accepting writes to `effortEstimate`. User can override any time. Historical accuracy shown over time in Analytics screen.

### 7.4 Compiler

Takes a project or list of related tasks and produces a single coherent summary document: what the project is, what's done, what's remaining, key blockers, next recommended step.

**Input:** Project ID (fetches all tasks, notes, and recent coach messages for that project)  
**Output:** Markdown summary document  
**Model:** Gemma (multi-source synthesis)  
**UX:** Available from Project Detail header via "Compile overview" action. Output opens in a read-only Note-like viewer with an option to "Save to Library" or "Create note from this".

### 7.5 Accountability Buddy

An opt-in feature where the user sets a public commitment ("I will finish the outline by 5pm"). The coach checks in at the designated time via push notification. User responds with a voice note or text update. Coach gives non-judgmental acknowledgment and asks what they need next.

**Input:** Commitment text + deadline time  
**Output:** Scheduled coach check-in message at deadline  
**Model:** Mistral (short check-in messages)  
**UX:** Can be created from Task Detail ("Set accountability check-in"), Coach Chat, or Planning Session. Commitments stored in tasks table with `type: "commitment"` flag. Check-ins generated by Convex scheduled actions.

---

## 8. Coach Personality Dial

### Scale Definition

The coach personality dial is a continuous 0–10 value stored in `profiles.coachPersonality`. It represents the tone and interaction style of all AI coach responses.

| Value | Archetype | Characteristics |
|---|---|---|
| 0 | Warm Wise Mentor | Gentle, patient, empathetic. Focuses on self-compassion. Never pushes. Uses "we" language. Long, nurturing responses. |
| 2–3 | Supportive Guide | Encouraging but structurally helpful. Offers frameworks and gentle suggestions. |
| 5 | Peer Friend | Peer-to-peer tone. Casual, honest, sometimes direct. Treats user as an equal making their own decisions. |
| 7–8 | Pragmatic Coach | Task-focused. Brief. Calls out avoidance patterns (non-judgmentally). "Here's what needs to happen" energy. |
| 10 | High-Intensity Accountability | Demanding accountability, direct confrontation of avoidance, high-urgency language. User must explicitly opt into this tier. |

### Implementation

The dial value is injected into every system prompt via a templated block:

```
[COACH PERSONALITY: {value}/10]
Style guide:
- Tone: {tone_description}
- Response length target: {length_target}
- Avoidance patterns: {avoidance_handling}
- Self-compassion framing: {compassion_level}
- Direct confrontation: {confrontation_level}
```

The template values are pre-computed for each integer level and interpolated for float values between integers.

### User Controls

- Default set during onboarding (based on neurodivergent tag selection)
- Adjustable in Settings → AI & Coach → Personality Dial
- Can be overridden per coaching session: "be more direct with me today"
- Dial 10 requires explicit confirmation step: "This mode is demanding. It works for some people and not others. Are you sure?" with a 3-second hold-to-confirm gesture.

### Tone Examples at Key Points

**Dial 2 — task is overdue:**  
"Hey, I noticed [task] has been sitting for a few days. No pressure — sometimes things just need more time. Want to talk through what's making it hard to start?"

**Dial 5 — task is overdue:**  
"[Task] is overdue. What's the actual blocker? Let's figure it out."

**Dial 9 — task is overdue:**  
"[Task] has been overdue for 3 days. You know what you need to do. What's your plan for the next hour?"

---

## 9. Voice Feature Spec

### 9.1 Walkie-Talkie (Universal — All Tiers)

Push-to-talk voice capture. User holds button, speaks, releases. Audio is sent to OpenRouter Whisper (or equivalent STT) for transcription. Transcription is injected into the current input context (coach message, task title, note, brain dump). No live streaming — fire-and-transcribe pattern.

**Latency target:** < 2 seconds from button release to transcription appearing.  
**Accuracy:** Whisper large-v3 level accuracy expected.  
**Languages:** All languages supported by Whisper.  
**UX:** Button is a large microphone icon in the bottom input area on all input-heavy screens. On mobile, position is user-configurable (Voice Settings). While recording: button animates, audio level indicator shown. While transcribing: spinner with "Listening…" text.

### 9.2 Live Voice (Minute-Capped by Tier)

Streaming bidirectional voice conversation with the coach. User speaks continuously, coach responds in real-time with speech synthesis. Session ends when user taps "End" or when the daily minute cap is reached.

**Daily caps:**
- Basic: 30 minutes/day
- Pro: 90 minutes/day
- Max: 180 minutes/day

Minutes reset at midnight local time. Remaining minutes shown in Voice Settings and in the live voice session header.

**Technical implementation:**  
- STT: OpenRouter Whisper streaming (or Deepgram-compatible API via OpenRouter)
- TTS: Kokoro or compatible open-source TTS via OpenRouter
- Transport: WebSocket connection from client to Convex HTTP action → OpenRouter stream
- Session recorded in `voiceSessions` table with `minutesConsumed`

**Cap enforcement:**  
Convex scheduled action queries `voiceSessions` by `userId + date`, sums `minutesConsumed`, and blocks new live sessions if daily cap is reached. A warning at 5 minutes remaining triggers an in-session banner.

**UX for cap reached:**  
Banner: "You've used your {cap} minutes for today. Voice resets at midnight." Links to Subscription screen for upgrade.

### 9.3 VTuber Avatar

Spec deferred to Phase 2.0. In 1.0, the live voice session UI shows a waveform animation only.

---

## 10. Template System

### 10.1 Overview

Templates are structured content blueprints that users can apply to create tasks, projects, journal entries, note structures, or planning sessions. They are stored in the `templates` table and accessed via the Templates screen.

### 10.2 Natural Language Template Generator

User types a free-form description of the template they want. Gemma generates a structured template.

**Example input:** "Weekly review template with energy check-in at the start, three priority slots, a blockers section, and a wins section"

**Example output (as stored JSON):**
```json
{
  "type": "planning_session",
  "title": "Weekly Review",
  "sections": [
    { "id": "energy", "label": "Energy Check-In", "type": "scale", "min": 1, "max": 5 },
    { "id": "priority_1", "label": "Priority 1", "type": "task_ref" },
    { "id": "priority_2", "label": "Priority 2", "type": "task_ref" },
    { "id": "priority_3", "label": "Priority 3", "type": "task_ref" },
    { "id": "blockers", "label": "Current Blockers", "type": "freetext" },
    { "id": "wins", "label": "Wins This Week", "type": "freetext" }
  ]
}
```

### 10.3 Picture Sketch Generator

User uploads an image (photo of a hand-drawn sketch, a screenshot of a layout they like, or a photo of a physical planner spread). Gemma analyzes the visual structure and generates a template.

**Supported input formats:** JPEG, PNG, WEBP. Max 4MB.  
**Output:** Same structured JSON format as NL generator.  
**Accuracy note:** Sketch interpretation is imperfect. Output is always shown for review and editing before saving.

### 10.4 Calendar Awareness

Templates can include relative date references:

| Token | Resolves to |
|---|---|
| `{{next_monday}}` | Next Monday's date at run time |
| `{{end_of_week}}` | Sunday of the current week |
| `{{first_of_month}}` | First day of next month |
| `{{today}}` | Today's date |
| `{{in_N_days}}` | Today + N days |

Resolution happens at template-use time, not at template-save time.

---

## 11. RAG and Contextual Memory

### 11.1 Architecture

Tempo Flow uses a three-layer retrieval strategy for all RAG-powered features (coach chat, planning session context, brain dump classification).

**Layer 1 — Recency:** The last 7 days of tasks (completed + pending), journal entries, and brain dumps are always included in context, regardless of semantic relevance.

**Layer 2 — Semantic:** A vector embedding index (`searchIndex` table, embedding column) covers all notes, journal entries, and library items. Top-k retrieval (k=8) using cosine similarity. Embeddings generated via Mistral embed API on content creation/update.

**Layer 3 — Graph:** Explicit relations (task→project, note→task, journal→habit) are traversed to surface linked items even if they are not semantically similar.

### 11.2 Hybrid Retrieval

For each coach message or planning request:
1. Recency layer returns all items from last 7 days (capped at 2000 tokens).
2. Semantic layer returns top-8 chunks scored by similarity to the user's current message (capped at 1600 tokens).
3. Graph layer expands the semantic results by 1 hop to include linked items (capped at 800 tokens).
4. Total RAG context is deduplicated and truncated to fit within the 3200-token RAG budget.

### 11.3 Scope (Phase 1.0)

All RAG is global per user. There is no per-conversation scope restriction in 1.0. The `ragScope` field in `coachConversations` is stored as a forward-compatibility slot but is not enforced in 1.0.

### 11.4 Privacy

- Journal entries are encrypted at rest. The embedding index stores a vector derived from the unencrypted content during the embedding generation step (a server-side operation). The raw content is not stored in the search index.
- Users can exclude journal entries from RAG entirely via Settings → Privacy → "Include journal in coach context" toggle.

---

## 12. Tagging Engine

### 12.1 Design Principle

Tags are always computed and stored on the backend. They are never opt-in at the data layer. The UI visibility of tags is user-configurable. This ensures that features like search, filtering, and RAG always have a consistent tag corpus regardless of whether the user has enabled tag display.

### 12.2 Tag Sources

| Source | Method |
|---|---|
| User-explicit | User types `#tag` inline in any text field |
| AI-suggested | Mistral classifies content on save, suggests tags with confidence >= 0.85 |
| Auto-applied | Tags from `sourceType` (e.g., `#from-brain-dump`, `#coach-generated`) |
| Routine-applied | Tags specified in routine step definitions |

### 12.3 Tag Visibility Toggle

In Settings → Appearance: "Show tags in task list" / "Show tags in note list" toggles. These affect display only. Tags are always present in the data and always used in search/filter regardless of display setting.

### 12.4 Tag Namespace

Tags are unstructured strings. No enforced hierarchy in 1.0. Reserved prefix `@` for context tags (e.g., `@work`, `@home`, `@phone`) and `#` for topic tags. The tagging engine treats both as equivalent in search and filtering.

---

## 13. Library System

### 13.1 Item Types

| Type | Description | Example |
|---|---|---|
| Prompt | A reusable AI prompt template | "Summarize this meeting into action items and decisions" |
| Recipe | A step-by-step process for completing a recurring task type | "How to do a code review" |
| Routine | A serialized routine definition (same structure as `routines` table but portable as a library item) | "Morning startup sequence" |
| Format | A structured template for writing (note format, report format) | "Project postmortem format" |
| Reference | A reference document (cheat sheet, contact list, decision matrix) | "My keyboard shortcuts" |

### 13.2 Usage Patterns

Library items can be:
- Dragged into a Note to insert content at cursor
- Selected in Coach Chat context ("use my 'project postmortem' format for this")
- Applied as a starting template when creating a new note or task list
- Shared as a link (profile must be public — Phase 1.0 shares are view-only, no forking until Phase 3)

### 13.3 Usage Tracking

Every application of a Library item increments `usageCount` and sets `lastUsedAt`. The Library screen sorts by "Recently Used" by default.

---

## 14. Design System Summary

### 14.1 Name: "Soft Editorial"

The Tempo Flow design system uses warm neutrals with an orange accent, serif headings, and high-legibility body text. It is deliberately not aggressive or gamified. It communicates calm authority.

### 14.2 Typography

| Role | Font | Weight |
|---|---|---|
| Headings | Newsreader (serif) | 400, 600 |
| Body | Inter (sans-serif) | 400, 500 |
| Code / monospace | IBM Plex Mono | 400, 500 |
| Accessibility override | OpenDyslexic | 400 |

OpenDyslexic replaces both Newsreader and Inter when enabled. IBM Plex Mono is not replaced (code blocks remain monospaced).

### 14.3 Color System

- **Background:** Warm off-white (`#FAF9F6` light / `#1A1917` dark)
- **Surface:** `#F2EFE9` light / `#242220` dark
- **Accent:** `#E8622A` (warm orange — primary CTA, active states, streak indicators)
- **Text primary:** `#1A1917` light / `#F2EFE9` dark
- **Text secondary:** `#6B6560` light / `#9C9690` dark
- **Error:** `#C0392B` (red, color-blind safe)
- **Success:** `#2C7A4B` (green, color-blind safe)
- **Warning:** `#B7770D` (amber, color-blind safe)
- All interactive elements: WCAG AA contrast ratio minimum (4.5:1 for normal text, 3:1 for large text)

### 14.4 Shared Tokens

Design tokens are defined in `packages/design-tokens/src/tokens.ts` and consumed by both `apps/web` (Tailwind 3.3.2 config) and `apps/mobile` (NativeWind config).

### 14.5 Reference

Full Brand Identity document: `docs/BRAND_IDENTITY.md`

---

## 15. Pricing and Paywall UX

### 15.1 Plans

| Plan | Price | Voice (live/day) | Features |
|---|---|---|---|
| Trial | $1 for 7 days | 30 min | Full Pro access during trial |
| Basic | $5/month | 30 min | All core features |
| Pro | $10/month | 90 min | All core features + Pro AI features |
| Max | $20/month | 180 min | All features + Max AI features (Phase 2: VTuber avatar) |
| Annual | 2 months free on any plan | same as monthly tier | — |

There is no free tier. The $1 trial is the only entry point for new users.

### 15.2 Trial Flow

1. User completes onboarding (Screen 41)
2. Post-onboarding, paywall is shown if not already subscribed
3. Paywall shows: "Start your 7-day trial for $1" as the primary CTA, plan comparison below
4. RevenueCat handles payment collection
5. Trial period: 7 calendar days from first payment
6. At trial end: RevenueCat auto-converts to the selected plan. User is notified at Day 5 and Day 7.
7. If no plan is selected at trial end, account downgrades to read-only access (data preserved, no new input)

### 15.3 Tier Feature Gating

Feature gating is enforced server-side via Convex auth middleware that reads `subscriptionStates.plan` on every mutation. Client-side gating is for UX only (showing the paywall screen) and is not treated as a security boundary.

### 15.4 Paywall UX Principles

- Never interrupt mid-task. Paywall appears at feature entry point before the user has started work.
- Show exactly what is locked and why.
- One-tap upgrade path. The paywall always includes "Start trial" or "Upgrade" as a primary CTA.
- Never show a paywall for features the user already unlocked in a previous session.

---

## 16. Compliance

### 16.1 GetTerms.io Integration

Privacy policy and terms of service are generated and maintained via GetTerms.io. The generated documents are hosted at:
- `tempoflow.app/privacy`
- `tempoflow.app/terms`

Both URLs are linked in the app footer (web), Settings → About (mobile), and the paywall screen.

### 16.2 Data Subject Request (DSR) Button

A DSR button is present in Settings → Privacy. Pressing it initiates a GetTerms.io-powered DSR workflow: the user selects the request type (access, deletion, correction, portability), submits, and receives an email confirmation. DSR responses are fulfilled within 30 days per GDPR.

### 16.3 Cookie Handling

Web PWA uses a GetTerms.io cookie banner on first visit. Only strictly necessary cookies are active before consent. PostHog analytics cookies are conditional on opt-in.

### 16.4 Journal Encryption

Journal entries are encrypted at rest using a per-user key stored in Convex Secrets. Key rotation is supported. Coach access to journal content requires the user's session key (journeys are never accessible by admin without user session).

### 16.5 App Store Compliance

- iOS: Privacy Nutrition Label populated via `PrivacyInfo.xcprivacy`
- Android: Data Safety form in Play Console populated
- Both: No third-party ad SDKs
- Both: No selling of user data

---

## 17. Analytics

### 17.1 Provider

PostHog, self-hosted. Instance managed by Amit on the project VPS (46.224.161.132 or equivalent). Analytics are opt-in.

### 17.2 Opt-In Flow

On first app open after onboarding, a one-time dialog: "Help us improve Tempo Flow? We collect anonymous usage data. No personal content is ever sent." Accept / Decline. Setting persisted in `profiles.analyticsOptIn` and respected on all subsequent sessions.

### 17.3 Events Tracked (When Opted In)

| Event | Properties |
|---|---|
| `onboarding_completed` | `template_selected`, `time_to_complete_seconds` |
| `first_plan_created` | `task_count`, `method` (coach / manual) |
| `brain_dump_submitted` | `word_count`, `items_extracted` |
| `coach_conversation_started` | `personality_dial_value` |
| `habit_logged` | `habit_id` (anonymized) |
| `paywall_shown` | `feature`, `plan_at_time` |
| `subscription_started` | `plan`, `cycle` |
| `subscription_cancelled` | `plan`, `days_active` |
| `voice_session_started` | `type` (walkie / live) |
| `template_used` | `template_type`, `generation_method` |
| `feature_used` | `feature_name` (Goblin feature ID) |

No content (task text, note text, journal text, coach messages) is ever sent to PostHog.

### 17.4 Self-Hosted Rationale

Self-hosting PostHog avoids third-party data sharing, aligns with the privacy-first product positioning, and gives Amit full control over the analytics data pipeline.

---

## 18. Launch Surfaces

### 18.1 Web PWA (Vercel)

- Domain: `tempoflow.app`
- Hosting: Vercel (hobby tier initially, scaling to Pro)
- PWA: Next.js 15 App Router with `next-pwa` or equivalent service worker setup
- "Add to Home Screen" prompt on mobile browsers
- During App Store / Play Store review: PWA is the only live surface. A "Web App Available Now — Native Apps Coming Soon" banner is shown.

### 18.2 iOS App Store

- App name: Tempo Flow
- Bundle ID: `app.tempoflow.ios`
- Target: iOS 16+
- Expo build via EAS Build
- TestFlight beta period: minimum 2 weeks before App Store submission
- Review time allowance: 5–7 business days built into launch timeline

### 18.3 Google Play Store

- Package name: `app.tempoflow.android`
- Target: Android 10+ (API 29+)
- Expo build via EAS Build
- Internal testing → Closed testing → Open testing → Production track
- Review time allowance: 3–5 business days

### 18.4 Simultaneous Launch Strategy

- All three surfaces launch within the same 48-hour window
- PWA ships first (Vercel deploy is instant)
- iOS and Android submit simultaneously after TestFlight/internal test sign-off
- Launch announcement withheld until all three are live

---

## 19. Road-to-1.0 Milestones

### M0: Project Foundation (Week 0–1)

- Monorepo setup: `apps/web` (Next.js 15), `apps/mobile` (Expo 52), `packages/design-tokens`, `packages/ui`, `packages/convex`
- Convex project initialized, schema committed
- Convex Auth configured (email + GitHub OAuth)
- Tailwind 3.3.2 configured in web, NativeWind in mobile
- shadcn/ui base components installed in web
- Design token pipeline: tokens.ts → Tailwind config → NativeWind config
- ESLint + TypeScript strict mode + Prettier
- EAS project initialized
- GitHub repo with branch protection on `main`
- TASKS.md committed with full phase breakdown
- GitHub Issues + Projects board initialized

### M1: Auth + Subscription Shell (Week 1–2)

- Sign-in / sign-up screens (email + OAuth)
- RevenueCat SDK integrated (web + mobile)
- Paywall screen functional (test products)
- Subscription state synced to Convex (`subscriptionStates` table)
- Onboarding screens 37–41 implemented (no AI yet — static flow)
- Dashboard shell with placeholder cards

**Week 1 target:** Developer (Amit) is using the PWA as a daily driver. This means: auth works, Dashboard shows today's date, tasks can be created and checked off.

### M2: Core Task + Note System (Week 2–3)

- Tasks screen + Task Detail (all fields, no AI actions yet)
- Notes screen + Note Detail (rich text editor)
- Calendar screens (week/month/day views, task scheduling)
- Folders screen
- Real-time sync via Convex verified (open on two devices, changes reflect instantly)

**Week 2 target:** React Native parity with web for Tasks + Notes. Mobile app is usable as a daily driver.

### M3: AI Pipeline (Week 3–4)

- OpenRouter client configured
- Brain Dump screen + AI processing (Gemma)
- Coach Chat screen (streaming, personality dial injected)
- RAG pipeline: embedding generation on note save, hybrid retrieval on coach message
- Goblin features: Magic ToDo, Formalizer, Estimator, Compiler (all in Task Detail)
- Accountability Buddy (basic version — coach check-in on task deadline)
- Tagging engine (AI tag suggestions on save)

### M4: Planning + Habits + Goals (Week 4–5)

- Planning Session flow (full guided flow)
- Habits screen + Habit completions
- Goals screen + Goal decomposition (AI milestone breakdown)
- Rewards system (XP tracking, reward catalog)
- Routines screen + Routine Detail + Run mode
- Recent Activity feed

### M5: Library + Templates + Search (Week 5–6)

- Library screen + Library Item Detail
- Templates screen + Template Editor (NL + sketch modes)
- Search screen (full-text + semantic)
- Journal screen + Journal Entry Detail

### M6: Voice + Settings + Analytics (Week 6–7)

- Voice: walkie-talkie (all screens with text input)
- Voice: live voice sessions (streaming, minute tracking)
- Settings screens (all subsections)
- Accessibility screen (OpenDyslexic, font scale, contrast, reduce motion)
- Appearance screen
- PostHog integration (opt-in)
- Analytics/Insights screen (computed aggregates)

### M7: Compliance + Ask the Founder + Polish (Week 7–8)

- GetTerms.io integration (privacy policy, ToS, cookie banner, DSR button)
- Ask-the-Founder screen + admin response panel
- Integrations screen (Phase 2 placeholder with waitlist)
- End-to-end testing: all 42 screens, all user flows
- Performance audit: Lighthouse >= 90 on PWA, 60fps on mobile
- Accessibility audit: WCAG AA pass on all screens
- Copy review: all AI response templates reviewed against neurodivergent-safe guidelines
- App icon, splash screen, marketing assets

### M8: App Store Submission + Launch (Week 8+)

- TestFlight beta (minimum 2 weeks)
- Android internal + closed testing
- App Store Connect metadata complete
- Google Play Console listing complete
- Vercel production deploy
- Monitoring: Convex dashboard, PostHog, error alerting
- Launch

---

## 20. Success Criteria

| Metric | Target | Notes |
|---|---|---|
| Activation rate (north star) | >= 60% | % of users completing onboarding + first plan in 24h |
| D7 retention | >= 30% | % of activated users with >= 1 session on Day 7 |
| D30 retention | >= 15% | % of activated users with >= 1 session on Day 30 |
| Ask-the-Founder response time | <= 48h | Measured from submission to response, Month 1 |
| Brain Dump → plan conversion | >= 70% | % of Brain Dumps that result in an accepted plan |
| Trial → paid conversion | >= 25% | % of trial starters who convert to any paid plan |
| App Store rating | >= 4.5 stars | Measured at 30 days post-launch, min 20 ratings |
| Crash-free rate | >= 99.5% | Both iOS and Android |
| PWA Lighthouse score | >= 90 | Performance, accessibility, best practices |
| AI response latency (P50) | <= 3s | For coach messages using Mistral |
| AI response latency (P95) | <= 10s | For Gemma-powered planning sessions |

---

## 21. Out of Scope (Moved to Later Phases)

The following features are explicitly excluded from 1.0 and are documented in their respective phase PRDs:

**Phase 1.1 "Presence"**
- Founder vlog embed card on Dashboard
- Public Ask-the-Founder transcripts
- Plugin SDK skeleton
- Open-source contributor badge
- Public CHANGELOG

**Phase 1.5 "Memory"**
- BYOK text providers (OpenAI, Anthropic, Mistral, Groq, Together keys)
- Offline quantized inference (Gemma 3B/7B on-device)
- NotebookLM-style scoped RAG
- Flashcards, spaced repetition, recall quizzing
- Anki export, RemNote sync
- Public plugin SDK

**Phase 2.0 "Connected"**
- Google Calendar / Apple Calendar two-way sync
- Apple Health / Google Fit read access
- ChatGPT / Claude conversation import (RAM-only)
- Cursor/Claude Code MCP server
- tempo-cli
- Browser extension
- REST API + webhooks
- Photo accountability
- WhatsApp / Telegram bridges (RAM-only)
- Bluetooth sync
- VTuber avatar (Max tier)
- BYOK TTS/STT/embedding/image/video
- Crypto donations

**Phase 3.0 "Ecosystem"**
- Learning platform integrations (Khan, Udemy, Skool, etc.)
- Bi-directional builder sync (Cursor, Replit, Lovable, v0)
- Advanced confidence router
- Community template gallery
- Plugin marketplace
- Swiss/EU inference region (user-selectable)

**Permanently excluded (forbidden tech)**
- Firebase, Supabase, Prisma, Drizzle
- Auth0, Clerk, NextAuth
- Stripe direct integration
- OpenAI/Anthropic/Google direct SDKs (OpenRouter only)
- Redux, Zustand, Jotai
- Axios
- Tailwind 3.4+
- Notion, Linear, Airtable


---

## 3.2 PRD Phase 1.1 — Presence

> **Source file:** `PRD_Phase_1_1_Presence.md`

# PRD: Tempo Flow 1.1 "Presence" — Open-Source Showcase Polish

**Document status:** Draft v1.0  
**Phase:** 1.1  
**Depends on:** 1.0 "Foundation" shipped and live  
**Estimated effort:** 2–4 weeks  
**Primary purpose:** Signal open-source posture, ship the founder's presence layer, address launch bugs, harden the CI pipeline.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals](#2-goals)
3. [Features](#3-features)
4. [Schema Additions](#4-schema-additions)
5. [UX Acceptance Criteria](#5-ux-acceptance-criteria)
6. [Success Criteria](#6-success-criteria)

---

## 1. Overview

Tempo Flow 1.1 "Presence" is the first post-launch release. It is a polish and signal release, not a feature release. Its primary purpose is to establish Tempo Flow as a credible open-source project in public, not just in private. This means:

- The founder is visible and reachable inside the app (vlog card, Ask-the-Founder transcript opt-in)
- The open-source identity of the project is surfaced inside the product (badge, license link, GitHub link, contributor count)
- The developer surface is hardened (CI gates, forbidden-tech scanner, schema guard)
- The bug backlog from 1.0's launch window is addressed
- The plugin SDK skeleton is committed to the repo as a foundation for Phase 1.5's public plugin release

1.1 ships as a rolling update to all three platforms (Vercel web, iOS, Android). It does not require an App Store review unless new permissions are added (they are not in this release).

---

## 2. Goals

### Primary Goals

- **Surface the open-source posture.** Users and potential contributors visiting the app should immediately understand that this is an open-source project with an active founder. The GitHub link, license type, and contributor count should be visible inside the app.

- **Ship the founder's presence layer.** Amit's YouTube vlog should be accessible from the Dashboard. Ask-the-Founder transcript opt-in should be working so that useful exchanges can become public reference material.

- **Publish CONTRIBUTING documentation.** The repo should have a `CONTRIBUTING.md`, a `CODE_OF_CONDUCT.md`, and a minimal `SECURITY.md` that make it possible for a first external contributor to open a valid PR without asking Amit directly.

- **Harden CI.** The pipeline should enforce what the repo documents: no forbidden tech, no schema regressions, all PRs must pass type-check + lint + test.

- **Clear the 1.0 bug backlog.** Launch bugs (P0 and P1) should be fixed before investing in new features.

### Non-Goals

- No new AI features in 1.1
- No new screens (other than the open-source badge section within Settings → About)
- No BYOK, offline inference, or plugin API (Phase 1.5)
- No calendar or health integrations (Phase 2.0)
- No community template gallery (Phase 3.0)
- The Plugin SDK skeleton is committed to the codebase but is NOT documented as a public API. External developers are not yet invited to build plugins. That happens in 1.5.

---

## 3. Features

### 3.1 Founder Vlog Embed Card on Dashboard

A persistent card on the Dashboard (below the today plan, above the habit rings or as a dismissible bottom card based on user layout preferences) that shows the latest episode of Amit's development vlog.

**Card design:**
- Thumbnail image (fetched from YouTube oEmbed or the `vlogEpisodes` Convex table)
- Title of the episode
- Duration
- "Watch on YouTube" button (opens in system browser, not an in-app WebView)
- Dismiss button (collapses the card for the current session; does not permanently hide it)

**Data source:**
The `vlogEpisodes` table (see Section 4). An admin Convex action (triggered via the admin panel or a manual mutation) populates the table with new episodes. Optionally a Convex scheduled action polls the YouTube RSS feed for the channel weekly.

**User control:**
Settings → Appearance → "Show founder vlog card on Dashboard" toggle. Default: on. Off hides the card permanently (persisted in profile).

**Why this matters:**
Users of open-source tools develop trust when they can see the founder is actively building in public. This card makes that visible without requiring users to seek it out externally.

### 3.2 Public Ask-the-Founder Transcripts (Opt-In Per User)

When Amit responds to an Ask-the-Founder message, the response panel includes an "Make this transcript public?" checkbox. If the user previously opted in (Profile → "Allow my Ask-the-Founder exchanges to be shared publicly") and Amit marks the response as public-approved, the exchange is visible at `tempoflow.app/founder/conversations/{id}` — a public read-only page.

**Privacy defaults:**
- `isPublicTranscript` defaults to `false` on every `askFounderQueue` record
- Users must explicitly opt in via Profile settings before any of their messages can be shared
- Even after opt-in, each individual exchange requires Amit's explicit approval
- Redaction: before publishing, Amit can redact any personally identifiable or sensitive content from the exchange using a text editor in the admin panel. The published version replaces redacted sections with `[redacted]`.

**Public page:**
- Shows: date, question (redacted if needed), Amit's response, category tag (bug / feature / question / feedback)
- Does not show: user display name, email, avatar, or any profile information unless user has opted to show their display name
- Linked from Settings → About → "Read founder conversations"

### 3.3 Open-Source Badge in Settings → About

A new "About" subsection in Settings that makes the project's open-source identity visible in-app.

**Displayed information:**
- "Tempo Flow is open source" headline
- License: BSL 1.1 (with link to full license text on GitHub)
- Apache 2.0 conversion date (4 years from initial commit — show the calculated date)
- GitHub link: `https://github.com/[org]/tempoflow` (opens in system browser)
- Contributor count (fetched from GitHub API, cached daily in `changelogEntries` metadata or a simple `settings` key-value store in Convex)
- Current version + build number
- Link to `CHANGELOG.md` (hosted on GitHub or rendered in-app)
- Link to CONTRIBUTING guide

**Visual treatment:**
- Small GitHub mark icon next to the GitHub link
- BSL badge with a tooltip explaining what BSL 1.1 means for users (brief: "You can use and self-host this app. You cannot resell it as a competing SaaS under a different brand.")

### 3.4 Public CHANGELOG.md

A `CHANGELOG.md` file is maintained in the repo root and generated semi-automatically from GitHub Releases. Format follows Keep a Changelog conventions.

**Process:**
1. When Amit creates a GitHub Release, the release notes are automatically (via GitHub Action) appended to `CHANGELOG.md` and a PR is opened.
2. Amit reviews and merges the PR.
3. The in-app About section links to the rendered GitHub version of `CHANGELOG.md`.

**No in-app changelog rendering in 1.1.** A future release may render the changelog in-app, but for now the link opens the GitHub page.

### 3.5 Plugin SDK Skeleton (Code Only, Not Public API)

A `packages/plugin-sdk` package is scaffolded in the monorepo. This is a code-only commitment — it is committed to the public repo but is explicitly documented as "not stable, not accepting external plugins yet."

**What the skeleton defines:**

**Manifest format (`plugin.manifest.json`):**
```json
{
  "id": "com.example.my-plugin",
  "name": "My Plugin",
  "version": "0.1.0",
  "author": "Author Name",
  "description": "What this plugin does",
  "permissions": ["tasks:read", "notes:read", "coach:append"],
  "entryPoint": "index.js",
  "sandboxType": "iframe" | "convex_action"
}
```

**Permission scopes (defined, not enforced yet):**

| Scope | Description |
|---|---|
| `tasks:read` | Read user's tasks |
| `tasks:write` | Create/update tasks |
| `notes:read` | Read user's notes |
| `notes:write` | Create/update notes |
| `library:read` | Read library items |
| `library:write` | Create library items |
| `coach:append` | Append a message to an active coach conversation |
| `coach:context` | Inject context into coach RAG scope |
| `calendar:read` | Read calendar events |
| `calendar:write` | Create calendar events |
| `tags:read` | Read tags |
| `tags:write` | Apply tags |

**Sandbox boundaries:**
- Web: sandboxed `<iframe>` with `allow="none"` policy. Plugin communicates via `postMessage` only. No direct DOM access to the host app.
- Mobile: sandboxed WebView (Phase 1.5 full implementation). In 1.1, mobile plugin sandboxing is defined in the spec but not implemented.
- Convex actions: plugins registered as Convex actions run in an isolated Convex function context. They can only call Convex queries/mutations that the permission scopes allow. No raw HTTP calls from server plugin actions.

**Lifecycle hooks (defined in TypeScript types, not fully implemented):**
```typescript
interface TempoPlugin {
  onInstall?: (ctx: PluginContext) => Promise<void>;
  onUninstall?: (ctx: PluginContext) => Promise<void>;
  onActivate?: (ctx: PluginContext) => Promise<void>;
  onDeactivate?: (ctx: PluginContext) => Promise<void>;
}
```

**What ships in 1.1 vs. 1.5:**

| Component | 1.1 | 1.5 |
|---|---|---|
| Manifest format | Defined | Stable + documented |
| Permission scopes | Defined | Enforced |
| Sandbox iframe (web) | Skeleton | Implemented |
| Sandbox mobile | Defined | Implemented |
| Plugin install UI | None | Implemented |
| External plugins allowed | No | Yes |
| First official plugins | None | Audible Library, Goodreads |

### 3.6 CI Pipeline Hardening

Four GitHub Actions workflows are added or updated:

**Workflow 1: `ci.yml` — PR gate**
```
Triggers: pull_request to main
Steps:
  1. pnpm install
  2. pnpm type-check (tsc --noEmit across all packages)
  3. pnpm lint (ESLint strict)
  4. pnpm test (Vitest for packages/convex functions, Jest for apps)
  5. pnpm build (next build + expo export, verifying no build errors)
```
All five steps must pass. Any failure blocks merge.

**Workflow 2: `forbidden-tech-scanner.yml` — dependency guard**
```
Triggers: pull_request to main (on package.json changes)
Steps:
  1. Parse all package.json files in the monorepo
  2. Check for forbidden packages:
     - firebase, @firebase/*
     - @supabase/supabase-js
     - prisma, @prisma/client
     - drizzle-orm
     - @auth0/*, @clerk/*, next-auth
     - stripe (direct — @revenuecat/* is allowed)
     - openai, @anthropic-ai/sdk, @google-ai/*
     - redux, @reduxjs/toolkit, zustand, jotai
     - axios
     - tailwindcss (versions >= 3.4.0)
  3. If any forbidden package is found: fail with list of violations
```

**Workflow 3: `schema-guard.yml` — Convex schema regression guard**
```
Triggers: pull_request to main (on convex/schema.ts changes)
Steps:
  1. Diff convex/schema.ts against base branch
  2. Parse added/removed table definitions and index definitions
  3. Output a human-readable summary as a PR comment
  4. Fail if:
     - An existing table is removed (breaking change)
     - An existing index is removed (breaking change)
     - A non-optional field is added to an existing table without a migration note
     (migration notes are checked by looking for a MIGRATION.md entry with the PR number)
```

**Workflow 4: `release-changelog.yml` — automatic CHANGELOG update**
```
Triggers: GitHub Release published
Steps:
  1. Fetch release notes from GitHub Release API
  2. Prepend to CHANGELOG.md in Keep a Changelog format
  3. Open a PR to main with the CHANGELOG update
  4. Assign the PR to @amit (repo owner)
```

### 3.7 Bug Backlog from 1.0 Launch

The 1.0 bug backlog is managed in GitHub Issues with labels `priority:P0`, `priority:P1`, `priority:P2`. All P0 (production incidents) and P1 (user-facing broken flows) issues must be resolved before 1.1 ships. P2 issues are prioritized within 1.1 if time permits.

At time of PRD authorship, the bug backlog does not yet exist (1.0 is not yet launched). This section documents the process:

1. Post-launch bugs are filed in GitHub Issues by Amit or by users via the Ask-the-Founder queue.
2. Amit triages daily for the first 2 weeks post-launch.
3. P0 bugs are fixed and hot-patched to production within 24 hours of discovery.
4. P1 bugs are collected into the 1.1 milestone in GitHub Projects.
5. 1.1 does not ship until the P1 backlog is empty.

---

## 4. Schema Additions

Three new tables support the 1.1 features. These are additive — no existing tables are modified.

```typescript
// Additions to convex/schema.ts

vlogEpisodes: defineTable({
  youtubeVideoId: v.string(),      // e.g., "dQw4w9WgXcQ"
  title: v.string(),
  description: v.optional(v.string()),
  thumbnailUrl: v.string(),
  durationSeconds: v.number(),
  publishedAt: v.number(),         // unix timestamp
  isActive: v.boolean(),           // false = hidden from Dashboard card
  order: v.number(),               // manual sort order (lower = shown first)
}).index("by_isActive_order", ["isActive", "order"]),

changelogEntries: defineTable({
  version: v.string(),             // e.g., "1.1.0"
  releaseDate: v.number(),         // unix timestamp
  title: v.string(),
  body: v.string(),                // markdown release notes
  githubReleaseUrl: v.optional(v.string()),
  type: v.union(
    v.literal("major"),
    v.literal("minor"),
    v.literal("patch")
  ),
}).index("by_releaseDate", ["releaseDate"]),

// Note: contributions table is intentionally omitted in 1.1.
// Contributor count is fetched live from GitHub API and cached
// in a simple key-value config document rather than a table.
// A dedicated contributions table may be added in a future phase
// if contributor tracking (XP, leaderboard, etc.) becomes a feature.
```

---

## 5. UX Acceptance Criteria

### 5.1 Founder Vlog Card

- [ ] Card is visible on Dashboard for all new sessions when `showFounderVlogCard` profile setting is `true` (default)
- [ ] Card displays thumbnail, title, and duration from the most recent active `vlogEpisodes` entry
- [ ] "Watch on YouTube" button opens `https://www.youtube.com/watch?v={youtubeVideoId}` in the system browser
- [ ] Dismiss button collapses the card for the current app session only (not persisted)
- [ ] Settings toggle in Appearance section persists the card's permanent visibility state
- [ ] Card does not appear when there are no active `vlogEpisodes` records

### 5.2 Ask-the-Founder Transcript Opt-In

- [ ] Profile settings screen shows "Allow public transcripts" toggle (default off)
- [ ] Admin panel (accessible to Amit at `/admin/founder-queue`) shows "Make public" checkbox on responded items
- [ ] Public transcript page at `/founder/conversations/{id}` renders correctly when `isPublicTranscript` is true
- [ ] Public transcript page returns 404 when `isPublicTranscript` is false
- [ ] Settings → About → "Read founder conversations" link opens the public conversations index
- [ ] Redacted sections render as `[redacted]` in a visually distinct style (muted background, not italic)

### 5.3 Open-Source Badge

- [ ] Settings → About shows all specified fields: license, conversion date, GitHub link, contributor count, version, build
- [ ] GitHub link opens in system browser
- [ ] License link opens BSL 1.1 full text in system browser
- [ ] Contributor count updates at most once per day (cached)
- [ ] BSL tooltip renders correctly on tap/hover
- [ ] CONTRIBUTING and CHANGELOG links open correct GitHub URLs

### 5.4 CI Workflows

- [ ] `ci.yml` runs on every PR and fails the PR on any step failure
- [ ] `forbidden-tech-scanner.yml` correctly detects and reports all forbidden packages
- [ ] `forbidden-tech-scanner.yml` correctly allows all permitted packages (e.g., `@revenuecat/purchases-js`)
- [ ] `schema-guard.yml` comments on PRs with a schema diff summary
- [ ] `schema-guard.yml` blocks PRs that remove existing tables or indexes
- [ ] `release-changelog.yml` opens a PR with correct CHANGELOG format on every GitHub Release

### 5.5 Plugin SDK Skeleton

- [ ] `packages/plugin-sdk` exists in the monorepo and is included in `pnpm-workspace.yaml`
- [ ] `plugin.manifest.json` schema is defined and exported as a TypeScript type
- [ ] All permission scopes are defined as a TypeScript union type
- [ ] `TempoPlugin` lifecycle interface is exported
- [ ] `README.md` in `packages/plugin-sdk` states clearly: "This SDK is pre-release. External plugins are not yet supported. Expect breaking changes. The public plugin API ships in Tempo Flow 1.5."
- [ ] CI type-checks the plugin-sdk package successfully

---

## 6. Success Criteria

| Metric | Target | Notes |
|---|---|---|
| P0 bugs at 1.1 ship | 0 | No production incidents unresolved |
| P1 bugs at 1.1 ship | 0 | No broken user flows unresolved |
| GitHub stars at 1.1 ship | >= 100 | Baseline signal of open-source visibility |
| First external PR merged | >= 1 | Non-founder contributor successfully merges a PR |
| First plugin prototype | >= 1 | A developer (external or Amit) builds a working proof-of-concept against the SDK skeleton |
| CI pass rate on PRs | >= 95% | Measured as: PRs that pass all checks / total PRs opened |
| Ask-the-Founder transcript opt-in rate | >= 10% | % of Ask-the-Founder users who enable public transcripts |
| Vlog card click-through rate | >= 15% | % of Dashboard sessions where vlog card is shown and user taps it |


---

## 3.3 PRD Phase 1.5 — Memory

> **Source file:** `PRD_Phase_1_5_Memory.md`

# PRD: Tempo Flow 1.5 "Memory" — BYOK, Offline, Study, and Public Plugin SDK

**Document status:** Draft v1.0  
**Phase:** 1.5  
**Depends on:** 1.0 "Foundation" and 1.1 "Presence" shipped  
**Estimated effort:** 8–14 weeks (significant release)  
**Primary purpose:** User sovereignty (BYOK), offline/privacy mode, study and recall tools, launch of the public plugin ecosystem.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals](#2-goals)
3. [Features](#3-features)
   - 3.1 BYOK Text Providers
   - 3.2 Offline Quantized Inference
   - 3.3 NotebookLM-Style Scoped RAG
   - 3.4 Flashcard Generation
   - 3.5 Spaced Repetition Scheduling
   - 3.6 Recall Quizzing
   - 3.7 Anki Export
   - 3.8 RemNote Sync
   - 3.9 Public Plugin SDK
4. [Schema Additions](#4-schema-additions)
5. [Swiss Cloud Placeholder](#5-swiss-cloud-placeholder)
6. [UX Acceptance Criteria](#6-ux-acceptance-criteria)
7. [Success Criteria](#7-success-criteria)

---

## 1. Overview

Tempo Flow 1.5 "Memory" is the product's largest release between launch and Phase 2. It addresses the two most common power-user requests anticipated from the 1.0 launch window:

1. **"I want to use my own API keys."** BYOK (Bring Your Own Keys) gives users control over which AI providers power their Tempo experience. Keys are stored encrypted in Convex and never leave the server in plaintext.

2. **"I want Tempo to work offline and I want more privacy."** Offline quantized inference ships a small on-device model (Gemma 3B or 7B) that handles coaching, extraction, and planning tasks when the user is offline or has enabled Privacy Mode.

Beyond those two headline features, 1.5 also ships a full study layer: flashcards, spaced repetition (SM-2), recall quizzing, Anki export, and RemNote sync — making Tempo useful for students, learners, and knowledge workers who want their notes to become durable knowledge, not just storage.

Finally, 1.5 opens the plugin ecosystem. The SDK skeleton committed in 1.1 becomes a published, versioned public API. Two official plugins ship with the release: an Audible Library importer and a Goodreads importer. Third-party developers can now build and distribute plugins.

---

## 2. Goals

### Goal 1: User Sovereignty

Users who pay for Tempo Flow should be able to choose which AI infrastructure processes their data. BYOK means users can route their own API keys, use their own rate limits, and avoid having their data processed by the Tempo default OpenRouter account. This is especially important for Pro and Max tier users who are storing sensitive work or personal data.

### Goal 2: Offline and Privacy Modes

Users should be able to use Tempo's core AI features without an internet connection. Privacy Mode should allow users to keep their data local except on explicitly whitelisted networks. This is a foundational trust feature for users with high data sensitivity.

### Goal 3: Study and Recall as a First-Class Feature

Note-taking without recall is just archiving. 1.5 turns Tempo's note system into an active learning system. Users should be able to generate flashcards from any note, review them on a spaced repetition schedule, quiz themselves with AI-generated questions, and export to Anki or sync to RemNote.

### Goal 4: Open Plugin Ecosystem

Third-party developers should be able to build and distribute plugins for Tempo Flow. The SDK should be stable, documented, and enforced via Convex permission scopes. The first two official plugins should demonstrate the capability and serve as reference implementations.

---

## 3. Features

### 3.1 BYOK Text Providers

#### Overview

Users can provide their own API keys for supported text AI providers. When a user's BYOK key is configured and active, all AI requests from that user route through their own key. Tempo's default OpenRouter account is the fallback if no BYOK key is configured or if the user's key returns an error.

#### Supported Providers

| Provider | Key type | Endpoint routed through |
|---|---|---|
| OpenRouter | API key | `openrouter.ai/api/v1` |
| OpenAI | API key | `openrouter.ai/api/v1` (proxied via OpenRouter with `openai/` model prefix) |
| Anthropic | API key | `openrouter.ai/api/v1` (proxied via OpenRouter with `anthropic/` model prefix) |
| Mistral | API key | `openrouter.ai/api/v1` (proxied via OpenRouter with `mistralai/` model prefix) |
| Together AI | API key | `openrouter.ai/api/v1` (proxied) |
| Groq | API key | `openrouter.ai/api/v1` (proxied) |
| Claude Code / Codex dev accounts | OAuth token | Provider-specific OAuth flow |

**Note on proxying:** All providers are accessed through OpenRouter even when the user has their own key. This is consistent with the "OpenRouter only" constraint and prevents adding direct provider SDKs to the codebase. Users provide their API key for the underlying provider, but the actual HTTP call goes through OpenRouter using that key.

#### Multi-Provider Router

The BYOK router is a layered chain:

```
Request arrives
  → Check: does user have a BYOK key for the preferred provider for this feature?
      → Yes: use BYOK key
      → No: check fallback chain (user-configured order)
          → Fallback chain exhausted: use Tempo default OpenRouter key
```

Users configure:
1. **Default provider** (per feature category: coaching, extraction, embedding)
2. **Fallback chain** (ordered list of providers to try if the default fails)
3. **Auto-fallback toggle** (if off, failures surface an error rather than falling back to Tempo's key)

#### Feature-Level Provider Assignment

Users can set different providers for different feature categories:

| Feature category | Default model (no BYOK) | User-configurable? |
|---|---|---|
| Coach (heavy reasoning) | Gemma 4 26B via Tempo OpenRouter | Yes |
| Coach (quick replies) | Mistral Small 4 via Tempo OpenRouter | Yes |
| Extraction (Brain Dump, note tagging) | Mistral Small 4 via Tempo OpenRouter | Yes |
| Embedding generation | Mistral embed via Tempo OpenRouter | Yes |
| Template generation | Gemma 4 26B via Tempo OpenRouter | Yes |
| Offline fallback | Quantized Gemma (on-device) | No (always on-device) |

#### Key Storage

BYOK keys are stored in the `providerCredentials` table (see Section 4). Keys are encrypted at rest in Convex using a per-user encryption key stored in Convex Secrets. Keys are never returned to the client. When the client requests an AI operation, the Convex action decrypts the key server-side and uses it for the request only. The key is not cached in memory between requests.

#### UI

Settings → AI → Providers. Each provider shows:
- Connection status (not configured / connected / error)
- "Add key" button (opens a modal with instructions for finding the API key on that provider's dashboard)
- Key preview (last 4 characters only, e.g., `...rX9z`)
- "Test connection" button (runs a minimal test prompt and shows latency)
- "Remove key" button (deletes from `providerCredentials` table)

A router visualization shows the current routing chain as a flowchart: which provider handles which feature category, and what the fallback chain is.

#### Claude Code / Codex OAuth

For users who have Claude Code or Codex dev accounts, an OAuth flow is provided. Instead of pasting an API key, the user taps "Connect via OAuth", is redirected to the provider's authorization page, grants the Tempo app permission, and the OAuth token is stored encrypted in `providerCredentials`. Token refresh is handled automatically via Convex scheduled actions.

---

### 3.2 Offline Quantized Inference

#### Overview

Tempo ships a small quantized language model on-device for mobile (iOS and Android). This model handles the core AI tasks — coaching responses, task extraction, tag suggestions — when the user is offline or has enabled Privacy Mode.

#### Model Selection

Target: **Gemma 3 2B** (quantized to Q4_K_M or equivalent) as the primary candidate. Fallback candidate: **Gemma 3 7B** (quantized to Q4_0) for devices with >= 6GB RAM and >= 12GB storage.

Model selection at install time:
- Device RAM >= 6GB and free storage >= 5GB: offer Gemma 7B (better quality)
- Otherwise: ship Gemma 2B (always available)

The quantized model file is downloaded on first use, not bundled with the app binary (app binary size constraint: the quantized model alone would exceed App Store and Play Store thresholds).

#### Inference Backends

| Platform | Backend |
|---|---|
| iOS | Core ML (via ExecuTorch iOS) as primary; llama.cpp via Swift binding as fallback |
| Android | ExecuTorch Android as primary; llama.cpp via JNI as fallback |

The Expo module wrapping the inference backend is in `packages/expo-local-inference` (custom Expo module). It exposes a simple TypeScript API:

```typescript
interface LocalInference {
  isAvailable(): Promise<boolean>;
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
  generateStream(prompt: string, options?: GenerateOptions): AsyncGenerator<string>;
  getModelInfo(): Promise<{ name: string; size: string; quantization: string }>;
}
```

The Convex client checks `localInference.isAvailable()` before routing. If unavailable (model not downloaded, or web PWA context), routing falls back to the server-side path.

#### Connectivity Settings

Accessible via Settings → AI → Connectivity:

**Online (default)**  
All AI requests go to the server-side router (OpenRouter / BYOK). On-device model is not used even if available.

**Offline on Low Battery**  
When device battery drops below a user-configured threshold (default: 20%), AI requests route to the on-device model. Server-side routing resumes when battery returns above threshold. Requires the on-device model to be downloaded.

**Privacy Mode**  
All AI requests route to the on-device model only. Convex sync continues (tasks, notes, calendar data still sync to Convex). Only the AI inference is kept local. If the user is on a non-whitelisted network, sync is also paused. Users can whitelist networks (e.g., home WiFi) for sync-only access. Raw content is never sent to OpenRouter or any external AI provider while Privacy Mode is active.

**Manual Sync (Bluetooth — Phase 2/3)**  
Defined in this PRD as a future state. Not implemented in 1.5.

#### Feature Parity in Offline Mode

| Feature | Online | Offline (on-device) |
|---|---|---|
| Coach chat | Full Gemma 26B quality | Reduced quality (2B or 7B) |
| Brain Dump extraction | Full quality | Reduced quality |
| Task extraction from note | Full quality | Reduced quality |
| Tag suggestions | Full quality | Reduced quality |
| Template generation | Full quality | Not available (too complex for small model) |
| Picture sketch template | Full quality | Not available |
| Embedding / semantic search | Server embeddings | Not available (falls back to full-text only) |
| Planning session | Full quality | Reduced quality |

Reduced quality is noted with a small indicator in the UI: a small "Offline AI" chip on responses generated from the on-device model.

#### Model Download UX

- First time user enables Offline Mode or Privacy Mode: a prompt explains the download ("To use AI offline, we need to download a ~1.5GB model file. This only happens once. Proceed?")
- Download shows progress bar, estimated time, WiFi-only option (default: download on WiFi only)
- Download is resumable (fails gracefully on connection loss)
- If download fails three times: show error with "Try again" and "Use server-only AI" options

---

### 3.3 NotebookLM-Style Scoped RAG

#### Overview

By default in 1.0, the coach has access to all of the user's notes, tasks, and journal (global RAG). In 1.5, users can pin a specific scope to a coaching conversation: a folder, a project, a set of tags, or hand-picked notes. The coach only retrieves from within that scope.

This is the same interaction pattern as NotebookLM's "notebook" concept, but applied to Tempo's existing content rather than uploaded documents.

#### Scope Switcher

A scope switcher appears in the coach chat input area:

```
[All content ▾]   [message input field]   [mic button]   [send button]
```

Tapping `[All content ▾]` opens a scope picker:

**Options:**
- All content (default — global RAG)
- This project: [project picker]
- This folder: [folder picker]
- These tags: [tag multi-select]
- Specific notes: [note multi-select, up to 20 notes]
- Custom (combine multiple of the above)

The selected scope is persisted per conversation in `coachConversations.ragScope`. Starting a new conversation resets scope to "All content" by default (configurable in AI settings).

#### Scope Enforcement

Scope is enforced in the Convex retrieval action, not client-side. The action receives the scope definition and constructs its `searchIndex` query with the appropriate filters before semantic retrieval. Items outside the scope are never fetched, even if they would be highly relevant.

**Scope indicator:** When a non-global scope is active, a persistent chip is shown above the conversation thread:

```
[Project: Q2 Launch] — Scoped RAG active. Coach can only see items in this project.
```

#### Cmd-K Integration

On web, `Cmd-K` (the global command palette) includes scope actions:
- "Set coach scope to: [current project]"
- "Set coach scope to: [recently viewed folder]"
- "Clear coach scope (return to global)"

---

### 3.4 Flashcard Generation

#### Overview

Users can generate flashcards from any note, journal entry, or selection of text. Flashcards are stored in the `flashcards` table, organized into `decks`, and reviewed via the spaced repetition scheduler.

#### Generation Entry Points

- **Note Detail → AI actions → "Generate flashcards"**: processes the entire note
- **Selected text in any editor → "Make flashcard from selection"**: processes only the selected text
- **Coach Chat → "Turn this into flashcards"**: coach extracts flashcard candidates from the current conversation
- **Explicit creation via Flashcards section** (accessible from Library or as a top-level tab depending on user layout preferences)

#### Flashcard Types

**Front/back pairs:**
```
Front: "What is the SM-2 algorithm?"
Back: "A spaced repetition algorithm that schedules review intervals based on a performance rating (0–5). Intervals start at 1 day and grow exponentially with consistent recall."
```

**Cloze deletions:**
```
"The SM-2 algorithm schedules review intervals based on a {{performance rating (0–5)}}."
```

Users can toggle the type per flashcard. The AI defaults to front/back pairs for factual content and cloze deletions for definition-heavy text.

#### Deck Organization

Flashcards belong to decks. A deck can be:
- Auto-created from a note (named after the note's title)
- Manually created
- Linked to a folder (all notes in the folder contribute cards to a single deck)
- Linked to a project

Decks are in the `decks` table (see Section 4). A flashcard belongs to exactly one deck but can be tagged.

#### Generation Model

Gemma 4 26B via the standard router. Generating from a note uses the full note content as context. Output is a structured JSON array of flashcard objects validated before storage.

---

### 3.5 Spaced Repetition Scheduling

#### Algorithm: SM-2

Tempo implements the SM-2 spaced repetition algorithm. This is not a custom algorithm — it is the standard SM-2 as originally described, with no modifications.

**Rating scale (per card review):**
- 0: Complete blackout — did not remember at all
- 1: Incorrect; upon seeing answer, it felt completely wrong
- 2: Incorrect; but the answer felt familiar on recall
- 3: Correct; significant difficulty
- 4: Correct; slight hesitation
- 5: Correct; instant recall

**Interval calculation:**
```
If rating < 3: reset interval to 1 day, reset repetition count
If rating >= 3:
  n=1: interval = 1 day
  n=2: interval = 6 days
  n>2: interval = round(previous_interval * easiness_factor)
  easiness_factor updated: EF += 0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)
  Minimum EF: 1.3
```

These calculations are run in a Convex mutation (`convex/flashcards.ts:recordReview`) on each card review submission.

#### Daily Review Session

From the Dashboard: a "Review cards due today" card appears if any cards are scheduled for review. Tapping it opens the review session.

Review session UX:
1. Card front is shown
2. User taps "Show answer"
3. Card back + cloze completion is revealed
4. User rates recall (0–5) via a horizontal slider or quick-tap buttons
5. Next card is shown
6. Progress indicator at top: "12 / 47 cards"
7. On completion: summary screen showing cards reviewed, new vs. review cards, average rating, estimated next review date

#### Review Session Configuration

Per deck:
- Max new cards per day (default: 20)
- Max review cards per day (default: 100, uncapped option available)
- Card order: due-date first / random / failed-first

---

### 3.6 Recall Quizzing

#### Overview

Recall quizzing is distinct from flashcard review. Instead of testing specific cards, the AI generates novel quiz questions from a scoped context (a folder, project, note, or deck). This tests holistic understanding, not memorized card answers.

#### Quiz Types

**Free response:**  
"Based on your notes on Project Alpha, what were the three main technical blockers identified in the retrospective?"  
User types an answer. AI evaluates the response against the source content and gives a score (0–3: missed, partial, complete) with explanation.

**Multiple choice:**  
"Which of the following best describes the SM-2 easiness factor?"  
A) A fixed 2.5 multiplier  
B) A user-adjustable confidence score  
C) A per-card factor that changes based on recall performance  
D) The number of days until the next review  
User selects an answer. AI marks correct/incorrect and explains.

#### Quiz Generation

Model: Gemma 4 26B. The quiz generation prompt includes the scoped content as context and the question type as an instruction.

Quiz results are stored in `reviewSessions` with `type: "quiz"`.

#### Availability

Recall quizzing requires a scope to be set (global quizzing on all content is too unfocused). The quiz entry point is in:
- Folder detail → "Quiz me on this folder"
- Project detail → "Quiz me on this project"
- Note detail → "Quiz me on this note"
- Deck detail → "Quiz mode" (as an alternative to card-by-card review)

---

### 3.7 Anki Export

#### Overview

Users can export any deck or collection of flashcards to Anki's `.apkg` format.

#### Implementation

`.apkg` is a SQLite database with a specific schema, zipped. Tempo implements this using a Convex HTTP action that:
1. Fetches all cards in the selected deck
2. Constructs the SQLite database in memory using `sql.js` or equivalent WebAssembly SQLite
3. Writes the Anki schema (notes, cards, revlog, col tables)
4. Zips the database file
5. Returns the zip as a file download

**Card mapping:**
| Tempo field | Anki field |
|---|---|
| `front` | Note front |
| `back` | Note back |
| `tags` | Anki tags |
| `deckId` | Anki deck name |
| `cloze` deletions | Anki cloze note type |

**Anki-connect alternative:** If the user has Anki open on their desktop with anki-connect installed, they can also sync directly via anki-connect's HTTP API. This is a secondary option, not the primary export path, because it requires Anki to be open.

#### UX

Deck detail → "Export to Anki" → modal with two options:
1. "Download .apkg file" (primary — always available)
2. "Sync with Anki Desktop via anki-connect" (secondary — requires anki-connect on localhost:8765)

---

### 3.8 RemNote Sync

#### Overview

Two-way sync of study-tagged notes between Tempo and RemNote. Notes tagged with `#study` (or any user-configurable study tag) are synced as RemNote "Rems" with flashcard formatting. Flashcards created in Tempo can be pushed to RemNote as Document Rems with front/back inline.

#### Sync Direction

**Tempo → RemNote:**  
Study-tagged notes and their associated flashcard decks are pushed to RemNote via RemNote's API. Format: each note becomes a RemNote document. Each flashcard becomes an inline Rem within that document with `::` flashcard separator.

**RemNote → Tempo:**  
Study-tagged Rems in RemNote that have been modified are pulled into Tempo as note updates. Flashcards within those Rems are synced back to the corresponding Tempo deck.

#### Conflict Resolution

- Last-write-wins per field (based on `updatedAt` timestamp)
- If both sides have been modified since the last sync: show a merge UI (similar to Git conflict resolution, but simplified for text)

#### Setup

Settings → Integrations → RemNote → "Connect RemNote account" → OAuth flow (or API key if OAuth not available from RemNote). Once connected, a "Study tag" field specifies which Tempo tag triggers sync (default: `#study`).

Sync runs:
- On explicit "Sync now" button press
- Automatically every 15 minutes when the app is open and online

---

### 3.9 Public Plugin SDK

#### Overview

The plugin SDK skeleton committed in 1.1 becomes a public, stable, versioned API in 1.5. Third-party developers can build and distribute plugins. Two official plugins ship with this release.

#### SDK Package: `@tempoflow/plugin-sdk`

Published to npm as `@tempoflow/plugin-sdk`. Version follows Tempo Flow's release version (1.5.0).

**Full API documentation** is published at `tempoflow.app/docs/plugins`.

**What is stable in 1.5:**
- Manifest format (backward-compatible versioning committed to)
- Permission scope definitions
- Web sandbox (iframe + postMessage API)
- Convex action plugins (server-side, scoped permissions)
- Plugin install/uninstall lifecycle
- Plugin data storage: each plugin gets a `plugin_data` namespace in Convex (isolated per plugin)

**What is not stable in 1.5 (subject to change in 2.0/3.0):**
- Mobile sandbox (iframe WebView on mobile, API may change)
- MCP-adjacent tool exposure (defined but not finalized)
- Plugin marketplace (Phase 3)

#### Plugin Install Flow

1. User navigates to Settings → Plugins → "Add plugin"
2. User pastes a plugin package name (`@tempoflow/plugin-audible`) or a manifest URL
3. Tempo fetches the manifest and shows: plugin name, author, description, requested permissions
4. User reviews permissions and taps "Install"
5. Plugin is registered in `pluginInstallations` table
6. Plugin is loaded in its sandbox on next app open

#### Permission Enforcement

All permission scopes are enforced server-side in Convex. A plugin that requests `tasks:read` can only read tasks for the installing user. It cannot read tasks for other users. It cannot write to tasks unless it also has `tasks:write`. Convex actions enforce this via a plugin auth context that wraps every query/mutation available to plugins.

#### Sandbox: Web (Iframe)

Web plugins run in a sandboxed `<iframe>` with the following CSP:
```
sandbox="allow-scripts"
csp="script-src 'self'; connect-src 'none'; frame-src 'none';"
```

Communication with the host app is exclusively via `postMessage`. The SDK provides a typed `TempoClient` object that wraps postMessage calls:

```typescript
// Plugin code (runs in iframe)
import { createClient } from "@tempoflow/plugin-sdk/client";
const tempo = createClient();

const tasks = await tempo.tasks.list({ status: "todo" });
await tempo.tasks.create({ title: "New task from plugin" });
```

The host app validates all messages against the plugin's registered permissions before processing.

#### Sandbox: Convex Actions (Server Plugin)

Server plugins are Convex actions registered in the `plugins` table with `sandboxType: "convex_action"`. They run as Convex functions with a scoped auth context. They cannot call arbitrary HTTP endpoints. They can only use Convex's built-in HTTP fetch action and only to domains listed in the plugin's manifest `allowedDomains` field.

#### Official Plugins

**Plugin 1: Audible Library Importer**

Inspired by the existing "Audible Library Extractor" Chrome extension (which generates a CSV/JSON of the user's Audible library). This plugin:

1. Accepts a JSON/CSV export from the Audible Library Extractor Chrome extension (user runs the extension separately, then uploads the file to Tempo)
2. Parses the exported library data
3. Creates Library items in Tempo (type: `reference`) for each audiobook
4. Optionally creates Goals linked to audiobooks ("Finish: The Body Keeps the Score")
5. Optionally creates reading sessions as Tasks

Manifest:
```json
{
  "id": "com.tempoflow.plugin-audible",
  "name": "Audible Library Importer",
  "version": "1.0.0",
  "author": "Tempo Flow",
  "permissions": ["library:write", "goals:write", "tasks:write"],
  "sandboxType": "iframe"
}
```

**Plugin 2: Goodreads Importer**

Imports the user's Goodreads reading history and want-to-read list.

1. User exports their Goodreads library as CSV (Goodreads → My Books → Import/Export)
2. User uploads the CSV to the plugin
3. Plugin parses reading history (read, reading, want-to-read shelves)
4. Creates Library items for each book (type: `reference`)
5. Creates Goals for "Currently Reading" books
6. Syncs Goodreads ratings as a note field

Manifest:
```json
{
  "id": "com.tempoflow.plugin-goodreads",
  "name": "Goodreads Library Importer",
  "version": "1.0.0",
  "author": "Tempo Flow",
  "permissions": ["library:write", "goals:write", "notes:write"],
  "sandboxType": "iframe"
}
```

#### Developer Documentation

Published at `tempoflow.app/docs/plugins`:
- Getting started guide (scaffold a plugin in 5 minutes)
- Manifest format reference
- Permission scopes reference
- `TempoClient` API reference (all methods, types, error codes)
- Sandbox model explanation
- Tutorial: Building the "habit from note" plugin (a complete worked example)
- Contributing plugins (how to submit to the Phase 3 marketplace)

---

## 4. Schema Additions

These tables are additive to the existing 1.0/1.1 schema. No existing tables are modified (exception: `coachConversations.ragScope` was added in 1.0 as a forward-compat slot; it is now enforced).

```typescript
// Additions to convex/schema.ts for Phase 1.5

flashcards: defineTable({
  userId: v.id("users"),
  deckId: v.id("decks"),
  front: v.string(),
  back: v.optional(v.string()),
  clozeText: v.optional(v.string()),    // null if type is front_back
  type: v.union(v.literal("front_back"), v.literal("cloze")),
  sourceNoteId: v.optional(v.id("notes")),
  sourceJournalId: v.optional(v.id("journalEntries")),
  tags: v.array(v.string()),
  // SM-2 state
  repetitions: v.number(),              // n in SM-2
  easinessFactor: v.number(),           // EF, default 2.5
  interval: v.number(),                 // days until next review
  dueAt: v.number(),                    // unix timestamp
  lastReviewedAt: v.optional(v.number()),
  lastRating: v.optional(v.number()),   // 0–5
  isArchived: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_deckId", ["deckId"])
  .index("by_userId_dueAt", ["userId", "dueAt"]),

decks: defineTable({
  userId: v.id("users"),
  title: v.string(),
  description: v.optional(v.string()),
  sourceNoteId: v.optional(v.id("notes")),
  sourceFolderId: v.optional(v.id("folders")),
  sourceProjectId: v.optional(v.id("projects")),
  cardCount: v.number(),                // denormalized for display
  dueCount: v.number(),                 // denormalized
  maxNewPerDay: v.number(),             // default 20
  maxReviewPerDay: v.number(),          // default 100, -1 = uncapped
  cardOrder: v.union(
    v.literal("due_first"),
    v.literal("random"),
    v.literal("failed_first")
  ),
  isArchived: v.boolean(),
  tags: v.array(v.string()),
  ankiDeckId: v.optional(v.string()),   // for Anki sync
  remnoteDeckId: v.optional(v.string()),// for RemNote sync
  updatedAt: v.number(),
}).index("by_userId", ["userId"]),

reviewSessions: defineTable({
  userId: v.id("users"),
  deckId: v.optional(v.id("decks")),
  type: v.union(v.literal("flashcard"), v.literal("quiz")),
  status: v.union(v.literal("active"), v.literal("completed"), v.literal("abandoned")),
  cardsReviewed: v.number(),
  cardsCorrect: v.number(),
  averageRating: v.optional(v.number()),
  durationSeconds: v.optional(v.number()),
  quizQuestions: v.optional(v.array(v.object({
    question: v.string(),
    type: v.union(v.literal("free_response"), v.literal("multiple_choice")),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.string(),
    userAnswer: v.optional(v.string()),
    score: v.optional(v.number()), // 0–3
    modelEvaluation: v.optional(v.string()),
  }))),
  ragScopeUsed: v.optional(v.string()), // JSON of scope definition
  startedAt: v.number(),
  completedAt: v.optional(v.number()),
}).index("by_userId", ["userId"]),

plugins: defineTable({
  id: v.string(),                       // e.g., "com.tempoflow.plugin-audible"
  name: v.string(),
  version: v.string(),
  author: v.string(),
  description: v.string(),
  permissions: v.array(v.string()),
  sandboxType: v.union(v.literal("iframe"), v.literal("convex_action")),
  entryPoint: v.string(),
  allowedDomains: v.optional(v.array(v.string())),
  manifestUrl: v.optional(v.string()),
  isOfficial: v.boolean(),
  isPublished: v.boolean(),             // Phase 3: marketplace listing
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_id", ["id"]),

pluginInstallations: defineTable({
  userId: v.id("users"),
  pluginId: v.string(),                 // references plugins.id
  status: v.union(
    v.literal("active"),
    v.literal("disabled"),
    v.literal("error")
  ),
  grantedPermissions: v.array(v.string()), // subset of plugin.permissions that user approved
  installedAt: v.number(),
  updatedAt: v.number(),
}).index("by_userId", ["userId"]),

providerCredentials: defineTable({
  userId: v.id("users"),
  provider: v.string(),                 // "openrouter" | "openai" | "anthropic" | etc.
  credentialType: v.union(v.literal("api_key"), v.literal("oauth_token")),
  encryptedValue: v.string(),           // encrypted, never returned to client
  keyPreview: v.string(),               // last 4 chars of the key, for display only
  status: v.union(
    v.literal("active"),
    v.literal("error"),
    v.literal("revoked")
  ),
  lastVerifiedAt: v.optional(v.number()),
  errorMessage: v.optional(v.string()),
  featureRouting: v.optional(v.object({
    coaching_heavy: v.optional(v.boolean()),
    coaching_quick: v.optional(v.boolean()),
    extraction: v.optional(v.boolean()),
    embedding: v.optional(v.boolean()),
    template_gen: v.optional(v.boolean()),
  })),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_userId", ["userId"]),

ragScopes: defineTable({
  userId: v.id("users"),
  name: v.string(),                     // user-defined label for the scope
  noteIds: v.optional(v.array(v.id("notes"))),
  projectIds: v.optional(v.array(v.id("projects"))),
  folderIds: v.optional(v.array(v.id("folders"))),
  tags: v.optional(v.array(v.string())),
  isDefault: v.boolean(),               // if true, applied to new conversations by default
  createdAt: v.number(),
}).index("by_userId", ["userId"]),
```

---

## 5. Swiss Cloud Placeholder

### Overview

Under Settings → AI → Providers, a "Swiss Cloud (Private EU Inference)" option is presented as a provider. In 1.5, this is a placeholder that signs users up for a waitlist. Functional Swiss Cloud routing ships in Phase 3.0.

### Display

In the provider list:
```
┌──────────────────────────────────────────────────────────────┐
│ Swiss Cloud (Private EU Inference)    [Coming in 3.0] [Wait-list] │
│ Keep your AI inference within European data centers.          │
│ Ideal for GDPR compliance and data residency requirements.    │
└──────────────────────────────────────────────────────────────┘
```

Tapping "Waitlist" adds the user to an internal waitlist (stored in a simple JSON array in Convex config or a minimal `featureWaitlists` table) and shows: "You're on the list. We'll email you when Swiss Cloud inference is available."

### Candidate Providers (Under Evaluation)

The following providers are under evaluation for the Phase 3.0 Swiss Cloud launch:

| Provider | Notes |
|---|---|
| Infomaniak AI | Swiss data center, privacy-focused, current shortlist leader |
| Nine.ch | Swiss hosting, no AI inference product as of PRD authorship |
| Exoscale | Swiss/EU cloud, compute available, inference API TBD |
| OVHcloud EU | EU-based, available now, not Swiss-domiciled |

Final provider selection is Amit's decision at Phase 3.0 planning time. This PRD documents the candidates only.

---

## 6. UX Acceptance Criteria

### BYOK

- [ ] Settings → AI → Providers shows all supported providers
- [ ] Adding an API key requires the user to paste the key; key is stored encrypted and only the last 4 characters are shown afterward
- [ ] "Test connection" runs a test prompt and shows latency + success/failure
- [ ] Removing a key prompts for confirmation before deletion
- [ ] Provider routing visualization is accurate (reflects current feature→provider mapping)
- [ ] If user's BYOK key returns a 401/429 error, the system falls back to Tempo's default key and shows a non-blocking "Your API key had an error — used Tempo's key instead" toast
- [ ] OAuth flow for Claude Code / Codex accounts completes without leaving the app on mobile

### Offline Inference

- [ ] Settings → AI → Connectivity shows all three modes (Online, Offline on Low Battery, Privacy Mode)
- [ ] Connectivity mode change takes effect on next AI request, not requiring app restart
- [ ] Model download prompt appears on first enabling of a mode that requires on-device inference
- [ ] Download progress bar is accurate and resumable
- [ ] "Offline AI" indicator chip is visible on responses from the on-device model
- [ ] Privacy Mode prevents any AI request from reaching OpenRouter (verified via network traffic in test)
- [ ] Template generation and picture-sketch generation show appropriate "Not available offline" messaging in Privacy Mode

### Scoped RAG

- [ ] Scope switcher is visible in coach input area in all conversation contexts
- [ ] Scope picker loads all projects, folders, tags, and recent notes correctly
- [ ] Selected scope is persisted per conversation (survives app backgrounding)
- [ ] Scope indicator chip is visible at top of conversation thread when scope is not global
- [ ] Retrieval in scoped mode never returns items from outside the selected scope (verifiable in test by querying the `coachMessages.ragChunksUsed` field)
- [ ] Clearing scope returns to global retrieval on the next coach message

### Flashcards + Spaced Repetition

- [ ] "Generate flashcards" in Note Detail produces cards in < 10 seconds for notes up to 2000 words
- [ ] Generated cards are shown for review before being saved (accept/edit/delete per card)
- [ ] SM-2 intervals are calculated correctly per algorithm specification (unit tested)
- [ ] Due cards badge count on Dashboard is accurate
- [ ] Review session completes gracefully when all due cards are reviewed
- [ ] Rating slider/buttons are accessible (keyboard-navigable on web, haptic on mobile)

### Anki Export

- [ ] Downloaded .apkg file opens in Anki desktop without errors
- [ ] Cloze cards render correctly in Anki
- [ ] Tags are preserved
- [ ] anki-connect sync works when Anki is open on localhost:8765

### RemNote Sync

- [ ] OAuth / API key connection to RemNote completes within the app
- [ ] Study-tagged notes appear in RemNote within 15 minutes of tagging
- [ ] Flashcards appear as inline Rems with `::` separator
- [ ] Changes in RemNote to synced notes appear in Tempo within 15 minutes

### Plugin SDK

- [ ] `@tempoflow/plugin-sdk` is published to npm and installable
- [ ] Audible Library Importer: uploading a valid Audible Library Extractor JSON creates Library items correctly
- [ ] Goodreads Importer: uploading a valid Goodreads CSV creates Library items and Goals correctly
- [ ] A plugin requesting `tasks:read` cannot access notes (permission enforcement verified)
- [ ] An installed plugin appears in Settings → Plugins with its name, version, and permission list
- [ ] Disabling a plugin removes it from the sandbox immediately (no reload required)

---

## 7. Success Criteria

| Metric | Target | Notes |
|---|---|---|
| % of Pro/Max users with BYOK configured | >= 20% | At 60 days post-1.5 launch |
| % of users using Privacy Mode | >= 5% | At 60 days post-1.5 launch |
| % of users using Scoped RAG | >= 15% | At 60 days post-1.5 launch |
| Study sessions logged (total) | >= 1,000 | Within first 30 days of 1.5 |
| Anki exports completed | >= 100 | Within first 30 days |
| External plugins published | >= 1 | Third-party plugin, not by Tempo team |
| Plugin SDK npm downloads | >= 500 | Within first 30 days of 1.5 |
| RemNote sync active users | >= 50 | Within first 30 days |
| On-device model download completion rate | >= 70% | Of users who initiate the download |
| Scoped RAG conversation NPS delta | >= +5 vs. global | As measured via in-conversation "was this helpful?" rating |


---

## 3.4 PRD Phase 2.0 — Connected

> **Source file:** `PRD_Phase_2_Connected.md`

# PRD: Tempo Flow 2.0 "Connected" — Integrations, Dev Tools, and Bridges

**Document status:** Draft v1.0  
**Phase:** 2.0  
**Depends on:** 1.0 "Foundation", 1.1 "Presence", 1.5 "Memory" shipped  
**Estimated effort:** 14–20 weeks  
**Primary purpose:** Make Tempo the center of the user's digital life. Expand to developer users. Connect to calendars, health, messaging, and build every dev-facing surface: MCP server, CLI, browser extension, REST API.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals](#2-goals)
3. [Features](#3-features)
   - 3.1 Google Calendar + Apple Calendar Two-Way Sync
   - 3.2 Apple Health + Google Fit Read Access
   - 3.3 ChatGPT Export Import (RAM-Only)
   - 3.4 Claude Conversation Import (RAM-Only)
   - 3.5 Cursor / Claude Code MCP Server
   - 3.6 tempo-cli
   - 3.7 Browser Extension
   - 3.8 REST API + Webhooks
   - 3.9 Photo Accountability
   - 3.10 WhatsApp Bridge (RAM-Only)
   - 3.11 Telegram Bridge (RAM-Only)
   - 3.12 Bluetooth Sync
   - 3.13 VTuber Avatar (Max Tier)
   - 3.14 BYOK Expanded (TTS, STT, Embeddings, Image, Video)
   - 3.15 Crypto Donations
4. [Schema Additions](#4-schema-additions)
5. [Security Posture](#5-security-posture)
6. [Success Criteria](#6-success-criteria)

---

## 1. Overview

Tempo Flow 2.0 "Connected" is the integration release. Every major surface of the user's digital life gets a connection point: their external calendar, their health data, their AI chat history from other tools, the dev environments they code in, the messaging apps they use, and the browsers they browse with.

This release also introduces two developer-first surfaces that position Tempo as infrastructure for builders: the MCP server (for Cursor and Claude Code users) and the tempo-cli (a Bun-compiled binary for terminal-first workflows).

The defining constraint of 2.0's sensitive integrations is the **RAM-only pattern**: imports from messaging apps (WhatsApp, Telegram) and AI chat exports (ChatGPT, Claude) are processed entirely in memory. Raw messages and raw conversation history are never written to Convex or any persistent store. Only AI-extracted, user-approved artifacts (tasks, commitments, notes) are persisted. This is not a workaround — it is the feature. Users who are privacy-sensitive about their message history should still be able to extract useful data from it.

---

## 2. Goals

### Make Tempo the center of the user's digital life

Every tool the user spends time in should have a Tempo connection: their calendar, their health tracker, their messaging apps, their AI chat tools, their code editor. In 2.0, a user who works in Cursor, chats in WhatsApp, tracks sleep with Apple Health, and plans in Tempo should experience those as a coherent system, not four disconnected silos.

### Expand to developer users

Developers are a natural market for Tempo because they already use tools like Cursor, Claude Code, and terminal CLIs daily. The MCP server, tempo-cli, and browser extension create touch points in the developer workflow that do not exist for any other planner. Developers who experience Tempo as "the thing that knows what I'm working on in Cursor" will retain at high rates.

### Deliver on the Max tier's full value proposition

The VTuber avatar for Max tier gives the most engaged users something exclusive and personality-forward: a visual companion during live voice sessions that acts as a focus-mate body double. This is the Max tier's headline feature in 2.0.

---

## 3. Features

### 3.1 Google Calendar + Apple Calendar Two-Way Sync

#### Overview

Full bidirectional sync between Tempo's internal calendar model and the user's Google Calendar and/or Apple Calendar (iCloud Calendar).

#### Google Calendar

**Setup:** OAuth 2.0 flow via Google's Calendar API. Scopes requested: `https://www.googleapis.com/auth/calendar`. Tokens stored encrypted in `integrations` table. Token refresh handled by Convex scheduled action.

**Sync behavior:**
- All Tempo calendar events (`calendarEvents` table, type `task_block` / `manual`) push to a dedicated "Tempo Flow" calendar in Google Calendar
- User can additionally select external Google calendars to pull into Tempo's calendar view (read-only display, no write-back to external events)
- Tasks scheduled via Planning Session create Google Calendar events automatically (unless user disables this in sync settings)
- Google Calendar changes to events in the "Tempo Flow" calendar are pulled back to Tempo within 15 minutes (via Google Calendar webhook push notifications)

**Conflict resolution:**
- Tempo is the source of truth for task-linked events
- If a task-linked event is moved in Google Calendar: the task's `scheduledStart` / `scheduledEnd` is updated in Tempo
- If the same event is modified in both Tempo and Google Calendar within the same sync window: Tempo wins; the Google Calendar event is updated to match Tempo

#### Apple Calendar (iCloud)

**Setup:** CalDAV protocol. User enters their Apple ID email and an app-specific password (Apple does not support OAuth 2.0 for CalDAV third-party apps). Credentials stored encrypted in `integrations` table.

**Sync behavior:** Same as Google Calendar. A "Tempo Flow" CalDAV calendar is created on the user's iCloud account. Events sync bidirectionally.

**Note on App Store compliance:** Apple's App Store does not permit storing Apple ID passwords. The app-specific password is required specifically because Apple provides this mechanism for third-party CalDAV clients. The UI copy explains this: "Enter an app-specific password from appleid.apple.com/account/manage — not your main Apple ID password."

#### UI

Calendar screen → top bar → calendar selector shows:
- Tempo internal calendars
- Connected Google calendars (with read/write indicators)
- Connected Apple calendars (with read/write indicators)
- Unconnected calendars greyed out with "+ Connect" link

Settings → Integrations → Calendar section shows sync status, last sync time, sync conflict log.

---

### 3.2 Apple Health + Google Fit Read Access

#### Overview

Tempo reads sleep, step count, and workout data from Apple Health (HealthKit) and Google Fit / Health Connect. This data feeds an **energy inference model** that the coach uses to calibrate planning recommendations.

#### Data Points Read

| Data point | HealthKit | Google Health Connect |
|---|---|---|
| Sleep duration (total) | HKCategoryTypeIdentifierSleepAnalysis | SLEEP_SESSION |
| Sleep quality (REM, deep) | HKCategoryTypeIdentifierSleepAnalysis | SLEEP_STAGE |
| Step count | HKQuantityTypeIdentifierStepCount | STEPS |
| Active energy burned | HKQuantityTypeIdentifierActiveEnergyBurned | CALORIES_EXPENDED |
| Workout (type + duration) | HKWorkoutTypeIdentifier | EXERCISE_SESSION |
| Resting heart rate | HKQuantityTypeIdentifierRestingHeartRate | RESTING_HEART_RATE |

No health data is stored in Convex. Health data is read on-device, processed locally into a simple energy score (1–5), and only the **score** (not the raw measurements) is sent to Convex and injected into the coach context.

**Energy score calculation (on-device):**
```
base_score = 3 (neutral)
if sleep_hours >= 7.5: base_score += 0.5
if sleep_hours < 6: base_score -= 1
if sleep_hours < 5: base_score -= 1 (additional)
if step_count > 7500: base_score += 0.5
if workout logged today: base_score += 0.5
if resting_hr > 80: base_score -= 0.5  (HRV stress proxy)
energy_score = clamp(round(base_score), 1, 5)
```

This score is injected into the coach system prompt: `[USER ENERGY TODAY: {score}/5]` and is displayed in the Dashboard energy indicator.

#### Permissions

- iOS: HealthKit permissions requested at onboarding (or later from Settings → Integrations → Health). User can grant partial permissions (e.g., sleep but not steps).
- Android: Health Connect permissions requested from Settings → Integrations → Health. Health Connect API requires the app to be declared in the AndroidManifest with the `healthPermissions` intent.

#### Data residency

Raw health measurements are never sent to Convex or any server. Only the computed energy score is transmitted. This is enforced in the native code module (`packages/expo-health-bridge`) which does the computation on-device before any network call.

---

### 3.3 ChatGPT Export Import (RAM-Only)

#### Overview

ChatGPT offers an account data export (Settings → Data controls → Export data) which produces a ZIP file containing `conversations.json`. Tempo can process this file to extract tasks, commitments, and key decisions, presenting them for user approval before any data is stored in Convex.

#### Processing Flow

1. User downloads their ChatGPT export ZIP from OpenAI
2. User taps Settings → Integrations → ChatGPT → "Import conversations"
3. User selects the ZIP file (file picker)
4. The ZIP is opened and `conversations.json` is parsed in-memory (never written to disk by Tempo)
5. A Convex HTTP action receives the raw JSON (via encrypted in-transit HTTPS), processes it in memory using Gemma via OpenRouter, and returns extracted items to the client
6. The client displays extracted items (tasks, commitments, notes, ideas) as a review list
7. User approves, edits, or rejects each item
8. Approved items are saved to Convex (tasks to `tasks`, notes to `notes`, etc.)
9. The raw JSON is discarded server-side immediately after extraction (it is never written to Convex storage)

#### What is extracted

The extraction prompt instructs Gemma to identify:
- Action items ("I need to...", "Let me...", "I should...")
- Commitments ("I will...", "I'll...", "I'm going to...")
- Decisions ("We decided to...", "Going with...")
- Ideas flagged for follow-up ("It might be worth...", "What if...")

Each extracted item includes: text, source conversation title, approximate date, confidence score.

#### Batch size

ChatGPT exports can be very large (hundreds of conversations). Processing is chunked:
- Conversations are processed in batches of 20
- Progress bar shown during processing
- User can cancel at any time; already-processed batches are discarded from memory

#### Privacy guarantee

The Convex HTTP action handling the raw JSON is a pure compute operation with no write side effects until the user approves items. Convex action logs for this function are disabled (via Convex action config) to prevent raw conversation content appearing in server logs.

---

### 3.4 Claude Conversation Import (RAM-Only)

Same pattern as ChatGPT import. Anthropic offers a data export at `claude.ai/settings` that produces a JSON export of conversations.

The processing flow is identical to Section 3.3 with the following differences:
- Input format: Claude's export JSON schema (different field names)
- The Convex HTTP action uses a separate parsing function for Claude's format
- UI entry point: Settings → Integrations → Claude → "Import conversations"

Both ChatGPT and Claude imports can be initiated independently or run together. If both are run, duplicate-detection (fuzzy string match on extracted item titles) prevents the same task appearing twice.

---

### 3.5 Cursor / Claude Code MCP Server

#### Overview

`@tempoflow/mcp-server` is an MCP (Model Context Protocol) server that exposes Tempo's task and knowledge graph to Cursor and Claude Code. Once installed, AI agents in Cursor and Claude Code can query the user's Tempo data, create tasks, and interact with the coach — all in the context of the developer's current work.

#### Installation

**Claude Code:**
```bash
claude mcp add @tempoflow/mcp-server
```
On first use, the user is prompted to authenticate with their Tempo account (OAuth token, not password).

**Cursor:**
Add to Cursor's MCP config at `.cursor/mcp.json`:
```json
{
  "servers": {
    "tempoflow": {
      "command": "npx",
      "args": ["@tempoflow/mcp-server"],
      "env": {
        "TEMPO_TOKEN": "your-personal-access-token"
      }
    }
  }
}
```

Personal access tokens are generated in Settings → Integrations → API → "New personal access token".

#### Exposed Tools

| Tool name | Description | Arguments |
|---|---|---|
| `get_today` | Returns today's plan (tasks + time blocks) | none |
| `list_tasks` | Returns tasks matching filters | `status`, `projectId`, `limit`, `tags` |
| `add_task` | Creates a new task | `title`, `description`, `dueDate`, `projectId`, `tags` |
| `complete_task` | Marks a task complete | `taskId` |
| `get_note` | Returns the content of a note | `noteId` or `title` (fuzzy search) |
| `append_to_note` | Appends text to a note, or creates a new note | `title`, `content`, `tags` |
| `query_rag` | Queries the user's RAG knowledge graph | `query`, `limit`, `scope` |
| `start_coach_session` | Starts a new coach conversation | `goal`, `context` |
| `get_project` | Returns a project's tasks and notes | `projectId` or `title` |
| `create_brain_dump` | Submits a brain dump for AI processing | `text` |

#### Authentication

The MCP server authenticates using a personal access token (PAT) stored in the environment. Tokens are scoped to specific permissions (same scopes as the plugin SDK). Tokens are revocable from Settings → Integrations → API.

#### Usage Examples

In Claude Code, after `@tempoflow/mcp-server` is added:

```
User: What am I supposed to be working on today?
Claude Code: [calls get_today] You have 3 tasks scheduled for today:
  1. "Implement OAuth callback" (in_progress, Project: Auth refactor)
  2. "Review PR #47" (todo, due 3pm)
  3. "Write deployment notes" (todo)
```

```
User: Add a task to fix the login bug we just found
Claude Code: [calls add_task with title="Fix login bug discovered 2025-04-17", projectId=current-project-id]
  Task created in Tempo: "Fix login bug discovered 2025-04-17" added to Auth refactor.
```

#### Server Implementation

`packages/mcp-server/` in the monorepo. Built with TypeScript and the `@modelcontextprotocol/sdk` package. Transport: stdio (for Cursor) and HTTP (for Claude Code's remote MCP option). Authentication: Bearer token validated against Convex `apiTokens` table.

---

### 3.6 tempo-cli

#### Overview

`tempo` is a single-binary CLI for interacting with Tempo Flow from the terminal. It is compiled with Bun to a self-contained binary (no runtime dependency). Installable via:

```bash
# macOS / Linux
curl -fsSL https://tempoflow.app/install.sh | sh

# npm (alternative)
npm install -g @tempoflow/cli

# Homebrew (macOS)
brew install tempoflow/tap/tempo
```

#### Commands

```
tempo                    # TUI mode (interactive dashboard in terminal)
tempo today              # Print today's plan as plain text
tempo add "task title"   # Create a task quickly
tempo add -p "project"   # Create a task in a specific project
tempo note               # Open a new note in $EDITOR
tempo note "title"       # Create a note with a title, open in $EDITOR
tempo ask "question"     # Send a message to the coach, print response
tempo sync               # Force sync (pull latest from Convex)
tempo status             # Show connection status + today's stats
tempo habits             # Show today's habits with completion status
tempo log                # Interactive habit logger
tempo --json             # Any command with --json flag outputs raw JSON
tempo --help             # Show help
```

#### TUI Mode

When run without arguments, `tempo` launches an interactive TUI (terminal user interface) built with [Ink](https://github.com/vadimdemedes/ink) (React for the terminal). The TUI shows:

- Today's plan (task list with checkboxes)
- Habit completion rings (ASCII art circles)
- Energy level prompt (1–5 number input)
- Quick-add input at the bottom
- Keyboard shortcuts: `j/k` navigate, `space` toggle complete, `n` new task, `q` quit

#### Authentication

On first run, `tempo auth login` opens a browser to `tempoflow.app/cli-auth` which generates a device token. The token is stored in `~/.config/tempo/credentials.json` (or `%APPDATA%\tempo\credentials.json` on Windows).

#### Implementation

`packages/cli/` in the monorepo. TypeScript, compiled with `bun build --compile`. HTTP client calls the Tempo REST API (see Section 3.8). The binary includes the TypeScript runtime via Bun's standalone binary compilation — no separate install required.

---

### 3.7 Browser Extension

#### Overview

A Manifest V3 browser extension for Chrome, Arc, Brave, and Edge. Content scripts inject into specific builder tool domains to provide a Tempo sidebar and capture button.

#### Supported Domains

| Domain | Content script behavior |
|---|---|
| `replit.com` | Sidebar shows project's Tempo tasks; "Capture note" button; "Summarize session → journal" action |
| `lovable.dev` | Same as Replit |
| `v0.dev` | Same |
| `bolt.new` | Same |
| `github.com` | Issue → Task converter; PR description → Tempo note |

#### Sidebar Component

A floating sidebar (togglable via extension icon or keyboard shortcut) shows:
- Current project's Tempo tasks (matched by URL or manual project link)
- Quick-add task input
- Recent notes
- Coach quick-ask (sends a message to the coach and shows response in-sidebar)

#### Capture Button

A floating "+" button (position: bottom-right, draggable) that opens a quick-capture modal:
- Selected text is pre-populated as note content
- User can add tags, link to a project, or send to coach
- Auto-tags with `#from-[domain]` (e.g., `#from-replit`)

#### "Summarize This Session" Action

A button in the sidebar that sends the user's last 30 minutes of activity (tab title, visited URLs matching the supported domain, visible text extracts) to the Tempo coach with the prompt "Summarize what I just built/did in this session as a journal entry." The journal entry is created after user approval.

**Privacy note:** This action is manually triggered. No automatic session tracking. The content script collects visible page text only when the user explicitly triggers the action. No data is collected passively.

#### Installation

Published to the Chrome Web Store and Firefox Add-ons (Firefox MV3 support permitting). Also installable directly from `tempoflow.app/extension` via Developer Mode for users who prefer not to use the Web Store.

---

### 3.8 REST API + Webhooks

#### Overview

A public HTTP API hosted at `api.tempoflow.app`. This is the same data surface as Convex but exposed over HTTP for external integrations, the CLI, and webhook consumers.

#### Authentication

Two methods:
1. **OAuth 2.0** — for third-party apps integrating with Tempo on behalf of users. Authorization code flow. Scopes mirror plugin SDK permissions.
2. **Personal Access Tokens (PAT)** — for personal scripts, CLI, and MCP server. Generated in Settings → Integrations → API. Scoped to selected permissions. Revocable.

#### API Endpoints (selected)

```
GET    /v1/tasks                    List tasks (filters: status, projectId, tags, due)
POST   /v1/tasks                    Create task
GET    /v1/tasks/{id}               Get task by ID
PATCH  /v1/tasks/{id}               Update task
DELETE /v1/tasks/{id}               Delete task
POST   /v1/tasks/{id}/complete      Mark task complete

GET    /v1/notes                    List notes
POST   /v1/notes                    Create note
GET    /v1/notes/{id}               Get note by ID
PATCH  /v1/notes/{id}               Update note
POST   /v1/notes/{id}/append        Append to note

GET    /v1/projects                 List projects
GET    /v1/projects/{id}            Get project by ID

GET    /v1/plans/today              Get today's plan
POST   /v1/plans                    Create a plan
GET    /v1/habits                   List habits
POST   /v1/habits/{id}/complete     Log habit completion

GET    /v1/coach/conversations      List coach conversations
POST   /v1/coach/conversations      Create conversation
POST   /v1/coach/conversations/{id}/messages   Send coach message

GET    /v1/search?q={query}         Full-text + semantic search

GET    /v1/me                       Current user profile + subscription
```

All responses are JSON. All endpoints require `Authorization: Bearer {token}`. Rate limiting: 100 requests/minute for PATs, 1000 requests/minute for OAuth apps.

#### Webhooks

Users can register webhook endpoints in Settings → Integrations → Webhooks. Available webhook events:

| Event | Payload |
|---|---|
| `task.created` | Task object |
| `task.updated` | Task object + changed fields |
| `task.completed` | Task object + completedAt |
| `plan.created` | Plan object |
| `coach_message.created` | Message object (content omitted if journal-scoped) |
| `habit.completed` | Habit ID + completedAt |
| `note.created` | Note object (content truncated to 500 chars) |

Webhook delivery: POST to registered endpoint with `Content-Type: application/json` and `X-Tempo-Signature` HMAC-SHA256 header for verification. Retry on failure: 3 retries with exponential backoff. Failed deliveries logged in Settings → Integrations → Webhooks → Delivery log.

---

### 3.9 Photo Accountability

#### Overview

The user commits to an effort-based goal with a deadline and submits a photo as evidence that they made an attempt. The AI verifies that effort was made (without grading quality). The commitment is marked complete if effort is confirmed.

#### Flow

1. User creates a commitment: "I will practice drawing today" with a deadline (5pm)
2. At deadline, the Accountability Buddy sends a check-in notification
3. User taps the notification and is taken to a capture screen
4. User takes or uploads a photo
5. Photo is sent to the AI (Gemma via OpenRouter) with the prompt: "The user committed to: '{commitment text}'. Does this photo show evidence that they made an effort toward this? Answer yes/no with a brief explanation. Do not evaluate quality."
6. If yes: commitment is marked complete, XP is awarded
7. If no: AI response is shown non-judgmentally: "This doesn't quite look like evidence of [commitment]. Want to try again or mark this as skipped?"
8. Photo is deleted from Convex storage after AI processing (it is NOT retained)

**Privacy:** Photos are uploaded to Convex storage temporarily for AI processing. They are automatically deleted within 5 minutes of processing completion (via a Convex scheduled action with a cleanup function). Photos are never used for any purpose other than verifying the specific commitment.

#### Storage

Commitments are stored in the `commitments` table. Evidence records (status only, no image) in `commitmentEvidence`. The Convex storage file ID is deleted after processing.

---

### 3.10 WhatsApp Bridge (RAM-Only)

#### Overview

An opt-in bridge that reads a user-selected WhatsApp group or conversation, extracts tasks and commitments mentioned in the last 30 minutes, and presents them for user approval before ingestion.

#### How it works

WhatsApp Web is the access mechanism. The bridge works as a browser extension content script that:
1. Injects into `web.whatsapp.com`
2. Reads the visible message history in the user-selected conversation (DOM scraping of the rendered chat view)
3. Extracts message text for the last 30 minutes
4. Sends extracted text to a Convex HTTP action for AI processing
5. Returns extracted commitments/tasks to the Tempo sidebar for user approval
6. Approved items are saved to Convex
7. Raw message text is discarded after extraction (never stored)

**Trigger:** Manual only. The user taps "Scan for commitments" in the Tempo sidebar overlay on WhatsApp Web. There is no automatic background scanning.

**Opt-in per conversation:** The user must explicitly select which WhatsApp conversations to make scannable. Selection is stored locally in the browser extension's storage (not in Convex).

**30-minute window:** Only messages sent in the last 30 minutes are processed. This is not configurable to a larger window — the 30-minute constraint is intentional to prevent bulk historical message ingestion.

#### Availability

WhatsApp bridge requires the browser extension. It is not available in the mobile app or PWA because those surfaces cannot access WhatsApp Web.

#### What is extracted

Same extraction targets as the ChatGPT import: action items, commitments, decisions, ideas flagged for follow-up. Attribution (who said what) is preserved in the extracted item's description for context, but the raw message text is discarded.

---

### 3.11 Telegram Bridge (RAM-Only)

#### Overview

Two components:
1. **Telegram Bot** — a Telegram bot (`@TempoFlowBot`) for adding tasks, logging habits, and asking the coach via Telegram messages
2. **Telegram group scan** — same RAM-only pattern as WhatsApp, via the Telegram Web client

#### Telegram Bot

User adds `@TempoFlowBot` to a personal Telegram chat (or to a group). Commands:

```
/add Buy groceries         → Creates task "Buy groceries"
/done [task number]        → Marks a task complete from today's list
/today                     → Sends today's plan as a message
/habit [habit name]        → Logs a habit completion
/ask How am I doing?       → Sends a message to the Tempo coach
/dump [text]               → Submits a brain dump
```

Bot is implemented as a Convex HTTP action responding to Telegram's Bot API webhooks. Authentication: user links their Telegram account to their Tempo account via Settings → Integrations → Telegram → "Link account" (generates a one-time code to send to the bot).

#### Telegram Group Scan

Same RAM-only pattern as WhatsApp. Requires the browser extension injecting into `web.telegram.org`. Same 30-minute window, manual trigger, opt-in per conversation.

---

### 3.12 Bluetooth Sync

#### Overview

When two authorized devices (both logged in as the same Tempo user) are in Bluetooth proximity, they can sync their local Convex cache without requiring an internet connection.

#### Architecture

Tempo uses Convex's standard online sync when connected. For offline-to-offline sync, a local Convex pouch (a lightweight local mirror of the user's Convex data stored in device storage) is maintained. When two devices are in Bluetooth proximity:

1. Device A advertises as a Tempo sync peer via BLE (Bluetooth Low Energy)
2. Device B discovers Device A
3. Both devices exchange a Tempo-signed handshake (using the shared user auth token as a shared secret)
4. Devices compare their `_creationTime` and `updatedAt` timestamps across all tables
5. Newer records are transmitted from one device to the other
6. Conflicts resolved last-write-wins

**Implementation:** `packages/expo-bluetooth-sync` custom Expo module using `react-native-ble-plx` for BLE. The sync protocol is custom (not using CouchDB/PouchDB sync protocol, which would require importing a forbidden database library).

**Availability:** Mobile only (iOS + Android). Not available in PWA.

**Opt-in:** Settings → Integrations → Bluetooth Sync → Enable. Requires Bluetooth permission grant.

---

### 3.13 VTuber Avatar (Max Tier)

#### Overview

During live voice sessions, Max tier users can enable a VTuber-style animated character that acts as a visual focus-mate body double. The avatar is visible in a floating window during voice sessions.

#### Preset Characters

Three preset characters ship with 2.0:
- **Sage** — calm, professional, Newsreader-serif aesthetic, warm neutrals
- **Pixel** — energetic, developer-aesthetic, pixel art style
- **Grove** — nature-themed, soft, calming

Character selection in Settings → Voice → Avatar.

#### Custom Avatars (BYOK)

Max tier users can bring their own avatar via integrations with image/video generation providers:

| Provider | What it provides |
|---|---|
| Pika | Short video loops of custom character animations |
| Runway | Same |
| Luma Dream Machine | Same |
| HeyGen | Full avatar with lip-sync from voice audio |
| D-ID | Same as HeyGen |

BYOK for avatar providers uses the same `providerCredentials` table as BYOK for text providers (provider field: `"pika"` / `"runway"` / etc.).

Custom avatar generation flow:
1. User uploads a reference image (character design, photo, illustration)
2. Tempo sends the image to the selected provider's API
3. Provider returns animated loops (idle, talking, reacting)
4. Loops are cached in Convex storage
5. During voice sessions, the appropriate loop is shown based on audio detection (is the user speaking / is the coach speaking / silence)

#### Lip-Sync (Optional)

For HeyGen and D-ID integrations, real-time lip-sync is available. The TTS audio output from the coach is sent to the lip-sync provider in real time to animate the avatar's mouth. This adds ~300–500ms latency to coach speech. Users can disable lip-sync in Voice Settings if they prefer lower latency.

#### Technical Implementation

Avatar rendering in web PWA: `<video>` loops with cross-fade transitions between states. In mobile: React Native Video component. No 3D rendering engine (Three.js, Unity, etc.) is used — all animations are pre-generated video loops.

#### Focus-Mate Mode

In Focus-Mate mode, the avatar window is persistent and visible above all other app content. The coach periodically sends short check-in messages ("Still with me?", "Good progress") based on session duration. At 25-minute intervals, a Pomodoro-style break prompt appears.

---

### 3.14 BYOK Expanded

In Phase 1.5, BYOK covered text AI providers. Phase 2.0 expands BYOK to all media-processing providers.

#### TTS (Text-to-Speech) Providers

| Provider | Notes |
|---|---|
| ElevenLabs | High-quality voice cloning, many voices |
| Kokoro (hosted) | Open-source TTS, self-hosted version available |
| Cartesia | Low-latency streaming TTS |

#### STT (Speech-to-Text) Providers

| Provider | Notes |
|---|---|
| Deepgram | Real-time streaming, high accuracy |
| AssemblyAI | Accurate, good speaker diarization |
| Whisper API (via OpenRouter) | Default, already in use via OpenRouter |

#### Embedding Providers

| Provider | Notes |
|---|---|
| Voyage AI | Best-in-class embedding quality for RAG |
| Cohere Embed | Strong multilingual embedding |
| OpenAI text-embedding-3 (via OpenRouter) | Default path |

#### Image Generation Providers

| Provider | Use |
|---|---|
| Pika | Avatar animation loops |
| Runway Gen-3 | Same |
| Luma Dream Machine | Same |
| Replicate | General-purpose image gen for templates |

#### Video Generation Providers

| Provider | Use |
|---|---|
| HeyGen | Lip-sync avatar video |
| D-ID | Same |

All BYOK media providers use the same `providerCredentials` table with a provider-specific `provider` field value.

---

### 3.15 Crypto Donations

#### Overview

Tempo Flow accepts voluntary cryptocurrency donations from users who want to support the project beyond their subscription. Donations are optional and not tied to any feature access.

#### Supported Currencies

| Currency | Address (to be configured at launch) |
|---|---|
| Bitcoin (BTC) | Amit's BTC address |
| Ethereum (ETH) | Amit's ETH address |
| Solana (SOL) | Amit's SOL address |
| Monero (XMR) | Amit's XMR address |

#### UI

Settings → Donate. Each currency shows:
- Currency icon + name
- A QR code of the wallet address
- The address string (tap to copy)
- A "Why Monero?" expandable explanation (brief: Monero offers privacy for donors who prefer not to have their donation amount and address publicly traceable on-chain)

#### Recurring Donations

Two optional recurring mechanisms:
1. **OpenCollective** — for users who prefer fiat-adjacent crypto (stablecoins) or want a formal open-source donation structure
2. **BitPay subscriptions** — for BTC/ETH recurring payments

Both are linked from the Donate screen as external links. Tempo does not process these payments directly — they go through OpenCollective's or BitPay's platform.

---

## 4. Schema Additions

```typescript
// Additions to convex/schema.ts for Phase 2.0

commitments: defineTable({
  userId: v.id("users"),
  text: v.string(),                     // e.g., "Practice drawing"
  deadline: v.number(),                 // unix timestamp
  status: v.union(
    v.literal("pending"),
    v.literal("evidenced"),
    v.literal("confirmed"),
    v.literal("skipped"),
    v.literal("missed")
  ),
  checkInSent: v.boolean(),
  coachConversationId: v.optional(v.id("coachConversations")),
  linkedTaskId: v.optional(v.id("tasks")),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_userId", ["userId"]),

commitmentEvidence: defineTable({
  commitmentId: v.id("commitments"),
  userId: v.id("users"),
  storageId: v.optional(v.string()),     // Convex storage ID — deleted after processing
  aiVerificationResult: v.optional(v.union(
    v.literal("effort_confirmed"),
    v.literal("effort_not_confirmed"),
    v.literal("inconclusive")
  )),
  aiExplanation: v.optional(v.string()),
  processedAt: v.optional(v.number()),
  storageDeletedAt: v.optional(v.number()),
  createdAt: v.number(),
}).index("by_commitmentId", ["commitmentId"]),

webhookSubscriptions: defineTable({
  userId: v.id("users"),
  url: v.string(),
  events: v.array(v.string()),          // e.g., ["task.created", "plan.created"]
  secret: v.string(),                   // HMAC signing secret (hashed, not plaintext)
  status: v.union(
    v.literal("active"),
    v.literal("paused"),
    v.literal("error")
  ),
  lastDeliveryAt: v.optional(v.number()),
  lastDeliveryStatus: v.optional(v.number()), // HTTP status code
  failureCount: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_userId", ["userId"]),

apiTokens: defineTable({
  userId: v.id("users"),
  name: v.string(),                     // user-defined label
  tokenHash: v.string(),               // SHA-256 of the token (not plaintext)
  tokenPreview: v.string(),            // first 8 chars, for display
  scopes: v.array(v.string()),         // permission scopes
  lastUsedAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),   // null = never expires
  isRevoked: v.boolean(),
  createdAt: v.number(),
}).index("by_userId", ["userId"]),

avatarProfiles: defineTable({
  userId: v.id("users"),
  presetCharacter: v.optional(
    v.union(v.literal("sage"), v.literal("pixel"), v.literal("grove"))
  ),
  customCharacterEnabled: v.boolean(),
  customCharacterProvider: v.optional(v.string()), // "pika" | "runway" | etc.
  idleLoopStorageId: v.optional(v.string()),
  talkingLoopStorageId: v.optional(v.string()),
  reactionLoopStorageId: v.optional(v.string()),
  lipSyncEnabled: v.boolean(),
  focusMateEnabled: v.boolean(),
  updatedAt: v.number(),
}).index("by_userId", ["userId"]),

// Note: integrations table already exists from Phase 1.0 schema.
// Phase 2.0 adds more provider values to the provider field but does not
// change the table structure.
```

---

## 5. Security Posture

### OAuth Scopes

All OAuth flows request the minimum scopes needed:
- Google Calendar: `https://www.googleapis.com/auth/calendar` (read + write own calendars only)
- Apple Health: per-data-point permissions (request only what is needed)
- GitHub (for MCP): `repo:read`, `issues:read` (no write permissions in 2.0)

### Token Storage and Rotation

- All OAuth tokens are stored encrypted in the `integrations` table using per-user Convex Secrets encryption
- Tokens are never returned to the client after storage
- Refresh tokens are rotated on every use (when the provider supports it)
- Access tokens are rotated on expiry via a Convex scheduled action that runs hourly

### Audit Log

A `securityAuditLog` (internal, not user-visible in 2.0) records:
- OAuth token issued
- OAuth token refreshed
- OAuth token revoked
- API token created
- API token used (rate-sampled: 1 in 100)
- API token revoked
- Webhook endpoint registered
- Photo uploaded for commitment evidence
- Photo deleted post-processing

### RAM-Only Reaffirmation

The RAM-only guarantee for ChatGPT/Claude imports and WhatsApp/Telegram scans is enforced at the architectural level, not just by policy:
- Convex HTTP actions handling raw message data use `"use server"` isolation and have no write mutations in their scope
- The processing function signature is `(rawText: string): ExtractedItems[]` — there is no `ctx.db` parameter available
- Write mutations are called separately by the client after the user approves items
- Convex action logs for the processing functions are disabled via Convex action configuration

This separation means that a code review can verify the RAM-only guarantee by inspecting the action signatures — no raw data can reach the database through these functions because they have no database write access.

### Rate Limiting on REST API

- PAT: 100 requests/minute, 5,000 requests/day
- OAuth app: 1,000 requests/minute, 50,000 requests/day
- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- On 429: response includes `Retry-After` header

---

## 6. Success Criteria

| Metric | Target | Notes |
|---|---|---|
| Google/Apple Calendar integration adoption | >= 30% of Pro/Max | At 60 days post-2.0 |
| Health data integration adoption (iOS) | >= 25% of iOS users | At 60 days post-2.0 |
| MCP server installs (Cursor) | >= 500 | Measured via PAT creation with `source: "cursor"` metadata |
| MCP server installs (Claude Code) | >= 200 | Same measurement method |
| tempo-cli weekly active users | >= 200 | Measured via API calls with `source: "cli"` header |
| Browser extension weekly active users | >= 100 | Measured via extension analytics (PostHog, opt-in) |
| REST API registered apps (OAuth) | >= 10 | Third-party apps using OAuth |
| Webhook subscriptions active | >= 50 | At 30 days post-2.0 |
| Photo accountability completion rate | >= 60% | Of commitments with deadlines that have photo evidence |
| ChatGPT/Claude import conversions (task approval rate) | >= 50% | Of extracted items, user approves |
| WhatsApp bridge weekly active users | >= 50 | At 60 days post-2.0 |
| VTuber avatar sessions (Max tier) | >= 40% of Max tier users | Use avatar at least once per week |
| BYOK expanded (TTS/STT) adoption | >= 10% of Pro/Max | At 60 days post-2.0 |


---

## 3.5 PRD Phase 3.0 — Ecosystem

> **Source file:** `PRD_Phase_3_Ecosystem.md`

# PRD: Tempo Flow 3.0 "Ecosystem" — Learning, Builder Sync, Marketplace

**Document status:** Draft v1.0  
**Phase:** 3.0  
**Depends on:** 1.0 "Foundation", 1.1 "Presence", 1.5 "Memory", 2.0 "Connected" shipped  
**Estimated effort:** 16–24 weeks  
**Primary purpose:** Make Tempo the planner of choice for lifelong learners and solo-dev builders. Launch the plugin marketplace. Open the community template gallery. Ship Swiss/EU inference as a user-selectable region.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals](#2-goals)
3. [Features](#3-features)
   - 3.1 Learning Platform Integrations
   - 3.2 Bi-Directional Builder Sync
   - 3.3 Advanced Confidence Router
   - 3.4 Community Template Gallery
   - 3.5 Swiss/EU-Hosted Inference (User-Selectable Region)
   - 3.6 Plugin Marketplace
4. [Schema Additions](#4-schema-additions)
5. [Compliance Additions](#5-compliance-additions)
6. [Success Criteria](#6-success-criteria)

---

## 1. Overview

Tempo Flow 3.0 "Ecosystem" completes the vision of Tempo as infrastructure — not just a personal planner, but a platform with a growing ecosystem of integrations, community content, and third-party extensions.

Three themes define this release:

**Learner-first.** By integrating with the major online learning platforms — Khan Academy, Udemy, Skool, Teachable, Coursera, edX — Tempo becomes the execution layer for self-directed learning. Course progress surfaces as Goals. Assignments become Tasks. The coach knows what the user is studying.

**Builder-central.** The bi-directional builder sync completes the loop begun in Phase 2 with the MCP server and browser extension. Now tasks don't just flow from Tempo to the builder's editor — status, completion, and context flow back. A user who closes a PR in GitHub, merges a branch, or marks a task done in Lovable sees it reflected in Tempo automatically.

**Ecosystem open.** The plugin marketplace makes Tempo's plugin ecosystem public, discoverable, and monetizable for third-party authors. The community template gallery opens Tempo's template system to public sharing and remixing. Swiss/EU inference gives privacy-conscious and GDPR-compliant users a managed, infrastructure-level guarantee of data residency — not just a policy, but a technical boundary.

---

## 2. Goals

### Goal 1: Learner Adoption

Students, self-directed learners, and knowledge workers who take online courses need a planning tool that knows about their coursework. Tempo should be the first productivity tool that reads course progress from the platforms they're already using and translates it into actionable plans. This positions Tempo as the planner for anyone pursuing structured learning outside a traditional institution.

### Goal 2: Developer Workflow Completion

The Phase 2 MCP server and browser extension were one-directional: Tempo data flowed into the dev environment. Phase 3 completes the feedback loop. When a developer finishes work (branch merged, PR closed, Lovable deployment succeeded), Tempo should know. This makes Tempo the authoritative record of what a developer built and when — more accurate than any manually maintained task list.

### Goal 3: Plugin Ecosystem Launch

A plugin ecosystem is only valuable if it is discoverable. The Phase 1.5 SDK gave developers the tools to build. Phase 3 gives users the marketplace to discover. With curation, featured plugins, and author monetization support (via Patreon/Ko-fi/GitHub Sponsors links), the marketplace creates sustainable incentives for third-party plugin development.

### Goal 4: Trust Through Infrastructure

Swiss/EU inference is not a checkbox. It is a trust signal backed by technical architecture. Users who are subject to GDPR, Swiss FADP, or organizational data residency requirements need to know not just that Tempo has a privacy policy, but that their data physically stays within a specific jurisdiction's borders. This is the feature that makes Tempo viable for European professionals and regulated industries.

---

## 3. Features

### 3.1 Learning Platform Integrations

#### Overview

Tempo integrates with six major online learning platforms to surface course progress as Goals, Milestones, and Tasks. Where partner APIs allow write-back, task completion in Tempo can mark assignments complete on the platform.

#### Supported Platforms

| Platform | Access method | Read | Write-back |
|---|---|---|---|
| Khan Academy | OAuth 2.0 (if available) or API key | Exercise progress, mastery map, streak | No (API is read-only) |
| Udemy | Udemy Affiliate API + OAuth | Course progress, lecture completion, quiz scores | No |
| Skool | No public API — browser extension scraping on skool.com | Course progress, community posts mentioning tasks | No |
| Teachable | OAuth 2.0 (Teachable Partner API) | Course enrollment, lesson completion, quiz scores | No |
| Coursera | Coursera OAuth (Partner API) | Course enrollment, assignment due dates, grade updates | No |
| edX | edX OAuth 2.0 (REST API) | Course enrollment, assignment due dates, completion status | No |

Write-back is rare because most platforms do not provide a public write API for assignment completion. Where write-back is available (edX progress API may support it — confirm at implementation time), Tempo implements it.

#### Data Mapping

| Platform data | Tempo representation |
|---|---|
| Course enrollment | Goal (category: learning, title: course name) |
| Course modules / sections | Goal milestones |
| Individual assignments / lessons | Tasks (linked to the goal, due dates from platform) |
| Assignment due date | Task due date |
| Assignment grade / pass/fail | Task custom field (read-only display) |
| Course completion | Goal marked complete |
| Learning streak | Displayed in Analytics screen, linked to Habits |

#### Coach Integration

When a learning platform is connected, the coach system prompt includes a summary of the user's active courses and upcoming assignment deadlines. The coach can reference coursework in planning sessions: "You have a Coursera assignment due Friday — want to schedule time for it this week?"

#### UI

Settings → Integrations → Learning Platforms → shows all six platforms with connection status.

Each connected platform shows a "Learning" section on the Goals screen with course-as-goal cards. Tapping a course-goal shows the milestone breakdown (modules) and the task list (assignments).

#### Skool (No API)

Skool does not have a public API as of PRD authorship. Integration relies on the browser extension's content script on `skool.com`. When the user visits a Skool course page, the extension scrapes the visible lesson progress and sends it to Tempo. This is clearly disclosed: the Skool integration requires the browser extension and works on web only.

---

### 3.2 Bi-Directional Builder Sync

#### Overview

Phase 2 made it easy to push Tempo tasks into dev environments (Cursor, Claude Code, Replit, Lovable, v0, Bolt) via the MCP server and browser extension. Phase 3 closes the loop: status changes in the dev environment flow back into Tempo automatically.

#### Detection Methods (per tool)

**Cursor and Claude Code (via MCP server):**  
The MCP server is extended with a `report_progress` tool that AI agents in Cursor/Claude Code can call automatically:

```typescript
report_progress({
  taskId: "tempo-task-id",   // if the task was created via Tempo MCP
  status: "completed",
  context: "PR #47 merged",
  evidence: "https://github.com/org/repo/pull/47"
})
```

The Cursor/Claude Code AI is instructed (via a system prompt fragment included in the MCP server's tool list description) to call `report_progress` when it detects that work related to a Tempo task has been completed: a PR merged, a commit pushed to main, a feature deployed.

**GitHub (via GitHub App):**  
A `tempo-flow[bot]` GitHub App that subscribes to:
- `pull_request.closed` (merged) events
- `issues.closed` events
- `push` events to the default branch (for commit message parsing)

When a PR is merged, the app looks for task references in the PR title or body (`TF-{taskId}` format) and calls the Tempo webhook to mark those tasks complete.

**Replit, Lovable, v0, Bolt (via browser extension):**  
The browser extension detects completion signals:
- Lovable: deployment success banner
- v0: "Deploy to Vercel" success event
- Replit: console output matching success patterns
- Bolt: similar deployment success detection

On detection, the extension sends a completion signal to the Tempo API for the current project's linked tasks. The user is shown a notification: "Looks like you finished something — marking [task] complete?"

#### Status Flow Architecture

```
Dev environment completion event
  → Detection layer (MCP / GitHub App / browser extension)
  → Tempo REST API (POST /v1/tasks/{id}/complete with evidence)
  → User notification (push / in-app): "Marked complete via [source]"
  → Undo window: 30 seconds to undo auto-completion
```

The 30-second undo window is important: AI-detected completions are not always accurate. Users should have an easy path to undo a false-positive completion without hunting for the task.

#### Manual Mark-Done from Browser Extension

When the extension detects a likely-completed task and the automated signal is ambiguous, it shows a floating card: "Did you just complete [task]? [Mark done] [Not yet]". This is the conservative fallback when automatic detection confidence is low.

#### Confidence Router for Builder Sync

The builder sync detection uses the same confidence router framework as the AI features (see Section 3.3):
- Confidence >= 0.85: auto-complete with notification + undo window
- Confidence 0.65–0.84: show "Did you finish this?" card
- Confidence < 0.65: no action (logged for debugging)

---

### 3.3 Advanced Confidence Router

#### Overview

The confidence router was introduced in Phase 1.0 as a simple rule-based system with three fixed thresholds. Phase 3.0 makes the router tunable per-user with per-category trust profiles.

#### Per-User Confidence Thresholds

Users can adjust auto-apply thresholds for each feature category in Settings → AI → Confidence Router:

| Category | Default auto-apply threshold | User can adjust to |
|---|---|---|
| Tag suggestions | 0.85 | 0.70–0.95 |
| Effort estimates | 0.80 | 0.65–0.95 |
| Calendar mutations | Always confirm | Always confirm (not adjustable — safety) |
| Builder sync task completion | 0.85 | 0.75–0.95 |
| Brain dump extraction | 0.75 | 0.60–0.90 |
| Coach-generated tasks | Always confirm | Always confirm (not adjustable) |
| Template tag auto-apply | 0.80 | 0.65–0.90 |

**Minimum threshold floors:** Calendar mutations and coach-generated tasks require user confirmation regardless of confidence score. These categories are marked as `confirmation_required: true` and the threshold UI is disabled for them.

#### Per-Category Trust Profiles

Trust profiles combine confidence thresholds with behavioral rules:

```typescript
interface TrustProfile {
  categoryId: string;
  autoApplyThreshold: number;
  alwaysConfirm: boolean;           // overrides threshold
  neverAutoApply: boolean;          // show as suggestion only
  showConfidenceScore: boolean;     // display the 0–1 score to user
  requiresReasonExplanation: boolean; // AI must explain its reasoning
}
```

Users can create named trust profiles ("conservative", "trusting", "paranoid") and switch between them. Switching takes effect on the next AI operation.

#### Router Observability View

A new sub-screen in Settings → AI → Router Log:
- Chronological list of all AI decisions in the last 7 days
- For each decision: feature, model, confidence score, action taken (auto-applied / showed confirmation / logged as suggestion), user's response (accepted / rejected / ignored)
- Aggregate statistics: auto-apply acceptance rate per category

This gives users insight into how well the router is calibrated for them and provides the data needed to adjust their trust profiles.

---

### 3.4 Community Template Gallery

#### Overview

The Templates screen gains a "Community" tab with a public registry of templates submitted by Tempo users. Templates are typed Library items (task lists, project templates, journal formats, note structures, routines, planning session formats).

#### Template Submission

Any user can submit a template to the community gallery from the Template Editor:
- "Share to community" button in Template Detail
- Submission includes: title, description, type, tags, preview (first 500 characters)
- Templates are submitted to a moderation queue

#### Moderation

Two-stage moderation:
1. **Automated:** Templates are scanned for: no personal data (using a Convex action that runs PII detection), no forbidden content (prompt injection patterns, external URL injection), no malformed structure (schema validation)
2. **Human review:** Amit reviews the moderation queue at least once per week. Approved templates go live. Rejected templates get a brief explanation sent to the author.

#### Gallery UI

Community tab in the Templates screen:
- Sort: Most remixed, Newest, Most saved
- Filter: By type (task_list / project / journal / note / routine / planning_session), by tag
- Template card: title, author (display name or anonymous), type badge, remix count, save count, preview

#### Remix and Fork

Users can remix any community template:
- "Use template" creates a local copy in the user's templates (no link back to the original — local copy only)
- "Fork and customize" creates a local editable copy and tracks it as a fork of the original (for attribution)
- Forked templates can be re-submitted to the community as a new template (with "forked from: [original title]" attribution)

#### Template Moderation via Report-and-Review

Users can report community templates:
- Report reasons: Inappropriate content, Personal data included, Not as described, Broken structure
- Reports are queued for Amit's review
- Three or more reports on a template suspend it from the gallery pending review

---

### 3.5 Swiss/EU-Hosted Inference (User-Selectable Region)

#### Overview

The Swiss Cloud placeholder introduced in Phase 1.5 becomes a functional, user-selectable inference region in Phase 3.0. Users can choose to have all of their AI inference processed by infrastructure located in Switzerland or the EU.

#### Region Options

Settings → AI → Region:

| Region | Provider | Data residency |
|---|---|---|
| Global (default) | Tempo's OpenRouter account | Data processed via OpenRouter's routing (no specific region guarantee) |
| Swiss Cloud | TBD (Infomaniak AI is current shortlist) | Switzerland — FADP compliant |
| EU Cloud | TBD (OVHcloud EU or equivalent) | European Union — GDPR compliant |

The final provider selection for Swiss Cloud and EU Cloud is Amit's decision at Phase 3.0 implementation time. This PRD documents the architecture and requirements; the specific vendor is TBD.

#### Provider Requirements

The selected provider must meet:
- Data center located in Switzerland (Swiss Cloud) or EU member state (EU Cloud)
- Support for Gemma 4 equivalent model inference (26B parameter class)
- Support for Mistral Small equivalent (24B class)
- Support for text embedding generation
- Compliant with Swiss FADP (Swiss Cloud) or GDPR (EU Cloud)
- API compatible with OpenRouter's request format or easy adapter layer

#### Technical Architecture

The inference routing layer in `convex/lib/router.ts` is extended with a `region` parameter:

```typescript
interface RouterConfig {
  region: "global" | "swiss" | "eu";
  // ... existing config
}
```

When `region` is set to `"swiss"` or `"eu"`, all inference requests are routed to the region-specific provider endpoint instead of Tempo's default OpenRouter account. BYOK keys from Phase 1.5 continue to work — if a user has both a BYOK key and a regional preference, the BYOK key takes precedence (since the user has already chosen their provider explicitly).

#### Data Residency Guarantees

When Swiss Cloud or EU Cloud region is selected:
- AI inference (prompt and response) is processed only by the selected region's provider
- RAG retrieval happens in Convex (Convex's data residency depends on the user's Convex deployment region — a separate setting, Phase 3 or beyond)
- Template generation, embeddings, and coach messages all route to the selected region

The guarantee is scoped to AI inference only. Convex data storage residency is a separate concern (Convex's regional deployment features are tracked but not committed to in 3.0).

#### Compliance Documentation

When Swiss Cloud or EU Cloud is enabled, the in-app privacy screen shows an updated indicator: "AI inference is processed in [Switzerland / the European Union]. Data does not leave [Swiss / EU] infrastructure for AI processing."

A downloadable "Data Processing Record" document is generated (via GetTerms.io or equivalent) documenting the data flow for users or their organizations who need to demonstrate GDPR/FADP compliance.

---

### 3.6 Plugin Marketplace

#### Overview

The Phase 1.5 public plugin SDK gave developers the tools to build plugins. Phase 3.0 gives users and developers the marketplace to discover, install, and monetize them.

#### Registry Architecture

The plugin marketplace is a public directory hosted at `tempoflow.app/marketplace`. It is separate from the in-app plugin installer (which accepts direct manifest URLs) but linked from it.

**Registry data** is stored in a combination of:
- The `plugins` Convex table (already exists from Phase 1.5) — source of truth for plugin metadata
- A static JSON index generated from the `plugins` table and served via CDN for fast browsing without Convex queries

#### Plugin Submission

Plugin authors submit via a web form at `tempoflow.app/marketplace/submit`:
1. Enter npm package name (`@author/tempo-plugin-name`)
2. Tempo fetches the package's `plugin.manifest.json` from npm
3. Automated validation: manifest schema check, permission scope validation, no forbidden domains
4. Human review: Amit reviews within 7 days for initial batch; community moderators added as volume grows
5. Approved: plugin appears in marketplace with a "Verified" badge
6. Rejected: author receives email with reason

#### Plugin Author Monetization

Tempo does not take a revenue cut. Plugin authors are responsible for their own monetization. The marketplace listing can include:
- **Patreon link** — "Support this plugin on Patreon"
- **Ko-fi link** — "Buy me a coffee"
- **GitHub Sponsors link** — "Sponsor on GitHub"
- **OpenCollective link**

These links are shown as small icons on the plugin card. They are optional — free plugins need not include any monetization links.

#### Marketplace UI (in-app)

Settings → Plugins → Explore:
- Featured plugins section (curated weekly by Amit)
- Categories: Productivity, Learning, Import, Integrations, Fun
- Sort: Most installed, Newest, Recently updated
- Search by name or tag
- Plugin card: icon, name, author, description, permission badges, install count, monetization links

Tapping a plugin card shows the full detail view with:
- Full description
- Screenshots (up to 4, submitted by author)
- Permission list with human-readable explanations
- Changelog (from npm package releases)
- "Install" button

#### Featured Plugins (Weekly Curation)

Every week, Amit selects 1–3 plugins to feature on the marketplace homepage and in the Dashboard (a dismissible "Try this plugin" card, similar to the vlog card). Featured selection criteria: quality, relevance to current season/context, diversity across categories.

#### Plugin Versioning

Plugin updates are published via npm. Installed plugins check for updates on app launch (once per day). If an update is available:
- If no new permissions are requested: auto-update silently
- If new permissions are requested: show an "Update available — review new permissions" prompt before updating

#### Official Plugin Catalog (at 3.0 Launch)

In addition to the Audible Library and Goodreads plugins from Phase 1.5, the following official plugins are targeted for the 3.0 marketplace launch:

| Plugin | What it does |
|---|---|
| `@tempoflow/plugin-github` | Two-way task ↔ GitHub Issues sync |
| `@tempoflow/plugin-notion-import` | One-time Notion page import → Tempo notes (read-only, no ongoing sync) |
| `@tempoflow/plugin-kindle` | Kindle highlights export → Library items + flashcard candidates |
| `@tempoflow/plugin-youtube-study` | YouTube video URL → timestamped notes + flashcard generation |

Note: the Notion import plugin is a one-time importer (user exports from Notion, Tempo ingests). It does not establish an ongoing Notion sync — Notion is on the forbidden tech list. This plugin helps users migrate away from Notion, not integrate with it.

---

## 4. Schema Additions

```typescript
// Additions to convex/schema.ts for Phase 3.0

learningCourses: defineTable({
  userId: v.id("users"),
  platform: v.union(
    v.literal("khan_academy"),
    v.literal("udemy"),
    v.literal("skool"),
    v.literal("teachable"),
    v.literal("coursera"),
    v.literal("edx")
  ),
  externalCourseId: v.string(),         // platform-specific course ID
  title: v.string(),
  instructorName: v.optional(v.string()),
  thumbnailUrl: v.optional(v.string()),
  url: v.optional(v.string()),
  progressPercent: v.number(),          // 0–100
  enrolledAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  linkedGoalId: v.optional(v.id("goals")),
  lastSyncedAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_platform", ["userId", "platform"]),

courseEnrollments: defineTable({
  userId: v.id("users"),
  courseId: v.id("learningCourses"),
  status: v.union(
    v.literal("enrolled"),
    v.literal("in_progress"),
    v.literal("completed"),
    v.literal("dropped")
  ),
  assignmentsDue: v.optional(v.array(v.object({
    id: v.string(),
    title: v.string(),
    dueAt: v.optional(v.number()),
    completed: v.boolean(),
    linkedTaskId: v.optional(v.id("tasks")),
  }))),
  lastSyncedAt: v.number(),
  updatedAt: v.number(),
}).index("by_userId", ["userId"]),

builderSyncLinks: defineTable({
  userId: v.id("users"),
  tool: v.union(
    v.literal("cursor"),
    v.literal("claude_code"),
    v.literal("windsurf"),
    v.literal("replit"),
    v.literal("lovable"),
    v.literal("v0"),
    v.literal("bolt"),
    v.literal("github")
  ),
  externalProjectId: v.optional(v.string()), // GitHub repo, Replit project ID, etc.
  externalProjectUrl: v.optional(v.string()),
  tempoProjectId: v.optional(v.id("projects")),
  syncEnabled: v.boolean(),
  lastSyncedAt: v.optional(v.number()),
  completionConfidenceThreshold: v.number(), // 0–1, default 0.85
  autoCompleteEnabled: v.boolean(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_tool", ["userId", "tool"]),

templateRemixes: defineTable({
  userId: v.id("users"),
  originalTemplateId: v.id("templates"),
  remixedTemplateId: v.id("templates"),
  remixNote: v.optional(v.string()),   // what the user changed
  createdAt: v.number(),
}).index("by_originalTemplateId", ["originalTemplateId"]),

pluginReviews: defineTable({
  pluginId: v.string(),                // references plugins.id
  userId: v.id("users"),
  rating: v.number(),                  // 1–5
  reviewText: v.optional(v.string()),
  helpfulCount: v.number(),
  isVerified: v.boolean(),             // verified = reviewer has the plugin installed
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_pluginId", ["pluginId"])
  .index("by_userId", ["userId"]),

regionPreferences: defineTable({
  userId: v.id("users"),
  inferenceRegion: v.union(
    v.literal("global"),
    v.literal("swiss"),
    v.literal("eu")
  ),
  dataProcessingRecordGeneratedAt: v.optional(v.number()),
  updatedAt: v.number(),
}).index("by_userId", ["userId"]),
```

---

## 5. Compliance Additions

### Per-Region Data Residency Enforcement

When a user selects Swiss Cloud or EU Cloud inference:

1. **Routing enforcement:** All Convex actions that make AI inference calls check `regionPreferences.inferenceRegion` before routing. A routing assertion in the action body raises an error if the call would go to the wrong region.

2. **Audit trail:** Every AI inference call in the `agent_runs` table is tagged with `inferenceRegion` (new field added to `agent_runs`). This provides an auditable record of where each inference was processed.

3. **BYOK override:** If a user has a BYOK key configured AND a region preference, the BYOK key takes precedence. The user has explicitly chosen their provider by entering a key — the region preference is a fallback for non-BYOK requests.

### GDPR / Swiss FADP Dual Compliance

Tempo already maintains GDPR-compliant data handling via GetTerms.io and the DSR button. Phase 3.0 adds:

**Swiss FADP (Federal Act on Data Protection, effective 2023):**
- The Privacy Policy is updated via GetTerms.io to include FADP-specific disclosures
- Data Subject Rights under FADP (right to information, right to rectification, right to object) are fulfilled via the same DSR button workflow
- Data transfers to non-Swiss countries are documented (relevant when `inferenceRegion: "global"` is selected)

**Dual compliance documentation:**
- A "Compliance" section in Settings → Privacy shows the user's current compliance posture: "Your AI inference is processed in Switzerland (FADP compliant) and your data is stored on Convex (Convex's data residency: [current])"
- A downloadable Data Processing Record (DPR) is generated listing all data processing activities, the legal basis for each, and the jurisdiction where processing occurs

### Community Template Gallery Moderation

The community template gallery moderation process includes a compliance check:
- Templates containing personal data (detected by PII scanner) are rejected automatically
- Templates are screened for prompt injection patterns (instructions that could manipulate the AI into taking unintended actions when the template is applied)
- Moderation logs are retained for 90 days

---

## 6. Success Criteria

| Metric | Target | Notes |
|---|---|---|
| Learning platform connections (total) | >= 500 | Users with at least one platform connected, at 60 days |
| Bi-dir builder sync active users | >= 200 | Users with at least one builder sync link active, at 60 days |
| Builder sync auto-completion accuracy | >= 80% | User does not undo the auto-completion within 30 seconds |
| Community template gallery submissions | >= 50 | At 30 days post-launch |
| Community template remixes/forks | >= 200 | At 60 days post-launch |
| Plugin marketplace listings | >= 20 | At 60 days post-launch |
| Swiss/EU region opt-in | >= 10% of active Pro/Max users | At 60 days post-launch |
| Confidence router observability view weekly active users | >= 100 | Proxy for engaged power users |
| Plugin marketplace featured plugin install rate | >= 15% click-through | Of users who see the featured plugin card, tap to view |
| Bi-dir sync among paying developer users (self-identified) | >= 40% | Users who signed up via developer referral channels |


---

# Part 4 — Rules & Governance


---

## 4.1 HARD_RULES.md

> **Source file:** `HARD_RULES.md`

# Tempo Flow — Hard Rules

**Read before touching code.** These are non-negotiables for every contributor — human, Cursor IDE, Cursor Cloud agent, plugin author. If anything in this file conflicts with a PRD or a prompt, this file wins. If you find a rule you disagree with, open an issue and discuss — do not silently ignore it.

---

## 1. Product posture

Tempo Flow is an overwhelm-first personal operating system for neurodivergent people. Everything in the product serves that purpose:

- **Never shame the user.** Empty states, error messages, accountability features, and the coach must never imply failure or laziness.
- **Accept the user's reality.** If a user misses a habit for 10 days, the UI says "welcome back, want to start fresh?" — not "streak broken."
- **Accept-reject flow is law.** The AI never silently mutates user state. Every state mutation originating from the AI surfaces a confirm / edit / reject card in the UI, with preview.
- **Undo is a feature.** Every mutation that the AI performs is reversible with a one-click undo for at least 5 minutes after the fact.
- **Personalization is philosophy.** The schema is generic; the user's experience is personalized at the AI + render layer. Do not encode user-specific variants in schema columns.

---

## 2. Forbidden tech (never add as a dependency; never reference in code, env vars, or docs)

| Category | Forbidden | Use instead |
|---|---|---|
| Backend-as-a-Service | Firebase, Supabase | Convex |
| ORM | Prisma, Drizzle, TypeORM, Mongoose | Convex `v.*` validators + `defineSchema` |
| Auth | Auth0, Clerk, NextAuth, BetterAuth | Convex Auth |
| Payments | Stripe SDK direct | RevenueCat (wraps Stripe, App Store, Play Store) |
| AI provider SDKs | `openai`, `@anthropic-ai/sdk`, `@google/generative-ai` | OpenRouter via `fetch` against `https://openrouter.ai/api/v1/chat/completions` |
| Client state | Redux, Zustand, Jotai, Recoil, MobX | Convex reactive queries are the state |
| HTTP | Axios, ky, got | Native `fetch` |
| Direct DB clients | `mongodb`, `pg`, `mysql2` | Convex queries / mutations / actions |
| Styling | Tailwind 3.4+ | Tailwind 3.3.2 (exact) |
| Task trackers in agent spine | Notion, Linear, Airtable | GitHub Issues + GitHub Projects + `TASKS.md` + Convex `agent_*` tables + Discord |

If you believe you need one of these, open an issue first with the specific justification. Do not add it on your own authority.

---

## 3. License boundary rules

- Tempo Flow ships under Business Source License 1.1, converting to Apache 2.0 four years after each versioned release.
- **Do not add dependencies with licenses that restrict our ability to ship under BSL 1.1 or convert to Apache 2.0.** AGPL-licensed code is not acceptable as a direct dependency in the main application. LGPL dynamic linking is acceptable. MIT / BSD / Apache / MPL are all fine. ISC, Unlicense, CC0 are fine.
- **Preserve copyright headers** in any file copied or adapted from another project.
- **Never commit code from another project without verifying the license.** When in doubt, write it yourself.

---

## 4. Naming conventions

### Files

- React components: `PascalCase.tsx` (e.g. `TaskCard.tsx`, `CoachPanel.tsx`).
- Hooks: `useThing.ts`.
- Non-component TypeScript modules: `kebab-case.ts` (e.g. `parse-brain-dump.ts`, `confidence-router.ts`).
- Convex files: `kebab-case.ts` inside `convex/` (e.g. `convex/tasks.ts`, `convex/coach.ts`).
- Route files (Next.js app router): Next conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`).

### Identifiers

- Variables and functions: `camelCase`.
- Types and interfaces: `PascalCase`. Prefer `type` aliases over `interface` unless you need declaration merging.
- Constants: `SCREAMING_SNAKE_CASE` only for genuine compile-time constants (e.g. `MAX_BRAIN_DUMP_LENGTH`). Everything else is `camelCase`.
- Convex table names: plural, no prefix. `tasks`, `notes`, `journalEntries`, `libraryItems`, `coachMessages`. **Not** `t_tasks`, `tbl_notes`, etc.
- Convex query/mutation/action names: `camelCase` verbs. `listByUser`, `createTask`, `completeHabit`, `generatePlan`.

### Branch names

- `feat/<task-id>-<short-kebab>` e.g. `feat/T-042-brain-dump-extractor`
- `fix/<task-id>-<short-kebab>`
- `chore/<scope>-<short-kebab>`
- `docs/<scope>-<short-kebab>`

### PR titles

- Conventional Commits format: `feat(scope): short summary`, `fix(scope): ...`, `chore: ...`, `docs: ...`.
- Reference `TASKS.md` IDs in the body (`Task: T-042`).

---

## 5. Schema rules

Every Convex table must have, at minimum:

```ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tasks = defineTable({
  // Ownership — optional for Convex Auth transitional state and anonymous usage.
  userId: v.optional(v.string()),

  // Soft-delete + audit
  createdAt: v.number(),   // Date.now() at insert
  updatedAt: v.number(),   // Date.now() at every mutation
  deletedAt: v.optional(v.number()), // null/undefined = live; number = soft-deleted at

  // ...domain fields
})
  .index("by_user", ["userId", "deletedAt"])
  .index("by_user_updated", ["userId", "updatedAt"]);
```

Rules:

- **`userId` is `v.optional(v.string())`** on every table. Never `v.string()` (non-optional). Convex Auth has transitional states and some tables predate sign-in (e.g. onboarding brain dumps).
- **Every write sets `updatedAt: Date.now()`.** Never rely on Convex's internal timestamps for user-visible sort order.
- **Soft delete only.** Hard deletes are forbidden except for: RAM-only scanner staging rows, expired rate-limit buckets, and test fixtures. All user-visible data soft-deletes via `deletedAt`. Restore must be possible.
- **Indexes are mandatory.** Every table that is queried by `userId` has a `by_user` index. Do not scan.
- **Generic schema.** Do not add columns like `recipe_ingredients_json` or `routine_morning_block_id`. Those are `libraryItems` with a `type` field and a flexible `content` field. The AI layer handles per-user formatting.
- **Enumerations as `v.union` of literal strings**, not free-form strings. Example: `status: v.union(v.literal("todo"), v.literal("doing"), v.literal("done"), v.literal("archived"))`.
- **References are `v.id("otherTable")`** not raw strings.
- **No per-user variant tables.** Never `tasks_user_123`. All users share one `tasks` table; `userId` discriminates.

---

## 6. AI integration rules

### 6.1 Routing

- All LLM calls go through `packages/ai/src/router.ts` which calls OpenRouter. Direct provider SDKs are forbidden.
- Default models:
  - **Fast path (Gemma 4 26B):** classification, extraction, tagging, short chat turns, accept-reject surfacing.
  - **Reasoning path (Mistral Small 4):** planning sessions, template generation, complex rewrites, coach deep mode.
- Route selection lives in `packages/ai/src/route-by-task.ts`. Keep the mapping explicit.

### 6.2 Accept-reject flow

- Every AI-originating mutation goes through `convex/proposals.ts` — it inserts a proposal row, the UI renders a confirm / edit / reject card, and only on confirm does the real mutation run.
- The proposal payload must be a structured preview the UI can render, not a blob of model text.
- **Never call a mutation directly from an `action` with AI-generated arguments and no user confirm.**

### 6.3 Confidence router

Every AI-originating mutation carries a `confidence: number` in the range `[0, 1]`.

- `confidence ≥ 0.8`: auto-apply, but show an inline undo toast for 5 minutes.
- `0.5 ≤ confidence < 0.8`: one-click confirm dialog.
- `confidence < 0.5`: open a clarifying dialog that asks the user the minimum questions needed to raise confidence (e.g. "Which test?", "Which 20th?", "How much time do you have?").

High-stakes categories (calendar events with real-world consequences, deletions, cross-user interactions, payments) always require confirm regardless of confidence.

### 6.4 RAM-only scanner rule

Any ingestion of third-party content (email, WhatsApp, Telegram, ChatGPT export, Claude conversation export, Obsidian vault, Apple Notes) must process in memory only:

- Raw message bodies **never** write to disk or Convex.
- The scanner extracts structured candidates (task, event, commitment, person mention), surfaces them for user approval via the accept-reject flow, and discards the source bytes when the action returns.
- Only the approved, derived records persist.
- If a user re-connects an integration, the scanner re-runs on the live source; there is no "historical cache" of raw content.
- Document the scanner entry point with a `// RAM-ONLY` comment and include a linter check (`pnpm scan:ram-only-audit`) that fails if a scanner function persists raw content.

### 6.5 Coach personality setting

- `profiles.coachDial: v.number()` in the range `[0, 10]`, default `5`.
- `0` = warm, gentle, wisdom-forward mentor; `5` = peer friend; `10` = high-intensity accountability archetype (stern and direct).
- The user may override per session via the coach-settings panel.
- The system prompt for the coach includes a line: `"Current accountability dial: N / 10. Match tone accordingly."`
- Do not hard-code personality anywhere else. Tone comes from the dial only.

### 6.6 RAG retrieval

- Global RAG: default retrieval is hybrid — recent time-window (7 days) union semantic top-K union graph neighbors of any entity mentioned in the prompt.
- Scoped RAG (Tempo 1.5): when the user is in a notebook-scope session, retrieval is constrained to the selected notes, folders, projects, or tags.
- User setting `ragScope: v.union(v.literal("global"), v.literal("scoped"))` with scoped subject stored separately.
- Never include raw PII from other users in retrieval context. Tenant isolation is enforced at the Convex query layer (`userId` filter) before retrieval, not after.

---

## 7. Design system rules

### 7.1 Palette

The "Soft Editorial" palette is defined in `packages/ui/src/tokens.ts`. Approved Tailwind utility classes only — no arbitrary hex values, no raw Tailwind arbitrary syntax (`bg-[#123456]`).

- Light and dark modes are both first-class.
- WCAG AA contrast minimum. AAA where reasonably achievable.
- Color-blind safe: never encode meaning in color alone. Pair every color with an icon, label, or pattern.

### 7.2 Typography

- Headings: Newsreader (serif).
- Body: Inter (sans).
- Monospace: IBM Plex Mono.
- **OpenDyslexic:** user-toggleable from Settings → Accessibility. When enabled, all body copy switches to OpenDyslexic. Headings remain in Newsreader by default; a secondary toggle can switch headings too.

### 7.3 Components

- Use `shadcn/ui` primitives as the foundation on web. Customize tokens, not component internals.
- On mobile, NativeWind-styled equivalents live in `packages/ui/src/native/`.
- Shared design tokens (colors, spacing, radii, shadows, type scale) live in `packages/ui/src/tokens.ts` and are the single source of truth across web and mobile.
- Arbitrary Tailwind values (`text-[13.5px]`, `w-[217px]`) are forbidden. If you need a new token, add it to `tokens.ts`.

### 7.4 Motion and feedback

- Default to `prefers-reduced-motion` respected.
- Haptics on mobile: tiny tap on task complete, medium on celebration milestones. Never on errors.
- Loading states: skeletons, not spinners, for content areas > 100 ms expected latency.

---

## 8. Accessibility rules

- **WCAG 2.1 AA minimum** across web and mobile.
- Screen-reader labels on every interactive element. Test with VoiceOver and TalkBack on real devices before shipping a feature.
- Keyboard navigation on web: every feature reachable without a mouse.
- Focus states visible. Never `outline: none` without a visible replacement.
- Touch targets ≥ 44x44 dp on mobile, ≥ 24x24 px on web with generous padding.
- Form inputs have associated `<label>` elements.
- Error text is programmatically associated with its field (`aria-describedby`).

---

## 9. Voice rules

- **Walkie-talkie (push-to-talk) voice is universal** across all tiers.
- **Live (streaming) voice is minute-capped** per tier:
  - Basic: 30 minutes per day
  - Pro: 90 minutes per day
  - Max: 180 minutes per day
- **Tracking is in minutes of real audio**, not tokens. A `voiceSessions` row opens on session start with `startedAt`, closes with `endedAt`, and computes `durationMs`. The daily budget is the sum of `durationMs` for the user's local calendar day.
- Daily budgets reset at the user's local midnight (derived from `profiles.timezone`).
- Session start checks available budget; if < 1 minute remains, walkie-talkie remains available, live voice is gated behind an upgrade prompt.

---

## 10. Privacy and compliance rules

- **GetTerms.io IDs** live in Vercel / EAS env vars: `TEMPO_GETTERMS_PRIVACY_ID`, `TEMPO_GETTERMS_TERMS_ID`, `TEMPO_GETTERMS_COOKIES_ID`. They are embedded in `app/(legal)/*` routes.
- **DSR (Data Subject Request) button** lives at Settings → Account → Privacy. Clicking it triggers `convex/dsr.ts:requestDataExport` or `requestAccountDeletion`, which enqueue a job.
- **Data export** produces a ZIP of the user's data as JSON files, one per table. Generated by a Convex action, stored in Convex file storage, link emailed via Resend.
- **Account deletion** soft-deletes immediately (all rows for that `userId` set `deletedAt = Date.now()`), with a 30-day grace window where the user can restore. After 30 days, a scheduled job hard-deletes.
- **Privacy mode** (Tempo 1.5): the user may flag their account as "privacy mode," which forces on-device inference, disables third-party analytics (PostHog opt-out), and defers all sync to manual moments.
- **Analytics are opt-in.** `profiles.analyticsOptIn: v.boolean()`, default `false`. Opt-in is set in the onboarding privacy screen, and may be toggled in Settings → Privacy at any time.

---

## 11. Testing rules

- Every new Convex mutation gets at least one test (`convex/<module>.test.ts`) — happy path + one error case minimum.
- Every React component with meaningful logic gets a render test with `@testing-library/react` (web) or `@testing-library/react-native` (mobile).
- Every AI routing function (`route-by-task`, `confidence-router`) is unit-tested with a golden fixture set.
- PRs run: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm scan:forbidden-tech`, `pnpm convex:schema-guard`, `pnpm scan:ram-only-audit`, `pnpm scan:design-tokens`.
- All of these must pass before merge.

---

## 12. Git and PR rules

- **Never push to `main` directly.** All changes through PR.
- **`main` is always deployable.** If a PR would break `main`, fix the PR or revert.
- **One logical change per PR.** Large features land as a stack of PRs.
- **PR description** must reference the `TASKS.md` task ID and include:
  - Summary (2–3 sentences, *why* not *what*)
  - Screenshots or screen recording for any UI change
  - Test plan (checkable boxes)
  - Acceptance criteria copied from `TASKS.md`
- **Reviewers** are required. For Cursor Cloud agent PRs, reviewer is the human (Amit) or a second agent flagged as `reviewer`.
- **Conventional Commits** for commit and PR titles.

---

## 13. Secrets and env vars

- **No secrets in the repo.** Ever. Use `.env.local` locally (git-ignored) and Vercel / EAS env var config for deployed environments.
- **`.env.example`** is the canonical list. Every new env var is added there with a placeholder and a one-line comment.
- **Secret scanning** runs in CI (`pnpm scan:secrets`). Never merge a PR where the scan fires.
- **OpenRouter keys** are scoped per environment and rotated quarterly.
- **RevenueCat** public keys are safe to ship client-side. Secret keys only in server-side Convex actions.

---

## 14. Owner-tag discipline

- **Only claim tasks whose owner tag matches your agent identity.** A `cursor-cloud-1` agent does not touch `cursor-cloud-2` work, and none of them touch `twin`, `pokee`, `zo`, or `human-amit` tasks.
- **Never ask a human to do work labeled for a code agent.** If a task is `cursor-cloud-2`, the cloud agent does it; Amit only reviews.
- **Never have a code agent click a web dashboard.** That is Twin's job. If a task genuinely requires a dashboard action, its owner tag is `twin` or `human-amit`, not `cursor-*`.

---

## 15. Ask-the-Founder queue

- Submissions land in Convex `askFounderQueue` with `userId`, `subject`, `body`, `priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"))`, `createdAt`.
- A Convex HTTP action `/ask-founder/webhook` notifies Pokee, which routes to a Google Sheet + Discord + optional SMS to the founder.
- **Never surface another user's submission to any other user.** Transcript sharing requires explicit opt-in per submission.

---

## 16. Plugin boundary

(Applies from Tempo 1.5 onwards; enforce the plumbing from day one.)

- Plugins can declare permission scopes: `read:tasks`, `write:tasks`, `read:notes`, `write:notes`, `read:coach`, etc.
- Plugins receive scoped API tokens; they never see other users' data, never see credentials, and never make direct network calls outside their declared allowed domains.
- Plugins run in sandboxed iframes on web and in constrained Convex actions server-side.
- Plugin monetization happens on patronage platforms (Patreon, Ko-fi, Buy Me a Coffee, GitHub Sponsors). Tempo Flow takes no cut.

---

## 17. If a rule feels wrong

Open an issue with:

- The rule (quote it).
- The concrete scenario where it bites.
- Your proposed alternative.
- The downside of the alternative.

Rules are updated only via PR to this file, with reviewer approval from the project owner.

---

*Last revised: this document is versioned with the repo. Check `git log docs/HARD_RULES.md` for history.*


---

## 4.2 CURSOR_RULES.md

> **Source file:** `CURSOR_RULES.md`

# Tempo Flow — Cursor Rules (Annotated)

This document is the long-form companion to `.cursorrules` at the repo root. It repeats every rule Cursor must follow and explains the rationale — the "why" behind each one. When Cursor needs to decide whether a rule applies in a novel situation, the rationale here is the intended interpretation.

For the hard non-negotiables, see [`HARD_RULES.md`](./HARD_RULES.md). This file and HARD_RULES should agree; if they don't, HARD_RULES wins.

---

## 1. Read order every session

**Rule.** Read these files in order before touching code:

1. `docs/HARD_RULES.md`
2. `docs/TASKS.md` (filter by your owner tag)
3. `docs/PRDs/PRD_Phase_1_MVP.md` (current phase spec)
4. `docs/CURSOR_PROMPTS.md` (if you need a kickoff template)

**Rationale.** Context drift is the single biggest failure mode of long-running Cursor Cloud agents. Reading the rules first and the current PRD second keeps the agent aligned with project posture instead of free-forming from model priors. `TASKS.md` tells you what you are allowed to work on; the PRD tells you what "done" means.

---

## 2. Owner tags

**Rule.** Only claim tasks whose owner tag matches your agent identity. Valid tags: `cursor-ide`, `cursor-cloud-1`, `cursor-cloud-2`, `cursor-cloud-3`, `twin`, `pokee`, `zo`, `human-amit`.

**Rationale.** Parallel Cursor Cloud agents step on each other's files if they both grab the same feature. The cluster split (Core Features / AI & Intelligence / Platform & Polish) is designed so that most PRs touch disjoint directories. `twin` / `pokee` / `zo` tasks require non-Cursor tooling — if a Cursor agent picks one up, it will fail. `human-amit` tasks require real-world actions (card entry, 2FA SMS, Apple Developer enrollment) that no agent can do.

---

## 3. Pre-flight preamble

**Rule.** On every non-trivial task, before writing code:

1. List the files you plan to create or modify.
2. Confirm your understanding against the current PRD.
3. List any clarifying questions.
4. Wait for approval before writing code.

**Rationale.** Cursor Cloud agents that start coding immediately produce a lot of work quickly, and much of it is wrong because they misread the scope. The pre-flight pass takes five minutes and saves hours. For trivial tasks (typo fixes, single-line changes, simple renames), skip the preamble.

---

## 4. Forbidden tech

**Rule.** Do not add as dependencies, do not reference in code, do not mention in env vars or docs:

| Category | Forbidden | Use |
|---|---|---|
| Backend-as-a-Service | Firebase, Supabase | Convex |
| ORM | Prisma, Drizzle, TypeORM, Mongoose | Convex `v.*` validators |
| Auth | Auth0, Clerk, NextAuth, BetterAuth | Convex Auth |
| Payments | Stripe direct SDK | RevenueCat |
| AI SDKs | `openai`, `@anthropic-ai/sdk`, `@google/generative-ai` | OpenRouter |
| Client state | Redux, Zustand, Jotai, Recoil, MobX | Convex reactive queries |
| HTTP | Axios, ky, got | Native `fetch` |
| Direct DB | `mongodb`, `pg`, `mysql2` | Convex |
| Styling | Tailwind 3.4+ | Tailwind 3.3.2 |
| Task trackers in agent spine | Notion, Linear, Airtable | GitHub + `TASKS.md` + Convex + Discord |

**Rationale.**

- **Firebase / Supabase:** Convex gives reactive queries, serverless functions, file storage, cron, and auth in one product. Adding another BaaS balloons infra cost and adds a sync-between-two-backends problem.
- **ORMs:** Convex's schema + validators are the ORM. Adding Prisma or Drizzle would duplicate the schema definition and introduce a second source of truth.
- **Auth libraries:** Convex Auth is designed for Convex. Third-party auth forces a user table in a second system, which fights against the tenant-isolation model.
- **Stripe direct:** RevenueCat wraps App Store, Play Store, and Stripe in a single SDK with subscription state management. Going direct means building three parallel billing systems.
- **AI SDKs:** OpenRouter routes between many providers behind one API. Direct SDKs lock us into one provider and break the OpenRouter-first cost optimization.
- **Client state libraries:** Convex queries are reactive. A Redux store on top of reactive queries is a performance and consistency problem in waiting.
- **Axios:** native `fetch` works everywhere we ship. Axios adds weight and an abstraction that is not needed.
- **Direct DB clients:** Convex is the database. We do not open direct DB connections.
- **Tailwind 3.4+:** NativeWind compatibility. NativeWind 4 pins to Tailwind 3.3.2.
- **Notion / Linear / Airtable in the agent spine:** founder preference. Use GitHub + `TASKS.md` + Convex + Discord instead.

If you think you need a forbidden dependency, open an issue first with the justification.

---

## 5. Accept-reject flow

**Rule.** The AI never silently mutates user state. Every AI-originating state change surfaces as a proposal card the user can confirm, edit, or reject.

**Rationale.** Neurodivergent users — the primary audience — often have low trust in automated systems that change things without asking. Silent mutation erodes that trust even when the mutation is correct. A small upfront friction (one click to confirm) is worth orders of magnitude more in long-term retention. Implementation lives in `convex/proposals.ts` and the UI `<ProposalCard />` component.

---

## 6. Confidence router

**Rule.** Every AI mutation carries a `confidence: number` in `[0, 1]`.

- ≥ 0.8: auto-apply with a 5-minute undo toast.
- 0.5–0.8: one-click confirm dialog.
- < 0.5: clarifying-question dialog.
- High-stakes categories (calendar events, deletions, cross-user, payments) always require explicit confirm regardless of confidence.

**Rationale.** A flat "always ask" rule creates click fatigue. A flat "always auto-apply" breaks trust. The confidence router gives the AI a quantified way to escalate the right decisions to the user. High-stakes categories override the router because the cost of a wrong auto-apply is much higher than the friction of a confirm.

---

## 7. RAM-only scanner rule

**Rule.** Any ingestion of third-party content (email, WhatsApp, Telegram, ChatGPT export, Claude export, Obsidian vault, Apple Notes) processes in memory only. Raw source bytes never write to disk or Convex. Only the approved, derived records (tasks, events, commitments, person mentions) persist, after the user approves them via the accept-reject flow.

**Rationale.** Neurodivergent users tend to be privacy-sensitive. The RAM-only posture is a differentiator: Tempo Flow can say "your scan never touched a disk." It is also a candidate patent (the ephemeral-scanner-with-derived-persistence pattern) and a compliance simplifier — there is no "raw messages" table to export or delete because there is no such table.

---

## 8. Generic schema rule

**Rule.** Convex tables are generic. Personalization happens at the AI and render layer. Same `libraryItems` table stores recipes, routines, templates, references, discriminated by a `type` field. User-specific structure emerges from RAG + prompting, not from schema columns.

**Rationale.** Overwhelm-first users have wildly different needs. Person A's "recipes" folder is a precise list; person B's is a brain-dump of cravings. Encoding either shape in the schema serves one and fights the other. A generic schema plus a personalization layer serves both. It also makes the app self-hostable: the generic schema is portable, and the user's RAG is the personalization that travels with them.

---

## 9. Default table fields

**Rule.** Every table has `userId: v.optional(v.string())`, `createdAt: v.number()`, `updatedAt: v.number()`, and `deletedAt: v.optional(v.number())`. Every mutation sets `updatedAt`. Deletes are soft (set `deletedAt = Date.now()`), not hard.

**Rationale.** `userId` optional handles anonymous onboarding and Convex Auth transitional states. `createdAt` + `updatedAt` give us user-visible sort order that does not depend on Convex internals. Soft delete means we can always recover from an AI mis-mutation and it feeds into the 30-day grace window for account deletion under GDPR.

---

## 10. Design tokens only

**Rule.** Only Tailwind utilities generated from our tokens. No arbitrary hex values, no raw Tailwind arbitrary syntax (`bg-[#xxxxxx]`, `text-[13.5px]`, `w-[217px]`). If you need a new token, add it to `packages/ui/src/tokens.ts`.

**Rationale.** Arbitrary values are how design systems erode. Once one file uses `#ff7a00` instead of `text-accent`, the next agent copies it, and within two weeks you have 17 orange-ish oranges and no way to theme. The design-token enforcer (`pnpm scan:design-tokens`) fails the build on arbitrary values.

---

## 11. Accessibility

**Rule.** WCAG 2.1 AA minimum. Screen-reader labels on every interactive element. Keyboard navigation on web. 44x44 dp touch targets on mobile. Focus states visible. OpenDyslexic toggle. Reduced-motion respected.

**Rationale.** Primary audience is neurodivergent. Many have co-occurring visual, motor, or auditory differences. Accessibility is not a nice-to-have — it is the product.

---

## 12. Coach personality dial

**Rule.** `profiles.coachDial: v.number()` in `[0, 10]` controls coach tone. `0` = gentle mentor; `5` = peer friend; `10` = high-intensity accountability archetype. The current value is included in the coach system prompt. Tone comes from this dial only — do not hard-code personality elsewhere.

**Rationale.** Users want different things from the same coach. Someone with low self-compassion may benefit from a gentler tone; someone who habitually avoids work may benefit from firm accountability. A single dial — per-user default, overridable per session — lets the same model serve both without a mode-switch UI.

---

## 13. Voice tracking

**Rule.** Count minutes of real audio, not tokens. Track in `voiceSessions` (`startedAt`, `endedAt`, `durationMs`). Daily cap resets at the user's local midnight. Basic 30 min, Pro 90 min, Max 180 min.

**Rationale.** Users experience voice as time, not as token cost. "3 hours of conversation" is legible; "500k tokens of TTS" is not. Tracking in minutes also makes the degradation path clean: when budget runs out, live voice gates behind an upgrade prompt but walkie-talkie still works.

---

## 14. License hygiene

**Rule.** Do not add a dependency with a license that restricts BSL 1.1 → Apache 2.0 conversion. AGPL direct deps are not acceptable. LGPL dynamic linking, MIT, BSD, Apache, MPL, ISC, Unlicense, CC0 are all acceptable.

**Rationale.** The whole license story only works if we can convert to Apache 2.0 in four years. A single AGPL import would block that. License review is part of every `package.json` diff in PRs.

---

## 15. Compliance plumbing

**Rule.** GetTerms.io embed IDs in Vercel / EAS env vars (`TEMPO_GETTERMS_PRIVACY_ID`, `TEMPO_GETTERMS_TERMS_ID`, `TEMPO_GETTERMS_COOKIES_ID`). DSR button at Settings → Account → Privacy triggers `convex/dsr.ts:requestDataExport` or `requestAccountDeletion`. Account deletion is soft + 30-day grace + hard delete via scheduled job.

**Rationale.** GDPR, Swiss FADP, California CCPA all have teeth. Paying for GetTerms to keep policies current and having a one-click DSR path means the founder does not have to hand-respond to DSR emails at 2 a.m. The 30-day grace window is both a compliance best practice and a safety net against impulsive account deletion by an overwhelmed user.

---

## 16. Testing minimums

**Rule.** Every Convex mutation: one happy-path test + one error-case test. Every component with meaningful logic: a render test. AI routing and confidence router: unit-tested against golden fixtures.

**Rationale.** Solo-founder velocity plus agent-written code is a bug factory without tests. The minimum bar is low enough to not block development, high enough to catch most regressions. Golden-fixture tests on AI routing catch prompt drift when models are swapped.

---

## 17. PR hygiene

**Rule.** One logical change per PR. PR description references the `TASKS.md` ID. PR body includes a summary (2–3 sentences, *why* not *what*), screenshots or screen recording for UI changes, test plan (checkable boxes), and acceptance criteria copied from `TASKS.md`. No direct pushes to `main`. Conventional Commits in titles.

**Rationale.** Small PRs review quickly and revert cleanly. Large PRs sit for days and produce merge conflicts. The structured description is the minimum information a reviewer needs to evaluate the change without going archaeological on the diff.

---

## 18. Secrets

**Rule.** No secrets in the repo. `.env.example` is the canonical list of required variables. Real values in `.env.local` (git-ignored) and Vercel / EAS env var config. Secret scanning runs in CI.

**Rationale.** A committed secret costs hours of rotation and a public embarrassment. Treat `.env.example` as schema, never carry a real value in it.

---

## 19. Kill-switches

**Rule.** Every integration with a third party (RevenueCat, OpenRouter, GetTerms, PostHog, Pokee) has a feature flag in Convex `flags` table that disables the integration path in an emergency. The flag is checked on every request, not just at startup.

**Rationale.** If OpenRouter has an outage, we need to disable AI features gracefully rather than stacking failed requests. If RevenueCat has a billing incident, we need to pause paywall enforcement rather than lock users out. Startup-only flags do not help when a dev server has been running for a week.

---

## 20. When in doubt

- Prefer simplicity over cleverness.
- Prefer Convex primitives over imported libraries.
- Prefer composition over inheritance.
- Prefer small PRs over large PRs.
- Prefer user confirmation over silent automation.
- Ask a clarifying question rather than guess.

If this file conflicts with `HARD_RULES.md`, `HARD_RULES.md` wins.

---

> Tempo Flow is an overwhelm-first product. The code we write should be calm too. Short functions, clear names, no cleverness.


---

## 4.3 .cursorrules

> **Source file:** `_cursorrules`

# Tempo Flow — Cursor rules

Tempo Flow is an open-source, overwhelm-first AI daily planner. Next.js PWA + Expo mobile + Convex + OpenRouter. See `README.md` for the project overview.

## Read these first (every session)

1. **`docs/HARD_RULES.md`** — canonical non-negotiables. Read before touching code.
2. **`docs/TASKS.md`** — find your assigned task by owner tag and update status as you go.
3. **`docs/PRDs/PRD_Phase_1_MVP.md`** — current phase spec. Other phase PRDs under `docs/PRDs/` are for planning context only.
4. **`docs/CURSOR_PROMPTS.md`** — kickoff prompts for each Cursor Cloud cluster.

## Owner tags

Only claim tasks whose owner tag matches your agent identity:

- `cursor-ide` — the local interactive Cursor IDE (the human is watching).
- `cursor-cloud-1` — Core Features cluster: Tasks, Notes, Calendar, Journal, Brain Dump, Search, Templates, Library, Projects, Folders.
- `cursor-cloud-2` — AI and Intelligence cluster: Coach, Planning, AI extraction, RAG, tagging engine, Habits, Goals, Rewards, Analytics.
- `cursor-cloud-3` — Platform and Polish cluster: Auth, Settings, RevenueCat paywall, design-system enforcement, PWA polish, React Native polish, accessibility, OpenDyslexic, voice plumbing.
- `twin`, `pokee`, `zo`, `human-amit` — NOT Cursor. Never pick these up in code.

## Pre-flight rule (every non-trivial task)

Before writing code:

1. List the files you plan to create or modify.
2. Confirm your understanding of the feature against the current phase PRD.
3. List any clarifying questions.
4. Wait for approval before writing code (unless the task is a trivial fix).

## Forbidden tech (never add as a dependency or reference)

- Firebase, Supabase (any service)
- Prisma, Drizzle, TypeORM, any other ORM
- Auth0, Clerk, NextAuth, BetterAuth (we use Convex Auth)
- Stripe direct SDK (we use RevenueCat)
- OpenAI, Anthropic, Google AI direct SDKs (we use OpenRouter)
- Redux, Zustand, Jotai, Recoil, MobX (Convex is reactive by default)
- Axios or any fetch wrapper
- MongoDB, Postgres (any direct DB client)
- Tailwind 3.4 or higher — pin to 3.3.2
- Notion, Linear, Airtable (never referenced in code, env vars, or docs)

## Core engineering rules

- **Accept-reject flow:** the AI coach never silently mutates user state. Every mutation surfaces a confirm / edit / reject card.
- **Confidence router:** auto-apply only when model confidence is ≥ 0.8, always with an undo window. 0.5–0.8 requires a one-click confirm. Below 0.5 opens a clarifying dialog.
- **RAM-only scanner rule:** any third-party content scan (email, WhatsApp, Telegram, chat history imports) processes in memory only. Raw messages never persist to disk or Convex.
- **Generic schema rule:** Convex tables stay generic. User-specific formatting and structure emerge from the AI / render layer, not from schema columns.
- **Every table has:** `userId: v.optional(v.string())`, `createdAt: v.number()`, `updatedAt: v.number()`, `deletedAt: v.optional(v.number())` (soft delete).
- **Voice tracking:** count minutes of real audio, not tokens. Daily caps reset at user's local midnight. Basic 30 min, Pro 90 min, Max 180 min.
- **Coach personality setting:** a numeric 0–10 dial per user, overridable per session. Inject the current value into the system prompt.

## Testing and quality gates

- Every new Convex mutation gets at least one test in `convex/*.test.ts`.
- Every React component with non-trivial logic gets a render test.
- PRs run: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm convex:schema-guard`, `pnpm scan:forbidden-tech`.
- PRs must target a feature branch, never `main` directly.

## Commit style

- Conventional commits: `feat(tasks): ...`, `fix(coach): ...`, `chore(deps): ...`, `docs: ...`.
- One logical change per commit.
- Reference the `TASKS.md` task ID in the PR description: `Task: T-042`.

## Branch naming

- `feat/<task-id>-<short-kebab>` e.g. `feat/T-042-brain-dump-extractor`
- `fix/<task-id>-<short-kebab>`
- `chore/<scope>-<short-kebab>`

## When in doubt

- Prefer simplicity over cleverness.
- Prefer Convex primitives over imported libraries.
- Prefer composition over inheritance.
- If a rule in this file conflicts with `docs/HARD_RULES.md`, `HARD_RULES.md` wins.
- Ask a clarifying question rather than guess.


---

# Part 5 — Task Management & Prompts


---

## 5.1 TASKS.md

> **Source file:** `TASKS.md`

# Tempo Flow — Master Task List

> **Single source of truth for every unit of work across every phase.**
> Cursor IDE + Cursor Cloud agents + Twin + Pokee + Zo + human-amit all read this file.
> Every task has an ID, owner, phase, status, dependencies, and acceptance criteria.
> Update this file in the same PR that changes status. Do not edit status in chat.

---

## Owner legend

| Tag | Who / what |
|---|---|
| `cursor-ide` | Cursor IDE running locally, with Amit present |
| `cursor-cloud-1` | Cursor Cloud background agent — Core Features cluster |
| `cursor-cloud-2` | Cursor Cloud background agent — AI & Intelligence cluster |
| `cursor-cloud-3` | Cursor Cloud background agent — Platform & Polish cluster |
| `twin` | Twin.so browser automation (dashboards, App Store, Play Store, etc.) |
| `pokee` | Pokee AI workflow orchestrator (cross-SaaS publishing, digests, triage) |
| `zo` | Zo Computer long-running cloud job |
| `human-amit` | Amit personally (physical devices, ID verification, payments, patents) |

## Status legend

`todo` — not started · `in-progress` — actively being worked on · `in-review` — PR open · `blocked` — waiting on something external · `done` — merged and verified

---

## Milestone roll-up

### Road to 1.0 (internal milestones inside the MVP phase)
- M0 — Foundation (repo, monorepo, Convex, Vercel, Expo scaffold)
- M1 — Amit's personal daily driver (PWA usable by Amit every day)
- M2 — React Native parity (Expo Go installable by family beta testers)
- M3 — Feature complete (all 42 screens functional on both platforms)
- M4 — Polish & hardening
- M5 — Payments & paywall live
- M6 — Compliance & legal
- M7 — Store submission
- M8 — Public 1.0 launch

### Public phases
- Tempo 1.0 — Foundation (MVP)
- Tempo 1.1 — Presence
- Tempo 1.5 — Memory
- Tempo 2.0 — Connected
- Tempo 3.0 — Ecosystem

---

## Phase 1.0 — Foundation (MVP)

### M0 — Foundation

| ID | Title | Owner | Deps | Status |
|---|---|---|---|---|
| T-0001 | Create GitHub organisation and private repo | human-amit | — | todo |
| T-0002 | Commit BSL 1.1 LICENSE with Additional Use Grant | cursor-ide | T-0001 | todo |
| T-0003 | Add README.md with open-source posture and quick start | cursor-ide | T-0001 | todo |
| T-0004 | Copy .cursorrules to repo root from docs/CURSOR_RULES.md | cursor-ide | T-0001 | todo |
| T-0005 | Initialise pnpm + Turborepo monorepo with `apps/web`, `apps/mobile`, `packages/ui`, `packages/convex`, `packages/config` | cursor-ide | T-0001 | todo |
| T-0006 | Configure TypeScript strict across all workspaces | cursor-ide | T-0005 | todo |
| T-0007 | Configure ESLint + Biome with shared config in `packages/config` | cursor-ide | T-0005 | todo |
| T-0008 | Create Convex account and link dev + prod deployments | human-amit | T-0001 | todo |
| T-0009 | Scaffold Convex schema in `packages/convex` with all 23 core tables | cursor-cloud-1 | T-0008 | todo |
| T-0010 | Add Convex Auth and wire email + passkey flows | cursor-cloud-3 | T-0009 | todo |
| T-0011 | Scaffold Next.js 15 web app with App Router in `apps/web` | cursor-cloud-3 | T-0005 | todo |
| T-0012 | Configure Tailwind 3.3.2 with Soft Editorial tokens in `packages/ui` | cursor-cloud-3 | T-0011 | todo |
| T-0013 | Scaffold Expo 54 app with new architecture in `apps/mobile` | cursor-cloud-3 | T-0005 | todo |
| T-0014 | Configure NativeWind 4 with shared tokens from `packages/ui` | cursor-cloud-3 | T-0013 | todo |
| T-0015 | Create Vercel project and bind to repo | human-amit + twin | T-0011 | todo |
| T-0016 | Deploy first Vercel build; confirm "Hello Tempo" live | cursor-cloud-3 | T-0015 | todo |
| T-0017 | Scaffold all 42 routes on web as empty placeholder pages | cursor-cloud-1 | T-0011 | todo |
| T-0018 | Scaffold all mobile routes as empty placeholder screens | cursor-cloud-1 | T-0013 | todo |
| T-0019 | Set up PostHog opt-in telemetry package | cursor-cloud-3 | T-0011 | todo |
| T-0020 | Set up GitHub Actions: type-check, lint, test, hard-rules scan on every PR | cursor-ide | T-0007 | todo |

### M1 — Amit's personal daily driver

| ID | Title | Owner | Deps | Status |
|---|---|---|---|---|
| T-0100 | Implement `/today` — Today dashboard with greeting, top-3 tasks, quick capture | cursor-cloud-1 | T-0017 | todo |
| T-0101 | Implement `/tasks` list with create, edit, complete, delete, soft-delete | cursor-cloud-1 | T-0009 | todo |
| T-0102 | Implement `/tasks/[id]` detail with subtasks, due date, priority, tags | cursor-cloud-1 | T-0101 | todo |
| T-0103 | Implement `/notes` list with create, rename, delete | cursor-cloud-1 | T-0009 | todo |
| T-0104 | Implement `/notes/[id]` editor with markdown + wiki-links `[[Note]]` | cursor-cloud-1 | T-0103 | todo |
| T-0105 | Implement `/brain-dump` quick capture → auto structured via Gemma | cursor-cloud-2 | T-0103 | todo |
| T-0106 | Implement `/coach` chat v1 with Gemma routing and Mistral fallback | cursor-cloud-2 | T-0009 | todo |
| T-0107 | Wire Convex reactive queries on Today, Tasks, Notes | cursor-cloud-1 | T-0100, T-0101 | todo |
| T-0108 | Implement global Cmd+K command bar with quick capture, navigation, recent | cursor-cloud-3 | T-0017 | todo |
| T-0109 | Amit dogfoods for 3 consecutive days; file issues tagged `dogfood:M1` | human-amit | T-0100–T-0108 | todo |

### M2 — React Native parity

| ID | Title | Owner | Deps | Status |
|---|---|---|---|---|
| T-0200 | Replicate Today screen on Expo with shared Convex queries | cursor-cloud-1 | T-0100 | todo |
| T-0201 | Replicate Tasks list + detail on Expo | cursor-cloud-1 | T-0101, T-0102 | todo |
| T-0202 | Replicate Notes list + editor on Expo | cursor-cloud-1 | T-0103, T-0104 | todo |
| T-0203 | Replicate Brain Dump on Expo | cursor-cloud-1 | T-0105 | todo |
| T-0204 | Replicate Coach chat on Expo | cursor-cloud-2 | T-0106 | todo |
| T-0205 | Replicate Cmd+K as mobile quick-capture FAB | cursor-cloud-3 | T-0108 | todo |
| T-0206 | Configure EAS Build for internal distribution (APK + IPA) | cursor-cloud-3 + twin | T-0013 | todo |
| T-0207 | Share Expo Go QR with 3 beta testers (Mom, sister, friend) | human-amit | T-0206 | todo |
| T-0208 | Collect feedback from beta testers for 3 days, file issues tagged `beta:M2` | human-amit | T-0207 | todo |

### M3 — Feature complete (all 42 screens)

| ID | Title | Owner | Deps | Status |
|---|---|---|---|---|
| T-0300 | Implement `/calendar` month view | cursor-cloud-1 | T-0017 | todo |
| T-0301 | Implement `/calendar/[month]` with drag-to-time-block | cursor-cloud-1 | T-0300 | todo |
| T-0302 | Implement `/journal` list | cursor-cloud-1 | T-0009 | todo |
| T-0303 | Implement `/journal/[date]` entry editor (separate from notes) | cursor-cloud-1 | T-0302 | todo |
| T-0304 | Implement `/habits` with check-ins, streak display | cursor-cloud-2 | T-0009 | todo |
| T-0305 | Implement `/habits/[id]` detail + AI insights | cursor-cloud-2 | T-0304 | todo |
| T-0306 | Implement `/goals` list | cursor-cloud-2 | T-0009 | todo |
| T-0307 | Implement `/goals/[id]` detail + AI breakdown into tasks | cursor-cloud-2 | T-0306 | todo |
| T-0308 | Implement `/projects` list | cursor-cloud-1 | T-0009 | todo |
| T-0309 | Implement `/projects/[id]` detail with linked tasks, notes, goals | cursor-cloud-1 | T-0308 | todo |
| T-0310 | Implement `/folders` tree + drag-drop | cursor-cloud-1 | T-0009 | todo |
| T-0311 | Implement `/templates` list of daily/weekly/monthly/weekend | cursor-cloud-1 | T-0009 | todo |
| T-0312 | Implement natural-language template editor (chat → template) | cursor-cloud-2 | T-0311 | todo |
| T-0313 | Implement picture-sketch template generator (photo → layout) | cursor-cloud-2 | T-0311 | todo |
| T-0314 | Implement calendar-aware template rendering (overrides per day) | cursor-cloud-2 | T-0311, T-0301 | todo |
| T-0315 | Implement `/library` unified typed-item list | cursor-cloud-1 | T-0009 | todo |
| T-0316 | Implement `/library/[itemId]` detail with type-specific editors | cursor-cloud-1 | T-0315 | todo |
| T-0317 | Implement `/search` global search with filters | cursor-cloud-1 | T-0009 | todo |
| T-0318 | Implement `/routines` list and `/routines/[id]` player | cursor-cloud-1 | T-0009 | todo |
| T-0319 | Implement `/rewards` with AI-generated rewards | cursor-cloud-2 | T-0009 | todo |
| T-0320 | Implement `/insights` dashboards (time, energy, completion) | cursor-cloud-2 | T-0009 | todo |
| T-0321 | Implement `/coach` modes: Ask, Agent, Plan | cursor-cloud-2 | T-0106 | todo |
| T-0322 | Implement Magic ToDo (AI task breakdown) | cursor-cloud-2 | T-0101 | todo |
| T-0323 | Implement Formalizer (tone rewrite) | cursor-cloud-2 | T-0104 | todo |
| T-0324 | Implement Estimator (time prediction) | cursor-cloud-2 | T-0101 | todo |
| T-0325 | Implement Compiler (brain dump → structure) | cursor-cloud-2 | T-0105 | todo |
| T-0326 | Implement Accountability Buddy with cron check-ins and personality dial | cursor-cloud-2 | T-0106 | todo |
| T-0327 | Implement auto-tagging engine (backend always on) | cursor-cloud-2 | T-0009 | todo |
| T-0328 | Implement tagging visibility toggle in Settings | cursor-cloud-3 | T-0327 | todo |
| T-0329 | Implement RAG pipeline with embeddings and global retrieval | cursor-cloud-2 | T-0009 | todo |
| T-0330 | Implement contextual memory in coach sessions | cursor-cloud-2 | T-0329 | todo |
| T-0331 | Implement walkie-talkie voice (push-to-talk) for all tiers | cursor-cloud-2 | T-0106 | todo |
| T-0332 | Implement live voice (time-limited) for Pro and Max | cursor-cloud-2 | T-0331 | todo |
| T-0333 | Implement voice-minute tracking in `voice_sessions` | cursor-cloud-2 | T-0331 | todo |
| T-0334 | Implement home screen personalization (layout picker) | cursor-cloud-3 | T-0100 | todo |
| T-0335 | Implement Ask the Founder queue (in-app form → Convex → email) | cursor-cloud-3 | T-0009 | todo |

### M4 — Polish & hardening

| ID | Title | Owner | Deps | Status |
|---|---|---|---|---|
| T-0400 | Empty states across every list and detail screen | cursor-cloud-3 | M3 | todo |
| T-0401 | Error states with recovery actions across every mutation | cursor-cloud-3 | M3 | todo |
| T-0402 | Skeleton loading states for every route | cursor-cloud-3 | M3 | todo |
| T-0403 | Light + dark mode audit across every screen | cursor-cloud-3 | M3 | todo |
| T-0404 | OpenDyslexic toggle plumbed to body copy everywhere | cursor-cloud-3 | M3 | todo |
| T-0405 | Accessibility sweep — axe-core zero violations on web | cursor-cloud-3 | M3 | todo |
| T-0406 | Accessibility sweep — RN accessibility API on mobile | cursor-cloud-3 | M3 | todo |
| T-0407 | Performance budget — Today route < 2 s TTI on 3G web | cursor-cloud-3 | M3 | todo |
| T-0408 | Performance budget — cold start < 2.5 s on mid-tier Android | cursor-cloud-3 | M3 | todo |
| T-0409 | Convex query optimisation — add indexes for all .withIndex usage | cursor-cloud-1 | M3 | todo |

### M5 — Payments & paywall

| ID | Title | Owner | Deps | Status |
|---|---|---|---|---|
| T-0500 | Create RevenueCat account | human-amit | — | todo |
| T-0501 | Create products: tempo_basic_monthly, tempo_basic_annual, tempo_pro_monthly, tempo_pro_annual, tempo_max_monthly, tempo_max_annual, tempo_trial_7day | twin | T-0500 | todo |
| T-0502 | Create entitlements: basic, pro, max | twin | T-0501 | todo |
| T-0503 | Create offerings with $1 trial paywall | twin | T-0502 | todo |
| T-0504 | Wire RevenueCat SDK on web + iOS + Android | cursor-cloud-3 | T-0503 | todo |
| T-0505 | Implement paywall screen (after signup, before onboarding) | cursor-cloud-3 | T-0504 | todo |
| T-0506 | Implement entitlement gating on Pro/Max features (EF coach, live voice) | cursor-cloud-3 | T-0504 | todo |
| T-0507 | Wire RevenueCat webhooks to Convex for server-side verification | cursor-cloud-3 | T-0504 | todo |
| T-0508 | Add Donate button in Settings → About (Ko-fi + BMC + GitHub Sponsors links) | cursor-cloud-3 | T-0017 | todo |
| T-0509 | Test the full payment flow end-to-end with real $1 trial | human-amit | T-0505 | todo |

### M6 — Compliance & legal

| ID | Title | Owner | Deps | Status |
|---|---|---|---|---|
| T-0600 | Create GetTerms.io account | human-amit | — | todo |
| T-0601 | Generate privacy policy, terms, cookie policy; copy embed IDs | twin | T-0600 | todo |
| T-0602 | Embed compliance copy in `/legal/privacy`, `/legal/terms`, `/legal/cookies` | cursor-cloud-3 | T-0601 | todo |
| T-0603 | Embed cookie banner (GetTerms-provided) | cursor-cloud-3 | T-0601 | todo |
| T-0604 | Implement DSR workflow (export, delete, rectify) via Convex actions | cursor-cloud-3 | T-0009 | todo |
| T-0605 | Fill App Store App Privacy labels | twin | T-0601 | todo |
| T-0606 | Fill Google Play Data Safety form | twin | T-0601 | todo |
| T-0607 | Legal review of BSL Additional Use Grant wording (optional, recommended) | human-amit | — | todo |
| T-0608 | Patent candidate inventory — file list with IP lawyer | human-amit | — | todo |

### M7 — Store submission

| ID | Title | Owner | Deps | Status |
|---|---|---|---|---|
| T-0700 | Enrol in Apple Developer Program ($99/year) | human-amit | — | todo |
| T-0701 | Enrol in Google Play Developer account ($25 one-time) | human-amit | — | todo |
| T-0702 | Create App Store Connect record with metadata | twin | T-0700 | todo |
| T-0703 | Create Google Play Console record with metadata | twin | T-0701 | todo |
| T-0704 | Generate screenshots for iPhone 6.7", 6.5", 5.5" | human-amit + zo | T-0400 | todo |
| T-0705 | Generate screenshots for iPad 12.9" and 11" | human-amit + zo | T-0400 | todo |
| T-0706 | Generate screenshots for Android phone and 7" + 10" tablet | human-amit + zo | T-0400 | todo |
| T-0707 | Write App Store description and keyword list | zo + cursor-ide | — | todo |
| T-0708 | Write Play Store description and short description | zo + cursor-ide | — | todo |
| T-0709 | Configure EAS Build production profile | cursor-cloud-3 | T-0206 | todo |
| T-0710 | Submit first TestFlight build | cursor-cloud-3 + human-amit | T-0709 | todo |
| T-0711 | Submit first Play Console internal testing build | cursor-cloud-3 + human-amit | T-0709 | todo |
| T-0712 | Run store-reviewable smoke test; fix issues | cursor-cloud-3 | T-0710 | todo |
| T-0713 | Submit for App Store review | twin + human-amit | T-0712 | todo |
| T-0714 | Submit for Play Store review | twin + human-amit | T-0712 | todo |
| T-0715 | Buy tempoflow.app domain + bind to Vercel | human-amit + twin | — | todo |
| T-0716 | Configure DNS + SSL | twin | T-0715 | todo |
| T-0717 | Deploy PWA as internal tool for authorized users (SEO builds during review wait) | cursor-cloud-3 | T-0716 | todo |

### M8 — Public 1.0 launch

| ID | Title | Owner | Deps | Status |
|---|---|---|---|---|
| T-0800 | App Store approval received | human-amit | T-0713 | todo |
| T-0801 | Play Store approval received | human-amit | T-0714 | todo |
| T-0802 | Public launch checklist: PWA public, stores live, paywall live, donate live | human-amit | T-0800, T-0801 | todo |
| T-0803 | Cross-post release announcement to social channels | pokee | T-0802 | todo |
| T-0804 | Open source repo: make public, add CONTRIBUTING.md, CODE_OF_CONDUCT.md | cursor-ide + human-amit | T-0802 | todo |
| T-0805 | First founder vlog episode: "Why I built Tempo Flow" | human-amit | T-0802 | todo |
| T-0806 | Create Discord server with sponsor role gating | human-amit | — | todo |
| T-0807 | Wire GitHub Sponsors tiers to Discord roles | pokee | T-0806 | todo |
| T-0808 | Monitor PostHog for 24 h, triage any crash reports | cursor-cloud-3 + pokee | T-0802 | todo |

---

## Phase 1.1 — Presence

| ID | Title | Owner | Deps | Status |
|---|---|---|---|---|
| T-1100 | Embed founder vlog in-app (Settings → About → Vlog card) | cursor-cloud-3 | T-0805 | todo |
| T-1101 | Publish public Ask the Founder transcripts (opt-in per submission) | cursor-cloud-3 | T-0335 | todo |
| T-1102 | Add open-source badge + repo link in Settings → About | cursor-cloud-3 | T-0804 | todo |
| T-1103 | Publish community changelog at /changelog | cursor-cloud-3 + pokee | — | todo |
| T-1104 | Write CONTRIBUTING.md with dev setup, test commands, PR guidelines | cursor-ide | T-0804 | todo |
| T-1105 | Write CODE_OF_CONDUCT.md (adapted from Contributor Covenant) | cursor-ide | T-0804 | todo |
| T-1106 | Add Dependabot + security scanning | cursor-cloud-3 | T-0804 | todo |
| T-1107 | Scaffold plugin SDK skeleton (types, manifest spec, sandboxing plan) | cursor-cloud-2 | T-0804 | todo |
| T-1108 | Polish pass on every issue filed during 1.0 public launch | cursor-cloud-1/2/3 | T-0808 | todo |

---

## Phase 1.5 — Memory

| ID | Title | Owner | Deps | Status |
|---|---|---|---|---|
| T-1500 | Implement NotebookLM-style scoped RAG (user selects sources; queries limited to scope) | cursor-cloud-2 | T-0329 | todo |
| T-1501 | Scope switcher in chat input (global / project / notebook / tag selection) | cursor-cloud-2 | T-1500 | todo |
| T-1502 | Implement flashcard generation from notes via AI | cursor-cloud-2 | T-0103 | todo |
| T-1503 | Implement spaced repetition scheduler (SM-2 or FSRS) | cursor-cloud-2 | T-1502 | todo |
| T-1504 | Implement recall quiz surface (/recall) | cursor-cloud-2 | T-1503 | todo |
| T-1505 | Implement Anki export (.apkg file generation) | cursor-cloud-2 | T-1502 | todo |
| T-1506 | Implement RemNote sync (API integration if available) | cursor-cloud-2 | T-1502 | todo |
| T-1507 | BYOK settings UI — user adds OpenAI, Anthropic, OpenRouter, Mistral keys | cursor-cloud-3 | T-0009 | todo |
| T-1508 | BYOK routing — per-feature model override | cursor-cloud-2 | T-1507 | todo |
| T-1509 | Quantized Gemma on-device integration via MLC-LLM or ExecuTorch | cursor-cloud-2 + zo | T-0013 | todo |
| T-1510 | Privacy-mode toggle (online / offline-preferred / privacy-strict) | cursor-cloud-3 | T-1509 | todo |
| T-1511 | Offline queue for Convex mutations | cursor-cloud-3 | T-1510 | todo |
| T-1512 | Publish plugin SDK v1 with first-party plugin example | cursor-cloud-2 | T-1107 | todo |
| T-1513 | Audible Library import plugin (reference first-party plugin) | cursor-cloud-1 | T-1512 | todo |
| T-1514 | Goodreads plugin (reference first-party plugin) | cursor-cloud-1 | T-1512 | todo |
| T-1515 | Expand Library types for study (flashcard deck, concept map, cheat sheet) | cursor-cloud-1 | T-0315 | todo |

---

## Phase 2.0 — Connected

| ID | Title | Owner | Deps | Status |
|---|---|---|---|---|
| T-2000 | Google Calendar two-way sync | cursor-cloud-1 | T-0301 | todo |
| T-2001 | Apple Calendar two-way sync (via CalDAV or EventKit on iOS) | cursor-cloud-1 | T-0301 | todo |
| T-2002 | Apple Health read integration (sleep, activity, HRV) | cursor-cloud-1 | T-0013 | todo |
| T-2003 | Google Fit read integration | cursor-cloud-1 | T-0013 | todo |
| T-2004 | ChatGPT export importer (RAM-only processing; extract tasks + mentions) | cursor-cloud-2 | T-0329 | todo |
| T-2005 | Claude conversation export importer (RAM-only) | cursor-cloud-2 | T-0329 | todo |
| T-2006 | Cursor MCP server (read tasks, add tasks, read/append today's note, query RAG) | cursor-cloud-2 | T-0329 | todo |
| T-2007 | Claude Code MCP server (shared codebase with Cursor MCP) | cursor-cloud-2 | T-2006 | todo |
| T-2008 | tempo-cli npm package (task add, today, brain-dump, coach) | cursor-cloud-2 | T-0009 | todo |
| T-2009 | Browser extension (Chrome / Firefox) for Replit, Lovable, v0, Bolt | cursor-cloud-2 | T-0009 | todo |
| T-2010 | Public REST API v1 (OpenAPI spec + key rotation) | cursor-cloud-2 | T-0009 | todo |
| T-2011 | Webhooks outbound (task.created, coach.message, etc.) | cursor-cloud-2 | T-2010 | todo |
| T-2012 | Photo accountability — photo upload + AI verification | cursor-cloud-2 | T-0009 | todo |
| T-2013 | WhatsApp bridge (RAM-only scanner, 30-min cycle) | cursor-cloud-2 | T-0009 | todo |
| T-2014 | Telegram bridge (RAM-only scanner) | cursor-cloud-2 | T-0009 | todo |
| T-2015 | Bluetooth sync between devices (air-gap friendly) | cursor-cloud-2 | T-1510 | todo |
| T-2016 | VTuber avatar body-double for Max tier (preset + BYOK image/video APIs) | cursor-cloud-2 | T-0332 | todo |
| T-2017 | BYOK expand to TTS, STT, embeddings, image generation | cursor-cloud-2 | T-1507 | todo |
| T-2018 | Crypto donations (BTC, ETH, SOL, XMR) in Settings → About | cursor-cloud-3 | T-0508 | todo |

---

## Phase 3.0 — Ecosystem

| ID | Title | Owner | Deps | Status |
|---|---|---|---|---|
| T-3000 | Khan Academy read-only progress integration | cursor-cloud-1 | T-0308 | todo |
| T-3001 | Udemy read-only progress integration | cursor-cloud-1 | T-0308 | todo |
| T-3002 | Skool integration (group and course tracking) | cursor-cloud-1 | T-0308 | todo |
| T-3003 | Teachable integration | cursor-cloud-1 | T-0308 | todo |
| T-3004 | Coursera integration | cursor-cloud-1 | T-0308 | todo |
| T-3005 | edX integration | cursor-cloud-1 | T-0308 | todo |
| T-3006 | Bi-directional builder sync — push Tempo task to Cursor / Windsurf / Replit / Lovable | cursor-cloud-2 | T-2006, T-2009 | todo |
| T-3007 | Pull builder status back to Tempo (git commits, PR merges, chat transcripts) | cursor-cloud-2 | T-3006 | todo |
| T-3008 | Advanced confidence-router semantic permissions v2 | cursor-cloud-2 | T-0106 | todo |
| T-3009 | Community template gallery (publish + fork + install) | cursor-cloud-1 | T-0311 | todo |
| T-3010 | EU/Swiss-hosted inference as user-selectable region (Infomaniak AI or similar) | cursor-cloud-2 | T-1507 | todo |
| T-3011 | Plugin marketplace with third-party monetisation (Patreon, Ko-fi, BMC) | cursor-cloud-2 | T-1512 | todo |
| T-3012 | Community-contributed avatars marketplace | cursor-cloud-2 | T-2016 | todo |

---

## Standing tasks (always-on)

| ID | Title | Owner | Cadence |
|---|---|---|---|
| T-S-01 | Daily PostHog + Sentry digest to Amit | pokee | daily |
| T-S-02 | Weekly GitHub issue triage | pokee + cursor-ide | weekly |
| T-S-03 | Monthly dependency updates | cursor-cloud-3 | monthly |
| T-S-04 | Quarterly accessibility audit | cursor-cloud-3 | quarterly |
| T-S-05 | Quarterly hard-rules review | human-amit | quarterly |
| T-S-06 | Ask the Founder queue triage (daily pickup) | pokee + human-amit | daily |
| T-S-07 | OpenRouter cost report | pokee | weekly |
| T-S-08 | Release notes drafting for each version bump | cursor-ide + zo | per release |

---

## How to add a task

1. Pick the next ID in the current phase's ID range (e.g., `T-03xx` for M3).
2. Add a row with title, owner, deps, status.
3. Reference any PRD section the task came from in the PR that adds the task.
4. Do not skip IDs. Do not reuse IDs.

## How to update a task

- Move to `in-progress` when you start. Post to Discord `#agent-<your-name>`.
- Move to `in-review` when you open a PR. Include the PR link in the Git log; the task row stays as `in-review`.
- Move to `done` only after the PR merges and deploys green.
- Move to `blocked` with a one-line reason and a link to the Discord `#blocked` post.

## How to archive a task

When all tasks in a phase are `done`, cut that section out of this file and into `docs/ARCHIVE/PHASE_X_TASKS.md`. Keep the active file short.


---

## 5.2 CURSOR_PROMPTS.md

> **Source file:** `CURSOR_PROMPTS.md`

# Tempo Flow — Cursor Prompt Library

> A library of reusable prompts for Cursor IDE agents and Cursor Cloud background agents.
> Copy the prompt, paste into Cursor, fill the placeholders in `[[ brackets ]]`, and run.
> Every prompt assumes Cursor has read `.cursorrules`, `docs/HARD_RULES.md`, and the active phase PRD.

---

## Table of contents

1. Session preamble (prepend to every prompt)
2. Master kickoff — Cursor Cloud Agent 1 (Core Features)
3. Master kickoff — Cursor Cloud Agent 2 (AI & Intelligence)
4. Master kickoff — Cursor Cloud Agent 3 (Platform & Polish)
5. Feature implementation template
6. Debug template
7. Write tests template
8. PR review template
9. Schema migration template
10. Refactor template
11. Accessibility sweep template
12. Performance investigation template
13. Background Agent automation prompts
14. Pre-flight clarifying question preamble

---

## 1. Session preamble

Prepend this to every prompt so Cursor reads the right context.

```
Before you write any code:

1. Read docs/HARD_RULES.md in full.
2. Read docs/CURSOR_RULES.md in full.
3. Read the phase PRD referenced by the task ID (docs/PRDs/PRD_Phase_X.md).
4. Read the task entry in docs/TASKS.md that you're about to work on.
5. If anything in these documents conflicts with my instructions, HARD_RULES wins — ask me instead of guessing.

Once you've read the above, confirm back to me in one paragraph: the task ID you're on, the acceptance criteria, and any ambiguity you see. Do not start coding yet.
```

---

## 2. Master kickoff — Cursor Cloud Agent 1 (Core Features)

Use when you spin up the first cloud agent and assign it the Core Features cluster.

```
You are Cursor Cloud Agent 1 — "Core Features" for the Tempo Flow project.

Scope of your ownership:
- Tasks (routes /tasks, /tasks/[id], related components)
- Notes and the daily markdown note surface
- Calendar (routes /calendar, /calendar/[month])
- Journal (routes /journal, /journal/[date])
- Brain Dump (/brain-dump, /brain-dump/session)
- Global Search (/search with command-bar integration)
- Templates system (/templates + sketch-to-template generator)
- Library system (/library with typed items: prompts, recipes, routines, formats, references)
- Projects and Folders (/projects, /folders)

Boundaries:
- You do not touch: auth, paywall, RevenueCat integration, Settings, Coach chat, RAG, AI extraction, voice mode, analytics, design-system primitives.
- When your feature needs those, import from the packages owned by Agents 2 and 3. Do not reimplement.

Working method:
1. Open docs/TASKS.md. Find tasks tagged `cluster:core-features` and `status:todo`.
2. Pick the highest-priority task with no blocking dependencies.
3. Follow the session preamble in CURSOR_PROMPTS.md §1.
4. Write the code. Write the tests. Run tsc --noEmit. Run the test suite.
5. Open a PR titled `[T-XXXX] <task title>`. Include in the PR body: what you built, acceptance criteria mapping, screenshots if UI.
6. Update docs/TASKS.md to set the task to `status:in-review`.
7. Post a one-line status update to the Discord `#agent-cursor` channel via the webhook.
8. Pick the next task.

When stuck:
- If you hit a HARD_RULES violation, stop, open an issue tagged `needs:human-amit`, post to `#blocked`, move on to another task.
- If you need a dashboard action (App Store, RevenueCat, etc.), open an issue tagged `needs:twin` and move on.

Start now.
```

---

## 3. Master kickoff — Cursor Cloud Agent 2 (AI & Intelligence)

```
You are Cursor Cloud Agent 2 — "AI & Intelligence" for the Tempo Flow project.

Scope of your ownership:
- Coach chat surface (/coach with all modes: Ask, Agent, Plan)
- AI extraction pipelines (brain dump → structured, natural language → template, photo → accountability)
- RAG pipeline — embeddings, retrieval, scoped queries, graph traversal
- Tagging engine — auto-tagging, entity extraction, wiki-link resolution
- Habits and Goals (routes /habits, /goals with AI breakdown support)
- Rewards system
- Analytics and insights (/insights dashboards for the user)
- Confidence router — the policy that decides when the AI acts vs asks
- Personality dial — the 0–10 coach temperament parameter
- AI usage tracking (ai_usage table, per-tier rate limits)
- Voice-mode integration with the walkie-talkie and live voice surfaces (coordinate with Agent 3 on the UI shell)

Boundaries:
- You do not touch: auth, paywall, route shells, design primitives, settings.
- You do implement the AI plumbing that those surfaces call into.

Working method: identical to Agent 1.

Start now.
```

---

## 4. Master kickoff — Cursor Cloud Agent 3 (Platform & Polish)

```
You are Cursor Cloud Agent 3 — "Platform & Polish" for the Tempo Flow project.

Scope of your ownership:
- Auth (sign up, sign in, magic link, session management via Convex Auth)
- Settings (/settings with all sub-pages: account, appearance, privacy, integrations, about)
- Paywall and RevenueCat integration
- Design system primitives (buttons, inputs, cards, dialogs, sheets, toasts)
- PWA shell (manifest, service worker, install prompt, offline banner)
- React Native shell (navigation, tab bar, status bar, safe area)
- Accessibility pass (focus management, screen reader labels, reduced motion)
- OpenDyslexic toggle plumbing
- Performance (route-level code splitting, image optimization, Convex query batching)
- BYOK settings UI (Phase 1.5+)
- Privacy mode toggle
- Compliance copy (privacy policy, terms, cookie banner from GetTerms)
- PostHog wiring (opt-in telemetry)

Boundaries:
- You do not own feature code (Tasks, Notes, Calendar, Coach, etc.). You expose the shell they live inside.

Working method: identical to Agent 1.

Start now.
```

---

## 5. Feature implementation template

For any new feature task.

```
Task: [[T-XXXX]] — [[task title]]

1. Read docs/HARD_RULES.md, docs/CURSOR_RULES.md, and the relevant phase PRD section.
2. Summarize back to me in 3 bullet points:
   - What you'll build
   - Which files you'll create or modify
   - Any HARD_RULES you think might bite this feature
3. Wait for my confirmation before writing code.

Acceptance criteria (from docs/TASKS.md):
[[paste acceptance criteria here]]

Files in scope:
[[paste file paths or modules here if known]]

Out of scope for this task:
[[anything explicitly deferred]]
```

---

## 6. Debug template

```
Bug report: [[one-line description]]

Reproduction:
1. [[step 1]]
2. [[step 2]]
3. [[observed outcome]]
4. [[expected outcome]]

Relevant files you may need to read:
[[paste paths]]

Relevant recent commits:
[[paste commit hashes or PR numbers if known]]

Before writing a fix:
- Reproduce the bug locally and show me the failing test or console output.
- State your hypothesis for the root cause in one paragraph.
- Propose the smallest possible fix.

Wait for my confirmation of the hypothesis before writing the patch.

After the patch:
- Add a regression test that would fail without the fix.
- Run the full test suite.
- Confirm tsc and lint still pass.
```

---

## 7. Write tests template

```
Task: add test coverage for [[module or feature]].

Scope:
- [[file or function paths]]

Approach:
1. List the public surface of the module (exported functions, components, hooks, mutations).
2. For each, enumerate the happy path and 2–3 edge cases.
3. Write unit tests using the project's testing framework (Vitest on web, Jest on RN for now).
4. For Convex queries and mutations, use convex-test or the project's mocked Convex harness.
5. Run the tests. Ensure they pass.
6. Report coverage before and after.

Do not add new test frameworks or tooling. Work with what's in the repo.
```

---

## 8. PR review template

```
Review PR #[[number]] against the project's rules.

Check:
1. Does the PR reference a task ID in the title?
2. Does it violate anything in docs/HARD_RULES.md?
3. Are all modified schema fields using v.optional(v.string()) for userId?
4. Are all new UI pieces using approved Tailwind tokens (no arbitrary values)?
5. Is there an AI mutation that isn't surfaced to the user via the accept-reject flow?
6. Are there new dependencies? If so, are they on the approved list?
7. Is light + dark mode covered?
8. Are there tests for new Convex logic?
9. Are AI calls logged to ai_usage?
10. Is there any persisted raw message content from a scanner (must be RAM-only)?

Produce a review with:
- Summary: one paragraph of what the PR does.
- Blockers: rule violations that must be fixed before merge.
- Suggestions: non-blocking improvements.
- Nits: style and readability.

If there are no blockers, approve. If there are blockers, request changes.
```

---

## 9. Schema migration template

```
Migration task: [[T-XXXX]] — [[description]]

Before you write any migration code:
1. Read convex/schema.ts in full.
2. Read docs/HARD_RULES.md §3 (schema rules).
3. Summarize the diff you plan to apply.
4. Identify any indexes that need updating.
5. Identify any reads or writes in existing code that touch the changed fields.

Rules for this migration:
- Additive changes only where possible (add fields as v.optional(); never delete fields in the same migration as a rename).
- Backfill with a Convex action that processes in batches of 100 rows with logging.
- Add an index if the new field is queryable.
- Write a rollback note in the migration file header.

Files to touch:
- convex/schema.ts
- convex/migrations/<date>_<description>.ts
- All call sites that read or write the changed fields

Wait for my confirmation of the plan before modifying schema.
```

---

## 10. Refactor template

```
Refactor task: [[T-XXXX]] — [[description]]

Before any code changes:
1. List every file that imports or is imported by the refactor target.
2. Describe the current behaviour in one paragraph.
3. Describe the target behaviour in one paragraph.
4. Identify the smallest set of changes that achieves the target.

Rules:
- Behaviour must not change. Tests must pass before and after.
- No rename + logic change in the same commit. Split them.
- If the refactor spans multiple packages, land one package per PR.
```

---

## 11. Accessibility sweep template

```
Accessibility sweep for [[route or component]]:

Checklist:
- Keyboard navigation: can every action be reached and activated with Tab + Enter + Space + Arrow keys?
- Focus states: visible on every interactive element, not clipped by parent overflow.
- Screen reader labels: every icon-only button has aria-label; every input has an associated label; every landmark has a role.
- Color contrast: 4.5:1 for body text, 3:1 for UI components. Use the project's token contrast helper.
- Motion: any animation > 200ms respects prefers-reduced-motion.
- Touch targets: 44x44 pt minimum on mobile.
- Forms: errors announced via aria-live. Validation on blur, not on every keystroke.
- Modals: focus trap, return focus to trigger on close, Esc closes.

Run axe-core on web and the RN accessibility API. Fix every violation. Report the before/after counts.
```

---

## 12. Performance investigation template

```
Performance task: [[T-XXXX]] — [[metric or symptom]]

Investigation order:
1. Measure the baseline. Screenshot the devtools waterfall or the Convex query dashboard.
2. Identify the top three time sinks.
3. Propose the smallest fix for each.
4. Wait for my OK before implementing.

Common Tempo-specific fixes to consider:
- Add a Convex index if you see .filter() on a large table.
- Batch sibling Convex queries by consolidating into one query with multiple returns.
- Lazy-load routes that aren't on the critical path.
- Defer non-critical image loading with next/image lazy or expo-image cachePolicy.
- Debounce AI extraction triggers (brain dump, natural language template) to 500 ms idle.

Report baseline numbers and post-fix numbers in the PR description.
```

---

## 13. Background Agent automation prompts

Short, recurring prompts for the Cursor Background Agent (or GitHub Actions equivalents).

### 13.1 Forbidden tech scanner

```
Scan the repository for forbidden imports and dependencies:
- Check package.json for any package in the forbidden list (HARD_RULES §2).
- Grep the codebase for imports from forbidden packages.
- If any are found, open a GitHub issue with the offending file paths and the rule violated.
```

### 13.2 Schema guard

```
On every change to convex/schema.ts:
- Confirm every userId field is v.optional(v.string()).
- Confirm every table has createdAt and updatedAt.
- Confirm every table has tenantId: v.optional(v.string()).
- Confirm no table has a soft-delete replacement (deletedAt absent from a table that used to have it).
- If any check fails, block the merge and comment on the PR with the rule violated.
```

### 13.3 Design token enforcer

```
Scan all .tsx, .jsx, and .mdx files for:
- Arbitrary Tailwind values: `text-\[#`, `p-\[`, `m-\[`, `w-\[`, `h-\[`, etc.
- Non-Lucide icon imports.
- Inline style= props on components where a Tailwind class exists.

If found, comment on the PR with the rule violated and the line numbers.
```

### 13.4 AI call audit

```
Scan all files touching OpenRouter:
- Every fetch call to OpenRouter must log to ai_usage.
- Every fetch call must include the X-Tempo-No-Train header.
- No provider SDK imports allowed.

Block merge if violations found.
```

### 13.5 RAM-only scanner audit

```
For any code that ingests email, WhatsApp, Telegram, or third-party message content:
- Confirm no persistence of raw content to Convex tables.
- Confirm no writes to disk other than OS-level temp cleanup.
- Confirm scanner function is explicitly marked with `// @ramOnly` comment.

Block merge if raw content is persisted anywhere.
```

### 13.6 Accessibility regression check

```
Run axe-core against the Playwright snapshot set on every PR.
If new violations appear compared to main, block the merge with details.
```

### 13.7 Voice-minute telemetry audit

```
Every voice session start must:
- Write a row to voice_sessions with tier, mode (walkie / live), startedAt.
- Every session end writes endedAt and minutes.
- The ai_usage rate limiter reads the user's tier daily cap and blocks further live-voice calls when exceeded.

If any of these are missing, block merge.
```

---

## 14. Pre-flight clarifying question preamble

Use this before any task that touches unfamiliar surface area.

```
Before writing any code, ask me clarifying questions about:

- Ambiguous acceptance criteria
- Edge cases not covered in the PRD
- Dependencies on other tasks that may not be complete
- UI affordances (where exactly does this button live, what's the empty state, what's the error state)
- Data model decisions (what tables, what indexes)
- Migration strategy if schema changes

Put your questions in a numbered list. I will answer them before you start writing. Do not guess.
```

---

**Usage pattern:** combine the session preamble (§1) + the right template. For example, to implement a new feature, concatenate §1 + §5 and fill the placeholders. For a background automation, reference the relevant §13 entry in the GitHub Actions workflow or Cursor Background Agent config.

**Keep this file updated.** Every time you find a prompt pattern you reuse more than twice, add it here so every agent benefits.


---

# Part 6 — Tempo-Specific Agent Setup


---

## 6.1 Agent Handoff Map

> **Source file:** `agent_handoff_map.md`

# Tempo Flow Agent Handoff Map — Orchestration Reference

## 1. Overview

Tempo Flow development is coordinated by a four-agent system operating alongside Amit's own Cursor IDE. Each agent occupies a distinct role in the production pipeline:

- **Cursor Cloud (background agents)** — three parallel clusters writing and reviewing code, opening pull requests, and iterating on features defined in TASKS.md.
- **Twin.so** — browser automation executor for all GUI-gated dashboard operations (App Store, Play Store, RevenueCat, GetTerms, Vercel, EAS, etc.).
- **Pokee AI** — the router and cross-poster; receives events from GitHub and Convex, dispatches work to other agents, cross-posts releases, sends digests, and triages incoming messages.
- **Zo Computer** — heavy compute executor; runs long overnight jobs, batch asset generation, transcription pipelines, release bundling, and R&D workloads.

These four agents do not coordinate directly with each other. All coordination flows through the **agent spine**: the set of infrastructure components described in Section 2. The spine ensures that every agent action is visible, auditable, and recoverable.

No external project management tools (Notion, Linear, Airtable) are used. The spine is built entirely from GitHub, Convex, Discord, and the repository itself. See Section 3 for the rationale.

---

## 2. Components of the Spine

### 2.1 GitHub

GitHub is the source of truth for all code, planned work, and product releases.

**Repositories**: All Tempo Flow code lives in the primary monorepo (`tempoflow`). No separate repos per agent — all agents branch from and merge to the same repository.

**Issues**: Every feature, bug, and task surfaces as a GitHub Issue. Labels distinguish type (`bug`, `enhancement`, `docs`, `backend`, `frontend`, `needs-twin`, `needs-zo`, `needs-review`) and owner (`cursor-cloud`, `twin`, `zo`, `amit`). Issues are not created by agents autonomously — they are either created by Amit or generated by Pokee's Issue Triage workflow in response to user bug reports.

**GitHub Projects (board)**: A single board with columns: `Backlog | In Progress | In Review | Done`. Items map one-to-one with Issues. Cursor Cloud agents move cards by updating issue state and labels via the GitHub API. Amit triages the Backlog column.

**Releases**: GitHub Releases are tagged from `main` using semantic versioning (`v1.0.0`, `v1.1.0`, etc.). A GitHub Release triggers the Pokee fan-out (see Section 5.3). Release notes are auto-generated from merged PR titles and then edited by Amit before publishing.

**GitHub Actions**: CI/CD pipelines defined in `.github/workflows/` handle build, test, lint, and deployment. Key actions:
- `ci.yml` — runs on every PR: TypeScript check, ESLint, Convex schema validation, unit tests.
- `deploy-preview.yml` — deploys to Vercel preview environment on PR open.
- `deploy-production.yml` — deploys to Vercel production on merge to `main`.
- `notify-pokee.yml` — sends webhook to Pokee on `pull_request.merged` and `release.published`.
- `update-tasks.yml` — updates TASKS.md task status when a PR with a `[TASK-XXX]` reference is merged.

### 2.2 Convex `agent_*` Tables

Convex serves as the runtime state store for in-flight agent jobs. Four tables are defined in `convex/schema.ts`:

**`agent_runs`**: One row per agent job execution. Written by agents when a job starts and updated on completion or failure.
```typescript
agent_runs: defineTable({
  agent: v.union(v.literal("cursor-cloud"), v.literal("twin"), v.literal("pokee"), v.literal("zo")),
  job: v.string(),                       // e.g. "nightly-sweep", "release-cross-post"
  status: v.union(
    v.literal("in-progress"),
    v.literal("complete"),
    v.literal("failed"),
    v.literal("cancelled-timeout"),
    v.literal("cancelled-awaiting-human")
  ),
  started_at: v.string(),                // ISO timestamp
  finished_at: v.optional(v.string()),
  pr_url: v.optional(v.string()),
  error: v.optional(v.string()),
  event_id: v.string(),                  // Unique event ID for idempotency (see Section 8)
})
```

**`agent_tasks`**: Tasks that have been assigned to a specific agent from TASKS.md or GitHub Issues, with current execution state.
```typescript
agent_tasks: defineTable({
  task_id: v.string(),                   // TASKS.md ID, e.g. "TASK-042"
  issue_number: v.optional(v.number()), // GitHub Issue number if linked
  assigned_agent: v.string(),
  title: v.string(),
  status: v.union(
    v.literal("queued"),
    v.literal("in-progress"),
    v.literal("blocked"),
    v.literal("complete"),
    v.literal("deferred")
  ),
  branch: v.optional(v.string()),
  pr_url: v.optional(v.string()),
  event_id: v.string(),
})
```

**`agent_handoffs`**: Records of one agent handing work to another, including the payload passed.
```typescript
agent_handoffs: defineTable({
  from_agent: v.string(),
  to_agent: v.string(),
  handoff_type: v.string(),             // e.g. "pr-review", "build-submit", "asset-announce"
  payload: v.any(),                      // JSON blob of handoff data
  status: v.union(
    v.literal("pending"),
    v.literal("accepted"),
    v.literal("completed"),
    v.literal("failed")
  ),
  created_at: v.string(),
  event_id: v.string(),
})
```

**`agent_artifacts`**: Artifacts produced by Zo that other agents or humans need to access.
```typescript
agent_artifacts: defineTable({
  agent: v.literal("zo"),
  type: v.union(
    v.literal("release-bundle"),
    v.literal("assets"),
    v.literal("transcript-pipeline"),
    v.literal("nightly-sweep")
  ),
  release: v.optional(v.string()),
  artifact_path: v.string(),
  manifest_url: v.optional(v.string()),
  timestamp: v.string(),
  event_id: v.string(),
})
```

All four tables are indexed on `event_id` for idempotent deduplication (Section 8) and on `agent` + `status` for the admin dashboard (Section 7).

### 2.3 Discord

Discord is the human-in-the-loop observability and escalation layer. Amit reads Discord to understand what agents are doing and to take action on blocked items. Agents do not read each other's Discord messages — they receive structured handoff payloads via Convex webhooks. Discord is for human visibility, not agent-to-agent communication.

Channel conventions are defined in full in Section 9. Summary:

| Channel | Purpose |
|---|---|
| #agent-cursor | Cursor Cloud job completions, PR links, code review requests |
| #agent-twin | Twin job completions and blocked items |
| #agent-pokee | Pokee workflow completions and errors |
| #agent-zo | Zo job completions, artifact notifications |
| #handoffs | Cross-agent handoff confirmations visible to Amit |
| #approvals | Items requiring Amit's explicit approval before proceeding |
| #blocked | Any agent blocked awaiting human input |
| #summary | Daily agent status summary (posted by Pokee) |
| #founder-inbox | Routed "Ask the Founder" messages |

### 2.4 Repo-Committed `TASKS.md`

`TASKS.md` at the repository root is the master task list for Tempo Flow development. It is committed to git, so every change is versioned and visible in the git log. All agents reference it by reading the file from the repository; no agent edits it directly except via pull request.

**Format**:
```markdown
# Tempo Flow Tasks

## Active

| ID | Title | Owner | Status | Branch | PR |
|---|---|---|---|---|---|
| TASK-001 | Set up Convex schema | cursor-cloud-1 | in-progress | feat/convex-schema | — |
| TASK-002 | Configure RevenueCat catalog | twin | queued | — | — |
| TASK-003 | Generate v1.0 App Store assets | zo | queued | — | — |

## Done

| ID | Title | Owner | Merged PR |
|---|---|---|---|
| TASK-000 | Initialize Next.js + Expo project | amit | #1 |
```

**Update process**: When a Cursor Cloud agent finishes a task and merges a PR, the `update-tasks.yml` GitHub Action updates the task's Status column and adds the PR number. The Action commits directly to `main` via the GitHub API (using a bot token), so TASKS.md stays current without requiring a separate PR.

### 2.5 Twilio SMS + Resend Email (Escalation)

When a blocking issue is not resolved within the configured timeout, the agent spine escalates to Amit via:

- **Twilio SMS**: A short plaintext message to Amit's phone. Configured via the `TWILIO_SMS_WEBHOOK` environment variable (a pre-built Twilio Functions URL that accepts a `body` POST parameter and sends to Amit's number). No Twilio SDK code is required in the Tempo Flow app itself — the webhook URL abstracts the SMS sending.

- **Resend email**: A structured email via `resend.com` to `amitlevin65@protonmail.com`. Configured via `RESEND_ESCALATION_API_KEY` and a pre-built Resend template. Used for blocked items with more context than fits in an SMS.

Escalation thresholds:
- **2 hours** blocked → SMS only.
- **8 hours** blocked → SMS + email with full context.
- **24 hours** blocked → Job cancelled, Convex status set to `cancelled-awaiting-human`, email with instructions on how to restart.

---

## 3. Why Not Notion, Linear, or Airtable

These tools are explicitly excluded from the Tempo Flow agent spine for the following reasons:

**Notion**: Notion has no reliable webhook-based event system for external agents to react to. API rate limits are low (3 requests/second per integration). Notion pages are not queryable in structured ways that suit agent routing logic. Amit has used Notion for documentation in other projects but has concluded it adds complexity without adding capability when agents, not humans, are the primary readers of task state.

**Linear**: Linear is well-suited for human engineering teams but adds a paid SaaS dependency. GitHub Projects provides equivalent Kanban-style tracking at no additional cost, integrated with the PR and release workflows the agents already use. Linear's API is excellent, but the GitHub API covers the same routing surface for this project's scale.

**Airtable**: Airtable is a relational database UI, not a project management tool. The structured data that Tempo Flow needs at runtime lives in Convex, which is already the authoritative backend. Running a parallel Airtable database for task state would create a synchronization problem rather than solve one.

**Conclusion**: Every capability needed by the agent spine is covered by tools already owned: GitHub (free for public repos, low cost for private), Convex (already the product backend), Discord (free for the team's usage), and the repo itself. Adding an external PM tool would mean agents must maintain state in two places and Amit must monitor two surfaces. The current stack minimizes the number of systems that can fail or drift out of sync.

---

## 4. Flow Diagram (ASCII)

```
                             ┌─────────────────┐
                             │    TASKS.md      │  ← committed to git, versioned
                             │   (repo root)    │
                             └────────┬────────┘
                                      │ read
                                      ▼
                             ┌─────────────────┐
                             │     GitHub       │  ← Issues, PRs, Releases, Actions
                             │  (source of      │
                             │    truth)        │
                             └────────┬────────┘
                                      │ webhook events
                                      ▼
                             ┌─────────────────┐
                             │    Pokee AI      │  ← router & cross-poster
                             │   (always on)    │
                             └──┬──────┬──────┘
                    ┌───────────┘      │       └────────────┐
                    │                  │                    │
                    ▼                  ▼                    ▼
          ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
          │ Cursor Cloud  │   │   Twin.so    │   │   Zo Computer    │
          │  (code work)  │   │  (dashboard  │   │  (heavy compute) │
          │               │   │  automation) │   │                  │
          └──────┬────────┘   └──────┬───────┘   └────────┬─────────┘
                 │                   │                     │
                 │ PR opened         │ job complete        │ artifact ready
                 │                   │                     │
                 └─────────┬─────────┴─────────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │     Convex       │
                  │  agent_* tables  │  ← runtime state, webhooks
                  └────────┬─────────┘
                           │ webhooks / reads
                           ▼
                  ┌──────────────────┐
                  │    Discord       │  ← human observability layer
                  │  (#agent-*, etc) │
                  └────────┬─────────┘
                           │ blocked / decisions
                           ▼
                  ┌──────────────────┐
                  │      Amit        │  ← escalation endpoint
                  │  (SMS + email)   │
                  └──────────────────┘
```

**Notes on the diagram**:
- Pokee is the only agent that both receives external events (GitHub webhooks, Convex webhooks) and dispatches to multiple downstream agents. Twin, Zo, and Cursor Cloud do not communicate with each other directly.
- Convex functions as both the product database and the agent coordination bus. Agents write to `agent_*` tables; Convex HTTP actions fire webhooks back to Pokee when certain events occur.
- Discord is purely for human visibility. Agents post to Discord; Discord does not post back to agents.
- Amit is at the bottom of the escalation chain, not the top of the execution chain. The system is designed to proceed without Amit's involvement for the vast majority of tasks.

---

## 5. Standard Triggers & Flows

### 5.1 PR Opened

**Trigger**: Developer (Cursor Cloud agent) pushes a branch and opens a PR on GitHub.

**GitHub Action fires**: `notify-pokee.yml` sends a `pull_request.opened` webhook to Pokee.

**Pokee reads the PR labels** and routes:

| Label(s) on PR | Pokee action |
|---|---|
| `needs-review` only | Post to Discord #agent-cursor: "PR #N needs review. Title: ..." |
| `needs-twin` | Write handoff to `agent_handoffs` (from: cursor-cloud, to: twin). Post to #agent-twin: "Twin job queued for PR #N: ...". Fire Twin job trigger webhook. |
| `needs-zo` | Write handoff to `agent_handoffs` (from: cursor-cloud, to: zo). Post to #agent-zo. Fire Zo job trigger webhook. |
| `needs-review` + any other | Handle other label first, then post to #agent-cursor for review after the downstream task completes. |

**Worked example**:
Cursor Cloud agent finishes implementing RevenueCat integration. It opens PR #47 titled "feat: RevenueCat entitlements wiring [TASK-012]" with labels `needs-review` and `needs-twin` (because the RevenueCat dashboard also needs to be configured to match).

1. Pokee receives the webhook.
2. Pokee fires Twin's job trigger webhook with `{ "job": "create-revenuecat-offering", "pr_url": "...", "task_id": "TASK-012" }`.
3. Pokee posts to #agent-twin: "Twin queued: create RevenueCat offering (PR #47, TASK-012)."
4. Pokee posts to #agent-cursor: "PR #47 also needs code review. Awaiting Twin completion first."
5. Twin completes the RevenueCat job and posts to #agent-twin.
6. Pokee (triggered by Twin's Convex write) posts to #approvals: "RevenueCat catalog and PR #47 ready. Amit: please approve for merge."

### 5.2 PR Merged to Main

**Trigger**: PR is merged to `main` on GitHub.

**GitHub Action fires**: `notify-pokee.yml` sends `pull_request.merged` webhook to Pokee. `update-tasks.yml` fires in parallel to update TASKS.md.

**Pokee actions**:
1. Reads the PR title for a `[TASK-XXX]` reference.
2. Updates the task status in `agent_tasks` Convex table to `complete`.
3. Posts to Discord #handoffs: "PR #N merged to main. Task TASK-XXX: done. Vercel preview deployed."
4. If the PR description includes `closes #issue-number`, Pokee closes the GitHub Issue via the GitHub API.

**Worked example**:
PR #47 "feat: RevenueCat entitlements wiring [TASK-012]" is merged.

1. Pokee updates `agent_tasks` where `task_id = "TASK-012"` → `status: "complete"`.
2. `update-tasks.yml` updates the TASKS.md table row for TASK-012: Status → `done`, PR → `#47`.
3. Pokee posts to #handoffs: "PR #47 merged. TASK-012 complete. RevenueCat integration live on main. Vercel deploying..."
4. Pokee waits for the `deploy-production.yml` action to complete (via GitHub API poll) and then posts: "Production deployment confirmed."

### 5.3 Release Tagged

**Trigger**: Amit pushes a git tag and publishes a GitHub Release (via the GitHub UI or `gh release create`).

**GitHub Action fires**: `notify-pokee.yml` sends `release.published` webhook to Pokee.

**Pokee fan-out** (concurrent, not sequential):
1. **Pokee → Release Announcement Cross-Post** (Section 4.1 in pokee_setup.md): posts to LinkedIn, X, Instagram, Facebook, TikTok, Discord #handoffs.
2. **Pokee → Twin**: fires Twin job trigger for store submission — `{ "job": "submit-ios-build", "release": "v1.0.0" }` and `{ "job": "submit-android-build", "release": "v1.0.0" }`.
3. **Pokee → Zo**: fires Zo job trigger for release artifact bundling — `{ "job": "release-artifact-bundle", "release": "v1.0.0" }`.

**Zo completes bundling** → writes to `agent_artifacts` → triggers Pokee → Pokee posts to #handoffs confirming artifacts archived.

**Twin completes store submission** → posts to #agent-twin → if release-announce follow-up needed, Pokee picks up.

**Worked example**:
Amit tags `v1.0.0` and publishes the GitHub Release.

1. Pokee receives the webhook.
2. Pokee queues three concurrent tasks:
   - Cross-post release to all social platforms.
   - Trigger Twin to submit iOS build to TestFlight.
   - Trigger Zo to bundle release artifacts.
3. Within 5 minutes: LinkedIn post live, X thread posted, Instagram post live.
4. Within 30 minutes: Zo completes bundling, posts to #agent-zo, writes to `agent_artifacts`.
5. Within 60 minutes: Twin completes TestFlight submission, posts to #agent-twin.
6. Within 120 minutes: Twin completes Play Internal Testing submission.
7. Pokee compiles a summary and posts to #handoffs: "v1.0.0 release complete. Social: ✓. TestFlight: ✓. Play Internal: ✓. Artifacts: ✓."
8. Amit receives the daily summary (Section 4.6 in pokee_setup.md) confirming all tasks resolved.

### 5.4 Convex `askFounderQueue` Write

**Trigger**: The Tempo Flow app (Next.js or Expo) writes a new document to the Convex `askFounderQueue` table (when a user submits an "Ask the Founder" message through the app UI).

**Convex HTTP action** (defined in `convex/http.ts`) fires a POST to Pokee's inbound webhook URL on any insert to `askFounderQueue`.

**Pokee action**: Runs the Ask-the-Founder Routing workflow (Section 4.4 in pokee_setup.md).

**Worked example**:
A user on the Tempo Flow iOS app submits the message "Will you add a shared calendar feature?" with priority `normal`.

1. The Expo app calls a Convex mutation that inserts into `askFounderQueue`.
2. The Convex HTTP action fires the Pokee webhook within milliseconds.
3. Pokee appends the message to the Founder Inbox Google Sheet.
4. Pokee posts to Discord #founder-inbox with the message text.
5. No SMS (priority is `normal`).
6. Amit reads #founder-inbox during his daily review and updates the Sheet's "response" column.

### 5.5 Cursor Cloud Agent Finishes

**Trigger**: Cursor Cloud agent completes its assigned task and pushes a branch + opens a PR.

**Flow**: Same as Section 5.1 (PR Opened). Cursor Cloud agents participate in the same PR flow as any human developer — they open PRs, apply labels, and let the GitHub Action → Pokee pipeline handle routing.

**Additional step**: Cursor Cloud agents write a row to `agent_runs` when they start and finish a task, so the admin dashboard (Section 7) shows real-time state.

**Worked example**:
Cursor Cloud agent 1 finishes implementing the focus-mode timer screen. It runs `gh pr create --title "feat: focus mode timer [TASK-031]" --label "needs-review"`. Pokee routes to #agent-cursor for code review by Amit or another Cursor Cloud agent.

### 5.6 Twin Finishes a Dashboard Job

**Trigger**: Twin completes a job (e.g., RevenueCat catalog configuration).

**Twin action**:
1. Posts completion to Discord #agent-twin with a screenshot.
2. Writes a row to `agent_runs` via the Convex HTTP action.
3. If the job was triggered by a handoff, Twin updates `agent_handoffs` status to `completed`.
4. If a Pokee handoff is needed (e.g., release-announce follow-up), Twin fires the Pokee handoff webhook with `{ "source": "twin", "event": "job_complete", "job_type": "..." }`.

**Pokee receives the handoff** and determines whether any downstream action is needed (announcement, another agent trigger, or TASKS.md update).

### 5.7 Zo Finishes a Long Job

**Trigger**: Zo completes a job (e.g., nightly error sweep, asset generation).

**Zo action**:
1. Writes a row to `agent_artifacts` via Convex HTTP action (if the job produced an artifact).
2. Writes a row to `agent_runs`.
3. Posts completion to Discord #agent-zo.

**Convex trigger**: A Convex database trigger on `agent_artifacts` fires the Pokee webhook, passing the artifact metadata.

**Pokee receives the trigger** and routes:
- `release-bundle`: Pokee cross-posts the release announcement.
- `transcript-pipeline`: Pokee posts the tweet thread to X, creates newsletter draft.
- `assets`: Pokee posts to Discord #agent-zo only (awaiting Amit's review before public post).
- `nightly-sweep`: Pokee posts the PR link to #agent-cursor for review.

---

## 6. Escalation Flows

### Standard Escalation Ladder

When any agent is blocked awaiting a human decision:

| Time since block | Action |
|---|---|
| Immediate | Post to Discord #blocked with full context |
| 2 hours | Twilio SMS to Amit: short description + Discord link |
| 8 hours | Resend email to Amit: full context, error log, restart instructions |
| 24 hours | Job cancelled in Convex (`cancelled-awaiting-human`). Email sent with restart instructions. |

### Types of Human Decisions That Block Agents

1. **2FA / CAPTCHA** (Twin): Amit must complete via Twin session URL.
2. **Apple App Review rejection** (Twin + Cursor Cloud): Amit reviews the rejection reason and decides whether to update the app or appeal.
3. **Pricing decisions**: No agent sets pricing. Any RevenueCat or App Store pricing step pauses for Amit's input.
4. **Legal policy approval** (Twin + GetTerms): Amit reviews generated legal documents before they are published.
5. **Content moderation edge cases**: If Pokee encounters an ambiguous social post (e.g., a release note that might contain a sensitive phrase), it posts to #approvals and waits.

### Kill Switch

To pause all downstream agent activity immediately:

1. **Disable Pokee's inbound webhook** in the GitHub repository settings (remove or disable the Pokee webhook URL). All `release.published`, `pull_request.merged`, and `issues.opened` events will stop reaching Pokee.
2. **Pause Pokee's scheduled workflows** in Pokee's dashboard (weekly digest, daily summary). This stops all outbound posting.
3. **Pause Zo's scheduler** in Zo's dashboard to stop nightly sweeps.
4. Cursor Cloud and Twin jobs in flight will complete (they do not receive a stop signal mid-job) but no new jobs will be triggered.

To re-enable: restore the Pokee webhook URL in GitHub and re-enable Pokee's scheduled workflows. No data is lost during a kill-switch pause.

---

## 7. Audit Log & Admin Dashboard

### Convex Audit Tables

Every agent logs to `agent_runs` and `agent_handoffs` with full timestamps and event IDs. This provides a complete audit trail of all agent activity, queryable via the Convex dashboard or the admin route.

### Admin Dashboard Route

The Tempo Flow Next.js app includes an internal admin dashboard at `/admin/agents` (server-rendered, not included in the public app bundle). This route is gated behind `role: "admin"` in Convex's identity system:

```typescript
// convex/admin.ts
export const getAgentRuns = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.role !== "admin") throw new Error("Unauthorized");
    return await ctx.db
      .query("agent_runs")
      .order("desc")
      .take(100);
  },
});
```

The admin UI shows:
- A live table of the 100 most recent `agent_runs` rows, with status badges (green: complete, red: failed, yellow: in-progress, grey: cancelled).
- A table of open `agent_handoffs` (status: pending or accepted) with the handoff payload visible.
- A list of unresolved `agent_tasks` (status: blocked or in-progress).
- A list of recent `agent_artifacts` with manifest links.

**Access**: Only Amit's Convex user (identified by admin role set in Convex dashboard → Users) can access `/admin/agents`. The route is not linked from the public app.

---

## 8. Idempotency Patterns

Every webhook-triggered agent action is protected against duplicate execution by a unique `event_id`.

### Event ID Generation

- **GitHub webhooks**: GitHub includes a `X-GitHub-Delivery` header on every webhook delivery. This UUID is used as the `event_id`.
- **Convex triggers**: Convex includes the document ID of the triggering record as part of the webhook payload. The document ID is used as the `event_id`.
- **Zo and Twin internal jobs**: Zo and Twin generate a UUID at job start and include it in all writes to Convex.

### Deduplication Logic

Before processing any webhook or trigger, each agent (and each Convex HTTP action) checks:

```typescript
// convex/http.ts — example for agent_runs
const existing = await ctx.db
  .query("agent_runs")
  .withIndex("by_event_id", (q) => q.eq("event_id", eventId))
  .first();

if (existing) {
  return new Response("duplicate", { status: 200 }); // acknowledge but skip
}
```

This ensures that even if GitHub re-delivers a webhook (which it does on 5xx responses), the agent does not run the same job twice. The deduplication index on `event_id` is defined in `convex/schema.ts` for all four `agent_*` tables.

### Pokee Idempotency

Pokee receives the `event_id` in the webhook payload and includes it in all downstream API calls as a custom header or idempotency key (where the target API supports it, e.g., Stripe-style idempotency keys). For platforms that do not support idempotency keys (LinkedIn, Instagram), Pokee checks its own internal job log before posting.

---

## 9. Discord Channel Conventions

### Channel Map

| Channel | Who posts | Who reads | Purpose |
|---|---|---|---|
| #agent-cursor | Pokee, Cursor Cloud (via Pokee) | Amit, Cursor Cloud agents (read-only) | PR links, code review requests, nightly sweep results |
| #agent-twin | Twin (directly), Pokee | Amit | Twin job completions, CAPTCHA/2FA blocks, dashboard screenshots |
| #agent-pokee | Pokee | Amit | Pokee workflow completions, posting errors |
| #agent-zo | Zo (directly), Pokee | Amit | Zo job completions, artifact notifications, spend alerts |
| #handoffs | Pokee | Amit | Cross-agent handoff confirmations, release fan-out status |
| #approvals | Pokee | Amit only | Items requiring Amit's explicit approval before proceeding |
| #blocked | All agents | Amit — action required | Blocked items awaiting human input. Amit reacts with ✅ when resolved. |
| #summary | Pokee | Amit | Daily agent status summary, weekly analytics digest |
| #founder-inbox | Pokee | Amit | Routed "Ask the Founder" messages |

### Posting Conventions

**Every agent post must include**:
- A bracketed agent identifier at the start: `[CURSOR]`, `[TWIN]`, `[POKEE]`, `[ZO]`
- Job name and status
- Relevant URL (PR, artifact path, or dashboard link)
- For blocked posts: the exact action Amit must take to unblock

**Message length**: Keep Discord messages under 1500 characters. For longer content (error logs, sweep reports), use a code block or attach a file. Do not paste full stack traces inline.

**Reactions**:
- Amit reacts with ✅ to acknowledge a blocked message when resolved.
- Amit reacts with 👀 to indicate he has seen a message but not yet acted.
- No other reactions have defined meaning in the spine.

### Read Access for Agents

Agents do not read Discord messages programmatically. Pokee's daily status summary (Section 4.6 in pokee_setup.md) reads Discord via the bot token as a one-time read — it does not maintain a persistent message stream. All agent-to-agent coordination happens through Convex, not Discord.

---

## 10. Security

### Webhook Signing

Every inbound webhook to Convex from an external agent is verified using HMAC-SHA256 signing:

1. The sending agent (Zo, Twin, Pokee, GitHub) computes `HMAC-SHA256(payload, shared_secret)` and includes the signature in the `X-Hmac-Signature` request header.
2. The Convex HTTP action re-computes the signature and compares with a constant-time equality check. If signatures do not match, the request is rejected with `403 Forbidden`.
3. Each agent has its own shared secret stored in Convex environment variables:
   - `TEMPO_ZO_HMAC_SECRET`
   - `TEMPO_TWIN_HMAC_SECRET`
   - `TEMPO_POKEE_HMAC_SECRET`
   - GitHub uses its own `X-Hub-Signature-256` mechanism.

### Token Scopes (Principle of Least Privilege)

- **GitHub tokens** for agents are scoped to the minimum required: Cursor Cloud needs `contents:write` and `pull_requests:write`; Pokee needs `issues:write` and `metadata:read`; Zo needs `contents:read`.
- **Convex deploy keys** for agents are separate from the production deploy key used by the Next.js app. Agent keys are created as separate keys in the Convex dashboard with `httpAction:execute` permission only.
- **Discord bot token** is read-only for all channels except the agent channels, where it has `Send Messages` permission only.
- **Social platform tokens** stored in Pokee are scoped to `post on behalf of` only — no admin or settings access.

### Token Rotation

| Token | Rotation frequency | Rotation procedure |
|---|---|---|
| Zo HMAC secret | Every 90 days | Update in Zo env vars + Convex env vars simultaneously. |
| Twin HMAC secret | Every 90 days | Same pattern. |
| Pokee HMAC secret | Every 90 days | Same pattern. |
| Convex agent deploy keys | Every 6 months | Generate new key in Convex dashboard, update in agent env vars. |
| GitHub token for actions | Managed by GitHub Actions (short-lived OIDC tokens) | No manual rotation needed. |
| Discord bot token | On compromise only | Regenerate in Discord Developer Portal, update all agents. |
| Twilio + Resend keys | Every 6 months | Rotate in respective dashboards, update Convex env vars. |

### Agent-to-Convex HMAC Implementation

Reference implementation for Zo (adapt for other agents):

```typescript
// In Zo's job runner (pseudo-code):
import { createHmac } from "crypto";

function signPayload(payload: object, secret: string): string {
  const body = JSON.stringify(payload);
  return createHmac("sha256", secret).update(body).digest("hex");
}

async function writeToConvex(payload: object) {
  const signature = signPayload(payload, process.env.TEMPO_ZO_HMAC_SECRET!);
  await fetch(`${process.env.CONVEX_URL}/internal/agent/artifact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Hmac-Signature": signature,
    },
    body: JSON.stringify(payload),
  });
}
```

```typescript
// In convex/http.ts:
import { createHmac, timingSafeEqual } from "crypto";

function verifyHmac(body: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export const agentArtifactHandler = httpAction(async (ctx, request) => {
  const body = await request.text();
  const sig = request.headers.get("X-Hmac-Signature") ?? "";
  const secret = process.env.TEMPO_ZO_HMAC_SECRET!;
  if (!verifyHmac(body, sig, secret)) {
    return new Response("Forbidden", { status: 403 });
  }
  const payload = JSON.parse(body);
  // ... deduplication check, then write to agent_artifacts
});
```

---

## 11. "Day in the Life" Walkthrough

The following is a walkthrough of a single feature moving through the agent spine from TASKS.md to completion, with Amit receiving only a single SMS summary at the end of the day.

**The feature**: TASK-088 — "Add empty-state illustration to the 'No Tasks Today' view" (frontend, needs Zo for asset generation, then Cursor Cloud to wire it in).

---

**07:00 UTC — Zo overnight sweep finishes**

Zo's nightly TypeScript sweep finds 3 trivial type errors introduced in last night's merge. It patches them, opens PR #91 "chore(zo): nightly TS sweep 2026-04-17 — 3 fixes, 0 deferred", and posts to Discord #agent-cursor.

Pokee receives the Convex write from Zo and routes the PR link to #agent-cursor.

---

**07:05 UTC — Cursor Cloud reviews the sweep PR**

Cursor Cloud agent 2 reviews PR #91, approves it, and Amit's CI passes. The PR is auto-merged (Cursor Cloud has merge permission on trivial sweep PRs). TASKS.md is not updated (the sweep is not a TASKS.md item).

---

**08:00 UTC — Cursor Cloud starts TASK-088**

Cursor Cloud agent 1 reads TASKS.md and picks up TASK-088. It writes to `agent_tasks`:
`{ task_id: "TASK-088", assigned_agent: "cursor-cloud-1", status: "in-progress", branch: "feat/empty-state-illustration" }`

It creates the branch and begins implementing the `NoTasksToday` component scaffold — without the actual illustration file yet (a placeholder SVG is used).

---

**08:15 UTC — Cursor Cloud opens an interim PR requesting Zo**

Cursor Cloud agent 1 opens PR #92 "feat: empty-state illustration wiring [TASK-088]" with labels `needs-zo` and `needs-review`.

The PR description includes:
```
Requires Zo to generate the empty-state illustration at:
/tempo-flow/assets/in-app/v1.0.0/empty-state-no-tasks.png

Illustration brief: A small illustrated character sitting on a clean desk, looking content. Indigo and warm white palette. No text.
```

---

**08:16 UTC — Pokee routes the PR**

Pokee receives the `pull_request.opened` webhook from GitHub.

Pokee reads the labels: `needs-zo` → fires Zo job trigger:
```json
{
  "job": "asset-batch",
  "task_id": "TASK-088",
  "brief": "Empty-state illustration: content character at clean desk. Indigo + warm white. No text.",
  "output_path": "/tempo-flow/assets/in-app/v1.0.0/empty-state-no-tasks.png",
  "pr_url": "https://github.com/amitlevin/tempoflow/pull/92"
}
```

Pokee writes to `agent_handoffs`:
`{ from_agent: "cursor-cloud", to_agent: "zo", handoff_type: "asset-generate", status: "pending" }`

Pokee posts to Discord #agent-zo: "Zo: generate empty-state illustration for TASK-088. Brief and output path in job payload."

---

**09:30 UTC — Zo generates the illustration**

Zo's asset generation job runs the illustration brief through the image generation API, produces `empty-state-no-tasks.png` in multiple sizes, and saves to `/tempo-flow/assets/in-app/v1.0.0/`.

Zo writes to `agent_artifacts`:
`{ type: "assets", release: "TASK-088", artifact_path: "/tempo-flow/assets/in-app/v1.0.0/", timestamp: "..." }`

Zo posts to Discord #agent-zo: "Illustration generated for TASK-088. File: /tempo-flow/assets/in-app/v1.0.0/empty-state-no-tasks.png"

Pokee receives the Convex trigger. It reads the artifact type as `assets` (not a release bundle), so it posts to #agent-zo only and does not trigger a public announcement.

Pokee updates `agent_handoffs` status to `completed`.

---

**09:35 UTC — Cursor Cloud wires in the illustration**

Cursor Cloud agent 1, polling the `agent_handoffs` table for TASK-088, sees the handoff status is `completed` and the artifact path is available.

It downloads the illustration from Zo's workspace URL, commits it to `assets/in-app/empty-state-no-tasks.png` in the repo, updates the `NoTasksToday` component to import the real asset, and force-pushes to the PR branch.

PR #92 now has the complete implementation.

---

**10:00 UTC — CI runs, PR passes**

The `ci.yml` GitHub Action runs on the updated PR: TypeScript, ESLint, and Convex schema checks all pass. Vercel deploys a preview.

Cursor Cloud agent 1 posts a review comment on PR #92: "Implementation complete. Preview deployed at [preview URL]. Ready for review."

---

**10:05 UTC — Pokee posts to #approvals**

Pokee, triggered by the CI pass and the `needs-review` label, posts to Discord #approvals:
"PR #92 (TASK-088: empty-state illustration) is ready. CI: ✓. Preview: [url]. Amit: please review and approve for merge."

---

**11:00 UTC — Amit reviews and merges**

Amit opens the preview URL, checks the illustration, approves PR #92, and merges it.

---

**11:01 UTC — Merge fan-out**

`notify-pokee.yml` fires. Pokee updates `agent_tasks` TASK-088 → `complete`. TASKS.md is updated by `update-tasks.yml`. Pokee posts to #handoffs: "PR #92 merged. TASK-088 complete. Production deploying."

---

**20:00 UTC — Pokee daily summary**

Pokee's daily status summary runs. It pulls the day's `agent_runs` from Convex and the Discord activity summary.

Pokee DMs Amit on Discord:
```
# Tempo Flow Daily Summary — 2026-04-17

## Cursor Cloud
- Jobs completed: 2 (nightly sweep, TASK-088 illustration wiring)
- PRs merged: 2 (#91, #92)

## Zo
- Jobs completed: 1 (empty-state illustration for TASK-088)
- Artifacts: 1

## Twin, Pokee
- No jobs today.

## Blocked
- None.

## Action needed from Amit
- None outstanding.
```

Amit reads the summary and sees a clean day. No SMS was required — nothing was blocked for more than 2 hours.

---

End of walkthrough. TASK-088 moved from `queued` in TASKS.md to `done` in 3 hours of calendar time, required Amit's attention for approximately 5 minutes (the PR review and merge), and involved three agents (Cursor Cloud, Zo, Pokee) coordinating without direct human intervention.


---

## 6.2 Zo Computer Setup

> **Source file:** `zo_setup.md`

# Zo Computer — Tempo Flow Setup & Usage Guide

## 1. What Zo Computer Is

Zo Computer is a persistent personal AI cloud computer that runs inside a managed cloud environment accessible via `zo.computer`. Unlike ephemeral CI runners or stateless serverless functions, Zo maintains a persistent workspace across sessions — files written in one job are available to the next. It can execute long-running tasks that would time out in a standard GitHub Action or Cursor Cloud agent: overnight error sweeps, large-batch asset generation, audio/video transcription pipelines, release bundling, and open-source model R&D. Zo connects to external APIs (GitHub, OpenRouter, Convex HTTP actions, S3-compatible storage) and can open pull requests, write to Convex tables via webhook, and post status messages to Discord. For Tempo Flow, Zo fills the role of the "heavy compute" executor in the agent spine: any job that takes more than a few minutes, consumes significant GPU/CPU, or produces large binary artifacts belongs here rather than in Cursor Cloud or Twin.

---

## 2. First-Time Account Setup

### 2.1 Create Account

1. Navigate to `https://zo.computer` and sign up with the GitHub account that owns the Tempo Flow repository (`amitlevin65@protonmail.com` or your GitHub login).
2. Verify your email address via the confirmation link Zo sends.
3. Choose the workspace tier that covers persistent disk and GPU access. At minimum, select the plan that offers at least 50 GB persistent storage and access to GPU nodes (needed for transcription and avatar R&D in Phase 2).

### 2.2 Connect GitHub

1. In Zo's dashboard, open **Settings → Integrations → GitHub**.
2. Click **Authorize** and grant access to the `tempoflow` repository (and the org if you have one).
3. Confirm that Zo can create branches and open pull requests on `tempoflow`.
4. Copy the Zo GitHub App installation ID — you will reference it in GitHub Actions if you want Zo to receive job triggers via `workflow_dispatch`.

### 2.3 Set Up Workspace

1. In the Zo dashboard, click **New Workspace** and name it `tempo-flow`.
2. Select the region closest to your Convex deployment (US East if using Convex's default region).
3. Enable **Persistent Disk** and allocate at least 50 GB.
4. Enable **GPU Node** access for transcription and avatar workloads. You can leave this off by default and enable it per-job to reduce cost.
5. Set the workspace timezone to `UTC` for consistent cron alignment with Pokee and Discord.

### 2.4 Add OpenRouter API Key

1. Log in to `openrouter.ai`, navigate to **Keys**, and create a key named `zo-tempo-flow` with a monthly budget cap (see Section 7 for budget guidance).
2. In Zo's dashboard, open **Settings → Environment Variables** and add:
   ```
   OPENROUTER_API_KEY=<your-key>
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   ```
3. For Tempo Flow's default models, add:
   ```
   TEMPO_AI_PRIMARY=google/gemma-4-26b-it
   TEMPO_AI_SECONDARY=mistralai/mistral-small-4
   ```

### 2.5 Add Convex Credentials

Zo needs to write to Convex `agent_artifacts` and read from `agent_tasks` to participate in the agent spine.

1. In your Convex dashboard, create a server-side API key (or use a Convex HTTP action with HMAC signing — see `AGENT_SETUP/agent_handoff_map.md` Section 10 for the signing pattern).
2. In Zo environment variables, add:
   ```
   CONVEX_URL=https://<your-deployment>.convex.cloud
   CONVEX_DEPLOY_KEY=<server-key>
   TEMPO_ZO_HMAC_SECRET=<shared-secret-with-convex>
   ```

### 2.6 Add Discord Webhook

1. In your Tempo Flow Discord server, open **#agent-zo → Edit Channel → Integrations → Webhooks → New Webhook**.
2. Copy the webhook URL.
3. In Zo environment variables, add:
   ```
   DISCORD_ZO_WEBHOOK=<webhook-url>
   DISCORD_BLOCKED_WEBHOOK=<#blocked-channel-webhook-url>
   ```

### 2.7 Configure Default LLM Routing

In Zo's **LLM Router** settings (if the workspace plan includes it), set:

- **Default model**: `google/gemma-4-26b-it` via OpenRouter
- **Fallback model**: `mistralai/mistral-small-4` via OpenRouter
- **Long-context override**: `anthropic/claude-3-5-sonnet` (for repo-wide sweeps that exceed 32k tokens — add key if needed)
- **Transcription**: Whisper via OpenRouter or a self-hosted Whisper endpoint if GPU node is enabled

---

## 3. Tempo Flow Workspace Structure

The following folder layout should be created inside the `tempo-flow` Zo workspace. Create these directories on first run; they persist across sessions.

```
/tempo-flow/
├── artifacts/          # Packaged release binaries, APKs, IPAs, OTA bundles
│   └── <version>/      # One subdirectory per release tag, e.g. v1.0.0/
├── assets/             # Generated images: App Store screenshots, social cards, illustrations
│   ├── appstore/       # Device-framed screenshots per locale
│   ├── social/         # Release announcement cards (1200x630 OG, 1080x1080 IG square)
│   └── in-app/         # Empty-state illustrations, onboarding graphics
├── transcripts/        # Raw and processed transcripts from vlog pipeline
│   ├── raw/            # Whisper output JSON
│   └── processed/      # Tweet threads, newsletter drafts, blog posts
└── logs/               # Job run logs (one file per run, named by timestamp + job type)
    └── YYYY-MM-DD_HH-MM-SS_<job-type>.log
```

**Retention policy**: Keep `artifacts/` indefinitely. Rotate `logs/` older than 90 days. Keep `transcripts/` for 1 year. Keep `assets/` until superseded by a new release's assets.

---

## 4. Standard Job Templates

Each template below is a self-contained prompt to paste into Zo's job runner, or to trigger programmatically via Zo's API. Substitute `{{variable}}` placeholders at call time.

---

### 4.1 Overnight TypeScript / Convex Error Sweep

**Purpose**: Run nightly against the `main` branch. Read all TypeScript and Convex files, identify type errors, linting violations, and trivial runtime issues, patch them automatically, and open a pull request.

**Schedule**: Daily at 02:00 UTC (configure in Zo's scheduler or via GitHub Actions `workflow_dispatch`).

**Prompt template**:

```
You are a TypeScript and Convex expert running an automated overnight error sweep on the Tempo Flow repository.

Repository: {{GITHUB_REPO}} (e.g. amitlevin/tempoflow)
Branch to read: main
New branch name: zo/nightly-fix-{{YYYY-MM-DD}}

Steps:
1. Clone or pull the latest main branch into the Zo workspace at /tempo-flow/sweep/.
2. Run `npx tsc --noEmit` from the repo root and capture all errors.
3. Run `npx eslint . --ext .ts,.tsx --max-warnings 0` and capture all warnings and errors.
4. Run `npx convex dev --typecheck-only` (or equivalent) to catch Convex schema drift.
5. For each error or warning:
   a. If it is a straightforward type annotation, missing import, unused variable, or trivial null-check issue, patch the file directly.
   b. If it requires architectural judgment (e.g. breaking API change, schema migration), skip it and add it to a list called DEFERRED_ISSUES.
6. After patching, re-run tsc and eslint to verify zero new errors were introduced.
7. Commit all patches with message: "chore(zo): nightly TS/Convex error sweep {{YYYY-MM-DD}}"
8. Push the branch and open a pull request titled "Nightly sweep {{YYYY-MM-DD}} — N fixes, M deferred".
9. In the PR body, list every file changed with a one-line explanation, then list DEFERRED_ISSUES.
10. Post to Discord #agent-zo webhook:
    "Nightly sweep complete. PR: <url>. Fixed: N. Deferred: M."
11. Write a log entry to /tempo-flow/logs/{{YYYY-MM-DD_HH-MM-SS}}_nightly-sweep.log.
12. Write a row to Convex agent_runs via HTTP action POST /agent/log with fields:
    { agent: "zo", job: "nightly-sweep", status: "complete", pr_url: "<url>", timestamp: <iso> }

If any step fails, post to Discord #blocked:
"Zo nightly sweep FAILED at step <N>: <error>. Log: /tempo-flow/logs/<filename>"
```

**Environment variables required**: `GITHUB_TOKEN`, `OPENROUTER_API_KEY`, `DISCORD_ZO_WEBHOOK`, `DISCORD_BLOCKED_WEBHOOK`, `CONVEX_URL`, `CONVEX_DEPLOY_KEY`

---

### 4.2 Asset Batch Generation

**Purpose**: Generate App Store screenshots (all required device sizes), social announcement cards for releases, and in-app empty-state illustrations using an AI image generation API.

**Trigger**: Manual (Amit runs this before each App Store submission) or triggered by Pokee when a release tag is published.

**Device sizes required by App Store Connect (as of 2025)**:
- iPhone 6.9" (1320x2868), iPhone 6.7" (1290x2796), iPhone 5.5" (1242x2208)
- iPad Pro 13" (2064x2752), iPad Pro 12.9" (2048x2732)

**Google Play required sizes**:
- Phone: 1080x1920, Tablet: 1600x2560

**Prompt template**:

```
You are an asset generation agent for Tempo Flow, an AI daily planner app for neurodivergent users.

Job: Generate all required App Store and Google Play screenshots plus social cards for release {{RELEASE_TAG}}.

Brand context:
- App name: Tempo Flow
- Tagline: "Your day, without the overwhelm."
- Color palette: Deep indigo (#3D2785), warm white (#FAFAF8), accent coral (#FF6B5B)
- Typography: Clean, rounded sans-serif. No sharp corners.
- Tone: Calm, supportive, empowering. Never clinical.
- Target user: Neurodivergent adults (ADHD, autism, anxiety).

Screenshot scenes to generate (one composition per scene):
1. Home screen — today's schedule with soft gradient, minimal task list
2. AI planning assistant — chat interface showing a calming, supportive AI message
3. Focus mode — single task view, progress ring, ambient timer
4. Weekly overview — gentle calendar grid, no overwhelming density
5. Onboarding — "Tell me about your day" prompt screen

For each scene:
1. Generate the base illustration at 1242x2208 (iPhone 5.5" base).
2. Upscale/reframe to each required device size listed above using content-aware fill.
3. Composite the actual app UI wireframe overlay (provided at /tempo-flow/assets/ui-frames/{{RELEASE_TAG}}/) on top of the illustration.
4. Add a caption bar at the bottom with scene title in the Tempo brand font.
5. Save outputs to /tempo-flow/assets/appstore/{{RELEASE_TAG}}/<device>/<scene-number>.png

Social cards:
- Generate 5 variants of a 1200x630 release announcement card using the scene 1 artwork.
- Generate 5 variants of a 1080x1080 square card for Instagram.
- Save to /tempo-flow/assets/social/{{RELEASE_TAG}}/

In-app illustrations (if flag GENERATE_ILLUSTRATIONS=true):
- Empty task list state: A small illustrated character sitting on a clean desk, looking content.
- No notifications state: Peaceful scene, plant on windowsill.
- Onboarding welcome: Warm sunrise over a minimal city.
- Save to /tempo-flow/assets/in-app/{{RELEASE_TAG}}/

After all assets are saved:
1. Write a manifest JSON to /tempo-flow/assets/{{RELEASE_TAG}}_manifest.json listing every file path and its dimensions.
2. Write a row to Convex agent_artifacts:
   { agent: "zo", type: "assets", release: "{{RELEASE_TAG}}", manifest_path: "...", timestamp: <iso> }
3. Post to Discord #agent-zo:
   "Asset batch generation complete for {{RELEASE_TAG}}. Files: N. Manifest: /tempo-flow/assets/{{RELEASE_TAG}}_manifest.json"
```

**Environment variables required**: `IMAGE_GEN_API_KEY` (Stability AI, DALL-E, or Flux via OpenRouter), `DISCORD_ZO_WEBHOOK`, `CONVEX_URL`, `CONVEX_DEPLOY_KEY`

---

### 4.3 Vlog Transcription Pipeline

**Purpose**: Accept an MP3 or MP4 file from Amit's vlog, transcribe it with Whisper, then generate a tweet thread, newsletter draft, and blog post from the transcript.

**Trigger**: Manual upload to `/tempo-flow/transcripts/raw/` in the Zo workspace, or Pokee triggers this job when a new YouTube upload is detected.

**Prompt template**:

```
You are a content repurposing agent for Tempo Flow's founder vlog.

Input file: {{INPUT_FILE_PATH}} (MP3 or MP4)
Video title: {{VIDEO_TITLE}}
Video date: {{VIDEO_DATE}}
YouTube URL (if already published): {{YOUTUBE_URL}}

Step 1 — Transcription:
1. Run Whisper on {{INPUT_FILE_PATH}} with model=large-v3, language=en.
2. Save raw transcript JSON to /tempo-flow/transcripts/raw/{{SLUG}}.json
3. Save clean plaintext transcript (no timestamps) to /tempo-flow/transcripts/raw/{{SLUG}}.txt

Step 2 — Tweet thread:
1. Read the clean transcript.
2. Identify the 8–12 most shareable insights, observations, or updates.
3. Write a tweet thread:
   - Tweet 1: Hook (max 240 chars). Must not start with "I". Start with the most surprising or emotionally resonant point.
   - Tweets 2–N: One idea per tweet, max 240 chars each.
   - Final tweet: CTA — "Full vlog: {{YOUTUBE_URL}} | Try Tempo Flow free: https://tempoflow.app"
4. Save to /tempo-flow/transcripts/processed/{{SLUG}}_thread.txt

Step 3 — Newsletter draft:
1. Write a ~600-word newsletter section titled "Founder update — {{VIDEO_DATE}}".
2. Tone: personal, candid, behind-the-scenes. Amit speaks directly to early adopters.
3. Include 3 key takeaways in bullet form.
4. End with a CTA to try Tempo Flow.
5. Save to /tempo-flow/transcripts/processed/{{SLUG}}_newsletter.md

Step 4 — Blog post:
1. Expand the newsletter draft into a ~1200-word blog post with H2 headers.
2. Add an intro paragraph optimized for search: include "ADHD planner", "neurodivergent productivity", "AI daily planner".
3. Add a conclusion with a soft conversion CTA.
4. Save to /tempo-flow/transcripts/processed/{{SLUG}}_blog.md

After all steps:
1. Write a row to Convex agent_artifacts:
   { agent: "zo", type: "transcript-pipeline", slug: "{{SLUG}}", files: [...], timestamp: <iso> }
2. Post to Discord #agent-zo:
   "Vlog pipeline complete for {{SLUG}}. Thread, newsletter, and blog post saved to /tempo-flow/transcripts/processed/"
3. Post artifact notification to Pokee via the handoff pattern (see Section 5) so Pokee can cross-post the thread.
```

**Environment variables required**: `WHISPER_MODEL_PATH` or OpenRouter Whisper endpoint, `OPENROUTER_API_KEY`, `DISCORD_ZO_WEBHOOK`, `CONVEX_URL`, `CONVEX_DEPLOY_KEY`, `POKEE_HANDOFF_WEBHOOK`

---

### 4.4 Release Artifact Bundling

**Purpose**: After a GitHub release tag is published, pull all release assets (JS bundles, OTA update payloads, APK/IPA if EAS Build outputs them), package them, and store them in `/tempo-flow/artifacts/<version>/`.

**Trigger**: Pokee webhook when GitHub release is published (event: `release.published`).

**Prompt template**:

```
You are a release artifact bundler for Tempo Flow.

Release tag: {{RELEASE_TAG}}
GitHub repo: {{GITHUB_REPO}}
EAS Build profile: production

Steps:
1. Use the GitHub API to fetch the release object for {{RELEASE_TAG}} and list all attached assets.
2. Download each asset to /tempo-flow/artifacts/{{RELEASE_TAG}}/:
   - .ipa file (iOS, from EAS Build artifacts if linked in release notes)
   - .aab file (Android, same)
   - expo-updates OTA bundle (if present)
   - CHANGELOG.md excerpt for this version
3. Generate a SHA256 checksum file: /tempo-flow/artifacts/{{RELEASE_TAG}}/checksums.sha256
4. Create a bundle manifest JSON: /tempo-flow/artifacts/{{RELEASE_TAG}}/manifest.json
   {
     "release": "{{RELEASE_TAG}}",
     "bundled_at": "<iso-timestamp>",
     "assets": [
       { "filename": "...", "size_bytes": ..., "sha256": "..." }
     ]
   }
5. Write a row to Convex agent_artifacts:
   { agent: "zo", type: "release-bundle", release: "{{RELEASE_TAG}}", manifest_path: "...", timestamp: <iso> }
6. Post to Discord #agent-zo:
   "Release bundle complete for {{RELEASE_TAG}}. N assets archived. Checksums verified."
7. Trigger Pokee handoff (see Section 5) to announce the release.

On error (asset download fails, checksum mismatch):
Post to Discord #blocked:
"Zo release bundler FAILED for {{RELEASE_TAG}}: <error>. Manual intervention required."
```

**Environment variables required**: `GITHUB_TOKEN`, `DISCORD_ZO_WEBHOOK`, `DISCORD_BLOCKED_WEBHOOK`, `CONVEX_URL`, `CONVEX_DEPLOY_KEY`, `POKEE_HANDOFF_WEBHOOK`

---

### 4.5 Avatar R&D (Phase 2 Onwards)

**Purpose**: Experimental. Evaluate open-source VTuber pipelines, lip-sync models, and character rigging tools for a potential Tempo Flow animated assistant avatar.

**Trigger**: Manual only. This is a research job, not production automation.

**Prompt template**:

```
You are an AI research assistant evaluating open-source avatar and lip-sync pipelines for Tempo Flow's Phase 2 animated assistant feature.

Research objectives:
1. Survey current open-source VTuber frameworks (VTube Studio protocol, Live2D Cubism SDK free tier, Ready Player Me, Avaturn, Metahuman).
2. Evaluate lip-sync models compatible with React Native / Expo:
   - Rhubarb Lip Sync
   - wav2lip (GPU required)
   - SadTalker
3. Evaluate character rigging options compatible with React Native Skia or Three.js via Expo:
   - Spine2D runtime
   - Lottie-based rigs
   - Three.js GLTF with morph targets
4. For each evaluated option, produce a scorecard:
   - License (commercial use allowed?)
   - Integration complexity (1–5)
   - Runtime performance on mobile (estimate)
   - Bundle size impact
   - Quality of lip sync output
5. Generate a 30-second test animation using the top-scored pipeline with a placeholder character saying:
   "Hi, I'm Tempo. Let's plan your day."
6. Save the test output to /tempo-flow/assets/avatar-rd/{{DATE}}/
7. Write a report to /tempo-flow/logs/{{DATE}}_avatar-rd.md summarizing findings and a recommended path forward.
8. Post to Discord #agent-zo:
   "Avatar R&D complete. Report: /tempo-flow/logs/{{DATE}}_avatar-rd.md"
```

**Environment variables required**: `OPENROUTER_API_KEY`, `DISCORD_ZO_WEBHOOK`, GPU node enabled for wav2lip / SadTalker

---

## 5. Handoff Patterns

### 5.1 Zo Produces an Artifact → Convex → Pokee → Discord / Social

When any Zo job completes successfully and produces an artifact (asset bundle, transcript, release package), it follows this sequence:

1. **Zo writes to Convex** via an HTTP POST to the Convex HTTP action at `/internal/agent/artifact`:
   ```json
   {
     "agent": "zo",
     "job_type": "release-bundle | assets | transcript-pipeline | nightly-sweep",
     "release": "v1.0.0",
     "artifact_path": "/tempo-flow/artifacts/v1.0.0/",
     "manifest_url": "https://zo.computer/workspace/tempo-flow/artifacts/v1.0.0/manifest.json",
     "timestamp": "2026-04-17T02:45:00Z",
     "hmac_signature": "<computed-with-TEMPO_ZO_HMAC_SECRET>"
   }
   ```
   The Convex action validates the HMAC, writes a row to `agent_artifacts`, and fires a database trigger.

2. **Convex triggers Pokee** via a webhook configured in `convex/http.ts`. The webhook payload includes the artifact type and metadata.

3. **Pokee routes the notification**:
   - If `job_type == "release-bundle"`: Pokee cross-posts the release announcement to all social channels (see `pokee_setup.md` Section 4.1).
   - If `job_type == "transcript-pipeline"`: Pokee posts the tweet thread and schedules the newsletter send.
   - If `job_type == "assets"`: Pokee posts a preview to Discord #agent-zo only (no public cross-post until Amit approves).
   - If `job_type == "nightly-sweep"`: Pokee posts the PR link to Discord #agent-cursor for Cursor Cloud review.

### 5.2 Zo Finishes a Long Job → Discord → Blocked if Needed

Every Zo job posts its completion status to Discord #agent-zo via the `DISCORD_ZO_WEBHOOK`. Message format:

```
[ZO] Job: <job-type> | Status: <complete|failed|partial> | Duration: <HH:MM:SS>
Details: <one-line summary>
<optional PR URL or artifact path>
```

If a job is **blocked** (awaiting a human decision, credential expired, disk full, etc.):

1. Zo posts to Discord #blocked:
   ```
   [ZO BLOCKED] Job: <job-type> | Reason: <description>
   Action needed: <specific instruction for Amit>
   Session URL: <zo.computer/workspace/tempo-flow/jobs/<job-id>>
   ```
2. After 2 hours with no Discord reaction from Amit, Zo calls the Twilio SMS webhook (configured in `TWILIO_SMS_WEBHOOK` env var) to send an SMS:
   ```
   Zo blocked on <job-type>. Action needed: <description>. Discord: #blocked
   ```
3. After 24 hours still blocked, Zo cancels the job and logs the cancellation to `agent_runs` with `status: "cancelled-timeout"`.

---

## 6. Troubleshooting

### Timeout on Very Long Jobs

**Symptom**: Job disappears or shows "timed out" in Zo's dashboard after 1–2 hours.

**Cause**: Zo has a default job timeout. Long transcription or asset generation jobs can exceed it.

**Fix**:
1. In Zo's job runner settings, increase the timeout for the `tempo-flow` workspace to 6 hours (or the maximum allowed by your plan).
2. Break large batch jobs into smaller sub-jobs. For example, generate screenshots per device size rather than all at once.
3. Use Zo's checkpoint/resume feature if available: save intermediate state to `/tempo-flow/logs/<job-id>_checkpoint.json` and resume from that checkpoint if the job is restarted.

### API Key Rotation

**Symptom**: Job fails with `401 Unauthorized` or `403 Forbidden` from OpenRouter or GitHub.

**Cause**: API key expired, rotated, or budget cap hit.

**Fix**:
1. Go to Zo dashboard → **Settings → Environment Variables**.
2. Update the relevant key.
3. Re-run the failed job. Zo does not automatically retry on 401.
4. For OpenRouter budget caps: log in to `openrouter.ai`, navigate to **Keys → zo-tempo-flow**, and increase the monthly cap or reset the budget period.
5. Set a calendar reminder to rotate all keys quarterly.

### Workspace Disk Full

**Symptom**: Job fails with "No space left on device" or similar.

**Cause**: `/tempo-flow/artifacts/` or `/tempo-flow/assets/` has accumulated too many large files.

**Fix**:
1. SSH into the Zo workspace (if supported) or use Zo's file manager.
2. Delete old release artifacts beyond the current + previous two versions.
3. Compress transcript files older than 3 months: `tar -czf transcripts-archive-<date>.tar.gz /tempo-flow/transcripts/raw/<year>/`
4. Move large archives to external S3-compatible storage (add `AWS_S3_BUCKET` and `AWS_ACCESS_KEY_ID` to env vars and update job templates to upload to S3 before deleting local copies).

### Convex Write Failures

**Symptom**: Job completes but no row appears in `agent_artifacts` or `agent_runs`.

**Cause**: HMAC signature mismatch, Convex deployment URL changed, or `CONVEX_DEPLOY_KEY` expired.

**Fix**:
1. Verify `CONVEX_URL` matches the active Convex deployment in your Convex dashboard.
2. Re-generate the `CONVEX_DEPLOY_KEY` and update it in Zo's environment variables.
3. Verify the HMAC secret matches between Zo (`TEMPO_ZO_HMAC_SECRET`) and the Convex HTTP action handler.
4. Test with a manual `curl` from Zo's terminal:
   ```bash
   curl -X POST $CONVEX_URL/internal/agent/artifact \
     -H "Content-Type: application/json" \
     -H "X-Hmac-Signature: <test-sig>" \
     -d '{"agent":"zo","job_type":"test","timestamp":"2026-04-17T00:00:00Z"}'
   ```

### Discord Webhook Failures

**Symptom**: Job completes but no message appears in Discord.

**Cause**: Webhook URL invalidated (Discord deletes webhooks if the channel is deleted or the webhook is manually removed).

**Fix**:
1. Regenerate the webhook in Discord: **#agent-zo → Edit Channel → Integrations → Webhooks**.
2. Update `DISCORD_ZO_WEBHOOK` in Zo environment variables.

---

## 7. Cost Considerations

### Estimated Monthly Budget

| Cost category | Estimated monthly cost (USD) |
|---|---|
| Zo workspace plan (persistent disk + compute) | $30–$80 depending on tier |
| GPU node usage (transcription, avatar R&D) | $10–$50 depending on hours |
| OpenRouter API calls (Gemma 4 26B sweeps) | $5–$20 depending on repo size |
| Image generation API (asset batch) | $10–$30 per release |
| GitHub API | Free (within rate limits) |
| **Total estimated** | **$55–$180/month** |

### When to Pause the Workspace

- Between major development phases (e.g., after v1.0 launch, before v1.1 sprint starts), pause the Zo workspace in the dashboard to stop compute billing.
- Keep persistent disk active even when paused — disk billing is minimal and losing the `/tempo-flow/` directory structure would require manual re-setup.
- Resume the workspace 24 hours before a planned nightly sweep or asset generation job to ensure the environment is warm.

### When to Upgrade the Plan

- If nightly sweeps consistently time out: upgrade to a plan with longer job timeout limits.
- If asset generation jobs are slow: add a dedicated GPU node rather than upgrading the base plan.
- If disk is consistently near capacity: add a storage expansion add-on rather than moving to a higher tier.

### Cost Alerts

Configure Zo's spending alerts (if available) to notify via email when monthly spend exceeds $100. Cross-reference with OpenRouter's budget cap on the `zo-tempo-flow` key to prevent runaway API spending from a runaway sweep job.


---

## 6.3 Twin.so Setup

> **Source file:** `twin_setup.md`

# Twin.so — Tempo Flow Setup & Usage Guide

## 1. What Twin Is

Twin.so is a browser automation agent that operates a real web browser — clicking buttons, filling forms, navigating between pages, and reading on-screen content — exactly as a human would. Unlike API integrations, Twin works against the live rendered DOM of any website, making it effective for dashboards and admin consoles that expose no public API or where the API is too cumbersome for routine tasks. For Tempo Flow, Twin is the designated executor for all GUI-gated operations: submitting builds to the Apple App Store and Google Play Store, configuring RevenueCat product catalogs, filling out platform privacy questionnaires, generating legal documents on GetTerms.io, and managing Vercel and Expo project settings. Twin does not hold credentials permanently; it uses stored browser sessions for re-authentication and defers to Amit for any step requiring physical 2FA (hardware keys, SMS codes received on Amit's personal device, or identity verification requiring a government ID).

---

## 2. First-Time Account Setup

### 2.1 Create Account

1. Navigate to `https://twin.so` and create an account using the same email used for Tempo Flow services (`amitlevin65@protonmail.com`).
2. Choose the plan that supports multiple concurrent browser sessions and persistent session storage — required for maintaining logged-in states across jobs without re-authenticating every run.
3. Verify your email and complete any identity verification Twin requires.

### 2.2 Authenticate and Configure the Extension

1. If Twin offers a browser extension for session capture (used to export authenticated cookies from Amit's local browser to Twin's cloud session), install it in Chrome or Firefox.
2. After installing, click **Connect to Twin** in the extension and authorize with your Twin account.
3. This extension is used only during the initial session-capture step for each dashboard (see Section 3). Once the session is stored in Twin, the extension is not needed for routine Twin jobs.

### 2.3 Configure Session Storage

Twin stores authenticated browser sessions as encrypted session snapshots in its cloud. Configure the following:

1. In Twin's dashboard, open **Settings → Session Storage**.
2. Enable **Persistent Sessions** for all Tempo Flow dashboards.
3. Set session expiry policy:
   - Short-lived sessions (Vercel, OpenRouter, PostHog): refresh on each job run.
   - Long-lived sessions (App Store Connect, Play Console, RevenueCat): refresh weekly or when Twin reports a session expired error.
4. Enable **session audit log** so every login and action is timestamped and attributable to a Twin job ID.

### 2.4 Store Initial Sessions

For each dashboard in Section 3, follow the **first-time auth flow** described there. The general pattern is:

1. Amit logs in manually on his local browser with the Twin extension installed.
2. The extension exports the authenticated session to Twin's cloud.
3. Future Twin jobs load the stored session, bypassing the login form.
4. When a session expires, Twin will fail the job with `SESSION_EXPIRED` and post to Discord #blocked — Amit re-authenticates manually and re-exports the session.

---

## 3. Dashboards Twin Needs Access To

### 3.1 Apple Developer Program

**URL**: `https://developer.apple.com`

**Why**: Required for App Store Connect access, certificate management, and push notification configuration.

**First-time auth flow**:
- Apple Developer requires Apple ID login plus 2FA via trusted device (Amit's iPhone or Mac) and optionally device-based SMS. **Amit must complete the initial login and 2FA personally.**
- After Amit has authenticated, Twin captures the session via the browser extension.
- Twin can then drive remaining form-filling operations (certificate downloads, provisioning profile updates, App Store Connect navigation) without triggering 2FA again, as long as the session remains valid (Apple sessions typically last several weeks).
- **If Apple invalidates the session** (logout, suspicious activity flag, or new device detection), Twin will fail and post to Discord #blocked. Amit must re-authenticate.

**Credentials Twin must NOT store**: Apple ID password. Twin stores only the post-authentication session cookie, never the password.

**What Twin automates on this dashboard**: Navigation to App Store Connect from the Developer portal, certificate status checks, and provisioning profile downloads.

### 3.2 Google Play Console

**URL**: `https://play.google.com/console`

**Why**: Required for submitting Android builds, managing app listings, content rating, and internal test tracks.

**First-time auth flow**:
- Google Play Console uses Google OAuth. Amit completes the initial $25 developer registration fee and account setup **personally** (this is a one-time payment and identity verification that cannot be delegated).
- After account setup, Amit logs in with his Google account and Twin captures the session via the extension.
- Google sessions on Play Console are typically long-lived but may require periodic re-authentication via Google's security check (which may trigger 2FA on Amit's device).

**What Twin automates**: Creating and updating app listings, uploading AAB files to internal test tracks, filling content ratings, data safety forms, and managing release tracks.

### 3.3 App Store Connect

**URL**: `https://appstoreconnect.apple.com`

**Why**: App record creation, metadata entry, screenshot upload, pricing configuration, TestFlight management, and release submission.

**First-time auth flow**:
- App Store Connect is accessed via the same Apple Developer session. If the Developer portal session is valid, App Store Connect is accessible without a separate login step.
- Amit creates the initial app record manually (this confirms the Bundle ID and primary language — decisions that require judgment).
- After the record exists, Twin handles all subsequent metadata updates.

**What Twin automates**:
- Filling app metadata (description, keywords, promotional text, support URL, marketing URL) from a structured JSON input file that Amit maintains at `docs/store-metadata/appstore.json`.
- Uploading screenshots from `/tempo-flow/assets/appstore/<release>/` (generated by Zo).
- Setting pricing and availability.
- Submitting builds from TestFlight for App Review.
- Managing App Privacy labels (see Section 3.7).

### 3.4 Google Play Console — App Listing

(Same dashboard as 3.2, different section.)

**What Twin automates**:
- Short and long descriptions from `docs/store-metadata/play.json`.
- Feature graphic and screenshots uploaded from `/tempo-flow/assets/appstore/<release>/` (Google Play accepts the same device frames as App Store for phone sizes).
- Content rating questionnaire (answers sourced from `docs/store-metadata/content-rating-answers.json`).
- Data safety form (see Section 3.8).
- Internal test track management and promotion to closed/open testing.
- Pricing and distribution settings.

### 3.5 RevenueCat Dashboard

**URL**: `https://app.revenuecat.com`

**Why**: Product catalog setup, entitlement configuration, offering creation, and webhook configuration for in-app subscription management.

**First-time auth flow**:
- Amit creates the RevenueCat account and the Tempo Flow project manually.
- After project creation, Amit logs in and Twin captures the session.

**Products to create** (in the RevenueCat dashboard under the Tempo Flow project):

| Product ID | Store | Type | Price |
|---|---|---|---|
| `tempo_basic_monthly` | App Store + Play | Auto-renewing subscription | Tier to be set by Amit |
| `tempo_basic_annual` | App Store + Play | Auto-renewing subscription | |
| `tempo_pro_monthly` | App Store + Play | Auto-renewing subscription | |
| `tempo_pro_annual` | App Store + Play | Auto-renewing subscription | |
| `tempo_max_monthly` | App Store + Play | Auto-renewing subscription | |
| `tempo_max_annual` | App Store + Play | Auto-renewing subscription | |

**Entitlements to create**:
- `basic` — unlock Basic tier features
- `pro` — unlock Pro tier features
- `max` — unlock Max tier features

**Offerings to create**:
- `default` offering containing all six products
- `launch_promo` offering (if a promotional offering is needed at launch — configure with Amit's input)

**Webhook configuration**:
- In RevenueCat → **Project Settings → Integrations → Webhooks**, add a new webhook:
  - URL: `https://<convex-deployment>.convex.cloud/revenuecat/webhook`
  - Events: All events (or at minimum: `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `BILLING_ISSUE`, `EXPIRATION`)
  - Shared secret: Copy from `REVENUECAT_WEBHOOK_SECRET` in Vercel/Convex environment variables.

**What Twin automates**: All of the above product, entitlement, offering, and webhook configuration steps, driven by a structured input JSON at `docs/store-metadata/revenuecat-config.json`.

### 3.6 GetTerms.io

**URL**: `https://getterms.io`

**Why**: Generates Privacy Policy, Terms of Service, and Cookie Policy documents and provides embed IDs for rendering them in the app.

**First-time auth flow**:
- Amit creates the GetTerms account and the Tempo Flow policy set manually.
- Twin captures the session after initial setup.

**What Twin automates**:
1. Navigating to the Tempo Flow policy set.
2. Triggering a new version generation (when Amit updates `docs/store-metadata/getterms-inputs.json` with any new data practices).
3. Copying the three embed IDs from the GetTerms dashboard.
4. Navigating to the Vercel dashboard (see Section 3.9) and updating the following environment variables:
   - `TEMPO_GETTERMS_PRIVACY_ID=<new-id>`
   - `TEMPO_GETTERMS_TERMS_ID=<new-id>`
   - `TEMPO_GETTERMS_COOKIES_ID=<new-id>`
5. Triggering a Vercel redeploy to apply the new env vars.
6. Posting the new embed IDs to Discord #agent-twin for Amit's record.

### 3.7 Apple App Privacy Labels

**URL**: `https://appstoreconnect.apple.com` → App record → App Privacy

**Why**: Apple requires detailed privacy label disclosures before any app can be submitted or updated. The questionnaire has 40+ fields across data categories.

**First-time auth flow**: Same Apple Developer session as Section 3.1.

**Answer source**: Amit maintains a canonical answer file at `docs/store-metadata/privacy-labels-apple.json`. The schema follows Apple's data category groupings:
```json
{
  "data_not_collected": false,
  "categories": {
    "contact_info": { "collected": true, "linked_to_user": true, "used_for_tracking": false, "purposes": ["app_functionality", "analytics"] },
    "identifiers": { "collected": true, "linked_to_user": true, "used_for_tracking": false, "purposes": ["app_functionality"] },
    "usage_data": { "collected": true, "linked_to_user": false, "used_for_tracking": false, "purposes": ["analytics", "product_personalization"] }
  }
}
```

**What Twin automates**: Loads `privacy-labels-apple.json`, navigates to each category in App Store Connect's privacy form, selects the correct checkboxes and radio buttons, and saves the form. Twin does not submit the privacy section for review independently — it saves a draft and posts to Discord #agent-twin for Amit to review before final submission.

### 3.8 Google Play Data Safety Form

**URL**: `https://play.google.com/console` → App → Policy → App content → Data safety

**Why**: Google Play requires similar privacy disclosures to Apple, organized into the Data Safety section.

**Answer source**: Amit maintains `docs/store-metadata/data-safety-google.json` using Google's category schema.

**What Twin automates**: Same pattern as Apple labels — loads the JSON, fills each section of the form, saves (does not submit to review independently).

### 3.9 Vercel Dashboard

**URL**: `https://vercel.com/dashboard`

**Why**: Domain binding for `tempoflow.app`, environment variable management, deployment protection, and build configuration.

**First-time auth flow**:
- Amit logs in to Vercel (GitHub OAuth).
- Twin captures the session.

**What Twin automates**:
- Adding and verifying custom domain `tempoflow.app` (if not already done via CLI).
- Setting and updating environment variables for Production, Preview, and Development environments.
- Enabling/disabling Deployment Protection for preview URLs.
- Checking deployment status and reading build logs for failed deployments.

**Environment variables Twin manages** (sourced from Amit's Vercel env file at `docs/config/vercel-env.md`):
- `TEMPO_GETTERMS_*` (updated as part of GetTerms workflow)
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `REVENUECAT_WEBHOOK_SECRET`
- Any other vars Amit adds to the canonical env file.

### 3.10 EAS Build Dashboard

**URL**: `https://expo.dev` → Organization → Project → Builds

**Why**: Managing iOS and Android build credentials, build profiles, and internal distribution.

**First-time auth flow**:
- Amit creates the EAS project and sets up credentials interactively via `eas credentials` on his local machine. **This step cannot be delegated — Apple certificate signing requires Amit's Apple Developer account.**
- After credentials are set up, Twin can navigate the EAS dashboard to check build status, download artifacts, and manage distribution.

**What Twin automates**:
- Checking build queue status.
- Downloading build artifacts to Zo's `/tempo-flow/artifacts/` (coordinated with Zo jobs).
- Managing internal distribution groups (adding tester emails).
- Reading build logs when a build fails.

### 3.11 Expo.dev Organization

**URL**: `https://expo.dev`

**Why**: Organization settings, push notification credentials, and project configuration.

**First-time auth flow**: Amit creates the Expo organization manually. Twin captures the session.

**What Twin automates**: Navigating to push notification credentials, verifying they are configured correctly, and reading any error states in the Expo dashboard.

### 3.12 OpenRouter

**URL**: `https://openrouter.ai`

**Why**: API key management and budget cap configuration for AI inference.

**What Twin automates**:
- Generating new API keys when rotation is needed (keys named by purpose: `cursor-cloud`, `zo-tempo-flow`, `app-server`).
- Setting monthly budget caps on each key.
- Reading current spend and posting a weekly spend summary to Discord #agent-zo.
- After generating a new key, Twin posts it to Discord #blocked (encrypted) for Amit to manually update in the relevant environment (Vercel, Zo, Cursor Cloud).

**Security note**: Twin does NOT directly write API keys to production systems. It generates the key, posts it to a secure channel, and Amit or Cursor Cloud applies it.

### 3.13 PostHog Self-Hosted Admin

**URL**: `https://posthog.tempoflow.app` (or wherever self-hosted PostHog is deployed)

**Why**: First-run admin setup, project creation, and API key extraction for the Tempo Flow analytics pipeline.

**First-time auth flow**: PostHog self-hosted first-run creates a superuser. Amit completes this manually. Twin captures the admin session.

**What Twin automates**:
- Creating a PostHog project named "Tempo Flow Production".
- Copying the Project API Key and Personal API Key from the PostHog settings page.
- Posting both keys to Discord #blocked for Amit to manually add to Vercel env vars.
- Navigating to the PostHog dashboards for the weekly digest (Pokee pulls PostHog data via API, not Twin).

---

## 4. Standard Job Templates

Each template is a self-contained prompt to give to Twin. Substitute `{{variable}}` placeholders at call time. Run via Twin's job runner or API.

---

### 4.1 Submit New iOS Build to TestFlight

**Trigger**: Manual, or Pokee triggers after Zo confirms EAS build artifact is in `/tempo-flow/artifacts/{{RELEASE_TAG}}/`.

**Prompt template**:

```
You are a browser automation agent. You will submit an iOS build to TestFlight on App Store Connect.

Target URL: https://appstoreconnect.apple.com
App name: Tempo Flow
Build version: {{BUILD_VERSION}} (e.g. 1.0.0 build 42)
Release notes: {{RELEASE_NOTES_PATH}} — read the file content and use it as TestFlight "What to Test" text.

Steps:
1. Navigate to https://appstoreconnect.apple.com and verify the session is authenticated.
2. Click "My Apps" and select "Tempo Flow".
3. Click "TestFlight" in the top navigation.
4. Wait for the build {{BUILD_VERSION}} to appear in the build list (it will have been uploaded by EAS).
   - If it does not appear within 5 minutes, stop and post to Discord #blocked:
     "TestFlight build {{BUILD_VERSION}} not visible. Check EAS upload status."
5. Click on the build {{BUILD_VERSION}}.
6. Fill in the "What to Test" field with the content from {{RELEASE_NOTES_PATH}}.
7. Under "Groups", add the "Internal Testers" group.
8. Click "Save".
9. If a compliance dialog appears (encryption), answer:
   - "Does your app use encryption beyond what Apple provides in the OS?" → No (adjust if Amit's compliance JSON at docs/store-metadata/compliance.json says otherwise).
10. Click "Submit to Review" if the build requires review, or confirm distribution to the Internal group.
11. Take a screenshot of the final success state.
12. Post to Discord #agent-twin:
    "iOS build {{BUILD_VERSION}} submitted to TestFlight. Screenshot: [attach]"

On any error: post to Discord #blocked with the exact error message and the screenshot.
```

---

### 4.2 Submit New Android Build to Internal Testing

**Trigger**: Manual, or Pokee triggers after EAS build artifact is confirmed.

**Prompt template**:

```
You are a browser automation agent. You will upload an Android build to the Internal Testing track on Google Play Console.

Target URL: https://play.google.com/console
App name: Tempo Flow
AAB file location: {{AAB_FILE_URL}} (either a direct download URL or a path in Zo's artifact store)
Release name: {{RELEASE_TAG}}
Release notes (en-US): Read from {{RELEASE_NOTES_PATH}}

Steps:
1. Navigate to https://play.google.com/console and verify session is authenticated.
2. Select the Tempo Flow app.
3. In the left navigation, click "Testing" → "Internal testing".
4. Click "Create new release".
5. Upload the AAB file from {{AAB_FILE_URL}}.
   - If the file is in Zo's workspace, download it first using Zo's file access API, then upload.
6. Set the release name to {{RELEASE_TAG}}.
7. Fill in the release notes for "en-US" with the content from {{RELEASE_NOTES_PATH}}.
8. Click "Save" and then "Review release".
9. Review the pre-launch report warnings — if any are severity "Error", stop and post to Discord #blocked listing the errors.
10. If no errors, click "Start rollout to Internal testing".
11. Take a screenshot of the confirmation screen.
12. Post to Discord #agent-twin:
    "Android build {{RELEASE_TAG}} submitted to Internal Testing. Screenshot: [attach]"

On any error: post to Discord #blocked with exact error and screenshot.
```

---

### 4.3 Refresh App Privacy Labels for Tempo 1.0

**Trigger**: Manual before any App Store submission that follows a change to data practices.

**Prompt template**:

```
You are a browser automation agent. You will update the App Privacy labels for Tempo Flow on App Store Connect.

Target URL: https://appstoreconnect.apple.com
App name: Tempo Flow
Answer source file: docs/store-metadata/privacy-labels-apple.json (read this file from the repo)

Steps:
1. Navigate to https://appstoreconnect.apple.com → My Apps → Tempo Flow → App Privacy.
2. Read the content of docs/store-metadata/privacy-labels-apple.json.
3. For each data category in the JSON:
   a. Navigate to that category in the App Store Connect privacy form.
   b. Set "Do you collect this data type?" to match the "collected" field.
   c. If collected: set "Is this data linked to the user's identity?" to match "linked_to_user".
   d. If collected: set "Is this data used for tracking?" to match "used_for_tracking".
   e. If collected: select all purposes listed in the "purposes" array.
4. After filling all categories, click "Save".
   Do NOT click "Publish" — save as draft only.
5. Take a screenshot of the saved state.
6. Post to Discord #agent-twin:
    "App Privacy labels updated (draft saved). Amit: please review at appstoreconnect.apple.com before publishing."

On any form error: post to Discord #blocked with the field name and the error.
```

---

### 4.4 Create RevenueCat Offering for Tempo 1.0 Launch

**Trigger**: Manual, run once before launch.

**Prompt template**:

```
You are a browser automation agent. You will configure the RevenueCat product catalog for Tempo Flow's 1.0 launch.

Target URL: https://app.revenuecat.com
Project: Tempo Flow
Config source: docs/store-metadata/revenuecat-config.json

Steps:
1. Navigate to https://app.revenuecat.com and verify session.
2. Select the Tempo Flow project.

--- Products ---
3. Navigate to "Products" and create the following if they do not already exist:
   For App Store:
   - tempo_basic_monthly (auto-renewing subscription)
   - tempo_basic_annual (auto-renewing subscription)
   - tempo_pro_monthly (auto-renewing subscription)
   - tempo_pro_annual (auto-renewing subscription)
   - tempo_max_monthly (auto-renewing subscription)
   - tempo_max_annual (auto-renewing subscription)
   For Play Store (same IDs, mark as "Google Play" platform).

--- Entitlements ---
4. Navigate to "Entitlements" and create if not existing:
   - Identifier: basic, Display name: Basic
   - Identifier: pro, Display name: Pro
   - Identifier: max, Display name: Max
5. Attach products to entitlements:
   - basic entitlement: attach tempo_basic_monthly, tempo_basic_annual
   - pro entitlement: attach tempo_pro_monthly, tempo_pro_annual
   - max entitlement: attach tempo_max_monthly, tempo_max_annual

--- Offerings ---
6. Navigate to "Offerings" and create if not existing:
   - Identifier: default, Display name: Default Offering
   - Attach all 6 products as packages: basic_monthly, basic_annual, pro_monthly, pro_annual, max_monthly, max_annual

--- Webhook ---
7. Navigate to "Project Settings" → "Integrations" → "Webhooks".
8. If no webhook exists for Convex, create one:
   - URL: https://<convex-deployment>.convex.cloud/revenuecat/webhook
   - Read the deployment URL from docs/config/convex-deployment.txt
   - Events: select all
   - Shared secret: post to Discord #blocked asking Amit to provide the REVENUECAT_WEBHOOK_SECRET value, then wait for Amit's reply before saving.

9. Take a screenshot of the completed Offerings view.
10. Post to Discord #agent-twin:
    "RevenueCat catalog configured. Products: 6. Entitlements: 3. Offering: default. Screenshot: [attach]"
```

---

### 4.5 Generate New GetTerms Policy Version and Copy Embed IDs to Vercel

**Trigger**: Manual, run whenever Tempo Flow's data practices change (new analytics, new third-party integrations, etc.).

**Prompt template**:

```
You are a browser automation agent. You will regenerate Tempo Flow's legal policies on GetTerms.io and update the resulting embed IDs in Vercel.

GetTerms URL: https://getterms.io
Vercel URL: https://vercel.com/dashboard
Input file: docs/store-metadata/getterms-inputs.json

Steps:
1. Navigate to https://getterms.io and verify session.
2. Open the Tempo Flow policy set.
3. Review current inputs against docs/store-metadata/getterms-inputs.json.
   If any fields differ, update them in the GetTerms form.
4. Click "Generate new version" (or equivalent).
5. Wait for generation to complete.
6. Copy the three embed IDs:
   - Privacy Policy embed ID
   - Terms of Service embed ID
   - Cookie Policy embed ID
7. Record them in a local variable (do not post them to a public Discord channel).

8. Navigate to https://vercel.com/dashboard.
9. Select the Tempo Flow project.
10. Navigate to Settings → Environment Variables.
11. Update or create the following variables for the Production environment:
    - TEMPO_GETTERMS_PRIVACY_ID = <privacy-embed-id>
    - TEMPO_GETTERMS_TERMS_ID = <terms-embed-id>
    - TEMPO_GETTERMS_COOKIES_ID = <cookies-embed-id>
12. Save changes.
13. Trigger a redeployment: navigate to Deployments, click "Redeploy" on the latest production deployment.
14. Wait for redeployment to succeed (check status every 30 seconds, timeout after 5 minutes).
15. Post to Discord #agent-twin:
    "GetTerms policies regenerated and embed IDs updated in Vercel. Vercel redeployment: [complete|timed out]. Privacy/Terms/Cookies IDs updated."

On session expiry (GetTerms or Vercel): post to Discord #blocked.
```

---

## 5. Handoff Patterns

### 5.1 Twin Completes a Dashboard Action → Discord → Optional Pokee Handoff

After every successful job, Twin posts a structured summary to Discord #agent-twin:

```
[TWIN] Job: <job-name> | Status: complete | Duration: <HH:MM:SS>
Dashboard: <dashboard-name>
Summary: <one-line description of what was done>
<screenshot URL if applicable>
```

If the completed action requires a follow-up release announcement (e.g., a new build was submitted to TestFlight), Twin also fires a webhook to Pokee:

```json
{
  "source": "twin",
  "event": "build_submitted",
  "platform": "ios | android",
  "release": "{{RELEASE_TAG}}",
  "dashboard_url": "<app-store-connect-or-play-console-url>",
  "timestamp": "<iso>"
}
```

Pokee receives this and, depending on the event type, either routes to Discord only (internal builds do not get public announcements) or prepares a release announcement for public channels once Amit approves (see `pokee_setup.md` Section 4.1).

### 5.2 Twin Hits a CAPTCHA or 2FA Prompt → #blocked + SMS

CAPTCHA and 2FA prompts cannot be solved by Twin automatically. When Twin encounters either:

1. Twin immediately pauses the job and posts to Discord #blocked:
   ```
   [TWIN BLOCKED] Job: <job-name> | Reason: <CAPTCHA | 2FA | session-expired>
   Dashboard: <url>
   Action needed: Complete the verification at the Twin session URL below, then resume the job.
   Twin session: <twin-session-live-url>
   ```

2. Simultaneously, Twin triggers the Twilio SMS webhook (`TWILIO_SMS_WEBHOOK` env var) with:
   ```
   Twin blocked on <job-name> at <dashboard>. Reason: <CAPTCHA|2FA>. Complete at: <twin-session-url>
   ```

3. After Amit completes the verification step in the Twin session UI, he clicks "Resume" in the Twin dashboard. Twin continues from where it paused.

4. If Amit does not resume within 4 hours, Twin cancels the job and logs it to Convex `agent_runs` with `status: "cancelled-awaiting-human"`.

---

## 6. Credential Storage

### What Twin Stores (Session Cookies, Not Passwords)

Twin stores only post-authentication browser sessions — specifically the HTTP cookies set by each platform after a successful login. Passwords are never stored in Twin.

| Dashboard | Session duration | Re-auth frequency |
|---|---|---|
| Apple Developer / App Store Connect | Several weeks (Apple's discretion) | As needed when Twin reports session expired |
| Google Play Console | Several weeks (Google's discretion) | As needed |
| RevenueCat | Long-lived (weeks to months) | As needed |
| GetTerms.io | Long-lived | As needed |
| Vercel | Moderate (days to weeks, Vercel uses short-lived JWTs) | Weekly |
| EAS / Expo.dev | Long-lived | As needed |
| OpenRouter | Long-lived | As needed |
| PostHog admin | Long-lived | As needed |

### What Amit Must Re-Enter Each Time

- **Apple 2FA codes** — tied to Amit's trusted Apple device. Cannot be delegated.
- **Google 2FA codes** — if Google prompts for 2FA during session refresh.
- **Any password change prompts** — if a platform forces a password change, Amit must complete it and then re-export the session.
- **CAPTCHA challenges** — any platform that presents a CAPTCHA on login.

### 1Password Export (Recommended)

Store all Tempo Flow dashboard credentials in a 1Password vault named `Tempo Flow Agents`. For each dashboard, create a Login item with:
- Username/email
- Password
- 2FA seed (TOTP) if the platform supports authenticator-based 2FA (preferred over SMS for dashboards where Amit controls 2FA setup)
- Notes field: Twin session last exported on `<date>`

Using TOTP-based 2FA where possible (rather than SMS) gives Twin a path to read the TOTP code from 1Password CLI (`op item get "..." --fields otp`) in jobs that include a TOTP step. This applies to platforms like Vercel, PostHog, and OpenRouter — not Apple (Apple requires its own trusted device).

---

## 7. Troubleshooting

### Session Expired

**Symptom**: Twin job fails immediately with `NOT_AUTHENTICATED` or is redirected to a login page.

**Fix**:
1. Check Discord #blocked for the auto-posted blocked message.
2. Amit opens the Twin session URL, completes login (including any 2FA), and re-exports the session via the browser extension.
3. Re-run the Twin job.

### CAPTCHA on Login

**Symptom**: Twin encounters a CAPTCHA immediately after navigating to a login page.

**Fix**:
1. As above — Amit must complete the CAPTCHA manually via the Twin session URL.
2. Consider using the browser extension's session export after a successful manual login rather than having Twin navigate the login form at all.

### Element Not Found / Layout Changed

**Symptom**: Twin's job fails partway through with an error like `Could not find button "Submit to Review"` or `Element not visible`.

**Cause**: The target dashboard has updated its UI.

**Fix**:
1. Post to Discord #blocked with the screenshot Twin captured.
2. Update the Twin job prompt to use updated selectors, labels, or navigation paths.
3. Re-run the job.
4. If the platform change is frequent, consider writing Twin jobs with multiple fallback selector strategies.

### Apple Build Not Appearing in TestFlight

**Symptom**: Twin waits 5 minutes and the build does not appear.

**Cause**: EAS Build has not finished uploading, or Apple's processing queue is delayed.

**Fix**:
1. Check EAS Build dashboard for the build status.
2. Apple typically takes 15–30 minutes to process a new binary. Wait and re-run the Twin TestFlight job.
3. If still not appearing after 2 hours, check for email from Apple regarding rejection or processing errors.

### RevenueCat Webhook Not Firing

**Symptom**: Twin configured the webhook but Convex is not receiving RevenueCat events.

**Fix**:
1. In RevenueCat dashboard → Webhooks, check the delivery log for the webhook.
2. Verify the Convex HTTP action URL is correct and accessible (test with a `curl` from Zo).
3. Verify the shared secret matches `REVENUECAT_WEBHOOK_SECRET` in Convex environment.

### Rate Limiting / Anti-Bot Detection

**Symptom**: Twin is blocked by the target platform's anti-bot detection (Cloudflare challenge, unusual traffic alert).

**Fix**:
1. Add a delay between Twin actions in the job prompt (e.g., "Wait 2 seconds between each form field fill").
2. Reduce the frequency of Twin jobs against the affected platform.
3. Use the stored session approach (Section 2.4) rather than having Twin navigate login forms, which are more likely to trigger bot detection.


---

## 6.4 Pokee AI Setup

> **Source file:** `pokee_setup.md`

# Pokee AI — Tempo Flow Setup & Usage Guide

## 1. What Pokee Is

Pokee AI is a multi-SaaS orchestration agent accessible at `pokee.ai`. Given a plain-text workflow prompt, Pokee connects to authorized integrations — Gmail, Google Docs, GitHub, YouTube, LinkedIn, Instagram, Facebook, TikTok, X (Twitter), Discord, Slack, newsletter platforms, and analytics tools — and executes multi-step workflows across them without writing code. Pokee is not a code executor and not a browser driver; it operates through official APIs and OAuth-authorized connections. For Tempo Flow, Pokee serves as the **router and cross-poster** in the agent spine: it receives webhook events from GitHub and Convex, decides which downstream agents or channels need to act, posts social content, generates and sends digests, triages GitHub Issues, routes founder-inbox messages, and ensures every significant event in the system is surfaced to Amit or to the appropriate agent. Pokee is always on and always connected — it is the nerve center that keeps Zo, Twin, Cursor Cloud, and Amit synchronized.

---

## 2. First-Time Account Setup

### 2.1 Create Account

1. Navigate to `https://pokee.ai` and sign up with `amitlevin65@protonmail.com`.
2. Select the plan that supports the number of active integrations needed (at minimum: GitHub, Gmail, YouTube, LinkedIn, Instagram, Facebook, TikTok, X, Discord, PostHog, Sentry, and one newsletter platform — verify plan limits before choosing).
3. Complete email verification.

### 2.2 Authorize Each Integration

For each integration listed in Section 3, Pokee will walk through an OAuth or API-key authorization flow. Complete each one in order before creating any workflow templates. Pokee will refuse to run a workflow that references an unauthorized integration.

### 2.3 Test with a Dry Run

Before activating any live workflow, run a dry-run test:

1. In Pokee's workflow editor, create a test workflow:
   ```
   Send a Discord message to the webhook at {{DISCORD_ZO_WEBHOOK}} with the text "Pokee dry-run test: {{timestamp}}".
   ```
2. Run the workflow manually.
3. Verify the message appears in Discord #agent-zo.
4. Delete the test workflow.

If the Discord message does not appear, troubleshoot the integration before proceeding (see Section 7).

---

## 3. Integrations to Connect for Tempo Flow

### 3.1 GitHub

**Integration type**: GitHub App (OAuth)

**Authorization steps**:
1. In Pokee → Integrations → GitHub, click **Connect**.
2. Authorize Pokee to access the `tempoflow` repository (and organization if applicable).
3. Grant permissions: Issues (read/write), Pull Requests (read/write), Releases (read), Webhooks (read), Labels (read/write), Contents (read).
4. Confirm the installation.

**What Pokee uses this for**: Receiving `issues.opened`, `pull_request.opened`, `pull_request.merged`, and `release.published` events; applying labels; posting comments on issues; reading TASKS.md.

**Webhook configuration**: In GitHub → Repository Settings → Webhooks, add a Pokee-provided webhook URL (Pokee generates this during setup) for the following events: Issues, Pull requests, Releases, Pushes to main.

### 3.2 Gmail

**Integration type**: Google OAuth (Gmail read/send scope)

**Authorization steps**:
1. In Pokee → Integrations → Gmail, click **Connect** and authorize with Amit's founder Google account.
2. Grant scopes: `gmail.readonly`, `gmail.send`, `gmail.labels`.
3. This account is the "Ask the Founder" inbox: `amitlevin65@protonmail.com` routed through a Gmail alias, or directly if the founder email uses Gmail.

**What Pokee uses this for**: Reading inbound "Ask the Founder" emails (filtered by a Gmail label `tempo-founder-inbox`) and routing them to the handoff pattern in Section 4.4.

### 3.3 YouTube

**Integration type**: Google OAuth (YouTube Data API v3)

**Authorization steps**:
1. In Pokee → Integrations → YouTube, click **Connect** and authorize with the Tempo Flow YouTube channel's Google account.
2. Grant scopes: `youtube.readonly` (for reading upload events).

**What Pokee uses this for**: Detecting new video uploads and triggering the vlog cross-post workflow (Section 4.5). Pokee does not post to YouTube — that remains manual or via EAS.

**Setup note**: Configure a Pokee trigger that polls the channel's uploads RSS feed every 30 minutes (or uses YouTube's PubSubHubbub push if Pokee supports it) to detect new uploads.

### 3.4 LinkedIn

**Integration type**: LinkedIn OAuth

**Authorization steps**:
1. In Pokee → Integrations → LinkedIn, connect Amit's personal LinkedIn account (or the Tempo Flow company page if one exists).
2. Grant scopes: `w_member_social` (post on behalf of member) or `w_organization_social` (post on behalf of company page).

**What Pokee uses this for**: Posting release announcements and founder vlog updates.

**Character limits**: LinkedIn posts support up to 3000 characters. Pokee's release announcement template (Section 4.1) generates platform-specific copy within this limit.

### 3.5 Instagram

**Integration type**: Meta Business OAuth (via Facebook Business Manager)

**Authorization steps**:
1. Connect the Tempo Flow Instagram account through Pokee's Meta integration.
2. The Instagram account must be a Professional account linked to a Facebook Page.
3. Grant permissions: `instagram_content_publish`, `pages_read_engagement`.

**What Pokee uses this for**: Posting release announcement square cards (1080x1080) generated by Zo.

**Media handling**: Instagram posts require a publicly accessible media URL. Pokee retrieves the image from Zo's artifact store URL (Zo publishes a signed URL to Convex `agent_artifacts.manifest_url`).

### 3.6 Facebook

**Integration type**: Meta Business OAuth (same connection as Instagram)

**Authorization steps**: Covered by the same Meta Business OAuth flow as Instagram (Section 3.5). Add the Tempo Flow Facebook Page as an authorized Page in Pokee's Meta integration settings.

**What Pokee uses this for**: Cross-posting release announcements to the Tempo Flow Facebook Page.

### 3.7 TikTok

**Integration type**: TikTok for Developers OAuth

**Authorization steps**:
1. In Pokee → Integrations → TikTok, connect the Tempo Flow TikTok account.
2. Grant scopes: `video.upload`, `video.publish` (if Pokee supports direct TikTok posting; otherwise, Pokee drafts the caption and Amit posts manually).

**What Pokee uses this for**: Posting vlog-derived short-form captions (generated by Zo's vlog pipeline) alongside a manually uploaded video clip from Amit.

**Note**: TikTok's API restrictions may limit automated video posting. If Pokee cannot post video directly, configure Pokee to instead DM Amit with the caption text and a reminder to post the clip.

### 3.8 X (Twitter)

**Integration type**: X Developer OAuth 2.0 (Bearer token + user context)

**Authorization steps**:
1. Create a Tempo Flow X Developer App at `developer.twitter.com` with Read + Write permissions.
2. In Pokee → Integrations → X, authorize using the app credentials and the Tempo Flow X account.

**What Pokee uses this for**: Posting tweet threads (generated by Zo's vlog pipeline) and release announcement tweets.

**Rate limits**: X API free/basic tier allows a limited number of posts per month. Monitor usage in the X Developer dashboard and upgrade the plan if volume increases.

### 3.9 Discord

**Integration type**: Discord Webhooks (per-channel) + Discord Bot (for reading channels)

**Authorization steps**:
1. Create a Discord bot for Pokee in the Tempo Flow Discord server:
   - Server Settings → Integrations → Webhooks: create webhooks for each agent channel.
   - Developer Portal: create a bot with permissions: Read Messages/View Channels, Send Messages, Embed Links.
2. In Pokee → Integrations → Discord, provide the bot token and the per-channel webhook URLs.
3. Channel webhooks needed:
   - `DISCORD_AGENT_CURSOR_WEBHOOK` — #agent-cursor
   - `DISCORD_AGENT_TWIN_WEBHOOK` — #agent-twin
   - `DISCORD_AGENT_POKEE_WEBHOOK` — #agent-pokee
   - `DISCORD_AGENT_ZO_WEBHOOK` — #agent-zo
   - `DISCORD_HANDOFFS_WEBHOOK` — #handoffs
   - `DISCORD_APPROVALS_WEBHOOK` — #approvals
   - `DISCORD_BLOCKED_WEBHOOK` — #blocked
   - `DISCORD_SUMMARY_WEBHOOK` — #summary
   - `DISCORD_FOUNDER_INBOX_WEBHOOK` — #founder-inbox

**What Pokee uses this for**: Posting agent status updates, routing handoffs, surfacing escalations, and sending the daily status summary.

### 3.10 PostHog

**Integration type**: PostHog API key (read-only)

**Authorization steps**:
1. In PostHog admin → Settings → API Keys, create a read-only personal API key named `pokee-digest`.
2. In Pokee → Integrations → PostHog (or Generic HTTP API), add the PostHog API base URL and key.

**What Pokee uses this for**: Pulling weekly active user counts, event totals, and funnel conversion rates for the Monday analytics digest (Section 4.2).

### 3.11 Sentry

**Integration type**: Sentry API key (read-only)

**Authorization steps**:
1. In Sentry → Settings → API → Auth Tokens, create a token with scopes: `project:read`, `event:read`.
2. In Pokee → Integrations → Sentry (or Generic HTTP API), add the Sentry API base URL, organization slug, and token.

**What Pokee uses this for**: Pulling weekly error counts, top errors by frequency, and new errors in the Monday analytics digest.

### 3.12 Newsletter Platform (Beehiiv / Substack / ConvertKit)

**Integration type**: Newsletter platform API key

**Authorization steps**:
1. Choose the primary newsletter platform (Beehiiv is recommended for its API completeness).
2. In the newsletter platform's settings, create an API key with send/draft permissions.
3. In Pokee → Integrations → Beehiiv (or the chosen platform), add the API key and the Tempo Flow publication ID.

**What Pokee uses this for**: Sending the weekly founder newsletter draft (generated by Zo's vlog pipeline) to subscribers. Pokee creates a draft, not a live send — Amit reviews and publishes manually.

---

## 4. Standard Workflow Templates

Each template includes the full prompt and the trigger/schedule. Configure these in Pokee's workflow editor.

---

### 4.1 Release Announcement Cross-Post

**Trigger**: GitHub webhook event `release.published` (Pokee receives this from the GitHub integration in Section 3.1)

**Schedule**: Runs immediately on trigger, no scheduled delay.

**Prompt template**:

```
A new Tempo Flow release has been published on GitHub.

Release tag: {{event.release.tag_name}}
Release title: {{event.release.name}}
Release body: {{event.release.body}}
Release URL: {{event.release.html_url}}
Asset manifest: {{convex_artifact_manifest_url}} (retrieve from Convex agent_artifacts where release={{event.release.tag_name}} and type="assets")

Steps:
1. Read the release body and extract:
   - Key features/changes (bullet list, max 5 items)
   - Any breaking changes
   - Upgrade instructions if applicable

2. Retrieve the social announcement card asset URL from the Convex artifact manifest for this release.
   If no asset is available: use the Tempo Flow default announcement card at {{TEMPO_DEFAULT_CARD_URL}}.

3. Generate platform-specific copy:

   LinkedIn post (max 2500 chars):
   "We just shipped {{release.tag_name}} of Tempo Flow — the AI daily planner built for neurodivergent users.

   What's new:
   {{bullet list of key features}}

   {{if breaking_changes}}Breaking change: {{breaking_changes}}{{end}}

   Try it free for 7 days: https://tempoflow.app
   Release notes: {{release_url}}"
   Attach the 1200x630 social card.

   X / Twitter thread (first tweet max 240 chars):
   Tweet 1: "Tempo Flow {{tag_name}} is live. {{top_feature_one_sentence}} 🧵"
   Tweet 2–4: One feature per tweet, max 240 chars each.
   Final tweet: "Free 7-day trial: https://tempoflow.app | Full notes: {{release_url}}"

   Instagram caption (max 2200 chars):
   "Tempo Flow {{tag_name}} is here. [Feature highlights]. Link in bio for a free 7-day trial."
   Attach the 1080x1080 square card.

   Facebook post:
   Same as LinkedIn post, slightly shortened to 1500 chars.

   TikTok caption (max 2200 chars but typically 150–300 chars for algorithm):
   "POV: your AI planner just got smarter. Tempo Flow {{tag_name}} drops today. #ADHD #neurodivergent #productivityapp #tempoflow"

   Discord #handoffs:
   "[RELEASE] Tempo Flow {{tag_name}} published. Notes: {{release_url}}. Social posts queued for LinkedIn, X, IG, FB, TikTok."

4. Post to each platform:
   a. LinkedIn — post with image.
   b. X — post the thread (first tweet, then replies).
   c. Instagram — post with image.
   d. Facebook — post with image.
   e. TikTok — post caption (Amit will add the video manually if needed).
   f. Discord #handoffs — post summary.

5. On any posting error, skip that platform and post to Discord #blocked:
   "[POKEE] Release cross-post failed for {{platform}}: {{error}}. Release: {{tag_name}}"

6. After all posts: post a summary to Discord #agent-pokee:
   "[POKEE] Cross-post complete for {{tag_name}}. Platforms: LinkedIn ✓/✗, X ✓/✗, IG ✓/✗, FB ✓/✗, TikTok ✓/✗"
```

---

### 4.2 Weekly Analytics Digest

**Trigger**: Scheduled — every Monday at 09:00 UTC.

**Prompt template**:

```
Generate the weekly Tempo Flow analytics digest for the week ending {{last_sunday_date}}.

Data sources:
- PostHog API: retrieve for the period {{last_monday_date}} to {{last_sunday_date}}:
  - Weekly active users (WAU)
  - New signups
  - Trial starts
  - Trial-to-paid conversion rate
  - Top 3 most-used features by event count
  - Funnel: signup → trial → subscription
- Sentry API: retrieve for the same period:
  - Total error events
  - New issues (first seen in period)
  - Top 3 errors by frequency with issue URL
  - Error rate (errors per active user)
- GitHub API: retrieve:
  - Current star count for tempoflow repo
  - Stars added this week
  - PRs merged this week (count + titles)
  - Issues opened and closed this week

Steps:
1. Fetch all data from the three sources above.
2. Format into a Markdown digest:

---
# Tempo Flow — Weekly Digest {{last_monday_date}} to {{last_sunday_date}}

## Growth
- WAU: {{wau}} ({{wau_delta}} vs prior week)
- New signups: {{signups}}
- Trial starts: {{trial_starts}}
- Trial → Paid conversion: {{conversion_rate}}%
- GitHub stars: {{stars}} (+{{stars_delta}} this week)

## Product
- Top features this week: {{feature_1}}, {{feature_2}}, {{feature_3}}
- PRs merged: {{pr_count}}
  {{pr_titles_as_bullet_list}}

## Errors
- Total errors: {{error_count}} ({{error_rate}} per WAU)
- New issues: {{new_issues}}
- Top errors:
  1. {{error_1_title}} — {{error_1_count}} occurrences — {{error_1_url}}
  2. {{error_2_title}} — {{error_2_count}} occurrences — {{error_2_url}}
  3. {{error_3_title}} — {{error_3_count}} occurrences — {{error_3_url}}

## Issues
- Opened: {{issues_opened}} | Closed: {{issues_closed}}
---

3. Email the digest to amitlevin65@protonmail.com via Gmail:
   Subject: "Tempo Flow Weekly Digest — {{last_monday_date}}"
   Body: the Markdown digest (render as HTML if possible).

4. Post the digest to Discord #summary via the summary webhook.

5. Write a row to Convex agent_runs:
   { agent: "pokee", job: "weekly-digest", status: "complete", week: "{{last_monday_date}}", timestamp: <iso> }

On any data fetch error, substitute "N/A" for the affected metric and add a note at the top of the digest.
```

---

### 4.3 GitHub Issue Triage

**Trigger**: GitHub webhook event `issues.opened`.

**Prompt template**:

```
A new GitHub issue has been opened on the Tempo Flow repository.

Issue number: {{event.issue.number}}
Issue title: {{event.issue.title}}
Issue body: {{event.issue.body}}
Author: {{event.issue.user.login}}
Created at: {{event.issue.created_at}}

Steps:
1. Analyze the title and body for keywords to determine the issue type:

   - If title/body contains any of: crash, error, exception, null, undefined, TypeError, 500 → label: `bug`
   - If title/body contains any of: feature, request, suggestion, add, would be nice → label: `enhancement`
   - If title/body contains any of: docs, documentation, readme, guide → label: `docs`
   - If title/body contains any of: perf, performance, slow, lag, memory → label: `performance`
   - If title/body contains any of: a11y, accessibility, screen reader, voiceover → label: `accessibility`
   - If title/body contains any of: convex, schema, backend, database → label: `backend`
   - If title/body contains any of: UI, design, layout, visual, style → label: `frontend`
   - Apply multiple labels if multiple categories match.

2. Apply the determined labels to the issue via the GitHub API.

3. Post a standard comment on the issue:
   "Thanks for opening this issue. It has been logged and labeled. We will triage it shortly.
   — Tempo Flow team"

4. If the issue has a `bug` label:
   - Post to Discord #agent-cursor:
     "[TRIAGE] New bug issue #{{number}}: {{title}}. URL: {{issue_url}}. Cursor Cloud: please review and create a fix branch if confirmed."
   
5. If the issue has a `backend` label:
   - Post to Discord #agent-cursor with the tag `[BACKEND]` instead.

6. All issues: post a brief note to Discord #agent-pokee:
   "[TRIAGE] Issue #{{number}} ({{labels}}) labeled and replied. Author: {{author}}"

7. Write a row to Convex agent_runs:
   { agent: "pokee", job: "issue-triage", issue_number: {{number}}, labels: [{{labels}}], timestamp: <iso> }
```

---

### 4.4 Ask-the-Founder Routing

**Trigger**: Convex HTTP webhook from `askFounderQueue` table write (any new document in `askFounderQueue`). Configure the webhook in `convex/http.ts` to POST to Pokee's inbound webhook URL on any insert to `askFounderQueue`.

**Also triggers on**: Gmail label `tempo-founder-inbox` applied to a new email (secondary trigger — Pokee polls Gmail for this label every 10 minutes as a fallback).

**Prompt template**:

```
A new "Ask the Founder" message has arrived for Tempo Flow.

Source: {{event.source}} (convex | gmail)
Message ID: {{event.message_id}}
Sender name: {{event.sender_name}}
Sender email: {{event.sender_email}}
Message body: {{event.body}}
Priority: {{event.priority}} (high | normal | low — set in the original submission form)
Received at: {{event.received_at}}

Steps:
1. Append the message to the Google Sheet "Tempo Flow Founder Inbox" (Sheet ID: {{FOUNDER_INBOX_SHEET_ID}}):
   Columns: received_at | sender_name | sender_email | priority | message_body | status (default: "new") | response | response_date

2. Post to Discord #founder-inbox:
   "[FOUNDER INBOX] New message from {{sender_name}} <{{sender_email}}>
   Priority: {{priority}}
   Received: {{received_at}}
   ---
   {{message_body | truncate at 500 chars}}
   ---
   Google Sheet: https://docs.google.com/spreadsheets/d/{{FOUNDER_INBOX_SHEET_ID}}"

3. If priority == "high":
   a. Tag @amit (Amit's Discord user ID: {{AMIT_DISCORD_USER_ID}}) in the #founder-inbox message.
   b. Send an SMS via Twilio webhook ({{TWILIO_SMS_WEBHOOK}}):
      "High-priority Founder Inbox message from {{sender_name}}: {{message_body | truncate at 160 chars}}"

4. Write a row to Convex agent_runs:
   { agent: "pokee", job: "founder-inbox-route", message_id: "{{message_id}}", priority: "{{priority}}", timestamp: <iso> }
```

**Google Sheet setup**: Create a Google Sheet named "Tempo Flow Founder Inbox" in Amit's Google Drive. Share it with Pokee's Google service account (displayed in Pokee → Integrations → Google Sheets). Authorize Pokee to append rows.

---

### 4.5 Vlog Cross-Post

**Trigger**: YouTube new upload detected (Pokee polls the Tempo Flow YouTube channel's uploads RSS or PubSubHubbub push).

**Prompt template**:

```
A new Tempo Flow founder vlog has been uploaded to YouTube.

Video title: {{video.title}}
Video ID: {{video.id}}
YouTube URL: https://www.youtube.com/watch?v={{video.id}}
Published at: {{video.published_at}}
Description: {{video.description}}

Steps:
1. Check if Zo has already processed a transcript for this video:
   - Query Convex agent_artifacts where type="transcript-pipeline" and metadata contains the video ID or title.
   - If found: retrieve the artifact paths for the tweet thread, newsletter, and blog post.
   - If not found: trigger Zo to run the vlog transcription pipeline (Section 4.3 in zo_setup.md):
     POST to Zo's job trigger webhook ({{ZO_JOB_TRIGGER_WEBHOOK}}) with:
     { "job": "vlog-transcription", "youtube_url": "https://www.youtube.com/watch?v={{video.id}}", "title": "{{video.title}}", "date": "{{video.published_at}}" }
     Then wait for Zo to post the artifact to Convex (Pokee will be re-triggered by the Convex webhook when Zo finishes).

2. Once transcript artifacts are available, retrieve:
   - Tweet thread text from /tempo-flow/transcripts/processed/{{slug}}_thread.txt (via Zo artifact URL)
   - Newsletter draft from /tempo-flow/transcripts/processed/{{slug}}_newsletter.md
   - Blog post from /tempo-flow/transcripts/processed/{{slug}}_blog.md

3. Post the tweet thread to X:
   - Parse the thread file (tweets separated by blank lines).
   - Post the first tweet.
   - Reply to it with each subsequent tweet in order.

4. Post IG Reel description to Discord #agent-twin:
   "[TWIN] Please post this description to the Tempo Flow Instagram Reel for video {{video.title}}:
   {{ig_description}}
   (Amit uploads the video clip manually)"

5. Post TikTok caption to Discord #agent-twin:
   "[TWIN] TikTok caption for {{video.title}}:
   {{tiktok_caption}}"

6. Create a newsletter draft in Beehiiv (or configured newsletter platform):
   - Title: "Founder update — {{video.published_at}}"
   - Body: content from the newsletter draft file.
   - Status: draft (do not send).
   - Post to Discord #agent-pokee:
     "[POKEE] Newsletter draft created for {{video.title}}. Amit: review and publish at {{newsletter_platform_url}}"

7. Post to Discord #agent-pokee:
   "[POKEE] Vlog cross-post complete for '{{video.title}}'. X thread: posted. IG/TikTok: instructions sent to #agent-twin. Newsletter: draft created."
```

---

### 4.6 Discord Agent Status Summary

**Trigger**: Scheduled — daily at 20:00 local time (convert to UTC based on Amit's timezone, e.g. 18:00 UTC if Amit is UTC+2).

**Prompt template**:

```
Generate the daily Tempo Flow agent status summary for {{today_date}}.

Steps:
1. Read the last 24 hours of messages from the following Discord channels (via Discord bot read access):
   - #agent-cursor
   - #agent-twin
   - #agent-pokee
   - #agent-zo
   - #handoffs
   - #blocked

2. For each channel, extract:
   - Number of messages posted in the last 24 hours
   - Any BLOCKED messages still unresolved (no reaction or follow-up)
   - Key completions (jobs that reported "complete" or "success")
   - Pending items (jobs that started but have not reported completion)

3. Query Convex agent_runs for today's records:
   SELECT agent, job, status, timestamp FROM agent_runs WHERE timestamp > {{24_hours_ago}}
   Group by agent and status (complete, failed, cancelled, in-progress).

4. Format the summary:

---
# Tempo Flow Daily Agent Summary — {{today_date}}

## Cursor Cloud
- Jobs completed: {{count}} | Failed: {{count}} | PRs opened: {{count}}
- Pending: {{list any in-progress}}

## Twin
- Jobs completed: {{count}} | Blocked: {{count}}
- Key actions: {{list completions}}

## Zo
- Jobs completed: {{count}} | Failed: {{count}}
- Artifacts produced: {{count}}

## Pokee
- Workflows run: {{count}} | Errors: {{count}}

## Blocked Items (unresolved)
{{list any blocked items from #blocked with no resolution, including how long they have been blocked}}

## Action needed from Amit
{{list any items explicitly requiring Amit's input}}
---

5. DM Amit on Discord (Discord user ID: {{AMIT_DISCORD_USER_ID}}) with the summary.
6. Post a shorter version (first 10 lines) to Discord #summary.
```

---

## 5. Handoff Patterns

### 5.1 Pokee Receives GitHub Webhook → Routes to Twin / Zo / Cursor Cloud

Pokee subscribes to the following GitHub webhook events (configured in Section 3.1):

| GitHub event | Pokee action |
|---|---|
| `pull_request.opened` with label `needs-twin` | POST to Twin job trigger: `{ "job": "run-from-pr", "pr_url": "..." }`. Post to #agent-twin. |
| `pull_request.opened` with label `needs-zo` | POST to Zo job trigger webhook. Post to #agent-zo. |
| `pull_request.opened` with label `needs-review` | Post to #agent-cursor. |
| `pull_request.merged` to main | Post to #handoffs. Update TASKS.md status (see below). |
| `release.published` | Run the Release Announcement Cross-Post workflow (Section 4.1). |
| `issues.opened` | Run the GitHub Issue Triage workflow (Section 4.3). |

**Updating TASKS.md on PR merge**: Pokee does not directly edit TASKS.md — that is done via a GitHub Action that is triggered by `pull_request.merged`. The Action reads the PR title for a TASKS.md reference (format: `[TASK-123]`) and updates the task status to `done`. Pokee posts to #handoffs confirming the merge and TASKS.md update.

### 5.2 Pokee Hits a Posting Error → #blocked + Email

When any Pokee workflow encounters an error (API call fails, rate limit hit, integration token expired):

1. Pokee posts to Discord #blocked:
   ```
   [POKEE BLOCKED] Workflow: <workflow-name> | Step: <step-number>
   Error: <error-message>
   Platform: <platform-name>
   Action needed: <specific fix required>
   ```

2. Pokee sends an email to `amitlevin65@protonmail.com` via Gmail:
   ```
   Subject: Pokee workflow error — <workflow-name>
   Body: Same content as the Discord message plus any stack trace or API response body.
   ```

3. Pokee retries the failed step once after 15 minutes automatically. If the retry also fails, it marks the workflow as `failed` and does not retry further, to avoid spamming blocked channels.

---

## 6. Integration Auth Rotation Schedule

OAuth tokens and API keys expire or need rotation on different schedules. The following table summarizes each integration's token lifespan and the action required for rotation.

| Integration | Token type | Typical lifespan | Rotation action |
|---|---|---|---|
| GitHub | GitHub App token (short-lived, auto-refreshed) | 1 hour (auto) | Pokee handles automatically |
| Gmail | Google OAuth refresh token | Very long-lived | Re-authorize in Pokee if Gmail disconnects |
| YouTube | Google OAuth refresh token | Very long-lived | Same as Gmail |
| LinkedIn | OAuth 2.0 access token | 60 days | Re-authorize in Pokee every 50 days |
| Instagram / Facebook | Meta long-lived access token | 60 days | Re-authorize in Pokee every 50 days |
| TikTok | OAuth 2.0 access token | 30 days | Re-authorize in Pokee every 25 days |
| X | OAuth 2.0 access + refresh token | Access: 2 hours (auto-refresh) | Pokee handles refresh automatically |
| Discord | Bot token (non-expiring) | Permanent until revoked | Rotate only if compromised |
| PostHog | API key (non-expiring) | Permanent until revoked | Rotate annually or if compromised |
| Sentry | Auth token (non-expiring) | Permanent until revoked | Rotate annually or if compromised |
| Beehiiv | API key | Permanent until revoked | Rotate annually |

**Set calendar reminders**: LinkedIn, Instagram/Facebook, and TikTok tokens require active rotation. Set a recurring calendar reminder at day 50 (LinkedIn, Meta) and day 25 (TikTok) to re-authorize in Pokee before expiry. Expired tokens cause silent failures in cross-post workflows.

**Automated rotation alert**: Configure Pokee to post to Discord #agent-pokee 7 days before any known token expiry date (if Pokee supports token expiry tracking — otherwise, rely on the calendar reminders above).

---

## 7. Troubleshooting + Quota Management

### Workflow Does Not Trigger

**Symptom**: A GitHub release is published but no cross-post appears.

**Cause**: GitHub webhook not delivered to Pokee, or Pokee integration is disconnected.

**Fix**:
1. In GitHub → Repository Settings → Webhooks, click on the Pokee webhook and check "Recent Deliveries". If no delivery is shown, the webhook URL may have changed (Pokee regenerates webhook URLs if the integration is reset).
2. In Pokee, go to the GitHub integration and confirm it is still connected.
3. Reconnect the integration if needed and update the webhook URL in GitHub.
4. Test with a manual workflow trigger.

### Social Post Fails with Rate Limit Error

**Symptom**: Pokee posts to Discord #blocked with `429 Too Many Requests` from LinkedIn, Instagram, or X.

**Cause**: Posting too frequently. LinkedIn limits posts per day; X's API has monthly post counts on lower tiers.

**Fix**:
1. Space out release announcements — do not trigger multiple cross-posts within the same hour.
2. For X: upgrade the X Developer plan if monthly post quota is consistently hit.
3. For LinkedIn: ensure only one workflow is posting at a time (Pokee jobs are not concurrent by default, but verify if multiple workflows could both post to LinkedIn simultaneously).

### Gmail Not Reading Founder Inbox Emails

**Symptom**: "Ask the Founder" emails arrive but no Discord message appears.

**Cause**: Gmail label `tempo-founder-inbox` not applied, or Pokee's Gmail poll is not running.

**Fix**:
1. Verify the Gmail filter/rule is applying the `tempo-founder-inbox` label to incoming emails to the founder address.
2. In Pokee, verify the Gmail integration shows "Active" and the poll trigger is enabled.
3. Test manually: apply the label to an existing email and wait for Pokee's next poll cycle (up to 10 minutes).

### Convex Webhook Not Triggering Pokee

**Symptom**: A new `askFounderQueue` record is written in Convex but Pokee does not receive the event.

**Cause**: The Convex HTTP action that fires the Pokee webhook is not deployed, or the Pokee inbound webhook URL has changed.

**Fix**:
1. Check the Convex dashboard → Logs for the HTTP action at `/internal/pokee/founder-inbox` (or whatever path is configured in `convex/http.ts`).
2. Verify the Pokee inbound webhook URL in Pokee's dashboard and update it in the Convex environment variable `POKEE_FOUNDER_INBOX_WEBHOOK`.
3. Test with a manual Convex mutation to insert a test record.

### Pokee Quota Exceeded

**Symptom**: Workflows start failing with `QUOTA_EXCEEDED` errors.

**Cause**: Pokee's plan limits the number of workflow runs per month.

**Fix**:
1. Audit which workflows are running most frequently (the daily status summary runs once per day = ~30 runs/month; the weekly digest = ~4 runs/month; issue triage depends on issue volume).
2. If over quota, consider:
   - Moving the daily status summary to every-other-day.
   - Reducing the GitHub issue triage to a manual trigger if issue volume is low.
3. Upgrade the Pokee plan if sustained workflow volume warrants it.

### LinkedIn / Meta Token Expired Mid-Workflow

**Symptom**: Pokee reports an authentication error posting to LinkedIn or Instagram.

**Fix**:
1. In Pokee → Integrations → LinkedIn (or Meta), click **Re-authorize**.
2. Complete the OAuth flow.
3. Re-run the failed workflow manually.
4. Update the token expiry calendar reminder to 50 days from today.


---

# Part 7 — Reusable Agent Playbooks


---

## 7.1 README.md (Reusable Playbooks)

> **Source file:** `README.md`

# Reusable Agent Workflow Playbooks

A project-agnostic library of agent workflow patterns for solo founders and small teams
running the Cursor + Twin + Pokee + Zo multi-agent stack.

---

## 1. What This Folder Is

This folder is a portable collection of playbooks that document how to delegate work to
specialized AI agents in a modern software project. The playbooks describe who does what,
when to hand off, how agents communicate, and where humans must remain in the loop.

The patterns here emerged from running multiple software projects with a five-agent stack.
They are intentionally generic: every reference to a specific project uses the `$PROJECT`
placeholder so you can fork and adapt without rewriting from scratch.

None of these playbooks require Notion, Linear, Airtable, or any rented task-tracking SaaS.
The orchestration spine is GitHub Issues, GitHub Projects, Discord, and a repo-committed
`TASKS.md` file. That combination is free, version-controlled, and survives vendor lock-in.

---

## 2. Who This Is For

These playbooks target:

- **Solo founders** building a software product with a small surface area but high automation
  ambition — you want agents doing the repetitive work so you focus on judgment calls.
- **Small teams (2–5 people)** where each person wears multiple hats and async communication
  is the default.
- **Anyone running the specific stack** described in this README: Cursor IDE for local coding,
  Cursor Cloud Background Agents for async parallel coding, Twin.so for GUI-gated dashboards,
  Pokee AI for SaaS orchestration and publishing, and Zo Computer for long-running cloud jobs.

If you are using a different stack the conceptual patterns (router agent, kill switch, audit
log, idempotency) still apply — you will need to swap the agent names for your equivalents.

---

## 3. Agent Philosophy

The core principle is **delegate to the right agent for the class of work**. Each agent in
this stack has a distinct strength and a clear boundary where it should hand off to another.

### Delegation Matrix

| Work Class | Agent | Why |
|---|---|---|
| GUI-gated dashboard action (no API) | Twin.so | Browser automation bypasses the missing API |
| SaaS orchestration, publishing, triage | Pokee AI | 50+ OAuth integrations, plain-text workflows |
| Long-running cloud job, batch, transcription | Zo Computer | Persistent VM, scheduled, artifact storage |
| Tight-loop coding, schema iteration, spike | Cursor IDE | Fast feedback, local context, paired watching |
| Parallel overnight coding, cross-repo refactor | Cursor Cloud | Isolated VMs, async, PR-based output |
| Human judgment, legal sign-off, payment entry | Human | Cannot and should not be delegated |

### Principles

1. **No agent touches production without a human confirmation step.** Every workflow that
   mutates a production resource (App Store submission, Stripe product, DNS record) must
   have a human-in-the-loop checkpoint before the final write.

2. **Every agent action is logged.** Each agent emits a structured event with a unique ID
   to a shared audit store. Retries use the same ID so duplicates are detected.

3. **The kill switch is always one step away.** Disabling the Pokee webhook pauses the
   entire routing layer. Every other agent waits for a Pokee trigger or a GitHub label to
   proceed.

4. **Discord is the single observability surface.** One Discord channel per agent, plus
   `#handoffs`, `#approvals`, `#blocked`, and `#summary`. Humans do not need to log into
   any agent dashboard to know what is happening.

5. **The repo is the source of truth.** `TASKS.md` in the repo root tracks what each agent
   is working on. GitHub Issues track bugs and features. GitHub Releases track shipped
   versions. Nothing important lives only in an agent's memory or a SaaS dashboard.

---

## 4. How to Fork These Playbooks Into a New Project

### Step 1: Copy this folder

```bash
cp -r /path/to/reusable-workflows /path/to/$PROJECT/agent-playbooks
```

Or add it as a git submodule if you want to pull upstream updates:

```bash
git submodule add https://github.com/your-org/agent-playbooks.git agent-playbooks
```

### Step 2: Replace `$PROJECT` placeholders

Each playbook uses `$PROJECT` as a generic stand-in for your project name. Run a
find-and-replace across the folder:

```bash
grep -rl '\$PROJECT' /path/to/$PROJECT/agent-playbooks | \
  xargs sed -i 's/\$PROJECT/YourActualProjectName/g'
```

### Step 3: Wire in project-specific environment variables

Each playbook has a section listing the env vars it expects. Copy those variable names
into your project's `.env.example` and populate the real values in your secrets manager
(for example, a `universal.env` file stored outside the repo, or 1Password).

Never commit real secrets. The playbooks reference env var names only, never values.

### Step 4: Update owner tags in TASKS.md

Owner tags identify which agent is responsible for a task. The standard tags are:

```
cursor-ide
cursor-cloud-1
cursor-cloud-2
cursor-cloud-3
twin
pokee
zo
human-<name>
```

Open `TASKS.md` in your project root and assign owner tags to every task. See the
`AGENT_ORCHESTRATION_PATTERNS.md` playbook for the full TASKS.md schema.

### Step 5: Create Discord channels

Create a Discord server (or a category in an existing server) with these channels:

```
#agent-cursor-cloud
#agent-twin
#agent-pokee
#agent-zo
#handoffs
#approvals
#blocked
#summary
```

Configure each agent's webhook to post to its own channel. Pokee posts to all channels
as the router.

### Step 6: Wire GitHub webhooks to Pokee

In your GitHub repo settings, add a webhook pointing to your Pokee instance endpoint.
Pokee will receive push, pull_request, issues, and release events and route them to the
appropriate downstream agents.

---

## 5. Table of Contents

| File | Summary |
|---|---|
| `README.md` | This file. Overview, philosophy, and how to fork. |
| `ZO_PLAYBOOK.md` | Zo Computer setup, job templates, and handoff patterns for long-running cloud work. |
| `TWIN_PLAYBOOK.md` | Twin.so setup, dashboard recipes, and human-handoff points for GUI-gated actions. |
| `POKEE_PLAYBOOK.md` | Pokee AI setup, workflow templates, and routing patterns for SaaS orchestration. |
| `AGENT_ORCHESTRATION_PATTERNS.md` | Cross-agent coordination patterns: GitHub-as-spine, Discord-as-observability, kill switches, audit logs, idempotency. |
| `CURSOR_AGENT_PATTERNS.md` | Cursor IDE vs. Cloud usage patterns, kickoff prompt templates, parallel-agent coordination, watchdog automations. |

---

## 6. Glossary

### Owner Tags

Owner tags appear in `TASKS.md` and GitHub Issue labels. They identify which agent or
human is responsible for a task at any given moment.

| Tag | Meaning |
|---|---|
| `cursor-ide` | Work is being done interactively in Cursor IDE by the founder |
| `cursor-cloud-1` | Cursor Cloud Background Agent cluster 1 (typically Core Features) |
| `cursor-cloud-2` | Cursor Cloud Background Agent cluster 2 (typically AI & Intelligence) |
| `cursor-cloud-3` | Cursor Cloud Background Agent cluster 3 (typically Platform & Polish) |
| `twin` | Twin.so browser automation agent |
| `pokee` | Pokee AI orchestration and publishing agent |
| `zo` | Zo Computer long-running cloud job |
| `human-<name>` | A specific human (e.g., `human-amit`, `human-contractor-1`) |
| `blocked` | Task cannot proceed; waiting for unblocking input |
| `pending-approval` | Task completed by agent; waiting for human review |

### Discord Channel Conventions

| Channel | Purpose |
|---|---|
| `#agent-cursor-cloud` | PR links, build status, and notes from all Cursor Cloud agents |
| `#agent-twin` | Session logs and results from Twin automation runs |
| `#agent-pokee` | Workflow execution logs from Pokee |
| `#agent-zo` | Job start, progress, and completion notices from Zo |
| `#handoffs` | Cross-agent handoff events (agent A signals agent B to begin) |
| `#approvals` | Items requiring human decision before an agent continues |
| `#blocked` | Tasks stuck waiting for input, credentials, or manual action |
| `#summary` | Daily digest of all agent activity (posted by Pokee at midnight) |

### Webhook Patterns

All inter-agent communication uses one of these patterns:

1. **GitHub label webhook**: A GitHub Action fires when a specific label is applied to
   an Issue or PR. Pokee listens and routes to the appropriate agent.

2. **Convex HTTP action**: When the project uses Convex as its backend, agents post
   events to a Convex HTTP endpoint that writes to `agent_handoffs` and triggers a
   scheduled function.

3. **Discord mention**: An agent posts to `#handoffs` with a structured message. Pokee
   reads the channel and dispatches the next step.

4. **Direct HTTP webhook**: Agent A calls Agent B's webhook URL directly with a JSON
   payload containing `event_id`, `source_agent`, `target_agent`, `payload`, and
   `timestamp`.

### Status Emojis in Discord Posts

Agents are expected to prefix their Discord messages with a status indicator:

| Prefix | Meaning |
|---|---|
| `[START]` | Agent is beginning a job |
| `[DONE]` | Agent has completed a job successfully |
| `[BLOCKED]` | Agent cannot continue without input |
| `[ERROR]` | Agent encountered a failure |
| `[HANDOFF]` | Agent is passing work to another agent |
| `[APPROVAL]` | Agent is requesting human sign-off |

---

## 7. Versioning

### Option A: Commit inside your project repo

Place this `agent-playbooks/` folder inside your project repo and commit it alongside
your code. This is the simplest approach. Every project commit captures the state of the
playbooks in use at that point.

Recommended location:

```
$PROJECT/
  agent-playbooks/        # this folder
  src/
  TASKS.md
  HARD_RULES.md
  .cursorrules
```

### Option B: Shared submodule

If you maintain multiple projects and want playbook updates to propagate automatically,
host this folder as a separate repository and include it as a submodule:

```bash
# Adding to a project
git submodule add https://github.com/your-org/agent-playbooks.git agent-playbooks

# Pulling upstream updates in a project
git submodule update --remote agent-playbooks
git add agent-playbooks
git commit -m "chore: update agent playbooks to latest"
```

### Option C: Version tag the playbooks

Inside each playbook file, add a `Playbook-Version` header (already present in each
file). When you fork and modify a playbook, increment the minor version. When you pull
an upstream breaking change, increment the major version.

```
Playbook-Version: 1.0.0
Last-Updated: 2025-01-01
Applies-To: $PROJECT
```

### Change Log

Keep a brief `CHANGELOG.md` inside the `agent-playbooks/` folder to track what changed
between versions and why. This is especially useful when multiple projects share the
same submodule and you need to audit which version a project was running when an
incident occurred.

---

*End of README*


---

## 7.2 Agent Orchestration Patterns

> **Source file:** `AGENT_ORCHESTRATION_PATTERNS.md`

# Agent Orchestration Patterns

Playbook-Version: 1.0.0
Applies-To: $PROJECT (generic — fork and replace placeholder)

This document describes how to compose Cursor IDE, Cursor Cloud Background Agents,
Twin.so, Pokee AI, Zo Computer, and humans into a reliable, auditable, self-correcting
system. Each pattern is self-contained and can be adopted independently.

---

## 1. Overview

A multi-agent software project fails in predictable ways:
- Agents step on each other's work because task boundaries are not enforced.
- No one knows what any agent is doing at a given moment.
- A misbehaving agent makes changes with no record of what it did or why.
- There is no kill switch — stopping one agent requires logging into five dashboards.
- Retry storms: an agent retries a failed action repeatedly, creating duplicates.

The patterns in this document address each failure mode. They form a layered system:

```
Layer 1: Source of truth   — GitHub + repo-committed TASKS.md
Layer 2: Event routing     — Pokee as the central router
Layer 3: Observability     — Discord, one channel per agent
Layer 4: Runtime state     — Convex agent tables (or SQLite/JSON for non-Convex projects)
Layer 5: Safeguards        — Kill switch, audit log, idempotency, rate limiting
Layer 6: Escalation        — Human-in-the-loop at defined checkpoints
```

Adopt layers in order. A project with only Layers 1 and 3 is already dramatically better
than no system at all.

---

## 2. The GitHub-as-Spine Pattern

### Principle

Everything that matters in the project flows through GitHub: Issues track work, PRs
carry code changes, Releases mark shipped versions, Actions enforce quality gates, and
Projects optionally provide a Kanban view. No rented task-tracker — no Notion, no
Linear, no Airtable.

### Why GitHub

- It is version-controlled: every state change is a commit.
- It has a rich webhook API: every event can trigger downstream automation via Pokee.
- It is free for public repos and inexpensive for private.
- It survives vendor pivots — the data is text in a git repository.
- Pull requests are the natural unit of agent output: agents write code and open PRs;
  humans merge.

### Implementation

**Issues** — used for:
- Bug reports (label: `bug`)
- Feature requests (label: `enhancement`)
- Agent task tracking (label: `agent-task`, owner tag in body)
- Support tickets (label: `support`, created by Pokee from email)

**PRs** — used for:
- All code changes, including agent-generated changes
- Every PR must reference an Issue: `Closes #N`
- Agent PRs are labeled with the agent that created them: `zo-automated`, `cursor-cloud`
- Human review is required before merging (enforced by branch protection)

**Releases** — used for:
- Every shipped version, tagged semver
- Release body is the changelog (written by Cursor Cloud or Zo)
- Release event triggers Pokee cross-post workflow

**Actions** — used for:
- CI (type check, lint, test) on every PR
- Forbidden-tech scan on every PR
- Deploy preview on every PR (via Vercel webhook)
- Label-based routing (apply label → trigger Pokee → trigger agent)

**Projects (optional)** — a GitHub Project board provides a Kanban view of Issues.
Use it for human orientation, not for agent state. Agents read from TASKS.md and GitHub
Issue APIs, not from a Project board.

### Label Taxonomy

Define these labels in your repo (create them in Settings → Labels):

| Label | Color | Meaning |
|---|---|---|
| `bug` | red | Something is broken |
| `enhancement` | blue | New feature or improvement |
| `documentation` | yellow | Docs-only change |
| `question` | purple | Support question |
| `support` | orange | Customer support ticket |
| `agent-task` | grey | Created and owned by an agent |
| `zo-automated` | teal | Output of a Zo job |
| `cursor-cloud` | cyan | Output of a Cursor Cloud agent |
| `twin-action` | indigo | Result of a Twin.so session |
| `needs-review` | white | Awaiting human review |
| `pending-approval` | gold | Agent waiting for human sign-off |
| `zo-handoff` | teal | Zo → next agent handoff signal |
| `approved` | green | Human has reviewed and approved |
| `blocked` | dark red | Cannot proceed without input |
| `needs-triage` | grey | Unclassified incoming item |

---

## 3. The Pokee-as-Router Pattern

### Principle

Pokee is the single broker between all event sources and all agent executors. No agent
talks to another agent directly — they emit events to Discord or GitHub, and Pokee
observes and dispatches.

This means:
- You can modify the routing logic by editing one Pokee workflow, not every agent.
- You can add a new destination (a new social platform, a new agent) without touching
  the source agent.
- The kill switch (Section 8) works by disabling Pokee's webhook receiver — everything
  downstream pauses automatically.

### Event Sources Pokee Listens To

| Source | Event | Example trigger |
|---|---|---|
| GitHub webhook | `issues.opened` | New issue → triage workflow |
| GitHub webhook | `release.published` | New release → cross-post workflow |
| GitHub webhook | `pull_request.labeled` | Label applied → route to agent |
| Discord channel | `#handoffs` message | Agent A signals Agent B |
| Discord channel | `#approvals` reply | Human approval → resume agent |
| Zo HTTP POST | Job completion payload | Zo done → fan-out artifacts |
| Scheduled cron | Time-based | Daily digest, weekly newsletter |
| HTTP inbound webhook | Any JSON POST | Generic event from any source |

### Label-Based Routing

The most common routing pattern: a GitHub Action applies a label to an Issue or PR, and
Pokee routes based on that label.

Example routing table (configure in Pokee):

| Label applied | Pokee action |
|---|---|
| `zo-handoff` | Trigger Cursor Cloud agent to review the Zo-produced PR |
| `pending-approval` | Post to Discord #approvals with human prompt |
| `approved` | Remove `pending-approval` label; signal next agent |
| `blocked` | Post to Discord #blocked; start escalation timer |
| `needs-review` | Assign to `human-<name>` based on Issue category |
| `agent-task` + `cursor-cloud` | No routing action; Cursor Cloud owns this |

### Pokee Workflow Directory

Maintain a file `agent-playbooks/pokee-workflows.md` listing every Pokee workflow by
name, trigger, and purpose. Update it whenever you add or modify a workflow. This file
is the human-readable index of your automation layer.

---

## 4. The Discord-as-Observability Pattern

### Principle

Discord is the single glass pane for everything happening in the agent system. Every
agent posts structured status messages to its channel. Humans read Discord to understand
system state without logging into any agent dashboard.

### Channel Structure

```
$PROJECT Server
  Category: Agents
    #agent-cursor-cloud    — PR links, build status, notes from all Cursor Cloud agents
    #agent-twin            — Session logs and outcomes from Twin.so
    #agent-pokee           — Workflow execution logs from Pokee
    #agent-zo              — Job start, progress, and completion from Zo
  Category: Coordination
    #handoffs              — Cross-agent handoff signals
    #approvals             — Items requiring human decision
    #blocked               — Stuck tasks awaiting unblocking input
    #summary               — Daily digest of all activity (auto-posted by Pokee)
  Category: Product
    #announcements         — Public-facing announcements (release posts, etc.)
    #releases              — Internal release notes
```

### Message Format

Every agent message should follow this format to be machine-parseable by Pokee:

```
[STATUS] Agent: <agent_name> | Job: <job_id> | <message>
```

Status tags: `[START]`, `[DONE]`, `[ERROR]`, `[BLOCKED]`, `[HANDOFF]`, `[APPROVAL]`

Example:
```
[DONE] Agent: zo | Job: transcription-2025-01-13-001 | 3 files processed.
Download: https://s3.amazonaws.com/...
```

### Pokee as Discord Monitor

Configure Pokee to watch `#handoffs` and `#approvals` for human replies. When a human
posts a reply containing a keyword (`proceed`, `approve`, `done`, `skip`, `reject`),
Pokee parses the reply, identifies the job it refers to (by job_id in the original
message), and dispatches the next action.

This creates a natural human-in-the-loop mechanism with zero extra tooling.

---

## 5. The Repo-Committed TASKS.md Pattern

### Principle

A single `TASKS.md` file in the repo root is the authoritative list of what each agent
is currently working on. It is committed to the repo, so it is version-controlled and
visible to all agents and humans.

Agents read TASKS.md at the start of their session to understand their scope. Agents
update TASKS.md when they start and complete tasks. Humans update TASKS.md to add or
reprioritize work.

### TASKS.md Schema

```markdown
# $PROJECT — Active Tasks

Last updated: YYYY-MM-DD HH:MM UTC

## cursor-cloud-1 (Core Features)
- [ ] Implement user authentication flow (Issue #42) — in-progress
- [ ] Add email verification (Issue #43) — queued

## cursor-cloud-2 (AI & Intelligence)
- [ ] Integrate OpenAI embeddings for search (Issue #51) — in-progress

## cursor-cloud-3 (Platform & Polish)
- [ ] Fix navigation animation on iOS (Issue #67) — queued
- [x] Add splash screen (Issue #60) — DONE, PR #89 merged

## twin
- [ ] Submit v1.0 to App Store (Issue #70) — pending-approval
- [ ] Create RevenueCat products (Issue #71) — queued

## pokee
- [ ] Configure release cross-post workflow — done, active
- [ ] Configure weekly digest — done, active

## zo
- [ ] Nightly error sweep — recurring (runs at 02:00 UTC)
- [ ] Asset batch for v1.0 launch — queued

## human-amit
- [ ] Review App Store submission screenshots (Issue #70)
- [ ] Record intro vlog for launch
```

### Owner Tag Conventions

| Tag | Meaning |
|---|---|
| `cursor-ide` | Active in local IDE session |
| `cursor-cloud-1` | Cursor Cloud cluster 1 |
| `cursor-cloud-2` | Cursor Cloud cluster 2 |
| `cursor-cloud-3` | Cursor Cloud cluster 3 |
| `twin` | Twin.so browser agent |
| `pokee` | Pokee AI workflow |
| `zo` | Zo Computer job |
| `human-<name>` | Specific human (lowercase first name) |
| `blocked` | Task halted, waiting for input |
| `pending-approval` | Awaiting human sign-off before proceeding |

### Update Protocol

- Agents prepend `[START]` and append `[DONE]` markers to their task entries when they
  begin and finish.
- Agents commit TASKS.md changes on a separate branch (e.g., `tasks/update-YYYY-MM-DD`)
  and open a tiny PR — this keeps the TASKS.md commit history clean and attributable.
- Alternatively, Pokee can maintain TASKS.md by listening for agent Discord messages and
  editing the file via GitHub API — this is more automated but requires careful conflict
  handling.
- Humans can directly edit TASKS.md on main — agents pull the latest before reading.

---

## 6. The Convex Agent Tables Pattern

### When to Use This

Use this pattern when your project already uses Convex as its backend database. Convex
provides real-time reactive queries, which means an agent can watch a table for new
tasks without polling.

If the project does not use Convex, use the fallback described at the end of this section.

### Table Definitions

Add these tables to your `convex/schema.ts`:

```typescript
// Agent execution runs — one row per job
agent_runs: defineTable({
  agent: v.string(),              // "zo", "twin", "pokee", "cursor-cloud-1", etc.
  job_id: v.string(),             // unique, e.g., "zo-transcription-20250113-001"
  status: v.string(),             // "started" | "running" | "done" | "error" | "blocked"
  prompt_hash: v.string(),        // SHA256 of the prompt used (for deduplication)
  started_at: v.number(),         // Unix timestamp
  completed_at: v.optional(v.number()),
  result_summary: v.optional(v.string()),
  artifact_urls: v.optional(v.array(v.string())),
  error_message: v.optional(v.string()),
}).index("by_agent", ["agent"])
  .index("by_status", ["status"])
  .index("by_job_id", ["job_id"]),

// Individual task items within a run
agent_tasks: defineTable({
  run_id: v.id("agent_runs"),
  task_description: v.string(),
  status: v.string(),             // "pending" | "done" | "failed" | "skipped"
  completed_at: v.optional(v.number()),
}).index("by_run", ["run_id"]),

// Handoff events between agents
agent_handoffs: defineTable({
  event_id: v.string(),           // unique UUID — used for idempotency
  from_agent: v.string(),
  to_agent: v.string(),
  payload: v.any(),               // JSON — job instructions for the target agent
  status: v.string(),             // "pending" | "received" | "processed"
  created_at: v.number(),
  processed_at: v.optional(v.number()),
}).index("by_to_agent", ["to_agent"])
  .index("by_event_id", ["event_id"]),

// Artifacts produced by agents
agent_artifacts: defineTable({
  run_id: v.id("agent_runs"),
  artifact_type: v.string(),      // "pr_url" | "s3_url" | "screenshot" | "report"
  url: v.string(),
  description: v.optional(v.string()),
  created_at: v.number(),
}).index("by_run", ["run_id"]),
```

### Usage Pattern

1. When an agent starts a job, it inserts a row into `agent_runs` with status `started`.
2. As it completes each step, it updates `agent_tasks` rows.
3. When the job finishes, it updates `agent_runs` to `done` and inserts into
   `agent_artifacts`.
4. To hand off to another agent, it inserts into `agent_handoffs`. The target agent
   either polls this table or is triggered by a Convex scheduled function.
5. A Convex scheduled function sweeps `agent_handoffs` every 60 seconds, finds pending
   rows addressed to each agent, and posts to that agent's webhook.

### Non-Convex Fallback

If the project does not use Convex, maintain agent state in two files in the repo:

- `agent-state/agent-runs.json` — array of run objects (append-only log)
- `agent-state/agent-handoffs.json` — array of handoff events (append-only log)

Agents read and write these files via GitHub API (read file → parse JSON → append →
write back). Add file locking by having agents create a `agent-state/.lock` file and
check for it before writing. This is less elegant than Convex but sufficient for low
concurrency.

---

## 7. The Human-Escalation Pattern

### Principle

Any task that is blocked for more than N hours without human attention triggers an
escalation. Pokee is the escalation engine.

### Escalation Levels

| Time since block | Escalation action |
|---|---|
| 30 minutes | Post to Discord #blocked (already done by agent) |
| 2 hours | Pokee posts a reminder to #blocked: "Still blocked: $JOB. 2h elapsed." |
| 4 hours | Pokee sends Twilio SMS to $FOUNDER_PHONE |
| 8 hours | Pokee sends Resend email to $FOUNDER_EMAIL |
| 24 hours | Pokee auto-cancels the blocked job and files a GitHub Issue |

### Pokee Escalation Workflow

```
Trigger: Pokee scheduled check every 30 minutes

Steps:
1. Read the last 24 hours of messages in Discord #blocked.
2. For each [BLOCKED] message that does not have a subsequent human reply
   (look for "proceed", "done", "approve", "skip", "reject"):
   a. Calculate time elapsed since the [BLOCKED] message was posted.
   b. Apply escalation level based on elapsed time (table above).
3. For Twilio SMS: POST to Twilio API (account SID + auth token + from number).
   Message: "$PROJECT: Agent $AGENT_NAME has been blocked for $HOURS hours.
   Check Discord #blocked. Job: $JOB_DESCRIPTION"
4. For email: send via Resend to $FOUNDER_EMAIL with the full blocked message content.
5. For auto-cancel: add comment to relevant GitHub Issue (if one exists), change
   Issue label from "agent-task" to "blocked", and post to #blocked:
   "[AUTO-CANCELLED] Job $JOB_ID cancelled after 24h without resolution.
   Manual intervention required. GitHub Issue: $ISSUE_URL"
```

### Required Env Vars

```
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_FROM_NUMBER
FOUNDER_PHONE
FOUNDER_EMAIL
RESEND_API_KEY
```

---

## 8. The Kill-Switch Pattern

### Principle

When something goes wrong — an agent misbehaves, a loop fires unexpectedly, a
third-party API returns corrupt data — you need to stop everything in one action.

The kill switch is: **disable Pokee's inbound webhook receiver**.

Because Pokee sits between all event sources and all agent executors (Pattern 3), disabling
Pokee's ability to receive webhooks means:
- No new agent jobs are triggered.
- No cross-posts fire.
- No escalations are sent.
- Active running jobs (Zo, Cursor Cloud) continue until their current step finishes,
  then have no new work dispatched.

This is the correct granularity for an emergency stop: you halt new work without
interrupting an in-flight database write or file save that would leave things corrupt.

### Kill-Switch Steps

1. **Log into Pokee** → Settings → Webhooks → Inbound Endpoint → Toggle to "Disabled".
2. **Post to Discord #summary**: "[KILL SWITCH ACTIVATED] All agent automation paused.
   Manual review in progress."
3. **Investigate**: Check Discord channels for the most recent [ERROR] or [DONE] messages
   to understand what happened.
4. **Resolve**: Fix the root cause (rotate a key, fix a bug, remove a bad prompt).
5. **Re-enable**: Toggle Pokee webhook receiver back to "Enabled".
6. **Post to Discord #summary**: "[KILL SWITCH RELEASED] Agent automation resumed."
7. **File a GitHub Issue** describing the incident, the timeline, and the fix. Label:
   `incident`. This becomes part of the audit trail.

### Per-Agent Kill Switches

For finer-grained control, each agent has its own pause mechanism:

| Agent | Kill mechanism |
|---|---|
| Pokee | Disable inbound webhook (pauses all Pokee-routed work) |
| Zo | Cancel the active session from the Zo dashboard |
| Twin | Close the active browser session from Twin dashboard |
| Cursor Cloud | Cancel the background agent from Cursor's cloud panel |
| Cursor IDE | Close the chat panel or type "Stop" |

---

## 9. The Audit-Log Pattern

### Principle

Every agent action that modifies external state (creates a file, opens a PR, posts to
social media, sends an email, submits a form) must be logged with:
- A unique event ID
- The agent that performed the action
- A timestamp (UTC)
- The action type
- The target (URL, Issue number, platform, etc.)
- The outcome (success, failure, pending)

The audit log is the record of what your system did. Without it, debugging an incident
is guesswork.

### Audit Log Schema

Each log entry is a JSON object:

```json
{
  "event_id": "zo-20250113-transcription-001-step-3",
  "agent": "zo",
  "timestamp": "2025-01-13T02:14:33Z",
  "action_type": "s3_upload",
  "target": "s3://my-bucket/project/transcripts/2025-01-13/transcripts.zip",
  "outcome": "success",
  "metadata": {
    "file_size_bytes": 2048576,
    "presigned_url_expires": "2025-01-27T02:14:33Z"
  }
}
```

### Storage Options

**Option A: Append to a file in the repo** (simplest)
```
agent-playbooks/audit-logs/YYYY-MM-agent-name.jsonl
```
Each line is one JSON log entry (JSONL format). Agents write via GitHub API.

**Option B: Convex `agent_runs` table** (if project uses Convex)
The `agent_runs` and `agent_tasks` tables already serve as a structured audit log.
Add an `audit_log` table for finer granularity if needed.

**Option C: S3 bucket**
Each agent appends to a log file in S3. The bucket has versioning enabled so entries
cannot be deleted. Use this for compliance-sensitive projects.

### Log Retention

Retain audit logs for a minimum of 90 days. For regulated industries, retain for the
legally required period. Archive logs older than 90 days to S3 Glacier.

---

## 10. The Idempotency Pattern

### Principle

Agents retry on failure. Without idempotency, retries create duplicates: two GitHub
Issues for the same email, two tweets for the same release, two S3 uploads of the same
file.

Every agent action that has an observable side effect must be idempotent: running it
twice with the same input produces the same result as running it once.

### Implementation

**Step 1: Assign an event ID to every trigger event**

The event ID is a deterministic hash of the trigger inputs:
```
event_id = SHA256(agent_name + "|" + trigger_type + "|" + trigger_payload_hash)
```

For scheduled jobs, use:
```
event_id = SHA256(agent_name + "|" + job_name + "|" + ISO_date_of_scheduled_run)
```

**Step 2: Check before acting**

Before performing any side-effecting action, the agent checks if an entry with this
event ID already exists in the audit log or `agent_runs` table. If it does, the agent
skips the action and returns the cached result.

```python
# Pseudocode
def create_github_issue(event_id, title, body, labels):
    existing = db.query("SELECT * FROM agent_runs WHERE job_id = ?", event_id)
    if existing and existing.status == "done":
        return existing.result_summary  # already created — return cached issue URL
    issue_url = github_api.create_issue(title, body, labels)
    db.insert("agent_runs", {job_id: event_id, status: "done", result_summary: issue_url})
    return issue_url
```

**Step 3: Use GitHub's idempotency features**

- PRs: check if a branch already exists before creating it. If it does, update the
  existing branch rather than creating a new PR.
- Issues: search for an existing issue with the same title before creating a new one.
- Labels: GitHub label application is naturally idempotent (applying an existing label
  is a no-op).

**Step 4: Use platform idempotency keys where available**

- Stripe API: pass an `Idempotency-Key` header on all POST requests.
- Resend: pass an `Idempotency-Key` header.
- Twilio: Twilio deduplicates SMS with the same `MessagingServiceSid` + body within
  4 hours.

---

## 11. The Rate-Limiting Pattern

### Principle

Agents run faster than human contributors and can exhaust API quotas in minutes. Every
agent must implement client-side rate limiting.

### Per-Integration Limits (Reference)

| Integration | Limit | Agent-side backoff |
|---|---|---|
| GitHub REST API | 5,000 req/hour | Exponential backoff after 429; check `X-RateLimit-Remaining` header |
| GitHub GraphQL | 5,000 points/hour | Same |
| X (Twitter) API v2 | 1,500 tweets/month (free), 300 reads/15min | Sleep 60s on 429 |
| LinkedIn Content API | 100 posts/day | Track count in agent state |
| Instagram Content Publish | 25 calls/hour | Sleep between posts |
| Sentry REST API | 100 req/s | Rarely hit; exponential backoff if 429 |
| PostHog Cloud API | Plan-dependent | Exponential backoff |
| Resend | 2 req/s (free), 10 req/s (paid) | Sleep between sends |
| Twilio SMS | Configurable; check account limits | Add 1s between SMS sends |
| OpenAI API | Token-based; model-specific | Exponential backoff on 429 |
| Anthropic API | Message-based; tier-specific | Exponential backoff on 429 |
| S3 | 3,500 PUT/s, 5,500 GET/s per prefix | Rarely hit in agent workloads |

### Agent-Side Backoff Template

```python
# Pseudocode — implement in the language your agent's pipeline uses
import time, random

def call_with_backoff(fn, max_retries=5, base_delay=1.0):
    for attempt in range(max_retries):
        try:
            return fn()
        except RateLimitError as e:
            if attempt == max_retries - 1:
                raise
            delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
            log(f"Rate limited. Retry {attempt + 1}/{max_retries} in {delay:.1f}s")
            time.sleep(delay)
        except TransientError as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(base_delay * (2 ** attempt))
```

### Quota Tracking

For integrations with monthly limits (X tweets, LinkedIn posts), maintain a counter in
the `agent_runs` table or in a JSON file in the repo:

```json
// agent-state/quota-usage.json
{
  "twitter_tweets_this_month": 87,
  "linkedin_posts_this_month": 12,
  "month": "2025-01"
}
```

Pokee checks this file before firing any cross-posting workflow. If a quota is within
10% of the limit, Pokee posts a warning to Discord #blocked.

---

## 12. The Credential-Rotation Pattern

### Rotation Schedule

| Integration | Rotation Frequency | Owner | Notes |
|---|---|---|---|
| GitHub Personal Access Token | 90 days | human-amit | Set expiry in GitHub token settings |
| Anthropic API key | 90 days | human-amit | Rotate in Anthropic console |
| OpenAI API key | 90 days | human-amit | Rotate in OpenAI platform |
| Replicate API token | 90 days | human-amit | Rotate in Replicate settings |
| AWS access key | 60 days | human-amit | Use IAM — create new, update, then delete old |
| Twilio auth token | On incident | human-amit | Rotate only if compromised |
| Resend API key | 90 days | human-amit | Rotate in Resend dashboard |
| Discord bot token | 180 days | human-amit | Rotate in Discord Developer Portal |
| LinkedIn OAuth token | 60 days | Pokee auto-refresh | Monitor for refresh failures |
| X OAuth token | Auto-refresh | Pokee auto-refresh | Monitor for expired refresh tokens |
| Instagram OAuth token | 60 days | Pokee auto-refresh | Monitor for expired refresh tokens |
| TikTok refresh token | 365 days | human-amit | Calendar reminder to re-authenticate |

### Rotation Process

1. Create the new credential in the external service.
2. Update the secret in every location that holds it:
   - Your `universal.env` or project secrets file
   - Zo Computer → API Keys
   - Pokee → Integrations
   - Any GitHub Actions secrets
   - Any Convex environment variables
3. Verify: run a test action for each agent that uses the credential.
4. Delete the old credential in the external service.
5. Log the rotation in the audit log with action type `credential_rotation`.
6. Update the rotation date in `agent-state/credential-rotation-log.json`.

### Rotation Reminders

Add a Pokee workflow that fires on the 1st of each month:

```
On the 1st of each month, check agent-state/credential-rotation-log.json.
For each credential where (today - last_rotation_date) >= rotation_frequency_days:
  Post to Discord #blocked: "[CREDENTIAL] $INTEGRATION key due for rotation.
  Owner: $OWNER. Last rotated: $DATE. Instructions: see AGENT_ORCHESTRATION_PATTERNS.md §12"
```

---

## 13. Anti-Patterns to Avoid

### 13.1 Rented Task-Tracker Lock-In

**Anti-pattern**: Storing all task state in Notion, Linear, Airtable, Jira, or any SaaS
task tracker as the primary record.

**Problem**: When the SaaS changes pricing, deprecates an API, or suffers an outage, your
task history is inaccessible. Agent workflows break when the API schema changes. Data export
is painful and lossy.

**Correct approach**: GitHub Issues + repo-committed TASKS.md. These are text in git.
They will outlast any SaaS.

### 13.2 Agents with Write Access to Production Without Confirmation

**Anti-pattern**: An agent that can directly modify a production database, production env
vars, or a live user-facing service without a human-in-the-loop checkpoint.

**Problem**: A hallucinated or malformed action corrupts production data. There is no
undo. Users are affected.

**Correct approach**: All agent actions that mutate production resources must go through
`#approvals`. The agent proposes, the human approves, the agent executes. For low-risk
writes (GitHub Issue comment, Discord message, draft newsletter), agents can act without
approval. For irreversible writes (delete, submit, publish, charge), always require
approval.

### 13.3 Agents That Mutate State Without Audit Logging

**Anti-pattern**: An agent modifies files, creates records, or posts content without
writing to the audit log.

**Problem**: When something goes wrong, you cannot reconstruct what the agent did. You
cannot tell a customer "this is what happened to your account." You cannot debug the
error because you have no trail.

**Correct approach**: Every side-effecting action writes to the audit log. This is non-
negotiable. If an agent framework does not support audit logging, add it at the wrapper
layer.

### 13.4 No Kill Switch

**Anti-pattern**: Agents are wired together with no single point where you can stop all
automation.

**Problem**: A misbehaving agent triggers a cascade. You need to log into five dashboards
and manually cancel five sessions while the agent continues to act.

**Correct approach**: Pokee is the single kill switch. All routing flows through Pokee.
Disabling Pokee's webhook stops new work from being dispatched.

### 13.5 Agents Sharing File System Access

**Anti-pattern**: Two agents write to the same directory or file at the same time without
locking.

**Problem**: Race conditions corrupt files. One agent overwrites the other's output.
Debugging is very difficult because both agents report success.

**Correct approach**: Assign disjoint directory ownership. In Cursor Cloud, each agent
cluster owns a specific set of directories (see CURSOR_AGENT_PATTERNS.md §6). For shared
surfaces (TASKS.md, audit logs), use file locks or sequential writes via GitHub API.

### 13.6 Hardcoded Secrets in Prompts

**Anti-pattern**: A prompt scaffold contains a real API key value, password, or session
token inline.

**Problem**: The prompt is stored in a repo or in an agent's history. The secret leaks
to anyone with repo access or who can read the agent's conversation history.

**Correct approach**: Use named environment variable references in prompts. Never paste
real credential values into prompt text.

---

## 14. End-to-End Feature Lifecycle Example

This example traces a single feature from idea to ship using all five agents. The project
is referred to as `$PROJECT`; for an illustrative reference, a mobile productivity app
like Tempo Flow would follow this exact sequence.

### Day 0 — Feature Entry

Human adds a task to TASKS.md:

```markdown
## cursor-cloud-2 (AI & Intelligence)
- [ ] Add smart notification scheduling based on user calendar (Issue #88) — queued
```

Human opens GitHub Issue #88 with full acceptance criteria, design notes, and links to
relevant files. Labels: `enhancement`, `agent-task`, `cursor-cloud-2`.

### Day 1 — Cursor Cloud Implementation

Cursor Cloud Agent 2 picks up Issue #88 at the start of its session. It reads TASKS.md
and the Issue body. It works through the implementation in its VM, writes tests, and
opens PR #112 with:
- Description referencing Issue #88
- `cursor-cloud` label applied automatically by the GitHub Action
- CI passes (type check, lint, test)

Cursor Cloud posts to Discord #agent-cursor-cloud:
```
[DONE] Agent: cursor-cloud-2 | PR #112 opened for Issue #88 (smart notifications).
All checks pass. Review: https://github.com/$REPO/pull/112
```

Pokee detects the `cursor-cloud` label on PR #112 and posts to Discord #approvals:
```
[APPROVAL] PR #112 ready for review. Feature: smart notification scheduling.
Review and merge, or reply 'reject' to send back.
```

### Day 1 — Human Review

Human reviews PR #112, leaves comments, Cursor Cloud addresses them, and the PR is
merged. The `approved` label is applied.

TASKS.md is updated (by Cursor Cloud or human):
```markdown
- [x] Add smart notification scheduling (Issue #88) — DONE, PR #112 merged
```

### Day 2 — Twin Dashboard Action

The feature requires a new RevenueCat entitlement for the premium tier. Human updates
TASKS.md:
```markdown
## twin
- [ ] Create RevenueCat entitlement "smart-notifications" (Issue #89) — queued
```

Human triggers the Twin RevenueCat recipe (Section 4.4 of TWIN_PLAYBOOK.md). Twin
creates the product and entitlement, posts the result to Discord #agent-twin:
```
[DONE] Agent: twin | RevenueCat entitlement "smart-notifications" created.
```

### Day 2 — Zo Asset Batch

The release requires updated App Store screenshots showing the new feature. Human adds
a Zo task and uploads a `asset-brief.json` to the Zo workspace inputs folder. Zo runs
the asset batch generation job overnight.

Next morning, Zo posts to Discord #agent-zo:
```
[DONE] Agent: zo | Job: asset-batch-v1.4 | 12 assets generated. Download:
https://s3.amazonaws.com/.../assets-2025-01-14.zip
```

### Day 3 — Release

Human bumps the version, tags the release, and publishes a GitHub Release. The release
event fires:

- Pokee receives `release.published` webhook.
- Pokee triggers the release cross-post workflow (POKEE_PLAYBOOK.md §5.1):
  posts to X, LinkedIn, Instagram, Facebook, TikTok, Discord #announcements.
- Pokee triggers Zo to bundle the release artifact (ZO_PLAYBOOK.md §4.4).
- Zo uploads the bundle to S3 and attaches it to the GitHub Release.

Twin is triggered by Pokee to submit the new build to App Store Connect
(TWIN_PLAYBOOK.md §4.1). Twin pauses at the final submit step and posts to #approvals:
```
[APPROVAL] App Store submission ready for v1.4. Review screenshot and reply 'proceed'.
```

Human approves. Twin submits.

### Day 4 — Post-Launch

Zo's nightly error sweep runs at 02:00 UTC, finds no new errors related to the feature,
and posts a clean report to Discord #agent-zo.

The Pokee weekly analytics digest (POKEE_PLAYBOOK.md §5.2) fires Monday morning,
showing increased retention for users who enabled smart notifications.

Human marks Issue #88 as closed with a comment linking the PR, the release, and the
analytics data. The feature lifecycle is complete and fully documented in GitHub.

---

*End of AGENT_ORCHESTRATION_PATTERNS.md*


---

## 7.3 Cursor Agent Patterns

> **Source file:** `CURSOR_AGENT_PATTERNS.md`

# Cursor Agent Patterns

Playbook-Version: 1.0.0
Applies-To: $PROJECT (generic — fork and replace placeholder)

---

## 1. Overview — Cursor IDE vs. Cursor Cloud Background Agents

Cursor provides two distinct execution modes that serve different purposes and should
not be confused with each other.

### Cursor IDE (Local, Interactive)

Cursor IDE is the desktop application. You run it locally on your machine. The AI
assistant operates in the context of your open files, your running terminal, and your
active debugging session. Feedback is immediate: you type, the agent responds, you see
the result in seconds.

Use Cursor IDE for work that benefits from fast iteration: refining a component,
debugging a specific error, exploring a new library, pair-programming through a tricky
algorithm, or reviewing an agent-generated PR.

### Cursor Cloud Background Agents (Async, VM-Isolated)

Cursor Cloud Background Agents are separate VMs that Cursor provisions and manages.
You give an agent a task via a kickoff prompt, and it works asynchronously — potentially
for hours — while you do other things. The agent's output is a GitHub PR.

Use Cursor Cloud for work that is well-specified, parallel, and long-running: building
out a feature you have fully designed, refactoring a module, adding test coverage across
a large surface, fixing a category of type errors.

### Key Differences

| Dimension | Cursor IDE | Cursor Cloud |
|---|---|---|
| Execution model | Synchronous, interactive | Asynchronous, headless VM |
| Duration | Minutes to 1–2 hours | Hours to overnight |
| Output format | Direct file edits in your workspace | GitHub PR |
| Supervision | Human watches and corrects in real time | Human reviews PR when done |
| Best for | Iteration, exploration, review | Parallelism, overnight work |
| Context | Your current open files | Cloned repo + kickoff prompt |
| Concurrency | One session at a time | Multiple clusters simultaneously |

The two modes are complementary. A typical day involves Cursor IDE for design-level
decisions and Cursor Cloud overnight for execution.

---

## 2. When to Use Cursor IDE

Use Cursor IDE when any of the following are true:

- **The task is under 1–2 hours**: If you expect the coding work to finish before you
  go to sleep, IDE is appropriate.
- **You want to observe and correct in real time**: Schema migrations, architectural
  changes, or anything where you want to steer the agent mid-task.
- **You are doing design-level iteration**: Trying different component structures,
  exploring API shapes, spiking a proof of concept before committing to an approach.
- **You are reviewing a Cursor Cloud PR**: Read the diff in IDE, leave comments,
  test-run locally, then merge or request changes.
- **The task requires your local tools**: Running a local emulator, connecting to a
  local dev database, using a tool that is not available in a cloud VM.
- **The task is paired work with another human**: You are screen-sharing and coding
  together with a contractor or co-founder.
- **You are debugging a specific error with a stack trace**: The IDE has access to
  your terminal output and can iterate on the fix in seconds.

Cursor IDE is also appropriate for writing kickoff prompts for Cursor Cloud — composing
a detailed, accurate spec takes IDE-quality iteration.

---

## 3. When to Use Cursor Cloud

Use Cursor Cloud Background Agents when any of the following are true:

- **You want to "ship while I sleep"**: Kick off an agent at night and review the PR
  in the morning.
- **The work is parallelizable**: Multiple agents can work on disjoint parts of the
  codebase simultaneously (see Section 6).
- **The task is well-specified**: You have written acceptance criteria, have the design
  decided, and are confident the agent can execute without mid-task steering.
- **The task involves repetitive mechanical changes**: Adding TypeScript types to 30
  files, converting class components to functional components, migrating an API to a
  new SDK version.
- **The task spans multiple files across the codebase**: Cross-repo refactors, renaming
  a concept everywhere, updating all usages of a deprecated API.
- **You want to run multiple tasks in parallel**: Three Cloud agents can work on three
  different features simultaneously, as long as their file scopes do not overlap.

Cursor Cloud is not appropriate for exploratory work where you do not yet know what the
right answer looks like. Spec it in IDE first, then hand off the execution to Cloud.

---

## 4. How to Spec a Cursor Cloud Cluster

A Cursor Cloud "cluster" is a conceptual grouping of related tasks assigned to a single
background agent. You might run 2–3 clusters simultaneously on different parts of the
codebase.

### Typical Cluster Assignments for a Mobile + Web Project

| Cluster | Owner Tag | Scope | Example tasks |
|---|---|---|---|
| Cluster 1 | `cursor-cloud-1` | Core Features | Auth flows, core data model, primary user screens |
| Cluster 2 | `cursor-cloud-2` | AI & Intelligence | Model integration, embeddings, smart features |
| Cluster 3 | `cursor-cloud-3` | Platform & Polish | Error handling, animations, performance, onboarding |

### Rules for Scoping a Cluster

1. **Disjoint directories**: Each cluster owns a subset of the codebase directories.
   No two clusters should be assigned tasks in the same directory at the same time.
   Example assignment:
   - Cluster 1: `src/features/auth/`, `src/features/home/`, `src/api/`
   - Cluster 2: `src/features/ai/`, `src/lib/ai/`, `convex/ai.ts`
   - Cluster 3: `src/components/`, `src/navigation/`, `src/utils/`
2. **Shared surfaces are locked**: Files touched by multiple clusters (e.g., `package.json`,
   `convex/schema.ts`, `TASKS.md`) must be modified by only one cluster at a time.
   Use a GitHub label `lock:schema` to signal that a shared surface is claimed.
3. **Each cluster references its tasks from TASKS.md**: The kickoff prompt tells the
   agent its cluster ID and points it to its section of TASKS.md.

---

## 5. How to Write a Master Kickoff Prompt

The kickoff prompt is the single instruction document you give a Cursor Cloud agent when
starting a session. A poorly written kickoff prompt leads to scope creep, hallucinated
files, and PRs that need to be completely rewritten.

### Template Scaffold

```
# $PROJECT — Cursor Cloud Kickoff — $CLUSTER_NAME (cluster-$CLUSTER_ID)

## Context

You are a senior software engineer working on $PROJECT.
$PROJECT is a [one-sentence description: e.g., "mobile productivity app for async
team communication, built with React Native (Expo), Convex, and TypeScript"].

The full codebase is in this repository. Read the following files before starting:
- TASKS.md (your assigned tasks are in the ## cursor-cloud-$CLUSTER_ID section)
- HARD_RULES.md (non-negotiable constraints — read every rule before writing any code)
- .cursorrules (condensed rules for quick reference)
- src/README.md (architecture overview)

## Your Scope (Cluster $CLUSTER_ID — $CLUSTER_NAME)

You are responsible for the following directories:
$DIRECTORY_LIST

You MUST NOT modify files outside these directories, with these exceptions:
- TASKS.md (update your task status only)
- package.json (only to add packages explicitly required by your tasks)
- Any shared type file explicitly listed in your tasks

## Your Tasks

Read TASKS.md → ## cursor-cloud-$CLUSTER_ID section.
Work through the tasks in order, top to bottom.
For each task:
1. Read the linked GitHub Issue for full acceptance criteria.
2. Implement the feature or fix.
3. Write or update tests for everything you touch.
4. Mark the task as in-progress in TASKS.md, then mark it done when the PR is opened.

## Acceptance Criteria

For each task, the acceptance criteria are in the linked GitHub Issue.
A task is complete when:
- [ ] The feature behaves as described in the Issue
- [ ] TypeScript reports no errors (`npx tsc --noEmit`)
- [ ] The linter reports no errors (`npx eslint .`)
- [ ] All tests pass (`npx jest` or equivalent)
- [ ] No files outside your scope are modified (run `git diff --name-only HEAD~1` to verify)

## Quality Bar

- All new code must be typed. No `any` without a comment explaining why.
- Every new React component must have at least one test.
- Every new API function must have at least one test.
- Follow existing patterns in the codebase — read 2–3 nearby files before writing new code.
- Do not add dependencies that are not in HARD_RULES.md's approved list without
  checking if an existing dependency can be used instead.

## Forbidden Technology

Read HARD_RULES.md for the full list. Summary:
$FORBIDDEN_TECH_LIST (e.g., "Do not use Moment.js. Do not use class components. Do not
use inline styles. Do not use any.")

## Pre-Flight

Before writing any code, do the following:
1. Read HARD_RULES.md completely.
2. Read TASKS.md, your cluster's section only.
3. For each task, open the linked GitHub Issue and read the full body.
4. Ask any clarifying questions by posting a comment on the relevant GitHub Issue.
   Tag @$FOUNDER_GITHUB_HANDLE in the comment.
5. Wait 30 minutes. If no response, proceed with the most reasonable interpretation.
6. Only then begin coding.

## Output

When all tasks are complete, open one GitHub PR per logical change (one PR per Issue,
or combine if Issues are tightly coupled). PR title format:
  feat($AREA): short description [cursor-cloud-$CLUSTER_ID]

PR body must include:
- Summary of what was done
- Link to the GitHub Issue(s) it closes
- Test instructions (how to verify the feature manually)
- Screenshot or screen recording for UI changes (use Zo or a local emulator)
```

### Kickoff Prompt Anti-Patterns

- **Too vague**: "Build the AI features." — The agent has no scope, no acceptance
  criteria, and no file boundaries. It will invent things.
- **Too large**: A single kickoff prompt covering 30 tasks across the entire codebase.
  Split into clusters. One agent per cluster.
- **Missing HARD_RULES reference**: Without this, the agent will introduce banned
  dependencies, use deprecated patterns, and ignore architectural decisions.
- **No pre-flight questions step**: The agent makes assumptions instead of asking.
  Assumptions compound into expensive misunderstandings.
- **No test requirement**: The agent writes code but no tests. You have no confidence
  the code works.

---

## 6. Parallel-Agent Coordination

Running multiple Cursor Cloud agents simultaneously requires a coordination protocol to
prevent conflicts.

### Directory Assignment

Before starting any Cloud agents, produce a directory map:

```
# agent-playbooks/cursor-cloud-directory-map.md

Cluster 1 (cursor-cloud-1) OWNS:
  src/features/auth/
  src/features/home/
  src/features/settings/
  src/api/

Cluster 2 (cursor-cloud-2) OWNS:
  src/features/ai/
  src/lib/ai/
  convex/ai.ts
  convex/embeddings.ts

Cluster 3 (cursor-cloud-3) OWNS:
  src/components/
  src/navigation/
  src/utils/
  src/hooks/

SHARED SURFACES (any cluster can read, write requires lock):
  package.json
  convex/schema.ts
  TASKS.md
  tsconfig.json
  .env.example
```

Include this directory map in every kickoff prompt. Agents must not modify files outside
their assigned directories without explicit instruction.

### The Lock File Convention

For shared surfaces, use a GitHub label to signal ownership:

| Label | Meaning |
|---|---|
| `lock:schema` | A cluster is currently modifying `convex/schema.ts` |
| `lock:package` | A cluster is currently modifying `package.json` |
| `lock:tasks` | A cluster is currently modifying `TASKS.md` |

Before modifying a shared surface, a Cloud agent:
1. Checks if the lock label exists on any open PR.
2. If locked: waits until the PR is merged, then proceeds.
3. If unlocked: applies the lock label on its own PR, then modifies the shared surface.
4. The GitHub Action removes the lock label when the PR is merged.

### PR Label Handoff

When one Cloud agent finishes a piece of work that another agent depends on, it signals
via a GitHub PR label:

```
Cluster 1 finishes auth PR #110 (merged)
  → GitHub Action applies label "cluster-2-unblocked" to Issue #88
  → Pokee detects the label
  → Pokee posts to Discord #handoffs: "Cluster 1 unblocked Cluster 2. Issue #88 now ready."
  → Cluster 2's next kickoff includes Issue #88 in its task list
```

---

## 7. .cursorrules + HARD_RULES.md Pattern

### The Two-File System

`.cursorrules` is a short, fast-to-read rules file that Cursor loads into context
automatically before every agent response. Keep it under 100 lines. It contains the
most critical rules in condensed form.

`HARD_RULES.md` is a longer document with full rationale. Agents read it once at the
start of a session. It documents the "why" behind each rule so agents can extrapolate
to edge cases.

Both files live in the repo root.

### .cursorrules Template

```
# $PROJECT — Cursor Rules

## Tech Stack
- React Native (Expo SDK $EXPO_VERSION) + TypeScript
- Convex (backend, DB, realtime, auth)
- NativeWind for styling (Tailwind classes only — no arbitrary values)
- React Navigation for routing

## Forbidden
- Moment.js (use date-fns or Temporal)
- class components (use functional only)
- inline styles (use NativeWind classes)
- `any` type without a // @allow-any comment explaining why
- Lodash (use native array/object methods)
- $ADDITIONAL_FORBIDDEN_ITEMS

## Required Patterns
- Every screen component: functional, typed props interface, named export
- Every Convex mutation: validate with zod before writing
- Every async operation: handle errors with try/catch + user-facing error state
- Every PR: must close a GitHub Issue (Closes #N in body)

## File Naming
- Components: PascalCase.tsx
- Hooks: useFeatureName.ts
- Utils: camelCase.ts
- Convex functions: camelCase.ts (in convex/)

## Testing
- Tests live alongside source: ComponentName.test.tsx
- Use Jest + React Native Testing Library
- Minimum: one smoke test per component, one unit test per util function

## Read Before Coding
- HARD_RULES.md — full rules with rationale
- TASKS.md — your assigned tasks
- src/README.md — architecture overview
```

### HARD_RULES.md Structure

```markdown
# $PROJECT — Hard Rules

These rules are non-negotiable. Violating them will cause a PR to be rejected.
Every agent reads this document at the start of every session.

## 1. No banned dependencies
[Rule text + rationale + what to use instead]

## 2. No any type
[Rule text + rationale + how to type unknown values properly]

## 3. No direct database writes in UI components
[Rule text + rationale + the correct pattern]

## 4. All mutations must be validated
[Rule text + rationale + code example]

## 5. No hardcoded strings in UI
[Rule text + rationale + i18n pattern used in this project]

## [Continue for all project-specific rules]
```

---

## 8. Automation Patterns

These patterns use Cursor IDE or Cloud to run automated watchdog tasks. Each includes
a short prompt scaffold.

---

### 8.1 Continuous Test Watchdog

**Mode**: Cursor Cloud, long-running session

**Prompt scaffold**:
```
You are running as a continuous test watchdog for $PROJECT.

Every 5 minutes:
1. Run `npx jest --passWithNoTests --forceExit` in the repo root.
2. If all tests pass: post nothing. Update a counter file
   agent-state/test-watchdog.json with {last_run: timestamp, status: "passing"}.
3. If any test fails:
   a. Capture the failure output.
   b. Post to Discord webhook $DISCORD_WEBHOOK_CURSOR_CLOUD:
      "[ERROR] Test failure detected at $TIMESTAMP:\n```\n$FAILURE_OUTPUT\n```"
   c. Create or update a GitHub Issue labeled "test-failure" with the failure details.
      If an issue already exists from a previous failure, comment on it rather than
      creating a duplicate.
4. Continue running until instructed to stop.

Do not attempt to fix the failing tests — only report them. Fixing is a separate task.
```

---

### 8.2 Continuous Lint Watchdog

**Mode**: Cursor Cloud or local terminal session

**Prompt scaffold**:
```
You are running as a continuous lint watchdog for $PROJECT.

Every 10 minutes:
1. Run `npx eslint . --ext .ts,.tsx --max-warnings 0`.
2. If lint is clean: update agent-state/lint-watchdog.json {status: "clean"}.
3. If lint has warnings or errors:
   a. Post to Discord webhook $DISCORD_WEBHOOK_CURSOR_CLOUD:
      "[ERROR] Lint issues detected: $COUNT warnings/errors. Run eslint locally to see details."
   b. List the files with issues (file paths only, not the full error text, to keep the
      Discord message readable).
4. Continue running.
```

---

### 8.3 Continuous Type-Check Watchdog

**Mode**: Cursor Cloud or local terminal session

**Prompt scaffold**:
```
You are running as a continuous TypeScript type-check watchdog for $PROJECT.

Every 10 minutes:
1. Run `npx tsc --noEmit`.
2. If type-check passes: update agent-state/typecheck-watchdog.json {status: "clean"}.
3. If type errors exist:
   a. Count the total number of errors.
   b. Post to Discord webhook $DISCORD_WEBHOOK_CURSOR_CLOUD:
      "[ERROR] TypeScript errors detected: $COUNT errors. Files affected:
       $FILE_LIST (first 5)"
   c. Do not attempt to fix the errors — only report.
4. Continue running.
```

---

### 8.4 Schema Guard

**Mode**: GitHub Actions (triggered on every PR targeting main)

**Prompt scaffold** (for a GitHub Action that calls Cursor):
```
You are a schema guard. A PR has been opened that may contain Convex schema changes.

1. Diff the PR against the base branch. Check if convex/schema.ts was modified.
2. If schema.ts was NOT modified: exit cleanly with "Schema guard: no schema changes detected."
3. If schema.ts WAS modified:
   a. Read the full diff of convex/schema.ts.
   b. Check these rules:
      - No table was dropped (removing a table = fail)
      - No required field was removed from an existing table (= fail)
      - No field type was changed in a way that is not backward-compatible (e.g., string → number = fail)
      - New optional fields are allowed (= pass)
      - New tables are allowed (= pass)
      - New optional fields on existing tables are allowed (= pass)
   c. If any rule is violated: fail the check with a descriptive error message listing
      each violation.
   d. If all rules pass: exit cleanly with "Schema guard: changes are backward-compatible."
```

---

### 8.5 Forbidden-Tech Scanner

**Mode**: GitHub Actions (triggered on every PR)

**Prompt scaffold** (for a shell script in GitHub Actions):
```bash
#!/bin/bash
# Forbidden technology scanner for $PROJECT
# Run on every PR to catch banned dependencies before merge

FORBIDDEN_PACKAGES=(
  "moment"
  "lodash"
  "axios"        # use native fetch
  "react-navigation/v4"
  "$ADD_OTHERS"
)

FAILED=0
for pkg in "${FORBIDDEN_PACKAGES[@]}"; do
  if grep -q "\"$pkg\"" package.json; then
    echo "FAIL: Forbidden package '$pkg' found in package.json"
    FAILED=1
  fi
done

if [ $FAILED -eq 1 ]; then
  echo ""
  echo "Remove all forbidden packages before merging. See HARD_RULES.md for alternatives."
  exit 1
fi

echo "Forbidden-tech scan: clean."
exit 0
```

---

### 8.6 Design-Token Enforcer

**Mode**: GitHub Actions or Cursor Cloud watchdog

**Prompt scaffold**:
```
You are a design-token enforcer for $PROJECT.

The project uses NativeWind (Tailwind). All colors, spacing, and typography must use
design tokens (Tailwind class names). No arbitrary values and no hardcoded hex colors
are allowed.

Patterns to flag:
- Any JSX className or style prop containing a hex color (e.g., "#3B82F6", "#fff")
- Any NativeWind arbitrary value (e.g., "w-[342px]", "text-[14px]")
- Any inline style object with a color value (e.g., style={{ color: '#333' }})

Steps:
1. Run: grep -rn --include="*.tsx" --include="*.ts" \
     -E '(#[0-9a-fA-F]{3,8}|\[[0-9]+px\]|style=\{\{.*color)' \
     src/ > /tmp/design-violations.txt
2. If the file is empty: print "Design-token check: clean." and exit 0.
3. If violations exist: print each violation with file path and line number.
   Exit 1.
```

---

### 8.7 PR Review Automation

**Mode**: Cursor Cloud, triggered by Pokee on every PR opened

**Prompt scaffold**:
```
You are a PR reviewer for $PROJECT. Review the PR at $PR_URL against HARD_RULES.md.

Steps:
1. Fetch the PR diff.
2. Read HARD_RULES.md completely.
3. For each changed file, check:
   a. Does it violate any rule in HARD_RULES.md?
   b. Does it use any forbidden dependency?
   c. Does it contain untested code (new functions or components with no corresponding
      test file change)?
   d. Does it contain hardcoded strings that should be i18n keys?
   e. Does it contain `any` types without the required // @allow-any comment?
4. Write a review summary:
   - PASS items: list what the PR does correctly.
   - FAIL items: list each specific violation with file path, line number, and the
     HARD_RULES.md rule that is violated.
   - SUGGESTIONS: list non-blocking improvement suggestions.
5. Post the review as a GitHub PR review comment using the GitHub API.
   - If any FAIL items exist: request changes.
   - If only PASS and SUGGESTIONS: approve.
6. Post to Discord #agent-cursor-cloud:
   "[DONE] PR review complete for #$PR_NUMBER. Result: $PASS/FAIL. Issues: $COUNT"
```

---

## 9. Human-in-the-Loop Patterns

### When to Require Human Approval on a Cloud Agent PR

Not all agent PRs require human review before merge. Use this matrix:

| PR type | Review required | Automation safe? |
|---|---|---|
| Automated error sweep (`zo-automated`) | Yes — human skims the diff | Never auto-merge |
| New feature (`feat:`) | Yes — human reviews and tests | Never auto-merge |
| Dependency update | Yes — check for breaking changes | Never auto-merge |
| Style/token fix | Yes, lightweight review | Could allow auto-merge after CI passes |
| Test-only change | Yes, lightweight review | Could allow auto-merge after CI passes |
| Type annotation only | Yes, lightweight review | Could allow auto-merge after CI passes |
| Documentation | Yes, lightweight review | Could allow auto-merge after CI passes |
| Schema migration | Always — senior human reviews | Never auto-merge |
| Dependency addition | Always — check HARD_RULES | Never auto-merge |

### PR Review Gate Implementation

1. All agent PRs are created with `needs-review` label.
2. A GitHub branch protection rule requires at least 1 approval and no pending reviews
   before merge is allowed.
3. The PR review automation (Section 8.7) runs and posts a review. If it requests
   changes, merge is blocked until a human overrides.
4. When a human approves and merges the PR, Pokee detects the `approved` label and
   removes `needs-review`.
5. After merge, Pokee posts to Discord #summary: "PR #$N merged. Feature: $TITLE."

### Emergency Override

If a human needs to merge an urgent hotfix despite pending automated reviews:
1. Human must manually dismiss all pending reviews in GitHub.
2. Human posts in Discord #approvals: "[OVERRIDE] Merging #$PR_NUMBER as hotfix.
   Reason: $REASON"
3. Pokee logs the override event to the audit log.

---

## 10. Troubleshooting

### Agent Context Drift

**Symptom**: The agent starts implementing something that made sense in step 1 but by
step 15 has drifted from the original spec. The PR contains changes you did not ask for.

**Cause**: Long Cloud sessions accumulate context and the agent begins to infer intent
rather than following the spec.

**Fix**:
1. Break long task lists into smaller chunks. No more than 5–7 tasks per Cloud session.
2. Require the agent to re-read TASKS.md and the linked Issues at the start of each
   major task, not just at the beginning of the session.
3. Add a rule to the kickoff prompt: "If you are unsure whether a change is in scope,
   do not make it. Post a comment on the Issue asking for confirmation."

### Hallucinated Files

**Symptom**: The agent creates new files that do not correspond to any task or existing
pattern in the codebase. These files reference imports that do not exist.

**Cause**: The agent inferred that a file should exist based on the codebase pattern,
but the file was not part of the task.

**Fix**:
1. Add to the kickoff prompt: "Do not create files that are not explicitly required by
   your tasks. If you need a new file, describe what it would contain in a GitHub Issue
   comment and wait for confirmation before creating it."
2. Add a GitHub Action that posts a comment on the PR listing all newly created files.
   A human reviews this list before approving.

### Repeated Fixes of the Same Bug

**Symptom**: A Cloud agent fixes a bug in one place, but the same pattern exists in 10
other places. The agent only touches one instance because the task said "fix the bug in
$FILE."

**Fix**:
1. When filing the task for a Cloud agent, explicitly state: "Search the entire codebase
   for this pattern and fix all instances." Include the grep pattern to search for.
2. After the PR is merged, run the design-token enforcer or forbidden-tech scanner
   to confirm the pattern is gone.

### Scope Creep

**Symptom**: The PR is 3,000 lines and touches files in all three cluster directories.
The agent clearly went beyond its assigned scope.

**Cause**: The kickoff prompt was too open-ended, or the agent found a "while I'm here"
improvement opportunity.

**Fix**:
1. Close the PR. Do not merge it. File a GitHub Issue documenting what happened.
2. Re-spec the tasks with stricter directory boundaries.
3. Add to the kickoff prompt: "If you find an improvement opportunity outside your
   assigned directories, file a GitHub Issue describing it and do not implement it."
4. Add the scope-check to the CI: a GitHub Action that fails if the PR touches files
   outside the `ALLOWED_DIRECTORIES` list extracted from the directory map.

### Agent Stops Mid-Task Without Explanation

**Symptom**: The agent opened a PR with incomplete work. Some tasks in TASKS.md were
never attempted.

**Cause**: The agent's Cloud session timed out, or the agent encountered an error it
could not handle and stopped without reporting.

**Fix**:
1. Check the agent's session log in Cursor Cloud dashboard.
2. Look for the last action before the session ended.
3. Re-start the agent with a kickoff prompt that acknowledges the partial state:
   "Continue from where you left off. The following tasks are done (marked in TASKS.md).
   The following tasks remain. Start from: $NEXT_TASK."
4. The partially complete PR should be left open. The agent can push additional commits
   to the same branch.

---

## 11. "Day in the Life" Example

This example shows how Cursor IDE and three Cloud agents coexist over a single workday
on `$PROJECT`. All five agents are active in overlapping windows.

### 07:00 — Morning Review

**Human (Cursor IDE)**:
- Opens Cursor IDE.
- Reviews the three PRs opened overnight by Cloud agents 1, 2, and 3.
- Runs the test suite locally.
- Merges two PRs. Requests changes on one (leaves comments in GitHub).
- Updates TASKS.md with new tasks for today.
- Writes three kickoff prompts for new Cloud agent sessions.

### 08:00 — Cloud Agents Start

**Cursor Cloud 1 (Core Features)**: Kicks off on a new session with 5 tasks from
TASKS.md §cursor-cloud-1. Posts to Discord #agent-cursor-cloud:
```
[START] Agent: cursor-cloud-1 | Session: 2025-01-14-morning | Tasks: #91, #92, #93, #94, #95
```

**Cursor Cloud 2 (AI)**: Kicks off with 4 tasks. Posts to #agent-cursor-cloud similarly.

**Cursor Cloud 3 (Platform)**: Picks up the change-request comments from last night's PR.
Kicks off with the goal of addressing all review comments.

### 09:00 — Human in IDE

**Human (Cursor IDE)**: Works on a spike for a new feature (exploring a third-party
audio processing library). This is exploratory work — not yet well-specified enough for
a Cloud agent.

Meanwhile, all three Cloud agents are working in their respective directories.

### 11:00 — Handoff Signal

**Cursor Cloud 1**: Completes task #91 (auth feature). Pushes commit. Notices that
Cluster 2's embeddings feature depends on the auth token being available, which #91 just
wired up.

Cluster 1 applies label `cluster-2-unblocked` to Issue #88.

Pokee detects the label. Posts to Discord #handoffs:
```
[HANDOFF] cursor-cloud-1 completed auth token setup.
cursor-cloud-2 can now proceed with embeddings (Issue #88).
```

Cursor Cloud 2 reads the Discord message at its next context refresh and adds Issue #88
to its active task list.

### 12:00 — Twin Session

**Human**: Sees that the RevenueCat products for the new AI feature tier need to be
created. Triggers a Twin.so session from the Twin dashboard using the recipe in
TWIN_PLAYBOOK.md §4.4.

Twin creates the products and posts to Discord #agent-twin:
```
[DONE] Agent: twin | RevenueCat "ai-tier" entitlement created. 2 products configured.
```

### 14:00 — Approval Gate

**Cursor Cloud 3**: Finishes addressing all review comments. Opens a new PR #116.
CI passes. Labels `needs-review`.

Pokee detects `needs-review` on PR #116 and posts to Discord #approvals:
```
[APPROVAL] PR #116 is ready for review. Agent: cursor-cloud-3.
Changes: addressed 8 review comments from PR #112. Review: https://github.com/...
```

**Human** reviews in Cursor IDE (10 minutes), approves and merges.

### 17:00 — Human in IDE (End of Day)

**Human (Cursor IDE)**: Writes the three kickoff prompts for tomorrow's overnight Cloud
sessions. Commits them as `prompts/2025-01-15-morning.md` for reference.

Updates TASKS.md with tonight's overnight tasks. Pushes.

### 22:00 — Overnight Cloud Sessions Start

Human kicks off all three Cloud agents with overnight prompts.

**Zo Computer**: Scheduled nightly backup runs at 02:00 UTC automatically.

**Pokee**: Weekly newsletter draft scheduled to fire at 18:00 UTC Friday.

By the next morning, the cycle repeats: three new PRs are waiting for human review.

---

*End of CURSOR_AGENT_PATTERNS.md*


---

## 7.4 Zo Playbook

> **Source file:** `ZO_PLAYBOOK.md`

# Zo Computer Playbook

Playbook-Version: 1.0.0
Applies-To: $PROJECT (generic — fork and replace placeholder)

---

## 1. What Zo Computer Is

Zo Computer is a personal AI cloud computer — a persistent, remotely accessible virtual
machine operated by an AI agent. Unlike a CI runner that executes a fixed script and
exits, Zo maintains a workspace: files persist between sessions, background processes can
run for hours, and you interact with it through natural-language instructions rather than
YAML pipelines.

Key characteristics:

- **Persistent workspace**: Files you place in the workspace survive across jobs. This
  makes Zo suitable for multi-step pipelines where one job produces artifacts consumed by
  the next.
- **Long-running processes**: Zo can run a job for 8–12 hours without a timeout, making
  it the right tool for overnight asset batches, large transcription runs, and multi-file
  refactors that would exhaust a Cursor Cloud session.
- **Natural-language interface**: You instruct Zo in plain English. It interprets the
  instruction, writes the necessary scripts, executes them, and reports results.
- **Scheduled execution**: Zo supports cron-style triggers. Point a Zo job at a schedule
  and it fires automatically — no GitHub Actions YAML required.
- **Model API passthrough**: Zo can call OpenAI, Anthropic, Replicate, ElevenLabs, and
  other model APIs on your behalf, treating them as tools inside a larger pipeline.

Zo is not a coding IDE. It does not give you a fast feedback loop for iterative coding.
It is a cloud execution environment for jobs you define and then walk away from.

---

## 2. When to Pick Zo

Use this decision matrix before assigning a job to Zo.

### Use Zo when:

| Scenario | Reason |
|---|---|
| Job runs longer than 2 hours | Cursor Cloud sessions have shorter time budgets; Zo has no practical timeout |
| Job produces file artifacts (images, audio, PDFs, zip bundles) | Zo workspace stores them; you retrieve via download or S3 push |
| Job requires calling multiple model APIs in sequence | Zo orchestrates multi-step pipelines natively |
| Job should fire on a schedule (daily, weekly, nightly) | Zo has native cron scheduling |
| Job processes large batches of inputs (100+ items) | Zo handles fan-out loops without timeouts |
| Job is a transcription pipeline (audio → text → structured output) | Zo has audio processing tools |
| Job is research synthesis (read 50 URLs → produce a report) | Zo can run a crawler + summarizer pipeline |
| Job is a release artifact bundle (zip, checksum, upload) | Zo produces and uploads reliably |
| You want "ship while I sleep" execution with no babysitting | Zo is designed for exactly this |

### Do NOT use Zo when:

| Scenario | Better Agent |
|---|---|
| Tight-loop coding with fast iteration | Cursor IDE |
| Parallel PR-based code changes | Cursor Cloud Background Agents |
| GUI-gated dashboard action (App Store, Stripe) | Twin.so |
| Cross-posting a release to social media | Pokee AI |
| Anything requiring human approval before proceeding | Route to `#approvals` first; do not start Zo |

---

## 3. Account Setup Checklist

Complete these steps once per project. Subsequent jobs skip to section 4.

### 3.1 Account Creation

- [ ] Create a Zo Computer account at zo.computer
- [ ] Verify email address
- [ ] Choose a workspace name matching `$PROJECT` (lowercase, hyphenated)
- [ ] Note the workspace URL (used in handoff webhooks)

### 3.2 GitHub Connection

- [ ] In Zo settings → Integrations → GitHub, authorize the OAuth app
- [ ] Grant read access to `$PROJECT` repository (required for code jobs)
- [ ] Grant write access if Zo will open PRs (code error sweep template)
- [ ] Test the connection: run `git clone $PROJECT_REPO_URL` from a Zo session and
  confirm it succeeds

### 3.3 Model API Key Entries

Zo uses these API keys to call external models on your behalf. Enter them in
Zo Settings → API Keys.

| Key Name | Source | Required For |
|---|---|---|
| `OPENAI_API_KEY` | platform.openai.com | GPT-4o summarization, embeddings |
| `ANTHROPIC_API_KEY` | console.anthropic.com | Claude synthesis, code review |
| `REPLICATE_API_TOKEN` | replicate.com | Image generation, audio models |
| `ELEVENLABS_API_KEY` | elevenlabs.io | Text-to-speech (optional) |
| `RESEND_API_KEY` | resend.com | Email delivery from Zo pipelines |
| `$PROJECT_CONVEX_DEPLOY_URL` | Convex dashboard | Posting handoff events |
| `DISCORD_WEBHOOK_ZO` | Discord server settings | Status posts to #agent-zo |
| `S3_BUCKET` + `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` | AWS | Artifact storage |

Never paste key values into Zo prompt text. Always reference the named key.

### 3.4 Workspace Provisioning

- [ ] Create a directory structure in the Zo workspace:
  ```
  /workspace/
    $PROJECT/
      inputs/       # files Zo should read
      outputs/      # files Zo produces
      logs/         # job logs
      scripts/      # reusable helper scripts
  ```
- [ ] Upload any seed files (brand kit, voice samples, logo assets) to `/workspace/$PROJECT/inputs/`
- [ ] Create a `workspace-manifest.md` listing what is in each directory
- [ ] Set the default working directory in Zo preferences to `/workspace/$PROJECT/`

### 3.5 Webhook Configuration

- [ ] Note your Zo workspace webhook URL (Settings → Webhooks → Inbound)
- [ ] In Pokee, add a Zo action using that webhook URL
- [ ] In Convex (if used), add `ZO_WEBHOOK_URL` to environment variables
- [ ] Test with a ping: send `{"event": "ping"}` and confirm Zo logs it

---

## 4. Generic Job Templates

Each template below includes:
- A plain-English description of what the job does
- The full prompt scaffold you paste into Zo to start the job
- Required env vars
- Expected output artifacts

Replace `$PROJECT`, `$REPO_URL`, `$DISCORD_WEBHOOK_ZO`, and other placeholders with
real values before running.

---

### 4.1 Overnight Code Error Sweep

**Purpose**: Zo clones the repo, runs type-checking and linting, patches trivial errors
it can fix automatically, and opens a PR with the changes. Runs overnight so the team
wakes up to a clean state.

**Required env vars**: `ANTHROPIC_API_KEY`, `$REPO_URL`, `GITHUB_TOKEN`

**Prompt scaffold**:

```
You are running an overnight code quality sweep for $PROJECT.

Steps:
1. Clone $REPO_URL into /workspace/$PROJECT/sweep/ using the GITHUB_TOKEN env var
   for authentication.
2. Install dependencies: run `npm install` (or the appropriate package manager for
   this repo — check package.json for a packageManager field).
3. Run the type checker: `npx tsc --noEmit`. Capture all output to
   /workspace/$PROJECT/logs/tsc-output.txt.
4. Run the linter: `npx eslint . --ext .ts,.tsx`. Capture all output to
   /workspace/$PROJECT/logs/eslint-output.txt.
5. For each error or warning in the output:
   a. If it is a trivially auto-fixable issue (unused import, missing semicolon,
      wrong quote style, explicit `any` where the type is obvious from context),
      fix it directly in the file.
   b. If it requires judgment (architectural change, breaking API, unclear intent),
      write it to /workspace/$PROJECT/logs/needs-human-review.md with file path,
      line number, and a one-sentence explanation.
6. After applying all auto-fixes, run tsc and eslint again. All auto-fixed errors
   should now be gone. If new errors appeared, revert those changes and add them
   to needs-human-review.md.
7. Create a git branch named `zo/error-sweep-YYYY-MM-DD`.
8. Commit all changes with message: "chore: automated type and lint fixes [zo]"
9. Push the branch and open a GitHub PR with:
   - Title: "Automated error sweep — YYYY-MM-DD"
   - Body: paste the contents of the logs directory summary
   - Labels: ["zo-automated", "needs-review"]
10. Post to Discord webhook $DISCORD_WEBHOOK_ZO:
    {"content": "[DONE] Error sweep complete. PR: <pr_url>. Human review items: <count>"}

Do not modify any files in /workspace/$PROJECT/sweep/ outside of TypeScript/TSX source
files. Do not change package.json, lock files, config files, or test fixtures.
Do not open more than one PR. If the branch already exists, delete it and recreate.
```

**Expected outputs**:
- GitHub PR with automated fixes
- `/workspace/$PROJECT/logs/needs-human-review.md`
- Discord message in `#agent-zo`

---

### 4.2 Asset Batch Generation

**Purpose**: Zo generates a batch of visual or audio assets (social cards, OG images,
marketing graphics, voice-over clips) from a list of inputs. This offloads expensive
generation from local machines and produces a downloadable artifact bundle.

**Required env vars**: `REPLICATE_API_TOKEN`, `ANTHROPIC_API_KEY`, `S3_BUCKET`,
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `DISCORD_WEBHOOK_ZO`

**Prompt scaffold**:

```
You are generating a batch of marketing assets for $PROJECT.

Input file: /workspace/$PROJECT/inputs/asset-brief.json
Format of asset-brief.json:
{
  "assets": [
    {
      "id": "string",
      "type": "social-card" | "og-image" | "banner" | "voice-clip",
      "title": "string",
      "subtitle": "string (optional)",
      "theme": "light" | "dark",
      "dimensions": { "width": number, "height": number }
    }
  ],
  "brand": {
    "primary_color": "#hex",
    "font": "string",
    "logo_url": "url"
  }
}

Steps:
1. Read /workspace/$PROJECT/inputs/asset-brief.json.
2. For each asset of type "social-card", "og-image", or "banner":
   a. Generate an image using Replicate (use the model appropriate for the size:
      stabilityai/stable-diffusion-xl-base-1.0 for general images, or
      construct a prompt using the title, subtitle, brand colors, and theme).
   b. Save the output to /workspace/$PROJECT/outputs/<asset.id>.<ext>.
3. For each asset of type "voice-clip":
   a. Call ElevenLabs TTS API with the title text.
   b. Save the output to /workspace/$PROJECT/outputs/<asset.id>.mp3.
4. After all assets are generated:
   a. Create a manifest file /workspace/$PROJECT/outputs/manifest.json listing
      each asset ID, type, file path, dimensions, and file size.
   b. Zip the outputs directory: /workspace/$PROJECT/outputs/assets-YYYY-MM-DD.zip
   c. Upload the zip to S3 bucket $S3_BUCKET at key:
      $PROJECT/assets/YYYY-MM-DD/assets-YYYY-MM-DD.zip
   d. Generate a pre-signed URL valid for 7 days.
5. Post to Discord webhook $DISCORD_WEBHOOK_ZO:
   {"content": "[DONE] Asset batch complete. $COUNT assets. Download: <presigned_url>"}

If any individual asset fails to generate, log the error to
/workspace/$PROJECT/logs/failed-assets.txt and continue with the rest.
Do not abort the entire batch for a single failure.
```

**Expected outputs**:
- All assets in `/workspace/$PROJECT/outputs/`
- `manifest.json`
- Zip uploaded to S3 with pre-signed URL posted to Discord

---

### 4.3 Transcription Pipeline

**Purpose**: Zo takes audio or video files, transcribes them, then produces a structured
set of outputs: cleaned transcript, Twitter/X thread, blog post draft, and newsletter
section draft. Designed for founder vlog recordings, podcast episodes, or meeting
recordings.

**Required env vars**: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `DISCORD_WEBHOOK_ZO`,
`S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

**Prompt scaffold**:

```
You are running a transcription and content repurposing pipeline for $PROJECT.

Input: /workspace/$PROJECT/inputs/audio/ (directory of .mp3 or .mp4 files)
Output: /workspace/$PROJECT/outputs/transcripts/

Steps:
1. List all .mp3 and .mp4 files in /workspace/$PROJECT/inputs/audio/.
2. For each file:
   a. Transcribe using OpenAI Whisper API (model: whisper-1).
      - Request verbose_json format to get word-level timestamps.
      - Save raw transcript to /workspace/$PROJECT/outputs/transcripts/<filename>.raw.json
   b. Clean the transcript:
      - Remove filler words (um, uh, like) that appear more than once per sentence.
      - Fix obvious speech-to-text errors using context.
      - Produce a clean plain-text version at <filename>.clean.txt
   c. Produce a Twitter/X thread from the transcript:
      - Maximum 15 tweets, each under 280 characters.
      - First tweet is a hook summarizing the key insight.
      - Save to <filename>.thread.txt
   d. Produce a blog post draft:
      - 600–900 words.
      - H2 headings for main sections.
      - No "As an AI" language.
      - Use first-person voice matching the speaker.
      - Save to <filename>.blog.md
   e. Produce a newsletter section:
      - 150–200 words.
      - Suitable as a section inside a weekly newsletter.
      - End with a call to action pointing to the blog post.
      - Save to <filename>.newsletter-section.md
3. After all files are processed:
   a. Create a /workspace/$PROJECT/outputs/transcripts/index.md listing each
      input file, its clean transcript path, thread path, blog path, and
      newsletter section path.
   b. Zip the transcripts directory.
   c. Upload to S3 at $PROJECT/transcripts/YYYY-MM-DD/transcripts.zip.
   d. Generate a pre-signed URL valid for 14 days.
4. Post to Discord webhook $DISCORD_WEBHOOK_ZO:
   {"content": "[DONE] Transcription pipeline complete. $COUNT files processed.
    Download: <presigned_url>. Review index: transcripts/index.md"}

If Whisper returns an error for a file, log it and continue.
Do not hallucinate content — base all outputs strictly on the transcript text.
```

**Expected outputs**:
- Per-file: `.raw.json`, `.clean.txt`, `.thread.txt`, `.blog.md`, `.newsletter-section.md`
- `index.md`
- Zip on S3 with pre-signed URL

---

### 4.4 Release Artifact Bundling

**Purpose**: Zo pulls a specific release tag, runs the production build, packages the
output into a distributable archive, generates checksums, and uploads to S3. Used for
self-hosted deployments, desktop builds, or release packages that go alongside a GitHub
Release.

**Required env vars**: `GITHUB_TOKEN`, `$REPO_URL`, `$RELEASE_TAG`, `S3_BUCKET`,
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `DISCORD_WEBHOOK_ZO`

**Prompt scaffold**:

```
You are building and packaging release artifacts for $PROJECT version $RELEASE_TAG.

Steps:
1. Clone $REPO_URL at tag $RELEASE_TAG:
   git clone --branch $RELEASE_TAG --depth 1 $REPO_URL /workspace/$PROJECT/release-build/
2. Install dependencies:
   cd /workspace/$PROJECT/release-build/ && npm ci
3. Run the production build:
   npm run build
   Capture stdout and stderr to /workspace/$PROJECT/logs/build-RELEASE_TAG.txt.
   If the build exits non-zero, post an error to Discord and abort.
4. Package the build output:
   a. Determine the output directory from package.json (look at the "build" script
      to find the output dir, typically dist/ or build/).
   b. Create a tar.gz archive:
      tar -czf /workspace/$PROJECT/outputs/$PROJECT-$RELEASE_TAG.tar.gz \
        -C /workspace/$PROJECT/release-build/ <output_dir>
   c. Create a zip archive:
      zip -r /workspace/$PROJECT/outputs/$PROJECT-$RELEASE_TAG.zip \
        /workspace/$PROJECT/release-build/<output_dir>
5. Generate checksums:
   sha256sum /workspace/$PROJECT/outputs/$PROJECT-$RELEASE_TAG.tar.gz > \
     /workspace/$PROJECT/outputs/$PROJECT-$RELEASE_TAG.tar.gz.sha256
   sha256sum /workspace/$PROJECT/outputs/$PROJECT-$RELEASE_TAG.zip > \
     /workspace/$PROJECT/outputs/$PROJECT-$RELEASE_TAG.zip.sha256
6. Upload all four files to S3:
   s3 key prefix: $PROJECT/releases/$RELEASE_TAG/
7. Generate pre-signed URLs (valid 30 days) for all four files.
8. Post to Discord webhook $DISCORD_WEBHOOK_ZO:
   {"content": "[DONE] Release $RELEASE_TAG artifacts ready.\n
    tar.gz: <url>\nzip: <url>\nsha256s: <url1> <url2>"}
9. Update the GitHub Release for $RELEASE_TAG by uploading the artifacts
   as release assets using the GitHub API (use GITHUB_TOKEN).
```

**Expected outputs**:
- `.tar.gz` and `.zip` bundles + `.sha256` files on S3
- Artifacts attached to the GitHub Release
- Discord notification

---

### 4.5 Research and Synthesis Batch

**Purpose**: Zo takes a list of URLs or topics, fetches and reads each source, and
produces a synthesized research report. Useful for competitive analysis, literature
review, or weekly link digests.

**Required env vars**: `ANTHROPIC_API_KEY`, `DISCORD_WEBHOOK_ZO`, `S3_BUCKET`,
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

**Prompt scaffold**:

```
You are running a research synthesis job for $PROJECT.

Input file: /workspace/$PROJECT/inputs/research-brief.json
Format:
{
  "topic": "string — the overarching research question",
  "sources": [
    { "url": "string", "label": "string (optional)" }
  ],
  "output_format": "executive-summary" | "annotated-bibliography" | "competitive-matrix",
  "max_words": number
}

Steps:
1. Read /workspace/$PROJECT/inputs/research-brief.json.
2. For each source URL:
   a. Fetch the page content (use a headless HTTP request; handle redirects).
   b. If the URL returns a PDF, extract text.
   c. If the URL is a YouTube video, extract the auto-caption transcript via the
      YouTube oEmbed or data API.
   d. Save the raw content to /workspace/$PROJECT/outputs/research/raw/<label>.txt.
   e. Produce a 200-word summary of the source.
   f. Extract 3–5 key claims or data points as bullet points.
3. Once all sources are processed:
   a. If output_format is "executive-summary":
      Write a single coherent report of max_words words covering the topic,
      synthesizing all sources, citing them by label.
   b. If output_format is "annotated-bibliography":
      For each source, write: label, URL, 150-word annotation, key claims.
   c. If output_format is "competitive-matrix":
      Build a Markdown table where rows are competitors/solutions and columns
      are evaluation criteria extracted from the topic.
4. Save the final report to /workspace/$PROJECT/outputs/research/report-YYYY-MM-DD.md.
5. Upload the report and raw source files (zipped) to S3.
6. Post to Discord webhook $DISCORD_WEBHOOK_ZO:
   {"content": "[DONE] Research synthesis complete on topic: <topic>.
    Report: <s3_url>. Sources processed: $COUNT"}

Do not fabricate sources or statistics. If a URL is inaccessible, note it in the report
and skip it.
```

**Expected outputs**:
- Per-source raw text files
- Final synthesized report as Markdown on S3
- Discord notification

---

### 4.6 Scheduled Cron Jobs

**Purpose**: Configure Zo to run recurring maintenance tasks on a schedule. The two most
common patterns are daily backups and weekly digests.

#### Daily Backup Job

**Prompt scaffold (set to fire daily at 02:00 UTC)**:

```
You are running the nightly backup job for $PROJECT.

Steps:
1. Clone or pull the latest $REPO_URL into /workspace/$PROJECT/backup-staging/.
2. Export the Convex database to JSON:
   npx convex export --format json --output /workspace/$PROJECT/backup-staging/db-export.json
   (Skip this step if the project does not use Convex.)
3. Create a backup archive:
   tar -czf /workspace/$PROJECT/outputs/backup-YYYY-MM-DD.tar.gz \
     /workspace/$PROJECT/backup-staging/
4. Upload to S3 at $PROJECT/backups/YYYY/MM/DD/backup-YYYY-MM-DD.tar.gz.
5. Delete archives older than 90 days from the S3 prefix $PROJECT/backups/.
6. Post to Discord webhook $DISCORD_WEBHOOK_ZO:
   {"content": "[DONE] Nightly backup complete. Size: <file_size>MB. Retained: <count> archives."}
```

#### Weekly Digest Assembly Job

**Prompt scaffold (set to fire every Sunday at 06:00 UTC)**:

```
You are assembling the weekly digest for $PROJECT for the week ending YYYY-MM-DD.

Steps:
1. Use the GitHub API (GITHUB_TOKEN) to fetch:
   a. All PRs merged this week in $REPO_URL.
   b. All Issues closed this week.
   c. New GitHub stars (if accessible via API).
2. Read the Sentry weekly summary from /workspace/$PROJECT/inputs/sentry-weekly.json
   (this file is written by a Pokee job that runs before this one).
3. Compile a weekly digest document at /workspace/$PROJECT/outputs/digest-YYYY-MM-DD.md:
   - Section 1: What shipped (merged PRs with titles and links)
   - Section 2: What was fixed (closed issues)
   - Section 3: Top errors (from Sentry data)
   - Section 4: Numbers (stars, open issues, open PRs)
4. Post the digest file to Discord webhook $DISCORD_WEBHOOK_ZO as a file attachment.
5. Save to S3 at $PROJECT/digests/YYYY/MM/digest-YYYY-MM-DD.md.
```

---

## 5. Handoff Patterns

### Zo → Pokee → Discord

The most common handoff: Zo completes a job, posts to a Convex HTTP endpoint or Discord
webhook, Pokee picks up the event and fans it out to other channels or agents.

```
Zo finishes job
  → POST to DISCORD_WEBHOOK_ZO with structured JSON
  → Pokee workflow listens on #agent-zo channel
  → Pokee cross-posts summary to #summary
  → If artifacts were produced, Pokee posts download link to relevant Slack/Discord thread
```

### Zo → Convex webhook → Cursor Cloud

When Zo produces code changes and a Cursor Cloud agent needs to continue:

```
Zo pushes a branch
  → GitHub webhook fires → Pokee receives it
  → Pokee posts label "zo-handoff" on the PR
  → Cursor Cloud agent monitors for that label and picks up the PR for review
```

### Zo → Human approval → Twin

When Zo produces an artifact that requires human sign-off before a GUI action:

```
Zo completes asset batch
  → Posts to #approvals: "[APPROVAL] Asset batch ready. Review at <url>. 
     Reply 'approve' to trigger Twin submission."
  → Human reviews and replies
  → Pokee detects the reply and triggers the Twin.so session
```

---

## 6. Cost and Quota Considerations

- **Zo compute time**: Zo bills by the minute of active execution. Overnight jobs of
  8–12 hours can accumulate significant cost. Set a monthly cap in Zo billing settings.
- **Model API calls**: Whisper, Claude, and image generation are billed per call.
  For large batches, estimate cost before running: `input_count × cost_per_call`.
- **S3 storage**: Standard S3 storage is inexpensive, but pre-signed URL generation and
  data transfer have costs. Set a lifecycle policy to expire artifacts older than 90 days.
- **GitHub API rate limits**: Authenticated requests allow 5,000/hour. A large code
  sweep that opens many PRs or fetches many issues can approach this limit.
- **Replicate cold starts**: First job of the day may wait for model warm-up (30–120s).
  Schedule batch jobs to start 5 minutes after any warm-up window.

---

## 7. Security

### API Key Management

- All API keys are stored in Zo's encrypted key vault (Settings → API Keys).
- Keys are referenced by name in prompts, never pasted as values.
- Keys are scoped to minimum required permissions:
  - `GITHUB_TOKEN`: repo scope only, not admin or org.
  - AWS keys: S3 PutObject + GetObject on the specific bucket prefix only.
  - Model API keys: no billing management permissions if the API allows scoping.

### Workspace Isolation

- Each project has its own workspace directory `/workspace/$PROJECT/`.
- If you run multiple projects in the same Zo account, use separate workspaces.
- Never store credentials as files in the workspace — they would persist across jobs
  and could be read by future prompt executions.

### Audit Log

- Zo maintains an execution log of every job: start time, prompt hash, model calls made,
  files written, external API calls, and end time.
- Download the audit log periodically and store in your repo at
  `agent-playbooks/audit-logs/zo-YYYY-MM.json`.
- Review the log after any unexpected behavior.

---

## 8. Troubleshooting

### Job times out without completing

**Symptom**: Zo posts no completion message; the job appears to have stopped.
**Cause**: Job exceeded Zo's maximum session length, or a subprocess hung.
**Fix**:
1. Check Zo execution logs for the last line of output before the timeout.
2. Add explicit timeout wrappers to long subprocesses:
   `timeout 3600 npm run build` instead of `npm run build`.
3. Break the job into smaller chunks; use the workspace to checkpoint progress.

### API key rejected mid-job

**Symptom**: Error mid-job like `401 Unauthorized` from a model API.
**Cause**: Key was rotated on the external service but not updated in Zo.
**Fix**:
1. Rotate the key in the external service.
2. Update in Zo Settings → API Keys.
3. Re-run the job from the checkpoint (use workspace files to skip completed steps).

### Workspace disk full

**Symptom**: `No space left on device` errors in Zo logs.
**Cause**: Previous jobs left large files in the workspace.
**Fix**:
1. In Zo, open a session and run `du -sh /workspace/$PROJECT/outputs/*` to find large files.
2. Delete or archive (upload to S3 then delete) files no longer needed.
3. Add a cleanup step at the end of every job template that deletes intermediate files.

### GitHub PR creation fails

**Symptom**: Zo reports success but no PR appears on GitHub.
**Cause**: `GITHUB_TOKEN` lacks `write:pull_request` scope, or the branch name conflicts.
**Fix**:
1. Check the token scopes: `curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit`.
2. Regenerate the token with `repo` scope in GitHub Settings → Developer Settings.
3. If branch already exists, add logic to delete and recreate: `git push origin --delete zo/branch-name`.

### Discord webhook posts fail silently

**Symptom**: Job completes but nothing appears in `#agent-zo`.
**Cause**: Webhook URL was deleted or the Discord channel was renamed.
**Fix**:
1. Test the webhook manually: `curl -X POST $DISCORD_WEBHOOK_ZO -H "Content-Type: application/json" -d '{"content":"test"}'`.
2. If it returns a 404, regenerate the webhook in Discord channel settings.
3. Update `DISCORD_WEBHOOK_ZO` in Zo API Keys.

---

*End of ZO_PLAYBOOK.md*


---

## 7.5 Twin Playbook

> **Source file:** `TWIN_PLAYBOOK.md`

# Twin.so Playbook

Playbook-Version: 1.0.0
Applies-To: $PROJECT (generic — fork and replace placeholder)

---

## 1. What Twin Is

Twin.so is an agentic browser automation agent. You give it natural-language instructions
and it operates a real browser session to complete the task — clicking buttons, filling
forms, uploading files, reading tables, and navigating multi-step flows.

Twin is purpose-built for the class of work that has no useful public API: proprietary
dashboards, approval workflows buried behind a login, admin consoles that predate REST,
and SaaS products that technically have an API but with scopes too narrow to accomplish
what you need.

Key characteristics:

- **Real browser sessions**: Twin operates Chromium (or your browser of choice) against
  the actual live website, not a scraping facsimile.
- **Session persistence**: You can give Twin a saved session cookie or have it log in
  once per day and reuse the session. This avoids repeated 2FA prompts.
- **Natural-language task spec**: Describe the goal in plain English. Twin interprets the
  UI and decides the action sequence.
- **Screenshot + confirmation loop**: Twin takes screenshots at each step and can pause
  to show you a screenshot before proceeding past a point of no return.
- **Human-handoff points**: Twin is designed to pause and notify you when it encounters
  a CAPTCHA, 2FA prompt, card entry field, or identity verification gate.

Twin is not an API client. Do not use it for services that have a proper REST or GraphQL
API — use Pokee AI for those. Twin is the last resort before manual work.

---

## 2. When to Pick Twin

### Use Twin when:

| Scenario | Reason |
|---|---|
| The target service has no public API | Twin is the only automation path |
| The API exists but requires a scope not available without enterprise plan | Twin bypasses the scope gate |
| The task requires navigating a multi-step wizard with conditional branching | Twin handles arbitrary UI flows |
| The task involves uploading binary files (screenshots, IPAs, AABs) through a web form | Twin handles file upload inputs |
| The task requires reading data out of a table that is not exported via API | Twin can scrape and return structured data |
| The task is a one-time or infrequent setup action (submit app, enroll in program) | Not worth building a custom integration |
| An existing Pokee workflow is blocked by a GUI gate | Twin unblocks it |

### Do NOT use Twin when:

| Scenario | Better Agent |
|---|---|
| The service has a documented REST/GraphQL API with adequate scopes | Pokee AI (OAuth integration) |
| The task is writing or reviewing code | Cursor IDE or Cursor Cloud |
| The task is a long-running server process | Zo Computer |
| You need real-time interactivity (you want to watch and correct) | Do it manually, then document for Twin |
| The page uses strong bot-detection (Cloudflare Turnstile v2, hCaptcha) | Flag as human-required |

---

## 3. Account Setup Checklist

- [ ] Create a Twin.so account at twin.so
- [ ] Verify email and set up billing (Twin bills per session minute)
- [ ] Install the Twin browser extension if using the managed browser path
- [ ] Generate a Twin API key: Settings → API → Create Key
- [ ] Store the key as `TWIN_API_KEY` in your secrets manager
- [ ] In Pokee, add a Twin action using the API key (Pokee can trigger Twin sessions)
- [ ] Set the default session region closest to your target services
  (App Store Connect is served from US; choose US-East or US-West)
- [ ] Test with a simple session: navigate to example.com and return the page title

### Session Cookie Strategy

For services requiring login, Twin can reuse a saved session:

- [ ] Log in to the target service manually in a clean browser profile
- [ ] Export cookies as JSON (Cookie Editor extension for Chrome exports RFC 6265 format)
- [ ] Upload the cookie file to Twin session storage: Settings → Sessions → Upload Cookies
- [ ] Label the cookie file clearly: `app-store-connect-YYYY-MM-DD.json`
- [ ] Plan a cookie refresh cycle: most sessions expire after 30–90 days
- [ ] Add a calendar reminder to refresh cookies before they expire

---

## 4. Generic Dashboard Recipes

Each recipe includes:
- A checklist of what to prepare before starting the session
- The Twin prompt scaffold

Replace `$PROJECT`, `$APP_NAME`, `$BUNDLE_ID`, and other placeholders before use.

---

### 4.1 iOS App Store Submission (App Store Connect)

**Pre-session checklist**:
- [ ] Have a signed `.ipa` file ready (built and exported by Cursor Cloud or Zo)
- [ ] Have App Store Connect session cookie loaded in Twin
- [ ] Have the app's metadata file ready:
  - App name, subtitle, description, keywords, support URL, marketing URL
  - Screenshots for all required device sizes (6.7", 6.5", 5.5", iPad Pro 12.9")
  - Privacy policy URL
  - App category (primary + optional secondary)
  - Age rating answers
  - Version number and build number matching the IPA
- [ ] Confirm: is this a new app listing or an update to an existing app?

**Twin prompt scaffold (new version submission)**:

```
Session goal: Submit a new version of $APP_NAME ($BUNDLE_ID) to App Store review.

Context:
- App Store Connect URL: https://appstoreconnect.apple.com
- Use the saved session cookie for App Store Connect.
- This is a version update, not a new app listing.

Steps:
1. Navigate to https://appstoreconnect.apple.com/apps.
2. Find the app "$APP_NAME" in the list and click it.
3. Click the "+" button next to "iOS App" to create a new version.
4. Enter version number: $VERSION_NUMBER. Click "Create".
5. Fill in the "What's New in This Version" field with:
   $WHATS_NEW_TEXT
6. Upload the screenshots from local paths:
   6.7" screenshots: $SCREENSHOT_67_PATHS
   6.5" screenshots: $SCREENSHOT_65_PATHS
   5.5" screenshots: $SCREENSHOT_55_PATHS
   iPad Pro 12.9": $SCREENSHOT_IPAD_PATHS
   (For each size, click "Add" in the screenshot section, select the correct files.)
7. Fill in or verify these metadata fields (update only if the value has changed):
   - App name: $APP_NAME
   - Subtitle: $APP_SUBTITLE
   - Keywords: $KEYWORDS
   - Description: $APP_DESCRIPTION
   - Support URL: $SUPPORT_URL
   - Marketing URL: $MARKETING_URL (if applicable)
8. Under "Build", click "Select a Build" and choose the build matching version
   $VERSION_NUMBER and build number $BUILD_NUMBER.
   If the build is not listed, pause and notify: "[BLOCKED] Build not visible in
   App Store Connect. Possible TestFlight processing delay."
9. Under "App Review Information", fill in:
   - Notes for reviewer: $REVIEW_NOTES
   - Demo account credentials if required: $DEMO_EMAIL / $DEMO_PASSWORD
10. Set pricing to: $PRICING_TIER (e.g., Free, or Tier 1).
11. Set availability to: All territories (or $TERRITORY_LIST if restricted).
12. Click "Save" and then "Submit for Review".
13. On the export compliance screen: answer $EXPORT_COMPLIANCE_ANSWER.
14. On the content rights screen: confirm.
15. Click "Submit".
16. Take a screenshot of the confirmation page and save it as submission-confirmation.png.
17. Post to Discord webhook $DISCORD_WEBHOOK_TWIN:
    {"content": "[DONE] App Store submission complete for $APP_NAME v$VERSION_NUMBER.
     Build: $BUILD_NUMBER. Status: Waiting for Review."}

If you encounter a CAPTCHA, 2FA prompt, or unexpected page state, pause and post:
"[BLOCKED] <describe what you see> — human intervention required."
Do not click "Submit" if there are any validation errors shown on the page.
```

---

### 4.2 Google Play Console Submission

**Pre-session checklist**:
- [ ] Have a signed `.aab` (Android App Bundle) file ready
- [ ] Have Google Play Console session cookie loaded in Twin
- [ ] Have metadata ready:
  - Short description (80 chars), full description (4000 chars)
  - Screenshots: phone (2+ required), 7" tablet, 10" tablet
  - Feature graphic (1024x500)
  - App category, content rating questionnaire answers

**Twin prompt scaffold (production release)**:

```
Session goal: Upload and submit $APP_NAME for production release on Google Play.

Context:
- Google Play Console URL: https://play.google.com/console
- Package name: $PACKAGE_NAME
- Use the saved session cookie for Google Play Console.

Steps:
1. Navigate to https://play.google.com/console and select the $PROJECT account.
2. Find "$APP_NAME" in the app list and click it.
3. Navigate to: Production → Create new release.
4. Upload the AAB file at $AAB_FILE_PATH using the upload button.
   Wait for the upload to complete and processing to finish.
5. In the "Release name" field, enter: $VERSION_NAME.
6. In the "Release notes" field, enter the release notes for each language you support:
   English (US): $RELEASE_NOTES_EN
   (Add other languages if applicable.)
7. Click "Next" to proceed to the review screen.
8. On the review screen, verify there are no policy warnings or errors.
   If there are warnings, screenshot them and post to Discord:
   "[BLOCKED] Play Console policy warning found — screenshot attached. Human review needed."
9. Click "Start rollout to Production".
10. On the confirmation dialog, click "Rollout".
11. Screenshot the success confirmation.
12. Post to Discord webhook $DISCORD_WEBHOOK_TWIN:
    {"content": "[DONE] Google Play submission complete. $APP_NAME $VERSION_NAME
     submitted for production rollout."}
```

---

### 4.3 Developer Program Enrollment Assist

Twin handles form-filling. Humans handle SMS verification, ID upload, and payment.

**Apple Developer Program enrollment**:

```
Session goal: Begin Apple Developer Program enrollment for $COMPANY_NAME.
IMPORTANT: Pause before any step that requires SMS verification, credit card entry,
or government ID upload. Those steps must be completed by a human.

Steps:
1. Navigate to https://developer.apple.com/enroll/.
2. Click "Start Your Enrollment".
3. Sign in with Apple ID: $APPLE_ID (you may need to pause here for 2FA).
4. Select entity type: $ENTITY_TYPE (Individual or Organization).
5. For Organization type, fill in:
   - Legal entity name: $LEGAL_NAME
   - DUNS number: $DUNS_NUMBER
   - Headquarters address: $ADDRESS
   - Website: $WEBSITE_URL
   - Confirm org phone: $ORG_PHONE
6. Fill in contact information:
   - First name: $FIRST_NAME
   - Last name: $LAST_NAME
   - Job title: $JOB_TITLE
   - Work email: $WORK_EMAIL
   - Phone: $PHONE
7. Review the form for accuracy and take a screenshot.
8. Post to Discord: "[APPROVAL] Developer enrollment form filled. Screenshot attached.
   Please review and reply 'proceed' to submit, or list corrections."
9. Wait for human approval before clicking Submit.
10. After human replies 'proceed', click Submit.
11. Post: "[DONE] Enrollment submitted. Next human step: complete payment at
    developer.apple.com/account/. Twin cannot handle payment entry."
```

---

### 4.4 RevenueCat Subscription Product Creation

**Pre-session checklist**:
- [ ] App already listed in RevenueCat and linked to App Store Connect / Play Console
- [ ] Product IDs planned and documented
- [ ] Entitlement names decided

**Twin prompt scaffold**:

```
Session goal: Create subscription products and entitlements in RevenueCat for $PROJECT.

Products to create (read from /local/revenuecat-products.json if available, or use below):
$PRODUCT_LIST (array of: { id, name, duration, price, trial_days })

Steps:
1. Navigate to https://app.revenuecat.com.
2. Select the project "$PROJECT".
3. Navigate to Products → Add Product.
4. For each product in the list:
   a. Click "Add Product".
   b. Enter the Product Identifier: <product.id>.
   c. Select the app store: $APP_STORE (App Store or Play Store).
   d. Click "Add".
5. Navigate to Entitlements → Add Entitlement.
6. Create an entitlement named "pro" (or $ENTITLEMENT_NAME).
7. Attach all created products to the entitlement.
8. Navigate to Offerings → Add Offering.
9. Create an offering named "default".
10. Add a package to the default offering for each product.
11. Screenshot the final offerings configuration.
12. Post to Discord webhook $DISCORD_WEBHOOK_TWIN:
    {"content": "[DONE] RevenueCat products created. $COUNT products, 1 entitlement,
     1 offering. Screenshot attached."}
```

---

### 4.5 Stripe Product Creation

Use this as an alternative or complement to RevenueCat for web-based billing.

```
Session goal: Create subscription products in the Stripe dashboard for $PROJECT.

Products:
$STRIPE_PRODUCT_LIST (array of: { name, description, price_monthly, price_yearly, currency })

Steps:
1. Navigate to https://dashboard.stripe.com (use saved Stripe session cookie).
2. Confirm you are in $STRIPE_MODE mode (Live or Test — check the toggle top-left).
   If wrong mode, switch before proceeding.
3. Navigate to Products → Add Product.
4. For each product:
   a. Name: <product.name>
   b. Description: <product.description>
   c. Pricing model: Recurring
   d. Add price: monthly at <product.price_monthly> <product.currency>
   e. Add price: yearly at <product.price_yearly> <product.currency>
   f. Click "Save Product".
5. Note the Product ID and Price IDs for each created product.
6. Save all IDs to a local JSON file: stripe-product-ids.json
7. Post to Discord: "[DONE] Stripe products created. IDs saved to stripe-product-ids.json."
```

---

### 4.6 Compliance Policy Generation

Generic pattern for GetTerms, Iubenda, or Termly.

```
Session goal: Generate and download a Privacy Policy and Terms of Service for $PROJECT
using $POLICY_SERVICE (GetTerms / Iubenda / Termly).

Project details:
- App name: $APP_NAME
- Company name: $COMPANY_NAME
- Website: $WEBSITE_URL
- Email: $CONTACT_EMAIL
- Collects user data: $COLLECTS_DATA (yes/no)
- Uses analytics: $USES_ANALYTICS
- Uses cookies: $USES_COOKIES
- Jurisdiction: $JURISDICTION (e.g., GDPR + CCPA)

Steps:
1. Navigate to the $POLICY_SERVICE website.
2. Start a new policy generation (Privacy Policy first).
3. Fill in the questionnaire with the project details above.
4. For any question not listed above, choose the most conservative option
   (i.e., assume the user wants maximum disclosure).
5. Generate the policy.
6. Copy the policy text and save to /local/$PROJECT-privacy-policy.md.
7. If the service offers a hosted URL, copy it and note it.
8. Repeat for Terms of Service.
9. Post to Discord: "[DONE] Policies generated. Privacy Policy: $HOSTED_URL.
   Terms: $TOS_URL. Files saved locally."
```

---

### 4.7 Vercel Domain Binding and Env Var Setup

```
Session goal: Bind the domain $DOMAIN to the Vercel project $PROJECT and configure
all required environment variables.

Environment variables to set (read from /local/$PROJECT-env-vars.json):
$ENV_VAR_LIST

Steps:
1. Navigate to https://vercel.com/dashboard.
2. Select the project "$PROJECT".
3. Navigate to Settings → Domains.
4. Click "Add Domain". Enter "$DOMAIN". Click "Add".
5. Note the DNS records Vercel requires (CNAME or A record).
6. Screenshot the DNS record instructions.
7. Post to Discord: "[APPROVAL] Vercel domain added. DNS records shown in screenshot.
   Update your DNS registrar with these records, then reply 'done' to continue."
8. Wait for human to reply 'done'.
9. Click "Verify" on the domain. Wait up to 60 seconds for verification.
   If verification fails, post: "[BLOCKED] Domain verification failed. DNS may not
   have propagated. Retry in 15 minutes or verify DNS records are correct."
10. Navigate to Settings → Environment Variables.
11. For each variable in the env var list:
    a. Click "Add".
    b. Key: <var.name>, Value: <var.value>, Environment: Production + Preview + Development
    c. Click "Save".
12. Screenshot the environment variables list (values will be masked — that is fine).
13. Post to Discord: "[DONE] Domain $DOMAIN bound and $COUNT env vars configured."
```

---

### 4.8 GitHub Org Settings Configuration

```
Session goal: Configure branch protection and required checks for the main branch of
$REPO_OWNER/$REPO_NAME on GitHub.

Required checks to enforce: $REQUIRED_CHECKS (e.g., "build", "test", "lint")

Steps:
1. Navigate to https://github.com/$REPO_OWNER/$REPO_NAME/settings/branches.
2. Click "Add rule" (or edit the existing rule for "main").
3. Branch name pattern: main
4. Enable "Require a pull request before merging".
5. Set required approvals: $REQUIRED_APPROVALS (typically 1).
6. Enable "Require status checks to pass before merging".
7. Search for and add each check in $REQUIRED_CHECKS.
8. Enable "Require branches to be up to date before merging".
9. Enable "Do not allow bypassing the above settings".
10. Click "Save changes".
11. Screenshot the branch protection rule.
12. Post to Discord: "[DONE] Branch protection configured for main in
    $REPO_OWNER/$REPO_NAME. Required checks: $REQUIRED_CHECKS."
```

---

### 4.9 Newsletter Platform First-Run Setup

Generic pattern for Beehiiv, Substack, or ConvertKit.

```
Session goal: Complete first-run setup for $PROJECT on $NEWSLETTER_PLATFORM.

Project details:
- Publication name: $PUBLICATION_NAME
- Tagline: $TAGLINE
- Description: $DESCRIPTION
- Author name: $AUTHOR_NAME
- Author bio: $AUTHOR_BIO
- Logo: /local/$PROJECT-logo.png
- Primary color: $PRIMARY_COLOR
- Domain to connect: $NEWSLETTER_DOMAIN (if custom domain is used)

Steps:
1. Navigate to the $NEWSLETTER_PLATFORM dashboard.
2. Create a new publication (if none exists) with the publication name above.
3. Upload the logo.
4. Set the tagline and description.
5. Configure the author profile.
6. Set the primary brand color to $PRIMARY_COLOR.
7. If custom domain is desired:
   a. Navigate to Settings → Domain.
   b. Enter $NEWSLETTER_DOMAIN.
   c. Note and screenshot the DNS records required.
   d. Post to Discord: "[APPROVAL] Newsletter domain DNS records ready. Screenshot
      attached. Update DNS and reply 'done'."
   e. Wait for human reply before continuing.
8. Set up the welcome email subject: "Welcome to $PUBLICATION_NAME".
9. Set up double opt-in if the platform offers it (recommended for GDPR).
10. Screenshot the final publication settings page.
11. Post to Discord: "[DONE] $NEWSLETTER_PLATFORM setup complete for $PUBLICATION_NAME."
```

---

### 4.10 Analytics Platform Setup

Generic pattern for PostHog self-hosted, Plausible, or Umami.

```
Session goal: Configure analytics for $PROJECT on $ANALYTICS_PLATFORM.

Steps:
1. Navigate to the $ANALYTICS_PLATFORM dashboard.
2. Create a new site/project named "$PROJECT".
3. Enter the domain: $DOMAIN.
4. Copy the tracking snippet or project API key.
5. Save the API key to /local/$PROJECT-analytics-keys.txt.
6. If the platform offers goal/event tracking, create these goals:
   $GOAL_LIST (e.g., "signup", "upgrade", "share")
7. If the platform offers team access, invite $TEAM_EMAILS with Viewer role.
8. Screenshot the tracking snippet (the actual key may need to go into Cursor for
   code integration — post it in Discord so the developer can copy it).
9. Post to Discord: "[DONE] $ANALYTICS_PLATFORM configured for $PROJECT. Tracking
   snippet posted. Developer: paste into your analytics provider init."
```

---

## 5. Handoff Patterns

### Twin → Discord → Pokee (most common)

```
Twin completes a session
  → POST to $DISCORD_WEBHOOK_TWIN with result
  → Pokee monitors #agent-twin channel
  → Pokee cross-posts to #summary
  → If artifacts produced (IDs, URLs, screenshots), Pokee stores them in a GitHub
    Issue comment for persistence
```

### Twin → Human (for approval) → Twin (continue)

```
Twin reaches a point of no return (Submit button, payment gate)
  → Posts to #approvals with screenshot
  → Human reviews in Discord and replies with approval keyword
  → Pokee detects the reply and signals Twin to continue the session
  → Twin completes the remaining steps
```

### Pokee → Twin (Pokee triggers a session)

```
Pokee receives a GitHub Release webhook
  → Pokee evaluates: does this release require App Store submission?
  → If yes, Pokee posts to Twin API webhook with a pre-built prompt
  → Twin executes the App Store Connect session
  → Twin posts result back to Discord
```

---

## 6. Human-Handoff Points

These steps cannot be automated regardless of the tool. Twin is required to pause and
notify the human at these gates.

| Gate | Why Human Required | What Human Must Do |
|---|---|---|
| Apple ID 2FA | Apple sends an OTP to a trusted device | Enter the code on the device |
| Apple Developer SMS verification | Phone number verification for enrollment | Enter the code received by SMS |
| Apple Developer payment | Credit card entry for annual fee | Enter card manually in the browser |
| Google Identity Verification | Google may require ID for Play Console | Upload government ID |
| Stripe card entry | PCI compliance; browsers block automation | Enter card manually |
| CAPTCHA (any service) | Bot detection | Solve manually |
| Identity document upload | Legal KYC requirement | Upload document manually |
| DNS record changes | Registrar login is a separate credential | Log into registrar and add records |

For each of these, Twin should:
1. Stop before the gate.
2. Post to `#approvals` with a screenshot and clear instructions.
3. Wait for a human reply with a specific keyword (`proceed`, `done`, `skip`).
4. Resume after the human signals.

---

## 7. Credential Storage Best Practices

### Session Cookies

- Export cookies after a successful manual login using a cookie manager browser extension.
- Store cookie files in 1Password as Secure Notes, not in the repo.
- Name files clearly: `<service>-session-<YYYY-MM-DD>.json`.
- Load the cookie file into Twin's session storage at the start of each session.
- Set a reminder to refresh cookies 1 week before they expire.

### API Keys in Twin Prompts

- Never paste a raw credential value into a Twin prompt. Write `[use TWIN_API_KEY]`
  and ensure the key is loaded in Twin's secure environment.
- If you must reference a username or password in a prompt (for demo account login),
  store the prompt in 1Password and paste it at session start, not in a committed file.

### Secrets in Repo

- No session files, cookie files, or credential files belong in the repo.
- Add these patterns to `.gitignore`:
  ```
  *-session-*.json
  *-cookies-*.json
  *.credentials.json
  twin-prompts/secrets/
  ```

---

## 8. Troubleshooting

### Session cookie expired mid-session

**Symptom**: Twin navigates to the site and is redirected to a login page instead of
the dashboard.
**Fix**:
1. Log in manually to the service.
2. Export fresh cookies.
3. Upload to Twin session storage with today's date in the filename.
4. Re-run the session.

### Twin clicks the wrong element

**Symptom**: Twin reports completing a step, but screenshots show the wrong state.
**Fix**:
1. Add more specificity to the prompt: instead of "Click the Add button", write
   "Click the blue 'Add Product' button in the top-right corner of the Products table."
2. Add a verification step: "After clicking, confirm the expected modal or page title
   appears before proceeding."
3. Add explicit pause-and-screenshot steps between critical actions.

### Upload fails silently

**Symptom**: Twin reports the upload step completed, but the file does not appear in
the dashboard.
**Fix**:
1. Verify the file path in the prompt is correct and the file exists.
2. Check the file size — some platforms have limits (iTunes Connect: no hard limit,
   but IPA over 4GB may time out).
3. Add an explicit "Wait for upload progress bar to reach 100% and disappear" step.

### CAPTCHA encountered unexpectedly

**Symptom**: Twin posts `[BLOCKED] CAPTCHA detected` during a routine session.
**Fix**:
1. Human solves the CAPTCHA in a fresh browser session.
2. Export a fresh session cookie.
3. Re-run Twin with the new cookie.
4. Consider running the session at an off-peak time — some services throttle and
   show CAPTCHAs to sessions making many requests in a short window.

### Site layout changed

**Symptom**: Twin cannot find an element that previously existed.
**Fix**:
1. Take a screenshot of the current state: ask Twin to "Navigate to [URL], take a
   screenshot, and report what you see."
2. Update the prompt to reference the new UI element labels.
3. Document the layout change in a comment above the prompt in your playbook fork.

---

*End of TWIN_PLAYBOOK.md*


---

## 7.6 Pokee Playbook

> **Source file:** `POKEE_PLAYBOOK.md`

# Pokee AI Playbook

Playbook-Version: 1.0.0
Applies-To: $PROJECT (generic — fork and replace placeholder)

---

## 1. What Pokee Is

Pokee AI is a SaaS-orchestration agent with over 50 OAuth-based integrations. You
instruct it in plain English, and it connects to external services, reads and writes
data across them, and routes events between them.

Pokee operates at the coordination layer: it receives events from GitHub, Convex, HTTP
webhooks, and Discord; decides what to do; and dispatches work to the appropriate
destination — posting to social media, filing a GitHub Issue, sending an email, triggering
a Zo job, or notifying a human.

Key characteristics:

- **Plain-text workflow authoring**: Workflows are plain-English prompts, not YAML.
  You describe what should happen when an event arrives, and Pokee figures out the steps.
- **50+ OAuth integrations**: GitHub, Gmail, LinkedIn, Instagram, Facebook, TikTok, X
  (Twitter), YouTube, Discord, PostHog, Sentry, Beehiiv, ConvertKit, Substack, Stripe,
  Google Sheets, Notion (if needed), Slack, and many more.
- **Webhook listener**: Pokee exposes HTTP endpoints you can point GitHub, Convex, or
  any other service at. When a webhook arrives, the matching workflow fires.
- **Fan-out routing**: One incoming event can trigger actions across many services in
  parallel or in sequence.
- **Scheduled triggers**: Like cron, but described in plain English and backed by real
  integrations.

Pokee is not a code editor. It does not run shell commands or manage files. It moves
data between connected SaaS services and notifies humans or other agents.

---

## 2. When to Pick Pokee

### Use Pokee when:

| Scenario | Reason |
|---|---|
| Cross-posting a release announcement to 5+ platforms | Pokee fans out to all in one workflow |
| Routing a GitHub Issue to the right label and team channel | Pokee reads labels and posts to Discord |
| Sending a weekly analytics digest via email | Pokee fetches from PostHog/Sentry, composes, sends |
| Auto-replying to triaged support email → GitHub Issue | Pokee connects email and GitHub |
| Publishing a newsletter draft from aggregated changelog | Pokee reads GitHub + Beehiiv |
| Daily agent-status summary for the founder | Pokee reads Discord channels, synthesizes, DMs |
| OAuth-based SaaS integration is the right tool | This is Pokee's native domain |

### Do NOT use Pokee when:

| Scenario | Better Agent |
|---|---|
| The target service has no OAuth or has a GUI-only admin console | Twin.so |
| The task involves writing or changing source code | Cursor IDE or Cursor Cloud |
| The task is a long-running batch (asset generation, transcription) | Zo Computer |
| The task requires executing shell commands | Zo Computer |
| The task requires human physical presence (ID upload, card entry) | Human directly |

---

## 3. Account Setup Checklist

- [ ] Create a Pokee AI account at pokee.ai
- [ ] Verify email
- [ ] Set display name to `$PROJECT bot` to distinguish from other Pokee accounts
- [ ] Generate a Pokee webhook inbound URL: Settings → Webhooks → Create Endpoint
  - Note the endpoint URL as `POKEE_WEBHOOK_URL` for use in other agents' configs
- [ ] Enable workflow logging: Settings → Logs → Enable all

---

## 4. Integrations to Connect

Connect these integrations for a typical software project. Navigate to
Pokee → Integrations for each and complete the OAuth flow.

| Integration | Purpose | Required Scopes |
|---|---|---|
| **GitHub** | Issue/PR/Release events, create issues, post comments, apply labels | `repo`, `read:org` |
| **Gmail** | Receive support email, send transactional email from founder address | `gmail.send`, `gmail.readonly` |
| **LinkedIn** | Post release announcements as text posts | `w_member_social` |
| **Instagram** | Post release visuals and short-form content | `instagram_basic`, `instagram_content_publish` |
| **Facebook** | Post to page (if public presence desired) | `pages_manage_posts`, `pages_read_engagement` |
| **TikTok** | Upload and publish short-form video | `video.upload`, `video.publish` |
| **X (Twitter)** | Post threads and announcements | `tweet.write`, `tweet.read`, `users.read` |
| **YouTube** | Cross-post vlog links and notify | `youtube.upload` (handled by Zo; Pokee only posts links) |
| **Discord** | Post to channels, read channel history, send DMs | Bot token with `Send Messages`, `Read Message History` |
| **PostHog** | Fetch analytics events for weekly digest | PostHog API key (personal or project) |
| **Sentry** | Fetch error data for daily/weekly digest | Sentry auth token with `project:read` |
| **Beehiiv** | Create newsletter drafts, publish issues | Beehiiv API key |
| **Resend** | Transactional email delivery as alternative to Gmail | Resend API key |
| **Google Sheets** | Append rows to a founder inbox log sheet | `spreadsheets` scope |

After connecting each integration, test it with a simple action from within Pokee's
workflow builder (e.g., post "test" to a Discord channel, or read the latest 5 issues
from GitHub) to confirm the token works.

---

## 5. Generic Workflow Templates

Each template below includes a plain-English prompt scaffold you paste into Pokee's
workflow builder. The trigger is described first, followed by the action sequence.

Replace `$PROJECT`, `$REPO`, `$DISCORD_CHANNEL_*`, and other placeholders before saving.

---

### 5.1 Release Announcement Cross-Post

**Trigger**: GitHub Release webhook (event: `release.published`)

**Prompt scaffold**:

```
When a new GitHub Release is published for $REPO:

1. Read the release tag, name, and body from the GitHub event payload.
2. Shorten the release URL using the GitHub short link if possible.
3. Compose a release announcement text:
   - Headline: "$PROJECT $TAG_NAME is live."
   - Body: first 3 bullet points from the release notes (strip markdown headers,
     keep bullet items).
   - Footer: "Full release notes: $RELEASE_URL"
4. Post the announcement to these destinations in parallel:
   a. X (Twitter): Post as a thread. First tweet = headline + first bullet.
      Subsequent tweets = remaining bullets. Final tweet = release URL.
   b. LinkedIn: Post as a text post with the full announcement text + hashtags:
      #$PROJECT #release #buildinpublic
   c. Instagram: Post as a caption with the first 150 chars of the announcement
      + release URL in bio note.
   d. Facebook Page ($FB_PAGE_ID): Post the full announcement text.
   e. TikTok: Post a text caption noting the release (video upload must be
      triggered separately via Zo; this is the caption-only notification).
   f. Discord channel #announcements ($DISCORD_CHANNEL_ANNOUNCEMENTS):
      Full announcement text as an embed with title, description, and URL field.
5. After all posts succeed, post to Discord #summary:
   "Release $TAG_NAME announced across X, LinkedIn, IG, FB, TikTok, Discord."
6. If any post fails, post an error to Discord #agent-pokee:
   "[ERROR] Failed to post to <platform>: <error_message>. Manual post required."
```

---

### 5.2 Weekly Analytics Digest

**Trigger**: Scheduled — every Monday at 08:00 UTC

**Prompt scaffold**:

```
Every Monday at 08:00 UTC, generate and send a weekly analytics digest for $PROJECT.

Steps:
1. Fetch from PostHog (project token: $POSTHOG_PROJECT_TOKEN):
   - Total unique users (last 7 days)
   - Top 5 events by count (last 7 days)
   - New user signups (last 7 days)
   - Retention: users who returned after day 1 (last 7-day cohort)
2. Fetch from Sentry (project: $SENTRY_PROJECT_SLUG):
   - Total error count (last 7 days)
   - Top 3 unresolved issues by occurrence count
3. Fetch from GitHub (repo: $REPO):
   - Number of PRs merged (last 7 days)
   - Number of Issues opened (last 7 days)
   - Number of Issues closed (last 7 days)
   - Current total star count
4. Compose a digest email:
   Subject: "$PROJECT Weekly Digest — Week of $DATE"
   Body (plain text + HTML):
   --- USERS ---
   Total active users (7d): $USERS
   New signups: $SIGNUPS
   Day-1 retention: $RETENTION%

   --- TOP EVENTS ---
   $EVENT_1: $COUNT_1
   $EVENT_2: $COUNT_2
   $EVENT_3: $COUNT_3
   $EVENT_4: $COUNT_4
   $EVENT_5: $COUNT_5

   --- ERRORS ---
   Total errors (7d): $ERROR_COUNT
   Top issues:
   1. $ISSUE_1 ($COUNT occurrences)
   2. $ISSUE_2 ($COUNT occurrences)
   3. $ISSUE_3 ($COUNT occurrences)

   --- GITHUB ---
   PRs merged: $PRS_MERGED | Issues opened: $ISSUES_OPENED | Closed: $ISSUES_CLOSED
   Total stars: $STARS

5. Send the email via Resend from $SENDER_EMAIL to $RECIPIENT_EMAILS.
6. Also post an abbreviated version to Discord #summary:
   "$PROJECT weekly digest sent. Users: $USERS | Signups: $SIGNUPS |
    Errors: $ERROR_COUNT | PRs merged: $PRS_MERGED | Stars: $STARS"
```

---

### 5.3 GitHub Issue Triage

**Trigger**: GitHub Issue webhook (event: `issues.opened`)

**Prompt scaffold**:

```
When a new GitHub Issue is opened in $REPO:

1. Read the issue title, body, and author from the event payload.
2. Classify the issue by reading its content:
   - If the title or body mentions "bug", "error", "crash", "broken", "not working":
     label it "bug"
   - If it mentions "feature", "request", "would be nice", "suggestion":
     label it "enhancement"
   - If it mentions "docs", "documentation", "readme", "example":
     label it "documentation"
   - If it mentions "question", "how do I", "help":
     label it "question"
   - Otherwise: label it "triage"
3. Apply the label to the issue using the GitHub API.
4. Post an auto-reply comment on the issue:
   For "bug": "Thanks for reporting! This has been labeled as a bug and will be
   reviewed by the team. If you can reproduce this consistently, please share any
   error logs or screenshots."
   For "enhancement": "Thanks for the feature request! We've added it to our backlog.
   Upvotes (+1 reactions) help us prioritize."
   For "question": "Thanks for reaching out! We'll get back to you. For faster help,
   search existing issues or check the docs at $DOCS_URL."
   For "triage": "Thanks! We've received your issue and will triage it shortly."
5. Route to Discord:
   - Post to #$DISCORD_CHANNEL_ISSUES:
     "New issue [$LABEL] #$ISSUE_NUMBER: $ISSUE_TITLE — $ISSUE_URL"
   - If label is "bug": also ping @$ONCALL_DISCORD_HANDLE in the post.
6. If the issue body is fewer than 20 words and label is "bug", also post to
   Discord #agent-pokee: "Possible low-quality bug report: $ISSUE_URL — manual
   review recommended."
```

---

### 5.4 Founder-Inbox Routing

**Trigger**: Gmail — new email matching filter: `to:$FOUNDER_EMAIL`

**Prompt scaffold**:

```
When a new email arrives at $FOUNDER_EMAIL:

1. Read: sender, subject, body (first 500 chars), timestamp.
2. Classify:
   - "investor": subject or body contains "investment", "funding", "term sheet",
     "cap table", "portfolio", "angel"
   - "partner": "integration", "partnership", "collaborate", "co-market", "B2B"
   - "press": "journalist", "media", "article", "podcast", "interview", "publication"
   - "support": "bug", "not working", "help", "account", "subscription", "refund"
   - "job": "hiring", "role", "resume", "CV", "work with you", "join your team"
   - "other": everything else
3. Append a row to Google Sheet ($FOUNDER_INBOX_SHEET_ID):
   Columns: Timestamp | Sender | Subject | Classification | Snippet | Action Taken
4. Post to Discord #approvals:
   "[INBOX] $CLASSIFICATION: From $SENDER — \"$SUBJECT\"
    Snippet: $BODY_SNIPPET
    Action: [Reply] [Archive] [Create Issue] [Forward]"
5. If classification is "support":
   - Also create a GitHub Issue in $REPO with:
     Title: "Customer support: $SUBJECT"
     Body: Sender email (masked), subject, body snippet, classification label
     Labels: ["support", "needs-triage"]
   - Post the issue link in the Discord message.
6. If classification is "investor" or "press":
   - Send a Twilio SMS to $FOUNDER_PHONE: "Priority email from $SENDER ($CLASSIFICATION).
     Check Discord #approvals."
```

---

### 5.5 Vlog Cross-Post

**Trigger**: HTTP webhook from Zo (Zo posts this after uploading a processed video to YouTube)

**Prompt scaffold**:

```
When a vlog cross-post webhook arrives from Zo:

Payload fields expected:
- youtube_url: string
- video_title: string
- transcript_summary: string (200-word summary produced by Zo transcription pipeline)
- thread_text: string (Twitter thread produced by Zo transcription pipeline)
- reel_description: string (150-char Instagram/TikTok caption produced by Zo)

Steps:
1. Post to X (Twitter): Post the thread_text as a thread. First tweet includes
   the YouTube URL.
2. Post to LinkedIn: "New vlog: $VIDEO_TITLE\n\n$TRANSCRIPT_SUMMARY\n\n
   Watch: $YOUTUBE_URL\n\n#$PROJECT #buildinpublic"
3. Post to Instagram: Caption = reel_description + " Link in bio."
   (Actual video must be uploaded as a Reel separately — this sets the caption
   for the post. Flag to Discord if native video upload is needed.)
4. Post to TikTok: Caption = reel_description. Video URL: $YOUTUBE_URL
   (Note: TikTok requires native video upload, not YouTube links. Flag if
   direct upload is needed.)
5. Post to Discord #announcements: "New vlog posted: $VIDEO_TITLE — $YOUTUBE_URL"
6. Post to Discord #summary: "Vlog cross-post complete. Platforms: X, LinkedIn, IG, TikTok, Discord."
```

---

### 5.6 Daily Agent Status Summary

**Trigger**: Scheduled — every day at 23:00 UTC

**Prompt scaffold**:

```
Every day at 23:00 UTC, compile and DM a daily agent status summary to the founder.

Steps:
1. Read the last 24 hours of messages from these Discord channels:
   - #agent-cursor-cloud
   - #agent-twin
   - #agent-pokee
   - #agent-zo
   - #handoffs
   - #approvals
   - #blocked
2. For each channel, extract:
   - Count of [DONE] events
   - Count of [ERROR] events
   - Count of [BLOCKED] events
   - Count of [APPROVAL] requests
   - Any unresolved [BLOCKED] messages (no subsequent human reply)
3. Compose a DM to $FOUNDER_DISCORD_ID:
   "**$PROJECT Daily Agent Report — $DATE**

   **Cursor Cloud**: $DONE_COUNT done, $ERROR_COUNT errors
   **Twin**: $DONE_COUNT done, $ERROR_COUNT errors, $BLOCKED_COUNT blocked
   **Pokee**: $DONE_COUNT workflows run, $ERROR_COUNT errors
   **Zo**: $DONE_COUNT jobs, $ERROR_COUNT errors

   **Approvals awaiting**: $APPROVAL_COUNT
   **Still blocked** (no reply yet):
   $UNRESOLVED_BLOCKED_LIST

   **Action required**: $ACTION_ITEMS"
4. Also post an abbreviated summary to Discord #summary:
   "Daily report sent to founder DM. Highlights: $HIGHLIGHTS"
```

---

### 5.7 Newsletter Issue Automation

**Trigger**: Scheduled — every Friday at 18:00 UTC

**Prompt scaffold**:

```
Every Friday at 18:00 UTC, draft the weekly newsletter issue for $PROJECT on $NEWSLETTER_PLATFORM.

Steps:
1. Fetch from GitHub ($REPO):
   - All PRs merged this week (Monday 00:00 UTC to Friday 18:00 UTC). Get: title, URL, merged_at.
   - All blog posts published this week: look for commits to /content/blog/ or /posts/ directory.
2. Fetch from Zo S3 bucket: list any digest files from the current week at
   $PROJECT/digests/YYYY/MM/ prefix (if the weekly digest job ran, it will have produced one).
3. Compose newsletter draft:
   Subject: "$PROJECT Weekly — $DATE_RANGE"
   Sections:
   a. "This Week in $PROJECT" — 2–3 sentence intro written conversationally.
   b. "What Shipped" — bullet list of merged PR titles with links.
   c. "From the Blog" — links to any new blog posts with 1-sentence description each.
   d. "By the Numbers" — copy from the weekly analytics digest email (fetch from
      the digest sent by workflow 5.2 earlier in the week if available).
   e. "What's Next" — 2–3 sentences on what's coming next week (read from TASKS.md
      if the repo is connected, or leave as a placeholder: "Continued work on X").
   f. Footer — unsubscribe link, social links.
4. Create a draft in $NEWSLETTER_PLATFORM using the API:
   - Title: "$PROJECT Weekly — $DATE_RANGE"
   - Status: draft (do not publish)
   - Content: the composed HTML/Markdown above
5. Post to Discord #approvals:
   "[APPROVAL] Newsletter draft created in $NEWSLETTER_PLATFORM for week of $DATE_RANGE.
   Review at: $DRAFT_URL. Reply 'publish' to send, or 'skip' to discard."
6. Wait for human reply. If 'publish', trigger $NEWSLETTER_PLATFORM publish API.
   If 'skip', delete the draft.
```

---

### 5.8 Error Log Digest

**Trigger**: Scheduled — every day at 07:00 UTC

**Prompt scaffold**:

```
Every day at 07:00 UTC, send the top error digest for $PROJECT from Sentry.

Steps:
1. Fetch from Sentry (project: $SENTRY_PROJECT_SLUG, auth token: $SENTRY_AUTH_TOKEN):
   - Top 5 unresolved issues by occurrence count in the last 24 hours.
   - For each: issue ID, title, first occurrence, last occurrence, count, culprit file.
2. Compose an email:
   Subject: "$PROJECT Error Digest — $DATE (Top 5 Issues)"
   Body:
   Rank | Issue | Count | First Seen | Last Seen | Culprit
   ---- | ----- | ----- | ---------- | --------- | -------
   (one row per issue)
   Footer: "Full dashboard: $SENTRY_PROJECT_URL"
3. Send via Resend to $ERROR_DIGEST_RECIPIENTS.
4. Post to Discord #agent-pokee:
   "Daily error digest sent. Top issue: $TOP_ISSUE_TITLE ($TOP_ISSUE_COUNT occurrences)."
5. If the top issue count exceeds $ERROR_ALERT_THRESHOLD (default: 100):
   Also post to Discord #blocked: "[ALERT] High error rate. $TOP_ISSUE_TITLE has
   $COUNT occurrences in 24h. Investigate: $SENTRY_ISSUE_URL"
```

---

### 5.9 Customer Feedback Routing

**Trigger**: Gmail — new email matching filter: `to:$SUPPORT_EMAIL`

**Prompt scaffold**:

```
When a new support email arrives at $SUPPORT_EMAIL:

1. Read: sender email, subject, body.
2. Determine if this is a new unique issue or a duplicate:
   - Search existing open GitHub Issues in $REPO with label "support" for
     subject keywords.
   - If a matching issue exists, post a comment on that issue with the
     new email sender (masked to first 3 chars of email) and body snippet.
     Do not create a duplicate issue.
   - If no matching issue exists, create a new one:
     Title: "[Support] $SUBJECT"
     Body: "**From**: $MASKED_EMAIL\n**Subject**: $SUBJECT\n\n**Message**:\n$BODY"
     Labels: ["support", "needs-triage"]
3. Send an auto-reply to the sender via Resend:
   Subject: "Re: $SUBJECT — We received your message"
   Body: "Hi,\n\nThanks for reaching out to $PROJECT support. We've received your
   message and will get back to you within $SUPPORT_SLA (typically 1–2 business days).
   Your reference number is GitHub Issue #$ISSUE_NUMBER.\n\nBest,\nThe $PROJECT Team"
4. Post to Discord #$DISCORD_CHANNEL_SUPPORT:
   "New support email from $MASKED_EMAIL: \"$SUBJECT\" → $ISSUE_URL"
5. Append to Google Sheet ($SUPPORT_LOG_SHEET_ID):
   Columns: Timestamp | Masked Sender | Subject | Issue URL | Auto-Reply Sent
```

---

## 6. Handoff Patterns

Pokee is the central router in this agent stack. It sits between all event sources and
all agent executors.

### Pokee as the Event Hub

```
GitHub Webhook ─┐
Convex Webhook  ─┤
Discord Reply   ─┤──► Pokee ──► Twin (GUI task)
Zo HTTP POST    ─┤         ├──► Zo (batch job)
Scheduled cron  ─┘         ├──► Cursor Cloud (label-based)
                            ├──► Human (Discord DM or SMS)
                            └──► Multi-platform publish
```

### Pokee → Twin (trigger a session)

```
Pokee receives GitHub Release webhook
  → Evaluates: does this release require App Store submission?
    (Check: does the release tag include "ios" or "android" in the name,
     or does the release body contain the string "submit-to-store"?)
  → If yes: POST to Twin API with the App Store Connect prompt scaffold
  → Twin executes the session
  → Twin POSTs result back to Pokee webhook
  → Pokee posts result to Discord
```

### Pokee → Zo (trigger a batch job)

```
Pokee receives a scheduled cron trigger (e.g., Friday 18:00 UTC)
  → POSTs to Zo webhook with the transcription pipeline prompt
  → Zo runs the job overnight
  → Zo POSTs completion to Pokee webhook
  → Pokee fans out the result (Discord, email, newsletter draft)
```

### Pokee → Human (escalation)

```
Pokee detects an unresolved [BLOCKED] in #blocked that is more than N hours old
  → Sends Twilio SMS to $FOUNDER_PHONE: "Agent blocked since <time>. Check Discord #blocked."
  → Sends Resend email to $FOUNDER_EMAIL with the blocked message content
```

---

## 7. OAuth Token Rotation and Quota Management

### Token Rotation Schedule

| Integration | Token Expiry | Rotation Action |
|---|---|---|
| GitHub OAuth | Long-lived (no expiry by default) | Rotate annually or on team change |
| Gmail OAuth | Refresh tokens are long-lived | Test monthly; rotate on Google account password change |
| X (Twitter) | OAuth 2.0 access tokens expire; refresh tokens do not | Pokee handles refresh automatically |
| LinkedIn | 60-day access tokens | Pokee should refresh before expiry; re-authenticate if expired |
| Instagram | 60-day tokens | Same as LinkedIn |
| TikTok | 24-hour access token; 365-day refresh token | Pokee handles rotation; monitor for 401 errors |
| Sentry | Auth tokens do not expire | Rotate annually |
| PostHog | Personal API keys do not expire | Rotate annually |
| Beehiiv | API keys do not expire | Rotate on team change |
| Resend | API keys do not expire | Rotate on security incident |

### Quota Awareness

- **X (Twitter)**: Free tier allows 1,500 tweet writes per month. At 7 posts/week
  across threads, this is approximately 100–200 tweets/month. Monitor usage in the
  Twitter Developer Portal.
- **LinkedIn**: 100 posts per day per user token. Cross-posting is well within limits.
- **Instagram**: 25 API calls per hour (Content Publishing API). Batch posts and add
  delays if posting many assets.
- **Gmail send**: Google Workspace accounts allow 2,000 sends/day via API. For high
  volume, use Resend instead.
- **GitHub API**: 5,000 requests/hour for authenticated apps. The triage workflow
  consumes ~3 requests per issue (read, label, comment). At 100 issues/hour this is
  fine; above that, implement batching.
- **Sentry API**: 100 requests/second. Daily digest jobs are well within this.
- **PostHog Cloud**: API rate limits vary by plan. Check your plan's documentation.

### Monitoring Token Health

- Add a Pokee workflow that runs weekly and makes a test API call to each integration.
- If any call returns 401 or 403, post to Discord #blocked: "Token health check failed
  for $INTEGRATION. Re-authenticate in Pokee settings."

---

## 8. Troubleshooting

### Workflow fires but no action occurs

**Symptom**: The webhook arrives, Pokee logs show the workflow triggered, but nothing
was posted or created.
**Fix**:
1. Check Pokee Logs → Workflow Runs for the specific run.
2. Look for the first step that returned an error.
3. Common causes: expired OAuth token, rate limit hit, malformed payload field reference.
4. Fix the OAuth token or the payload reference, then manually re-trigger the workflow.

### Cross-post succeeds on some platforms but fails on others

**Symptom**: X post appears but LinkedIn post does not.
**Fix**:
1. Check each integration's status separately in Pokee Logs.
2. For LinkedIn: check that the token has not expired (LinkedIn tokens expire after 60 days).
3. For Instagram: check that the account is a Business or Creator account — personal
   accounts cannot use the Content Publishing API.
4. For TikTok: verify the refresh token has not expired (365-day limit).

### GitHub Issue triage creates duplicate labels

**Symptom**: An issue ends up with both "bug" and "triage" labels.
**Fix**: Review the classification logic in the workflow. Add explicit `else if` style
conditions (in Pokee's workflow description) so only one label is applied per issue.
Update the prompt to say: "Apply exactly one label from this list, chosen by the first
matching condition."

### Gmail trigger fires on outgoing auto-replies

**Symptom**: The founder-inbox workflow creates a GitHub Issue for Pokee's own auto-reply.
**Fix**: Add a filter condition at the top of the workflow: "If the sender email matches
$SENDER_EMAIL or $RESEND_FROM_DOMAIN, stop and do nothing." Alternatively, configure
the Gmail filter in Google's own filter settings to only trigger on inbound mail to the
support alias, not outgoing replies.

### Scheduled workflow misses a trigger

**Symptom**: The Friday newsletter draft was not created.
**Fix**:
1. Check Pokee's scheduled job log for that time slot.
2. Common causes: Pokee account was temporarily suspended, network issue, or the
   scheduled trigger was accidentally deleted.
3. Manually trigger the workflow from the Pokee dashboard to catch up.
4. Add a Pokee workflow that checks if the newsletter draft exists by Sunday morning
   and posts to Discord #blocked if not: "Newsletter draft not found for this week."

---

*End of POKEE_PLAYBOOK.md*


---

*End of consolidated master document.*
