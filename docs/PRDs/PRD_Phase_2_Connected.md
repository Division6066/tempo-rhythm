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
