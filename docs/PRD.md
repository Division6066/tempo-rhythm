# Tempo Flow: Product Requirements (PRD)

> **Last updated 2026-10-03** (IDT) · Written by Grok Bot from the sources below · Decisions are Amit's.
> **Sources:** factory-v2 product docs v2 (20 Sep 2026): `01-PRD-PATCH.md` with its 30 Sep decision update, applied to `04-PRD-TEMPO-FLOW.md` (16 Sep) · Basic Memory notes `Factory Decisions — 2026-09-18`, `Factory merge and deploy policy` (30 Sep), `Weekend factory plan 2026-10-02`, `Weekend goals 2026-10-02`, `Next week — factory decisions and research 2026-10-03` · plan-v3 and plan-v4 (`PLAN-FINAL.md`, 3 Oct 15:44 IDT) · the 3 Oct component map, live walk and umbrella issue [#546](https://github.com/Division6066/tempo-rhythm/issues/546) · the repo on `integration` at `5b9675e` (3 Oct).
> **Markers:** UNKNOWN = not known or not decided. (EXTRAPOLATED) = Grok Bot's own fill, not a decision. Precedence: Amit's decisions of 1–3 Oct > merge and deploy policy (30 Sep) > Factory Decisions (18 Sep) > factory-v2 docs (20 Sep) > older documents. Where a newer decision overrides an older source, it is listed under "Conflicts resolved".
> **Companion docs:** [TRD](./TRD.md) · [App flow](./APP-FLOW.md) · [UI brief](./UI-BRIEF.md) · [Backend schema](./BACKEND-SCHEMA.md) · [Roadmap](./ROADMAP.md)

## 1. What Tempo Flow is

**Vision lock (10 Aug 2026):** "An executive function aid for adults with ADHD, autism, or learning disabilities. It is a coach, not a therapist or counselor."
Tagline: "Tempo Flow: your brain's operating system." Short form: "A starter for your brain."

- **Shape.** Calendar, tasks and notes over one markdown layer, with an adaptive coach. Every page is one markdown document. Tasks, events, habits, nags and templates are JSON blocks inside it, drawn as normal UI elements. The user never sees JSON (20 Sep target; see [Backend schema](./BACKEND-SCHEMA.md)).
- **Closest product:** today.ai (memory, acts before asked, to-dos, notes, connectors), which is built for neurotypical users. Tempo is that for a neurodivergent user: it **paces** the day and **nags** in the user's own words.
- **UX bar:** NotePlan + StudyFetch ("feature parity" = features and components, not the system). Design reference: Memos (MIT, behaviour only, no code). Joplin is secondary.
- **Live address:** `www.tempoflow.dev`. Internal testing (preview) address: `preview.tempoflow.dev`.

## 2. Users

| | |
|---|---|
| Primary | Adults with ADHD, autism or learning disabilities whose executive dysfunction is the root cause. Design target: diagnosed and medicated. |
| Anti-persona | Dysfunction downstream of bipolar disorder, personality disorders, PTSD, addiction recovery, or anxiety/depression as the primary condition. Said plainly in the app; downloads are not gatekept. |
| First user | Amit ("Phase minus one is one user"). He is dyslexic and often listens rather than reads. |
| Testers today | Amit and two family members signed in on the preview by magic link (2 Oct). Any other named tester: UNKNOWN. |
| Escalation | Three nights without sleep, severe distress or an escalating crisis: show real resources and stop coaching. |

## 3. Where the product stands (3 Oct 2026)

| Area | State | Evidence |
|---|---|---|
| Live site | `www.tempoflow.dev` still runs the old `master` code with password sign-in. The release (merge [#327](https://github.com/Division6066/tempo-rhythm/pull/327) + live Convex deploy) is Amit's. | FULL-STATUS 2 Oct, plan-v3 |
| Preview | `preview.tempoflow.dev` runs `integration` against Convex `ceaseless-dog-617`. Web sign-in is magic link only. | Live walk 3 Oct 13:30–13:43 IDT |
| Signed-in pages | 45 page files: 28 placeholders, 13 wired to Convex, 3 partly wired, 1 redirect. | Component map at `5b9675e` |
| Working live | `/today`, `/tasks` (all four views), `/projects` + kanban, `/habits`, `/notes` (create), `/coach` (a reply comes back). | Live walk |
| Broken live | `/calendar` add (event never appears, [#527](https://github.com/Division6066/tempo-rhythm/issues/527)), `/insights` (endless skeleton, [#528](https://github.com/Division6066/tempo-rhythm/issues/528)), `/notes/[id]` (crash on a bad id, [#526](https://github.com/Division6066/tempo-rhythm/issues/526), PR [#547](https://github.com/Division6066/tempo-rhythm/pull/547) open), `/tracking` (focus blocks lost on reload). | Live walk |
| AI layer | `convex/lib/ai_router.ts` still reads `MISTRAL_API_KEY` (cancelled provider), so model calls through it fail. Fix ticket: [#412](https://github.com/Division6066/tempo-rhythm/issues/412). Whether the `/coach` reply seen live is model-written or a template reply: UNKNOWN. | Repo |
| Greeting | Shows "Hi, User" instead of the person's name ([#479](https://github.com/Division6066/tempo-rhythm/issues/479)). | Live walk |

## 4. Goals

### 4.1 This weekend (2–4 Oct, Amit's goals)

| # | Goal | How we know |
|---|---|---|
| A1 | `www.tempoflow.dev` uses magic link only | No password field anywhere; the sign-in email comes from `noreply@tempoflow.dev` |
| A2 | Sign-ups capped at 30; earlier approvals kept | A Playwright test with the cap set to 1 blocks person #2 |
| A3 | Terms, Privacy and Cookies in English and Hebrew (drafts for a lawyer) | All pages load; Hebrew reads right to left; linked on sign-up |
| A4 | Every control on every signed-in screen works | One Playwright test per screen, with a reload check |
| A5 | "Hi, User" shows the person's name | Profile name, or the start of the email address |
| A6 | AI actions answer | Through the runtime models (Nemotron, with Inkling second) |
| A7 | Live release done by Amit | #327 merged, live Convex deploy approved, smoke test passes on www |

"Works after sign-in" means every visible control on each signed-in screen does its job. Looks and animations come next week.
Added 3 Oct: Tempo should work as a **daily planner by Sunday morning** (day plan, time blocks, habit check-ins by local day, carry-over tasks). Tracked in umbrella [#546](https://github.com/Division6066/tempo-rhythm/issues/546). Ticket releases are **paused** since 3 Oct 14:40 IDT.

### 4.2 Next week (already decided)

Sign-up approval flow (unlimited sign-ups, each approved by Amit by email; anyone approved before stays approved) · animations · a chat button inspired by Taby, with **Taby UX work starting next week** · the avatar · Turnstile on sign-up · phone app sign-in ([#425](https://github.com/Division6066/tempo-rhythm/issues/425)). See [Roadmap](./ROADMAP.md).

## 5. Feature list (Gen 1 = V1)

| MUST | Notes |
|---|---|
| Unified surface: calendar + tasks + notes over one markdown layer; daily / weekly / monthly pages | Pages are markdown with JSON blocks (20 Sep). Comparator: NotePlan. |
| Priority calibration: inelastic vs elastic items | Elastic items reflow around fixed ones. |
| Templates as architecture | The app proposes the right template when a page is created; the user never hand-builds one. Starting set adapted from popular public Joplin, Notesnook, Notion and Obsidian templates (structure, not text). |
| Nags | Phrases are the user's own words or derived from them. No stock copy, no emoji. A nag with no accepted phrase can't be switched on. |
| Adaptive coach | Dial 0–10, panic button, bad-day detection, 10-second action, realism checker, forgiveness contract, graduated load 2→4 tasks. Accept / reject is law. |
| Memory | One adapter (remember / recall / context / forget / export) on Convex over the existing `memories` table. Kept as written. |
| Connectors | Executor (executor.sh) behind an adapter. Read plus light writes; heavy writes refused; every external write is confirmed. Work waits until after the current sprint. |
| Voice | Walkie-talkie push-to-talk on every tier, read-back, live conversation on Pro/Max. Hebrew voice (STT → text → TTS) and English. |
| Study track | Record → notes → flashcards → test; SM-2; separate mode, never mixed into `/today`. |
| Key vault (BYOK) | OpenAI-compatible keys and local endpoints; encrypted per user; never returned to the client. |
| Billing visible | RevenueCat on all surfaces, Polar as web fallback. Billing is never hidden. |
| Soft delete | 30-day grace. Undo for 5 minutes inside the app; confirm anything external. |
| Sign-in | Web: email magic link only (decided 1–2 Oct). Mobile: OTP or magic link, UNKNOWN ([#425](https://github.com/Division6066/tempo-rhythm/issues/425)). |
| Sign-up control | Cap of 30 now; approval-by-email flow next week. |
| Legal pages | Terms, Privacy, Cookies in English and Hebrew, marked as drafts for a lawyer. |

| SHOULD (Gen 1 if time) | |
|---|---|
| Anti-slop verification; Socratic questioning | |
| Cron accountability with partial credit; self-rules (trial → lock → cooldown) | |
| Import from ChatGPT / Claude / Markdown | |
| Audio recap of a note set; screen sharing with the coach (home: UNKNOWN) | |

**LATER (Gen 2+):** plugin SDK and marketplace · dispatch B, sent to Agentwright rather than rebuilt · two-way calendar sync · WhatsApp / Telegram bridges · offline inference and local-first sync · regional inference, SOC 2 · family plans · V2 "Tempo Max" desktop client in Rust.
**Parked:** an outside memory engine (EverOS, Mega Memory) · Jev ideas.

## 6. Product rules (locks)

- Never shame. No "you failed", "streak lost" or "overdue!". Streaks are dosing data, never pressure.
- Accept / reject is law: the model proposes, the user accepts, code writes. The model never writes to the database.
- The user never sees JSON, on any screen.
- Study never mixes into `/today`.
- Crisis words return a fixed resources card, with no model call. The text is never model-written (EXTRAPOLATED rule). The per-country data source is UNKNOWN.
- Family-friendly: no image generation, no adult surface.
- Bun only for tooling; pnpm is never used. Technical locks and the forbidden list: [TRD](./TRD.md).

## 7. Runtime models (names only)

These run inside the product. They never write Tempo's code.

| Lane | Model | Env var name |
|---|---|---|
| Text fast / balanced | DeepInfra Nemotron (3.5 Lightning / 3 Super 120B) | `DEEPINFRA_API_KEY` |
| Text deep (second) | DeepInfra Inkling | `DEEPINFRA_API_KEY` |
| STT incl. Hebrew | Deepgram Nova-3 | `DEEPGRAM_API_KEY` |
| TTS incl. Hebrew | DeepInfra Chatterbox multilingual | `DEEPINFRA_API_KEY` |
| Overrides read by code today | whatever `AI_PROVIDER` names | `AI_API_KEY`, `AI_PROVIDER`, `AI_MODEL` |

Gate: a written DeepInfra Service Order before any paid tier. Long-term fate of the `AI_*` names: UNKNOWN.

## 8. Billing (from the 16 Sep PRD, not re-decided since)

Trial $1 / 3 weeks → Basic $10 (walkie-talkie only) → Pro $20 (+ live voice, 90 min/day) → Max $40. Annual = two months free. No free tier.
- The repo's design export says "seven-day walk … $1" ([`brand-voice.md`](https://github.com/Division6066/tempo-rhythm/blob/integration/docs/design/claude-export/design-system/brand-voice.md)). Trial length: UNKNOWN until Amit rules.
- Today's code grants every new account the top tier (`max`) on open sign-up (`convex/lib/entitlements.ts`). A `god` tier also exists on `users`; its purpose is UNKNOWN.
- Payments are not this weekend's work.

## 9. How work gets built (summary)

- Product code is written only by agents working from tickets (11 fields; 3 files + 1 test; DONE is a runnable command). Grok Bot changes settings and CI only, through config-lane PRs.
- PRs go into `integration`. A PR merges only when every machine check passes, including the merge-blocking reviewer. Only Amit deploys live (merge to `master`, live Convex deploy).
- Code models: mid-tier pricing only (e.g. Sonnet 5, Grok 4.7 Fast); never Fable, Astra, Opus or Soul for code.
- Detail: [TRD](./TRD.md) §8 and [Roadmap](./ROADMAP.md).

## 10. Conflicts resolved by newer decisions

| Older source said | Newer decision (wins) |
|---|---|
| 16 Sep PRD: "Bun → pnpm" in P-1 | 20 Sep, re-confirmed 1–3 Oct: **Bun only, never pnpm.** |
| 20 Sep TRD / app flow: sign-in = password + magic link | 1–2 Oct: **web is magic link only.** Mobile undecided (#425). |
| 20 Sep: review gate "not chosen" | 1–2 Oct: Greptile blocks merges (score ≥ 4/5, no open P1). 3 Oct 15:25: disconnect Greptile; Cursor Bugbot becomes the reviewer after the org move. See TRD §8; this is still flagged as a conflict. |
| 18 Sep: two products only, OmniAgent parked | 1–2 Oct: OmniAgent unparked (not Tempo scope). |
| 18 Sep: memory = EverOS as a service | 20 Sep: Convex memory adapter, kept; outside engine parked. |
| 18 Sep: nothing runs Friday/Saturday; one 18:00 merge window | 30 Sep: agents merge into `integration` when checks pass. 3 Oct: "Shabbat light": build work runs 7 days; no configuration or patching Fri–Sat. |
| 20 Sep PRD patch C2: "who deploys the front end, Grok Build or Cursor?" | 30 Sep: neither; only Amit deploys live. |
| 20 Sep PRD patch C7: open sign-up, top tier for all (code) | 1–2 Oct: sign-up cap 30; approval flow next week. The code at `5b9675e` still says "open, no seat cap"; how the cap is enforced on the deployments is UNKNOWN. |
| 16 Sep PRD: Composio connectors | 18 Sep: Executor, not Composio. |

## 11. Open questions (UNKNOWN)

1. Phone sign-in: OTP or magic link ([#425](https://github.com/Division6066/tempo-rhythm/issues/425)).
2. Nag delivery at V1 beyond in-app (browser notifications allowed; phone push is V1.5).
3. Trial length ($1 / 3 weeks vs $1 / 7 days) and the purpose of the `god` tier.
4. Typeface: see [UI brief](./UI-BRIEF.md).
5. Whether Amit's Sunday planner data may live on the test deployment `ceaseless-dog-617` (#546 question 2).
6. Is a brain dump kept as a page after its plan is accepted?
7. What an admin may read (never page bodies or memories (EXTRAPOLATED)).
8. Whether pages-with-blocks (20 Sep) or the typed planner tables of #546 is the path for the planner. See [Backend schema](./BACKEND-SCHEMA.md) §5.
