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
