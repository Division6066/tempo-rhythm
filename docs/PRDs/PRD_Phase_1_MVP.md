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

- All 42 defined screens across web PWA (Next.js 16) and mobile apps (Expo SDK 53)
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

Design tokens live in **`packages/ui`** (shared) and **`apps/web/app/globals.css`** (Tailwind v4 `@theme` / CSS variables). `apps/mobile` consumes the same semantic colors via NativeWind once wired from shared tokens.

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
- PWA: Next.js 16 App Router with `next-pwa` or equivalent service worker setup
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

- Monorepo setup: `apps/web` (Next.js 16), `apps/mobile` (Expo 53), `packages/types`, `packages/utils`, `packages/ui`, Convex at repo root `convex/`
- Convex project initialized, schema committed
- Convex Auth configured (email + GitHub OAuth)
- Tailwind v4 + PostCSS on web; NativeWind + Tailwind 3.x on mobile
- shadcn/ui base components installed in web
- Design token pipeline: shared tokens in `packages/ui` + `@theme` / CSS variables in web → NativeWind theme on mobile
- Biome + TypeScript strict mode (Prettier optional)
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
- A second global CSS utility stack on web; downgrading `apps/web` from Tailwind v4 to v3
- Notion, Linear, Airtable
