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
  4. pnpm test (Vitest for `convex/` functions, Jest for apps)
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
