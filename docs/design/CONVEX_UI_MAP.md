# Convex UI Map Draft

Read-only design mapping for Phase 0. This file consumes the frozen Phase 1 schema references and flags gaps; it does not propose schema edits.

## Source and drift notes

- Frozen table list source: `docs/design/claude-export/design-system/uploads/Tempo_Flow_Master_Document.md` Part 6 schema section.
- Hard rules source: `docs/HARD_RULES.md`.
- Current implementation may differ from frozen naming; later agents should reconcile in a schema-specific ticket before wiring UI.
- Important naming drift: `user_profiles` vs `profiles`, `journal_entries` vs `notes.periodType`, `coachConversations`/`coachMessages` vs current conversation/message naming, `ai_suggestions` vs proposals, `dueAt` vs `dueDate`, `body` vs `content`, `cadence` vs `frequency`.

## Hard-rule constraints

- AI-originated writes must surface as proposal UI: accept, edit, or reject. Relevant UI: `TF.Coach.AcceptStrip`, brain-dump review rows, coach extraction cards, note rewrite suggestions, weekly recaps, and first-plan onboarding.
- Confidence thresholds follow `docs/HARD_RULES.md`: `>= 0.8` may auto-apply with undo, `0.5-0.8` confirms, `< 0.5` asks a clarifying question.
- User-owned tables need `userId`, `createdAt`, `updatedAt`, and soft delete via `deletedAt`.
- Generic schema rule applies to templates, library items, profile personalization, recipes/routines/prompts, and "one wobble" coach context.
- Third-party scanners are RAM-only. Brain Dump is first-party capture; still use confirm-before-write for derived records.

## UI field map by feature

### Flow

| Screen | UI fields | Likely Convex table fields | Gaps / notes |
|---|---|---|---|
| `today` | task title, time, est, energy, tag, done, AI badge | `tasks.title`, `tasks.status`, `tasks.dueDate/scheduledStart`, `tasks.effortEstimate`, `tasks.energyLevel`, `tasks.tags`, `tasks.sourceType` | Current schema may only have title/status/priority/due; energy, estimates, tags, source, and schedule need reconciliation. |
| `today` | energy bar, streak, habits sidebar | `plans.energyCheckIn.level`, `streaks.*`, `habits.*`, `habitCompletions.*` | `plans`, `streaks`, and completion logs are likely absent or naming-drifted. |
| `today` | overdue carry strip | `ai_suggestions/proposals` -> `tasks` on confirm | Must not silently carry tasks. |
| `daily-note` | day body, period nav | `notes.content` with `periodType: daily` or `journal_entries.content` | Frozen schema and PRD-style notes model conflict. |
| `daily-note` | inline task rows | `tasks.*` linked to day/date or plan | Embedded note-task links need a concrete generic relation. |
| `brain-dump` | raw text | `brainDumps.rawText` | `brainDumps` is PRD-style, not in frozen 23-table list; preserve privacy copy. |
| `brain-dump` | extracted items and confidence | `brainDumps.extractedItems[]`, `ai_suggestions/proposals.confidence` | Accept/reject before writing tasks/notes/library items. |
| `coach` | messages, role, timestamps | `coachMessages.content`, `coachMessages.role`, `coachMessages.createdAt` | Current schema may use generic `messages`; map before wiring. |
| `coach` | thread title and scope | `coachConversations.title`, `coachConversations.ragScope` | `ragScope` is required for scoped context UI. |
| `coach` | warmth dial | `user_preferences.coachDial` or profile sidecar | HARD_RULES names `profiles.coachDial`; frozen list splits profiles/preferences. |
| `coach` | voice usage | `voiceSessions.durationMinutes`, `subscriptionStates.plan` | Count real audio minutes, not tokens. |
| `plan` | proposed blocks | `plans.timeBlocks[]`, `calendar_events` task blocks | `plans` may be missing in current schema. |

### Library

| Screen | UI fields | Likely Convex table fields | Gaps / notes |
|---|---|---|---|
| `tasks` | list filters, rows | `tasks.status`, `tasks.energyLevel`, `tasks.tags`, `tasks.projectId`, `tasks.dueDate` | Add indexes only in schema work; this file only flags needs. |
| `notes` | title, preview, tags, folder, word count, pinned | `notes.title`, `notes.content/body`, `notes.tags`, `notes.folderId`, `notes.wordCount`, `notes.isPinned/pinned` | Folders are referenced by UI but may be absent from frozen schema. |
| `note-detail` | coach rewrite suggestion | `ai_suggestions/proposals` -> `notes.content` on confirm | Requires preview and undo. |
| `journal` | body, prompt, mood, encrypted marker | `journal_entries.content`, `journal_entries.promptType`, `journal_entries.moodTags`, `journal_entries.encryptionKeyRef` | Schema may fold journal into notes; encryption fields need security review. |
| `calendar` | event title/time/type | `calendar_events.title`, `calendar_events.startTime`, `calendar_events.endTime`, `calendar_events.type`, `calendar_events.linkedTaskId` | External calendar sync copy says later phase; avoid over-wiring. |
| `habits` | habit name/frequency/streak/history | `habits.title/name`, `habits.frequency/cadence`, `habits.currentStreak`, `habits.longestStreak`, `habitCompletions.completedAt` | Naming drift and completion log gap. |
| `routines` | routine title, schedule, steps, last run | `routines.title`, `routines.schedule`, `routines.steps[]`, `routines.lastRunAt` | Routine run log table unclear. |
| `goals` | title, category, due, percent, milestones | `goals.title`, `goals.category`, `goals.dueDate/targetDate`, `goals.progressPercent`, `goals.milestones[]` | Category and milestones may be missing. |
| `projects` | title, due, progress, linked tasks/notes | `projects.title`, `projects.dueDate`, `tasks.projectId`, `notes.projectId` | Projects may be absent in current schema. |
| `project-kanban` | columns/cards | `tasks.status` or project board metadata | Avoid custom per-project columns until generic schema is resolved. |

