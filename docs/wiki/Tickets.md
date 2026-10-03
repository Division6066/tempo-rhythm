# Ticket board mirror

This page mirrors **currently open** GitHub issues on [`Division6066/tempo-rhythm`](https://github.com/Division6066/tempo-rhythm). `tempo-rhythm` has **no GitHub Wiki tab requirement** — `docs/wiki/` is the wiki.

Source of truth for issue state is GitHub. This file is a snapshot for humans and agents. It does **not** change issue state, add `agent:ready`, or close anything.

- Open issues at last sync: **60**
- Grouping: OSS, CI, store, coach, billing, probes, then remaining product work
- Labels shown as on the issue; `—` means none
- Private `docs/brain/TASKS.md` is not readable to cloud agents; use this page + [docs/TASKS.md](../TASKS.md) + GitHub Issues

Last synced: 2026-09-16 18:34 UTC

## OSS

| # | Title | Labels | State |
|---|-------|--------|-------|
| [307](https://github.com/Division6066/tempo-rhythm/issues/307) | TF-OSS-02 — Schema-validate the LLM response (zod, NOT Instructor) | `est:S`, `oss-incorporation-2026-08-04`, `convex`, `ai-router` | OPEN |
| [308](https://github.com/Division6066/tempo-rhythm/issues/308) | TF-OSS-03 — Zustand client state in apps/web | `est:S`, `oss-incorporation-2026-08-04`, `next-js`, `frontend` | OPEN |
| [309](https://github.com/Division6066/tempo-rhythm/issues/309) | TF-OSS-04 — Zustand client state in apps/mobile | `est:S`, `oss-incorporation-2026-08-04`, `expo` | OPEN |

## CI

| # | Title | Labels | State |
|---|-------|--------|-------|
| [253](https://github.com/Division6066/tempo-rhythm/issues/253) | TF-05 — AGENTS.md + CI skeleton + seed data | `oneshot-2026-07-23` | OPEN |
| [271](https://github.com/Division6066/tempo-rhythm/issues/271) | TF-19 — Persistence / reload proof suite | `oneshot-2026-07-23` | OPEN |
| [281](https://github.com/Division6066/tempo-rhythm/issues/281) | TF-32 — Deterministic logic test suite | `oneshot-2026-07-23` | OPEN |
| [282](https://github.com/Division6066/tempo-rhythm/issues/282) | TF-33 — Playwright suite + browser-proof merge gate | `oneshot-2026-07-23` | OPEN |
| [284](https://github.com/Division6066/tempo-rhythm/issues/284) | TF-35 — Soak test + Lighthouse ≥80 + axe accessibility pass | `oneshot-2026-07-23` | OPEN |
| [325](https://github.com/Division6066/tempo-rhythm/issues/325) | CI: pin bun-version in `.github/workflows/ci.yml` notices job + `security.yml` (missed by #320) — `latest` download 503s and fails required checks | — | OPEN |
| [340](https://github.com/Division6066/tempo-rhythm/issues/340) | CI — Fix Playwright webServer startup blocked by Google Fonts | — | OPEN |

## Store

| # | Title | Labels | State |
|---|-------|--------|-------|
| [293](https://github.com/Division6066/tempo-rhythm/issues/293) | TF-43 — EAS iOS production build | `oneshot-2026-07-23` | OPEN |
| [294](https://github.com/Division6066/tempo-rhythm/issues/294) | TF-44 — EAS Android production build (.aab + .apk) | `oneshot-2026-07-23` | OPEN |
| [295](https://github.com/Division6066/tempo-rhythm/issues/295) | TF-45 — Store assets, metadata, privacy labels (BOTH stores) | `oneshot-2026-07-23` | OPEN |
| [296](https://github.com/Division6066/tempo-rhythm/issues/296) | TF-47 — Play review readiness + SUBMIT (closed-test gate flagged) | `oneshot-2026-07-23` | OPEN |
| [297](https://github.com/Division6066/tempo-rhythm/issues/297) | TF-46 — iOS review readiness + SUBMIT | `oneshot-2026-07-23` | OPEN |

## Coach

| # | Title | Labels | State |
|---|-------|--------|-------|
| [169](https://github.com/Division6066/tempo-rhythm/issues/169) | T-007c — Energy-aware suggestions (accept/reject) + shame-free copy scan | — | OPEN |
| [274](https://github.com/Division6066/tempo-rhythm/issues/274) | TF-25 — Coach chat backend + UI (text) | `oneshot-2026-07-23` | OPEN |
| [275](https://github.com/Division6066/tempo-rhythm/issues/275) | TF-26 — Coach techniques + planning wizard | `oneshot-2026-07-23` | OPEN |
| [276](https://github.com/Division6066/tempo-rhythm/issues/276) | TF-27 — Walkie-talkie voice capture | `oneshot-2026-07-23` | OPEN |
| [298](https://github.com/Division6066/tempo-rhythm/issues/298) | TF-48 — Clunky live voice loop | `oneshot-2026-07-23` | OPEN |
| [301](https://github.com/Division6066/tempo-rhythm/issues/301) | TF-51 — Coach research/recency: fresh answers via official APIs | `oneshot-2026-07-23` | OPEN |

## Billing

| # | Title | Labels | State |
|---|-------|--------|-------|
| [273](https://github.com/Division6066/tempo-rhythm/issues/273) | TF-24 — Settings + tier stub + data export + account deletion | `oneshot-2026-07-23` | OPEN |
| [280](https://github.com/Division6066/tempo-rhythm/issues/280) | TF-31 — Web subscriptions via Polar | `oneshot-2026-07-23` | OPEN |
| [291](https://github.com/Division6066/tempo-rhythm/issues/291) | TF-41 — RevenueCat IAP | `oneshot-2026-07-23` | OPEN |
| [292](https://github.com/Division6066/tempo-rhythm/issues/292) | TF-42 — Per-surface premium + billing UI | `oneshot-2026-07-23` | OPEN |

## Probes

Capability / loop-test issues. Status documented only — not closed by this sync.

| # | Title | Labels | State |
|---|-------|--------|-------|
| [337](https://github.com/Division6066/tempo-rhythm/issues/337) | LOOP TEST — trivial copy change | `agent:claude` | OPEN |
| [338](https://github.com/Division6066/tempo-rhythm/issues/338) | LOOP TEST — deliberately failing change | — | OPEN |
| [345](https://github.com/Division6066/tempo-rhythm/issues/345) | CODEX CAPABILITY PROBE — no code changes | — | OPEN |

## Other open issues

Remaining open work that does not sit cleanly in the themes above.

### Capture, notes, templates

| # | Title | Labels | State |
|---|-------|--------|-------|
| [152](https://github.com/Division6066/tempo-rhythm/issues/152) | E2b — WhatsApp voice-note transcription capture | — | OPEN |
| [153](https://github.com/Division6066/tempo-rhythm/issues/153) | E2c — WhatsApp outbound reminders + Meta verification doc | — | OPEN |
| [155](https://github.com/Division6066/tempo-rhythm/issues/155) | E2a — WhatsApp text capture → task/note/reminder (Twilio Sandbox webhook) | — | OPEN |
| [258](https://github.com/Division6066/tempo-rhythm/issues/258) | TF-08 — Brain dump → proposal → task | `oneshot-2026-07-23` | OPEN |
| [261](https://github.com/Division6066/tempo-rhythm/issues/261) | TF-12 — Block/Markdown data model | `oneshot-2026-07-23` | OPEN |
| [262](https://github.com/Division6066/tempo-rhythm/issues/262) | TF-13 — Template registry + built-in template set | `oneshot-2026-07-23` | OPEN |
| [263](https://github.com/Division6066/tempo-rhythm/issues/263) | TF-14 — JSON→rendered template renderer (mockup-matching) | `oneshot-2026-07-23` | OPEN |
| [264](https://github.com/Division6066/tempo-rhythm/issues/264) | TF-15 — Block editor: edit + drag/rearrange | `oneshot-2026-07-23` | OPEN |
| [265](https://github.com/Division6066/tempo-rhythm/issues/265) | TF-16 — AI template-fill (proposal-gated) | `oneshot-2026-07-23` | OPEN |
| [266](https://github.com/Division6066/tempo-rhythm/issues/266) | TF-17a — Notes surfaces on the engine (incl. backlinks) | `oneshot-2026-07-23` | OPEN |
| [267](https://github.com/Division6066/tempo-rhythm/issues/267) | TF-17b — Journal surfaces on the engine (incl. backlinks) | `oneshot-2026-07-23` | OPEN |
| [300](https://github.com/Division6066/tempo-rhythm/issues/300) | TF-50 — Content Ingestion service: paste a link, the app can see it | `oneshot-2026-07-23` | OPEN |

### Product surfaces

| # | Title | Labels | State |
|---|-------|--------|-------|
| [260](https://github.com/Division6066/tempo-rhythm/issues/260) | TF-10 — Projects/folder tree | `oneshot-2026-07-23` | OPEN |
| [269](https://github.com/Division6066/tempo-rhythm/issues/269) | TF-20 — Habits, routines, streaks | `oneshot-2026-07-23` | OPEN |
| [270](https://github.com/Division6066/tempo-rhythm/issues/270) | TF-23 — All-screen shell + honest inactive states | `oneshot-2026-07-23` | OPEN |
| [277](https://github.com/Division6066/tempo-rhythm/issues/277) | TF-28 — Goals + AI breakdown | `oneshot-2026-07-23` | OPEN |
| [278](https://github.com/Division6066/tempo-rhythm/issues/278) | TF-29 — Onboarding flow (013-026) + feedback path | `oneshot-2026-07-23` | OPEN |
| [279](https://github.com/Division6066/tempo-rhythm/issues/279) | TF-30 — Journal encryption at rest | `oneshot-2026-07-23` | OPEN |
| [288](https://github.com/Division6066/tempo-rhythm/issues/288) | TF-21 — Calendar day/week/month + time-block planner | `oneshot-2026-07-23` | OPEN |
| [290](https://github.com/Division6066/tempo-rhythm/issues/290) | TF-40 — Push notifications | `oneshot-2026-07-23` | OPEN |

### Mobile

| # | Title | Labels | State |
|---|-------|--------|-------|
| [286](https://github.com/Division6066/tempo-rhythm/issues/286) | TF-37 — Expo shell: auth + Today + tab navigation | `oneshot-2026-07-23` | OPEN |
| [287](https://github.com/Division6066/tempo-rhythm/issues/287) | TF-38 — Mobile capture: tasks, brain dump, habits | `oneshot-2026-07-23` | OPEN |
| [289](https://github.com/Division6066/tempo-rhythm/issues/289) | TF-39 — Mobile notes/templates/coach/calendar parity | `oneshot-2026-07-23` | OPEN |

### Auth, security, foundation, launch

| # | Title | Labels | State |
|---|-------|--------|-------|
| [250](https://github.com/Division6066/tempo-rhythm/issues/250) | TF-01 — Audit + align tempo-rhythm to template structure | `oneshot-2026-07-23` | OPEN |
| [251](https://github.com/Division6066/tempo-rhythm/issues/251) | TF-02 — Schema audit + extend to canonical domain tables | `oneshot-2026-07-23` | OPEN |
| [252](https://github.com/Division6066/tempo-rhythm/issues/252) | TF-04 — Design tokens from TEMPO_STYLE_GUIDE (dark/light, English) | `oneshot-2026-07-23` | OPEN |
| [254](https://github.com/Division6066/tempo-rhythm/issues/254) | TF-03 — Shared packages: types, AI-router adapter, template-engine skeleton | `oneshot-2026-07-23` | OPEN |
| [255](https://github.com/Division6066/tempo-rhythm/issues/255) | TF-06 — Auth + approved-user allowlist gate | `oneshot-2026-07-23` | OPEN |
| [257](https://github.com/Division6066/tempo-rhythm/issues/257) | TF-11 — Vercel prod + env + browser-proof harness | `oneshot-2026-07-23` | OPEN |
| [272](https://github.com/Division6066/tempo-rhythm/issues/272) | TF-22 — Multi-user isolation / IDOR sweep | `oneshot-2026-07-23` | OPEN |
| [285](https://github.com/Division6066/tempo-rhythm/issues/285) | TF-36 — Web production launch: domain + landing + privacy/terms | `oneshot-2026-07-23` | OPEN |
| [303](https://github.com/Division6066/tempo-rhythm/issues/303) | TF-52 — Deploy the web frontend to a shareable Vercel PREVIEW url | `exec-domain:devops`, `exec-cursor`, `pipe-test`, `Division6066/tempo-rhythm` | OPEN |

## Sync notes

- No Week-0 v1 close list was found in this checkout, so **no issues were closed**.
- `docs/LEDGER.md` does not exist in this repo; no ledger line was appended.
- `agent:ready` was not added to any issue or PR.
