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