### You

| Screen | UI fields | Likely Convex table fields | Gaps / notes |
|---|---|---|---|
| `templates` | title, description, cadence, blocks, author | `templates.title`, `templates.description`, `templates.cadence`, `templates.content.blocks`, `templates.authorId` | Use generic JSON/content field for block layouts. |
| `template-builder` | block type/text/items/prompt/range | `templates.content.blocks[]` | Picture/sketch/AI generation uses proposals and agent run logs. |
| `template-run` | answers and completion | `notes.content` as template output, `templates.lastRunAt`, optional run log | Avoid inventing new run table in design phase. |
| `search` | query and grouped results | `searchIndex.textChunk`, `searchIndex.sourceType`, `searchIndex.sourceId` | `searchIndex` is likely absent. |
| `command` | actions and destinations | Route/action registry, not persisted | Commands that mutate use corresponding proposal/mutation flow. |
| `analytics` | stat cards and charts | PostHog aggregate or derived `audit_events`/domain data | Keep opt-out; never shame. |
| `activity` | timeline events | `audit_events.action`, `audit_events.entityType`, `audit_events.entityId`, `audit_events.createdAt` | Append-only audit table appears frozen but may be absent. |
| `empty-states` | copy gallery | Static copy, no Convex table | Use as QA reference. |

### Settings, auth, billing, marketing

| Screen | UI fields | Likely Convex table fields | Gaps / notes |
|---|---|---|---|
| `settings` | display name, email, pronouns, bio, one wobble, plan | `users.email`, `user_profiles.displayName`, `user_profiles.pronouns`, `user_profiles.bio`, `user_ai_profile.context`, `subscriptionStates.plan` | One wobble belongs in generic AI profile/context, not a rigid user-specific schema column. |
| `settings-prefs` | theme, density, accent, font scale, OpenDyslexic, read aloud, reduce motion | `user_preferences.theme`, `user_preferences.layoutDensity`, `user_preferences.accentColor`, `user_preferences.fontScale`, `user_preferences.openDyslexicEnabled`, `user_preferences.readAloudEnabled`, `user_preferences.reduceMotion` | Frozen list has preferences table; current field names need reconciliation. |
| `settings-integrations` | provider, status, last sync | `integrations.provider`, `integrations.status`, `integrations.lastSyncAt` | Avoid forbidden providers and direct SDKs. |
| `billing` / `trial-end` | plan, trial day, days left, renewal | `subscriptionStates.plan`, `subscriptionStates.trialStartedAt`, `subscriptionStates.trialEndsAt`, `subscriptionStates.currentPeriodEnd` | RevenueCat is source of truth; no Stripe direct SDK. |
| `ask-founder` | question, optional contact, transcript opt-in | `askFounderQueue.message`, `askFounderQueue.contactEmail`, `askFounderQueue.isPublicTranscript` | Queue table not in frozen 23-table list; flag only. |
| `notifications` | push/email/coach toggles, quiet hours | `user_preferences.notifications.*` | No explicit notification prefs table in frozen section. |
| `sign-in` | email | Convex Auth + `users.email` | Pre-auth CoachDock suppressed. |
| `onboarding` | tags, energy, work style, template pick, dump, first plan | `users.onboardingStep`, `user_profiles/preferences`, `templates`, `brainDumps`, `plans/proposals` | Preserve progress pre-auth; first plan is proposal UI. |
| `landing`, `about`, `changelog` | marketing copy, pricing, release notes | Static content or CMS-like `library_items` only if later needed | No Convex wiring required for static MVP pages. |
| `mobile-today`, `capture` | mobile reference/capture text | Mirrors `today`, `tasks`, `brainDumps/proposals` | Capture is modal spec, not standalone web router screen. |

## Schema gaps to flag for later tickets

- Tables present in frozen/PRD language but likely absent in current implementation: `user_profiles`, `user_preferences`, `user_ai_profile`, `journal_entries`, `projects`, `routines`, `streaks`, `calendar_events`, `templates`, `library_items`, `ai_suggestions`, `ai_runs`, `agent_runs`, `agent_tasks`, `agent_handoffs`, `agent_artifacts`, `tags`, `audit_events`, `brainDumps`, `plans`, `habitCompletions`, `folders`, `searchIndex`, `integrations`, `askFounderQueue`, `voiceSessions`.
- Naming drift: `body/content`, `name/title`, `dueAt/dueDate`, `cadence/frequency`, `conversations/coachConversations`, `messages/coachMessages`, `ai_suggestions/proposals`.
- UI assumes filters on energy, tags, project, status, and scheduled time. Future schema work must add indexes before wiring large queries.

## Accept/reject checkpoints

1. Brain Dump sorted items.
2. Today carry-over strip.
3. Coach task extraction.
4. Note rewrite suggestion.
5. Journal weekly recap.
6. Onboarding first plan.
7. Template AI generation or picture-sketch parsing.
