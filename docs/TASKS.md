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

## Phase 0 — Spec vs repository (reconciliation)

Do these before treating the original M0 checklist as authoritative. Docs and code were aligned **in-repo** (Next 16, Tailwind v4 web, Expo 53, `convex/` at root).

| ID | Title | Owner | Deps | Status |
|---|---|---|---|---|
| T-R001 | Keep `README.md`, `docs/HARD_RULES.md`, PRD, and `.cursorrules` in sync with actual stack (web TW v4, mobile NativeWind, Convex root) | cursor-ide | — | done |
| T-R002 | Expand Convex `schema.ts` toward PRD 23+ tables; add migrations / backfills as needed | cursor-cloud-1 | T-0008 | todo |
| T-R003 | Reconcile `userId` shape (`v.id("users")` today vs optional string + soft-delete fields in HARD_RULES) | cursor-cloud-1 | T-R002 | todo |
| T-R004 | Implement Soft Editorial tokens in `packages/ui` + web `globals.css`; wire mobile theme | cursor-cloud-3 | T-0012 | todo |
| T-R005 | Add `packages/ai` OpenRouter router + `route-by-task` OR keep explicit `convex/lib` module until package exists | cursor-cloud-2 | T-0008 | todo |
| T-R006 | Extend `.env.example` with all vars from docs (OpenRouter, RevenueCat, Polar, GetTerms, etc.) | cursor-ide | — | todo |

---

## Phase 1.0 — Foundation (MVP)

### M0 — Foundation

| ID | Title | Owner | Deps | Status |
|---|---|---|---|---|
| T-0001 | Create GitHub organisation and private repo | human-amit | — | todo |
| T-0002 | Commit BSL 1.1 LICENSE with Additional Use Grant | cursor-ide | T-0001 | done |
| T-0003 | Add README.md with open-source posture and quick start | cursor-ide | T-0001 | done |
| T-0004 | `.cursorrules` at repo root aligned with `docs/HARD_RULES.md` | cursor-ide | T-0001 | done |
| T-0005 | Initialise pnpm + Turborepo monorepo: `apps/web`, `apps/mobile`, `packages/types`, `packages/utils`, `packages/ui`; Convex at repo root `convex/` | cursor-ide | T-0001 | done |
| T-0006 | Configure TypeScript strict across all workspaces | cursor-ide | T-0005 | done |
| T-0007 | Configure Biome (and per-app lint); add shared `packages/config` **optional** — or document Biome-only approach | cursor-ide | T-0005 | in-progress |
| T-0008 | Create Convex account and link dev + prod deployments | human-amit | T-0001 | todo |
| T-0009 | Scaffold Convex schema in `convex/` toward all 23+ core tables (PRD) | cursor-cloud-1 | T-0008 | in-progress |
| T-0010 | Add Convex Auth; wire email (+ passkey when ready) | cursor-cloud-3 | T-0009 | in-progress |
| T-0011 | Scaffold Next.js 16 web app with App Router + Turbopack in `apps/web` | cursor-cloud-3 | T-0005 | done |
| T-0012 | Tailwind v4 + Soft Editorial direction in web; shared tokens in `packages/ui` | cursor-cloud-3 | T-0011 | in-progress |
| T-0013 | Scaffold Expo 53 app with new architecture in `apps/mobile` | cursor-cloud-3 | T-0005 | done |
| T-0014 | Configure NativeWind 4 with shared tokens from `packages/ui` | cursor-cloud-3 | T-0013 | in-progress |
| T-0015 | Create Vercel project and bind to repo | human-amit + twin | T-0011 | todo |
| T-0016 | Deploy first Vercel build; confirm "Hello Tempo" live | cursor-cloud-3 | T-0015 | todo |
| T-0017 | Scaffold all 42 routes on web as empty placeholder pages | cursor-cloud-1 | T-0011 | in-progress |
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
