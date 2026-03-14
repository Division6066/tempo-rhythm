# TEMPO — Master Roadmap: NotePlan Parity + Full AI Layer

> **Reference Document** — 26 Phases, Web + Mobile
> Last updated: 2026-03-14

---

## Executive Summary

This roadmap defines every phase required to bring Tempo to **full NotePlan feature parity** on both the web app (`artifacts/tempo`) and the iOS/mobile app (`tempo-app/apps/mobile`), then layer a comprehensive **AI co-pilot** that surpasses NotePlan's ChatGPT integration.

The work is organized into **26 phases** across 7 domains. Each phase includes a current-state assessment, gap analysis, required changes, affected files, and estimated complexity.

---

## Table of Contents

1. [Current State Assessment](#current-state-assessment)
2. [Domain Map](#domain-map)
3. [Phase Definitions (1–26)](#phase-definitions)
4. [Dependency Graph](#dependency-graph)
5. [File Index](#file-index)
6. [Out of Scope](#out-of-scope)

---

## Current State Assessment

### Web App (artifacts/tempo) — What Exists Today

| Feature Area | Status | Notes |
|---|---|---|
| Dashboard | ✅ Built | Progress ring, Top 3 focus, quick actions |
| Today View | ✅ Built | Tasks by priority (high/medium/low/completed) |
| Inbox | ✅ Built | Quick capture, brain dump, AI extract, staging |
| Calendar | ⚠️ Partial | Month + Week views; no Day view, no time-blocking drag-and-drop |
| Period Notes | ⚠️ Partial | Weekly/Monthly/Yearly only; missing Daily + Quarterly, no date navigator |
| Notes List | ⚠️ Partial | List view only; no Kanban or Table views |
| Note Editor | ⚠️ Partial | Edit/Preview tabs (not split-pane); basic Markdown via ReactMarkdown; wiki-links + backlinks exist; no collapsible sections, frontmatter editor, image upload, archiving |
| Bi-directional Links | ✅ Built | `[[wiki-links]]` with auto-sync; backlinks panel on notes |
| Projects | ⚠️ Partial | List view only; no Kanban or Table views |
| Task Detail | ✅ Built | Status, priority, energy, scheduling, recurrence, AI chunking, time blocking |
| Task Filters | ⚠️ Partial | Status/priority/search filters; no advanced syntax (`is:open date:this-week #tag`) |
| Templates | ⚠️ Partial | Template library with built-in + custom; no AI generation, no dynamic fields beyond `{{date}}` |
| Command Bar | ✅ Built | ⌘K with navigation + global search |
| AI Chat | ✅ Built | Conversational AI with memory context, quick prompts |
| AI Daily Plan | ✅ Built | Generate, review, edit, accept/reject staging |
| AI Task Extract | ✅ Built | Brain dump → structured tasks with staging |
| AI Task Chunk | ✅ Built | Break large task → sub-steps with staging |
| AI Memory | ⚠️ Partial | Manual add/delete; warm/cold tiers; no automatic preference extraction |
| Voice Transcription | ⚠️ Partial | VoiceNote component exists; transcription via server proxy; not in Command Bar |
| Focus Timer | ✅ Built | Pomodoro timer with task selection |
| Folders/Areas | ✅ Built | CRUD with icons |
| Tags | ✅ Built | CRUD with color picker |
| Settings | ✅ Built | ADHD mode, routine, energy peaks, focus sessions, Lore Pack import |
| Onboarding | ✅ Built | 6-step setup wizard |
| Dark Mode | ⚠️ Partial | Dark theme is the default; no light mode or system toggle |
| Published Notes | ✅ Built | Public slug-based note view |

### Mobile App (tempo-app/apps/mobile) — What Exists Today

| Feature | Status |
|---|---|
| 14 Screens | ✅ Scaffolded (Home, Today, Inbox, Chat, More, Task Detail, Plan, Calendar, Projects, Notes, Note Editor, Settings, Filters, Templates) |
| Auth | ✅ Convex Auth with email/password |
| Core CRUD | ✅ Tasks, Notes, Projects via Convex |
| AI Features | ⚠️ Basic (Chat, task extraction) |
| Period Notes Nav | ❌ Missing |
| Timeline Day View | ❌ Missing |
| Bi-directional Links | ❌ Missing |
| Command Bar (FAB) | ❌ Missing |
| Plugin Bottom Sheet | ❌ Missing |
| View Mode Toggles | ❌ Missing |
| Voice in Quick Capture | ❌ Missing |

---

## Domain Map

| Domain | Phases | Description |
|---|---|---|
| **A. Calendar & Time** | 1–3 | Day view, time blocking, unified layout, notifications |
| **B. Notes & Content** | 4–8 | Editor upgrade, bi-directional links, period notes, views, templates |
| **C. Task Management** | 9–11 | Recurring, energy, `>today`, advanced search, consolidated view |
| **D. Platform Systems** | 12–14 | Plugin registry, command bar upgrades, dark mode |
| **E. AI Co-Pilot** | 15–22 | Auto-categorize, rewrite, extract, plan, prioritize, voice, memory, deep think |
| **F. Mobile Parity** | 23–25 | Full feature parity pass for Expo app |
| **G. Settings & Polish** | 26 | Settings expansion, preference toggles, final QA |

---

## Phase Definitions

---

### Phase 1 — Calendar: Day View + Hour-by-Hour Timeline

**Domain**: A. Calendar & Time
**Complexity**: Large
**Depends on**: None

#### What Exists
- Calendar page (`Calendar.tsx`) has Month and Week views.
- Events have `startTime`, `endTime`, `duration` fields.
- Tasks have `scheduledDate` and `startTime` fields.

#### What to Build
- Add a **Day view mode** (toggle: Month | Week | Day).
- Render a vertical **hour-by-hour timeline** (00:00–23:59) with hour markers.
- Tasks and events with `startTime`/`endTime` render as **colored blocks** on the timeline, sized proportionally to duration.
- Implement **drag-and-drop** to move blocks to different time slots (updates `startTime`/`endTime` via API).
- Add a **time picker** to the event creation dialog (already partially exists — needs refinement for Day view context).

#### Affected Files
- `artifacts/tempo/src/pages/Calendar.tsx` — Add Day view mode, timeline renderer, drag-and-drop
- `lib/api-spec/openapi.yaml` — Verify task/event time fields are complete
- `artifacts/api-server/src/routes/calendarEvents.ts` — Ensure time update endpoint exists
- `artifacts/api-server/src/routes/tasks.ts` — Ensure `startTime`/`endTime` update works

#### Acceptance Criteria
- [ ] Day view shows 24-hour vertical timeline
- [ ] Events/tasks with times render as colored blocks at correct positions
- [ ] Blocks can be dragged to new time slots
- [ ] Dragging persists via API call
- [ ] View mode toggle cycles Month → Week → Day

---

### Phase 2 — Calendar: Time Blocking Drag-and-Drop (Task → Timeline)

**Domain**: A. Calendar & Time
**Complexity**: Medium
**Depends on**: Phase 1

#### What to Build
- From the task list (sidebar or Day view panel), allow **dragging a task onto the timeline** to assign it a time slot.
- When dropped, create a time block: set `startTime` to the drop position, `endTime` = `startTime + estimatedDuration` (or default 30 min).
- Visual feedback during drag (ghost block on timeline).
- Update the task's `scheduledDate` to the Day view's current date if not already set.

#### Affected Files
- `artifacts/tempo/src/pages/Calendar.tsx` — Drag source (task cards) + drop target (timeline)
- `artifacts/tempo/src/components/TaskCard.tsx` — Make draggable

#### Acceptance Criteria
- [ ] Tasks can be dragged from a list onto the Day timeline
- [ ] Drop creates a time block with correct start/end
- [ ] Task's `scheduledDate` and `startTime` update via API

---

### Phase 3 — Calendar: Unified/Hybrid Layout + Notifications

**Domain**: A. Calendar & Time
**Complexity**: Medium
**Depends on**: Phase 1

#### What to Build
- Add a **Settings toggle**: "Calendar layout: Separate tabs | Unified | Hybrid (collapsible panel)".
  - **Separate tabs** (default): Calendar and Daily Note are on different pages.
  - **Unified**: The Daily Note panel appears alongside the calendar in a split layout.
  - **Hybrid**: A collapsible side panel shows the day's note next to the calendar.
- Store preference in user preferences (Convex/API).
- Implement **notifications/reminders** that fire when a time block is about to start (browser Notification API; configurable lead time in Settings).

#### Affected Files
- `artifacts/tempo/src/pages/Calendar.tsx` — Layout modes
- `artifacts/tempo/src/pages/Settings.tsx` — New toggle
- `artifacts/api-server/src/routes/preferences.ts` — New preference field
- `lib/db/src/schema.ts` — Add `calendarLayout` to preferences schema

#### Acceptance Criteria
- [ ] Three layout modes work and persist across sessions
- [ ] Notification fires N minutes before a time block starts
- [ ] User can configure notification lead time in Settings

---

### Phase 4 — Period Notes: All Five Periods + Date Navigator

**Domain**: B. Notes & Content
**Complexity**: Medium
**Depends on**: None

#### What Exists
- `PeriodNotes.tsx` supports Weekly, Monthly, Yearly.
- Notes have `periodType` and `periodDate` fields.

#### What to Build
- Add **Daily** and **Quarterly** period types.
- Add a **date navigator** (prev/next arrows + date picker) to navigate between periods.
- Each period **auto-generates** a note on first access using the user's assigned template.
- Add an **upcoming tasks filter** that aggregates tasks from all period notes for the visible range.

#### Affected Files
- `artifacts/tempo/src/pages/PeriodNotes.tsx` — Add Daily + Quarterly tabs, date navigator
- `artifacts/api-server/src/routes/notes.ts` — Support `periodType: "daily" | "quarterly"`
- `lib/db/src/schema.ts` — Extend `periodType` enum
- `lib/api-spec/openapi.yaml` — Update `periodType` values

#### Acceptance Criteria
- [ ] Five period tabs: Daily, Weekly, Monthly, Quarterly, Yearly
- [ ] Date navigator (prev/next) for each period type
- [ ] Auto-generate note on first access for current period
- [ ] Upcoming tasks filter aggregates tasks from period notes

---

### Phase 5 — Markdown Editor: Full Feature Parity

**Domain**: B. Notes & Content
**Complexity**: Large
**Depends on**: None

#### What Exists
- `NoteEditor.tsx` has Edit/Preview tabs with `ReactMarkdown`.
- Basic Markdown rendering; `[[wiki-links]]` supported.
- Tags (`#tag`) and mentions (`@mention`) parsed from content.

#### What to Build
- Replace tab-based Edit/Preview with a **split-pane** layout (left = raw Markdown, right = live preview).
- Add **toolbar buttons** for: H1–H6, bold, italic, strikethrough, underline, inline code, code block, table, blockquote, horizontal rule, ordered/unordered list, checkbox.
- Implement **collapsible/foldable headings** and task sections (click to expand/collapse in preview).
- Add a **frontmatter properties editor** (key-value metadata panel above the note body).
- Add a **note background color selector** (per-note color accent stored in DB).
- Add **image paste/upload** support (store in object storage, insert Markdown image link).
- Add **file attachment** support on notes.
- Add a **note archiving** action (archive instead of delete; archived notes hidden from default list).

#### Affected Files
- `artifacts/tempo/src/pages/NoteEditor.tsx` — Major rewrite: split-pane, toolbar, collapsible sections, frontmatter editor, color picker, image upload, archiving
- `artifacts/api-server/src/routes/notes.ts` — Add `backgroundColor`, `isArchived`, `frontmatter` fields; archive endpoint; file upload endpoint
- `lib/db/src/schema.ts` — Extend notes table
- `lib/api-spec/openapi.yaml` — New fields and endpoints

#### Acceptance Criteria
- [ ] Split-pane editor with live preview
- [ ] Toolbar with all Markdown formatting types
- [ ] Collapsible headings in preview
- [ ] Frontmatter key-value editor
- [ ] Per-note background color
- [ ] Image paste/upload working
- [ ] File attachments on notes
- [ ] Archive action (separate from delete)

---

### Phase 6 — Bi-Directional Links: Auto-Complete Enhancement

**Domain**: B. Notes & Content
**Complexity**: Small
**Depends on**: Phase 5

#### What Exists
- `[[Note Title]]` wiki-link parsing with `syncWikiLinks` on save.
- Backlinks panel at bottom of NoteEditor.
- `noteLinks` table in DB with source/target relationships.

#### What to Build
- Add **live auto-complete** when typing `[[`: show a dropdown of matching note titles as the user types inside the brackets.
- Ensure **links update in real time** when notes are renamed (update all `[[Old Title]]` references to `[[New Title]]`).
- Make backlinks panel show a **snippet preview** of the referencing context (the line containing the `[[link]]`).

#### Affected Files
- `artifacts/tempo/src/pages/NoteEditor.tsx` — Auto-complete dropdown in editor textarea
- `artifacts/api-server/src/routes/noteLinks.ts` — Context snippet in backlinks query
- `artifacts/api-server/src/routes/notes.ts` — On rename, update wiki-link references

#### Acceptance Criteria
- [ ] Typing `[[` opens auto-complete with note titles
- [ ] Selecting from auto-complete inserts `[[Note Title]]`
- [ ] Renaming a note updates all `[[references]]` across other notes
- [ ] Backlinks show context snippets

---

### Phase 7 — Views: List, Kanban, Table on Notes

**Domain**: B. Notes & Content
**Complexity**: Medium
**Depends on**: None

#### What Exists
- `Notes.tsx` renders a grid of note cards (effectively a List/Grid view).

#### What to Build
- Add a **view mode toggle** (List | Kanban | Table) to the Notes list page.
- **Kanban view**: Cards grouped by configurable columns (folder, tag, or custom grouping). Drag-and-drop between columns.
- **Table view**: Spreadsheet-like with sortable columns (title, created date, updated date, tags, folder, word count).

#### Affected Files
- `artifacts/tempo/src/pages/Notes.tsx` — View mode toggle, Kanban renderer, Table renderer
- New component: `artifacts/tempo/src/components/KanbanBoard.tsx`
- New component: `artifacts/tempo/src/components/DataTable.tsx`

#### Acceptance Criteria
- [ ] Three view modes accessible via toggle
- [ ] Kanban shows notes as cards in configurable columns
- [ ] Table view with sortable columns
- [ ] View preference persists

---

### Phase 8 — Views: List, Kanban, Table on Projects

**Domain**: B. Notes & Content
**Complexity**: Medium
**Depends on**: Phase 7

#### What Exists
- `Projects.tsx` renders a list of project cards with progress bars.

#### What to Build
- Add the same **view mode toggle** (List | Kanban | Table) to the Projects page.
- Kanban columns configurable by project status (active/archived/custom).
- Table view with sortable columns (name, status, task count, progress, created date).
- Tasks page (`TaskFilters.tsx`) gets **List and Table** views.

#### Affected Files
- `artifacts/tempo/src/pages/Projects.tsx` — View toggle, Kanban, Table
- `artifacts/tempo/src/pages/TaskFilters.tsx` — List + Table view toggle
- Reuse: `artifacts/tempo/src/components/KanbanBoard.tsx`, `DataTable.tsx`

#### Acceptance Criteria
- [ ] Projects page has List | Kanban | Table toggle
- [ ] Task Filters page has List | Table toggle
- [ ] Kanban columns are configurable

---

### Phase 9 — Task Enhancements: Recurring, Energy, Sub-Items

**Domain**: C. Task Management
**Complexity**: Medium
**Depends on**: None

#### What Exists
- `TaskDetail.tsx` has recurrence configuration (interval type, next occurrence).
- Energy level field exists (1/2/3 with icons).
- Task completion handles recurrence (creates next occurrence).

#### What to Build
- Add **sub-item/checklist support** within a task card (nested checkboxes under a parent task).
- Ensure recurring task intervals include: daily, weekdays, weekly, biweekly, monthly, custom ("after completion" mode).
- Add `estimatedDuration` field (separate from `estimatedMinutes` — or consolidate).
- Verify the **complete-and-recur** flow creates the next instance with correct dates.

#### Affected Files
- `artifacts/tempo/src/pages/TaskDetail.tsx` — Sub-items UI
- `artifacts/tempo/src/components/TaskCard.tsx` — Show sub-item progress
- `artifacts/api-server/src/routes/tasks.ts` — Sub-items CRUD
- `lib/db/src/schema.ts` — `taskSubItems` table or JSON field

#### Acceptance Criteria
- [ ] Tasks can have sub-items (add, check, delete)
- [ ] Sub-item progress shown on TaskCard
- [ ] All recurrence intervals work correctly

---

### Phase 10 — Task Enhancements: `>today` Tag + Advanced Search

**Domain**: C. Task Management
**Complexity**: Medium
**Depends on**: None

#### What to Build
- Implement **`>today` tag behavior**: typing `>today` in a task title or note moves that task to today's plan/status.
- Implement **advanced search filter syntax**:
  - `is:open` — filter by open status
  - `date:this-week` — filter by date range
  - `#tag` — filter by tag
  - `folder:work` — filter by folder/area
  - `OR` operator: `#pending OR #waiting`
- Build a **consolidated "All Tasks" view** that aggregates tasks from the task system and tasks extracted from notes.

#### Affected Files
- `artifacts/tempo/src/pages/TaskFilters.tsx` — Advanced search syntax parser
- `artifacts/api-server/src/routes/search.ts` — Support filter syntax in search endpoint
- `artifacts/api-server/src/routes/tasks.ts` — `>today` handling
- New page or section: All Tasks consolidated view

#### Acceptance Criteria
- [ ] `>today` on a task moves it to today status
- [ ] Advanced search syntax works: `is:open date:this-week #tag folder:work`
- [ ] OR operator works in search
- [ ] "All Tasks" view shows tasks from all sources

---

### Phase 11 — Task Enhancements: Drag-to-Reschedule from List to Calendar

**Domain**: C. Task Management
**Complexity**: Medium
**Depends on**: Phase 1, Phase 2

#### What to Build
- From the Today view, Inbox, or Task Filters, allow **dragging a task** and dropping it onto the Calendar (any view) to reschedule it.
- On drop, update the task's `scheduledDate` and optionally `startTime`.
- Visual feedback: highlight drop zones on calendar.

#### Affected Files
- `artifacts/tempo/src/components/TaskCard.tsx` — Draggable
- `artifacts/tempo/src/pages/Calendar.tsx` — Drop targets on calendar cells
- `artifacts/tempo/src/pages/TodayView.tsx` — Drag source context
- `artifacts/tempo/src/pages/Inbox.tsx` — Drag source context

#### Acceptance Criteria
- [ ] Tasks can be dragged from task list to calendar
- [ ] Dropping on a day sets `scheduledDate`
- [ ] Dropping on Day view timeline sets `startTime`

---

### Phase 12 — Template System: Full Build

**Domain**: B. Notes & Content
**Complexity**: Medium
**Depends on**: Phase 4

#### What Exists
- `NoteTemplates.tsx` with built-in + custom templates.
- "Use template" creates a new note from template content.
- `{{date}}` replacement exists.

#### What to Build
- Ship additional **built-in primitive block templates**: Top 3 Focus, Focus Block, Study Session, Meeting Prep, Weekly Review, Habit Tracker, Reflection Block.
- Add **"Save as Template"** action on any note in NoteEditor.
- Add **template auto-insert configuration** per period type (e.g., every Daily note uses "Daily Template").
- Add `{{weekNumber}}`, `{{month}}`, `{{year}}`, `{{quarter}}` dynamic fields.
- Add **AI template generation** from description ("make me a keto meal planning template").

#### Affected Files
- `artifacts/tempo/src/pages/NoteTemplates.tsx` — New built-in templates, AI generation
- `artifacts/tempo/src/pages/NoteEditor.tsx` — "Save as Template" action
- `artifacts/tempo/src/pages/PeriodNotes.tsx` — Auto-insert template on period note creation
- `artifacts/tempo/src/pages/Settings.tsx` — Default template per period type setting
- `artifacts/api-server/src/routes/noteTemplates.ts` — Seed new built-ins
- `artifacts/api-server/src/routes/ai.ts` — Template generation endpoint

#### Acceptance Criteria
- [ ] All primitive block templates available
- [ ] "Save as Template" works from note editor
- [ ] Period notes auto-insert configured template
- [ ] Dynamic fields expand correctly
- [ ] AI generates templates from description

---

### Phase 13 — Plugin Registry: Architecture + Built-in Plugins

**Domain**: D. Platform Systems
**Complexity**: Large
**Depends on**: None

#### What to Build
- Build a **Plugin Registry page** (`/plugins`) in Settings.
- Define the **plugin manifest schema**: `{ id, name, version, description, permissions, entryPoint }`.
- Implement **plugin loading** in an isolated JS context (sandboxed `iframe` or `Function` constructor with restricted scope).
- Plugins can: add sidebar items, add toolbar actions, add custom template blocks, run on note save, add AI skills.
- Ship **four built-in plugins**:
  1. **Focus Timer** — Current FocusSession page, refactored as a plugin
  2. **Word Count** — Shows word/character count for current note
  3. **Reading Time** — Estimated reading time for current note
  4. **Daily Habit Tracker** — Track daily habits with streaks
- Plugin sidebar item and toolbar action APIs.
- On mobile, plugins render in a **bottom sheet** panel.

#### Affected Files
- New page: `artifacts/tempo/src/pages/Plugins.tsx`
- New: `artifacts/tempo/src/lib/pluginRuntime.ts` — Plugin sandbox + API
- New: `artifacts/tempo/src/plugins/` — Built-in plugin bundles
- `artifacts/tempo/src/components/layout/AppLayout.tsx` — Plugin sidebar integration
- `artifacts/tempo/src/pages/NoteEditor.tsx` — Plugin toolbar actions
- `artifacts/tempo/src/pages/Settings.tsx` — Link to Plugins page

#### Acceptance Criteria
- [ ] Plugin Registry page lists installed plugins
- [ ] Plugins run in isolated sandbox
- [ ] Four built-in plugins functional
- [ ] Plugins can add sidebar items and toolbar actions
- [ ] Plugin enable/disable toggle works

---

### Phase 14 — Global Command Bar: Full Surface Coverage

**Domain**: D. Platform Systems
**Complexity**: Medium
**Depends on**: Phase 12, Phase 13

#### What Exists
- `CommandBar.tsx` supports ⌘K with navigation + global search across notes/tasks.

#### What to Build
- Add **AI action shortcuts** to Command Bar: "Summarize note", "Rewrite selection", "Plan my day", "Chunk task".
- Add **template selection** from Command Bar: "Apply template: [name]".
- Add **plugin action execution** from Command Bar.
- Ensure Command Bar is accessible on **every screen** (already wrapped in AppLayout — verify).
- On mobile: long-press FAB or search icon triggers Command Bar equivalent.

#### Affected Files
- `artifacts/tempo/src/components/CommandBar.tsx` — AI actions, template actions, plugin actions
- `artifacts/tempo/src/components/QuickCapture.tsx` — Long-press behavior for mobile

#### Acceptance Criteria
- [ ] Command Bar includes AI action shortcuts
- [ ] Templates can be applied from Command Bar
- [ ] Plugin actions accessible from Command Bar
- [ ] Available on every screen

---

### Phase 15 — AI: Auto-Categorization

**Domain**: E. AI Co-Pilot
**Complexity**: Medium
**Depends on**: None

#### What to Build
- When a note or task is **saved**, call AI (Ollama) to suggest: folder, project, and tags.
- Display suggestion as a **dismissible inline prompt** with confidence score (e.g., "85% confident → Projects/Work").
- **One-tap accept** applies the categorization.
- Store accepted categorizations in AI memory for learning.
- Add **toggle in Settings** to enable/disable auto-categorization.

#### Affected Files
- `artifacts/tempo/src/pages/NoteEditor.tsx` — Suggestion prompt after save
- `artifacts/tempo/src/pages/TaskDetail.tsx` — Suggestion prompt after save
- `artifacts/api-server/src/routes/ai.ts` — Auto-categorize endpoint
- `artifacts/tempo/src/pages/Settings.tsx` — Toggle
- `artifacts/api-server/src/routes/preferences.ts` — `aiAutoCategorize` field

#### Acceptance Criteria
- [ ] Saving a note/task triggers AI categorization suggestion
- [ ] Suggestion shows confidence score
- [ ] One-tap accept applies folder + project + tags
- [ ] Toggle in Settings works

---

### Phase 16 — AI: Rewrite, Summarize, Text Actions

**Domain**: E. AI Co-Pilot
**Complexity**: Medium
**Depends on**: Phase 5

#### What to Build
- Add **AI action menu** to NoteEditor toolbar: Rewrite, Summarize, Simplify, Make ADHD-Friendly, Expand, Translate.
- Text selection context menu (right-click or toolbar) triggers these actions on **selected text**.
- Whole-note summarize with one click.
- **AI preview panel**: show the AI output in a side panel / modal before inserting into the note.
- Wire all actions to Ollama.

#### Affected Files
- `artifacts/tempo/src/pages/NoteEditor.tsx` — AI action menu, preview panel
- `artifacts/api-server/src/routes/ai.ts` — Rewrite/summarize/simplify/expand endpoints
- New component: `artifacts/tempo/src/components/AiPreviewPanel.tsx`

#### Acceptance Criteria
- [ ] AI action menu available in editor toolbar
- [ ] Text selection triggers context-specific AI actions
- [ ] AI output shown in preview before insertion
- [ ] All 6 actions work (Rewrite, Summarize, Simplify, ADHD-Friendly, Expand, Translate)

---

### Phase 17 — AI: Task Extraction Enhancement

**Domain**: E. AI Co-Pilot
**Complexity**: Small
**Depends on**: None

#### What Exists
- Inbox has "Brain Dump → Extract Tasks" with staging system.
- TaskDetail has "Chunk this task" with staging.

#### What to Build
- Add **"Extract Tasks with AI"** action in NoteEditor (select text → extract tasks from that text).
- Extracted tasks appear in a **confirmation modal** (same staging pattern as Inbox).
- Ensure chunked tasks show **time estimates** in the confirmation view.
- Nothing committed without user confirmation (already implemented — verify consistency).

#### Affected Files
- `artifacts/tempo/src/pages/NoteEditor.tsx` — "Extract Tasks" toolbar action
- Reuse staging components from Inbox

#### Acceptance Criteria
- [ ] "Extract Tasks" action available in NoteEditor
- [ ] Extracted tasks shown in confirmation modal with staging
- [ ] Time estimates visible on chunked tasks

---

### Phase 18 — AI: Plan My Day Enhancement

**Domain**: E. AI Co-Pilot
**Complexity**: Medium
**Depends on**: None

#### What Exists
- `DailyPlan.tsx` has AI plan generation with accept/edit/reject staging.

#### What to Build
- AI should read: inbox items, **overdue tasks**, today's events, **preference memory**, and **user-provided energy level input** (added at generation time).
- Generated plan includes **ADHD-friendly framing** (gentle language, chunked blocks).
- Show **AI rationale per item** ("This is first because it's due today and takes ~30 min").
- User can **drag to reorder** items before accepting (needs drag-and-drop on plan blocks).

#### Affected Files
- `artifacts/tempo/src/pages/DailyPlan.tsx` — Energy input, rationale display, drag-to-reorder
- `artifacts/api-server/src/routes/ai.ts` — Enhanced plan generation with overdue tasks + memory context

#### Acceptance Criteria
- [ ] Energy level input before generation
- [ ] Overdue tasks included in AI context
- [ ] Per-item AI rationale shown
- [ ] Blocks can be drag-reordered before accepting

---

### Phase 19 — AI: Priority Scoring

**Domain**: E. AI Co-Pilot
**Complexity**: Medium
**Depends on**: Phase 15

#### What to Build
- Add **AI priority ranking** to the task list and inbox.
- Priority score shown as a **subtle visual indicator** (e.g., small badge or colored dot with score).
- Factors: due date, energy level, project importance, user habits from memory.
- **User can always override** AI priority.
- Wire to Ollama with user memory context.

#### Affected Files
- `artifacts/tempo/src/components/TaskCard.tsx` — AI priority indicator
- `artifacts/tempo/src/pages/Inbox.tsx` — "AI Prioritize" button
- `artifacts/tempo/src/pages/TodayView.tsx` — AI priority sort option
- `artifacts/api-server/src/routes/ai.ts` — Priority scoring endpoint

#### Acceptance Criteria
- [ ] AI priority scores displayed on task cards
- [ ] Priority ranking available in Inbox and Today view
- [ ] User can manually override AI priority
- [ ] Scoring considers due date, energy, project importance, memory

---

### Phase 20 — AI: Voice Transcription Expansion

**Domain**: E. AI Co-Pilot
**Complexity**: Medium
**Depends on**: Phase 14

#### What Exists
- `VoiceNote.tsx` component with server-side transcription proxy.
- Microphone button in NoteEditor toolbar.

#### What to Build
- Add microphone button to: **Inbox quick capture**, **Command Bar**.
- Voice recording → transcribed to text via Ollama/Whisper-compatible model.
- Transcribed text is then run through **task extraction AI** before being committed.
- Add **custom transcription prompt** in Settings (e.g., "always format as bullet points").

#### Affected Files
- `artifacts/tempo/src/pages/Inbox.tsx` — Voice capture button
- `artifacts/tempo/src/components/CommandBar.tsx` — Voice input
- `artifacts/tempo/src/components/VoiceNote.tsx` — Custom prompt support
- `artifacts/tempo/src/pages/Settings.tsx` — Transcription prompt setting
- `artifacts/api-server/src/routes/transcribe.ts` — Custom prompt parameter

#### Acceptance Criteria
- [ ] Microphone in Inbox quick capture, NoteEditor, Command Bar
- [ ] Transcribed text routed through task extraction AI
- [ ] Custom transcription prompt configurable in Settings

---

### Phase 21 — AI: Preference Memory Auto-Updates

**Domain**: E. AI Co-Pilot
**Complexity**: Medium
**Depends on**: Phase 18, Phase 19

#### What Exists
- `Memories.tsx` with manual add/delete; warm/cold tiers.

#### What to Build
- After every **accepted AI plan** or task set, silently extract preference signals:
  - Chunk size preference
  - Time-of-day patterns
  - Energy patterns
  - Task type preferences
- **Upsert** extracted signals to the Convex/API preferences/memory table.
- Update Memories page to clearly show **AI-learned entries** vs. manual entries.
- Add **edit capability** on memory entries (currently only add/delete).

#### Affected Files
- `artifacts/tempo/src/pages/Memories.tsx` — Edit capability, AI-learned badge
- `artifacts/tempo/src/pages/DailyPlan.tsx` — Post-accept memory extraction
- `artifacts/api-server/src/routes/ai.ts` — Memory extraction logic
- `artifacts/api-server/src/routes/preferences.ts` — Upsert learned preferences

#### Acceptance Criteria
- [ ] Accepting an AI plan silently updates memory
- [ ] AI-learned memories distinguished from manual ones
- [ ] Memory entries can be edited (not just deleted)
- [ ] Memory extraction captures meaningful signals

---

### Phase 22 — AI: Council/Deep Think Mode

**Domain**: E. AI Co-Pilot
**Complexity**: Small
**Depends on**: Phase 16

#### What to Build
- Add an optional **"Deep Think" toggle** on AI action modals.
- When enabled, the request goes through a **secondary reasoning pass** (chain-of-thought or verification step).
- Show a **quality/confidence score** on the result.
- **Off by default** to keep latency low.

#### Affected Files
- New component: `artifacts/tempo/src/components/DeepThinkToggle.tsx`
- `artifacts/tempo/src/pages/NoteEditor.tsx` — Deep Think toggle on AI actions
- `artifacts/tempo/src/pages/DailyPlan.tsx` — Deep Think toggle on plan generation
- `artifacts/api-server/src/routes/ai.ts` — Secondary reasoning pass

#### Acceptance Criteria
- [ ] "Deep Think" toggle visible on AI action modals
- [ ] Off by default
- [ ] Enabling it adds a reasoning verification pass
- [ ] Quality/confidence score shown on result

---

### Phase 23 — Dark Mode: Full Theme System

**Domain**: D. Platform Systems
**Complexity**: Medium
**Depends on**: None

#### What Exists
- App uses a dark theme by default (CSS custom properties in `index.css`).
- No light mode or system preference detection.

#### What to Build
- Implement full **theme system**: Light / Dark / System (follow OS preference).
- Add **theme toggle** in Settings.
- Ensure **all pages and components** render correctly in light mode (audit every page).
- Store theme preference in localStorage + sync to user preferences.

#### Affected Files
- `artifacts/tempo/src/index.css` — Light mode CSS variables
- `artifacts/tempo/src/App.tsx` — Theme provider context
- `artifacts/tempo/src/pages/Settings.tsx` — Theme toggle
- All pages — Audit for hardcoded dark-mode colors

#### Acceptance Criteria
- [ ] Light, Dark, and System theme options
- [ ] Theme persists across sessions
- [ ] All pages render correctly in light mode
- [ ] System mode follows OS preference

---

### Phase 24 — Mobile Parity: Core Features

**Domain**: F. Mobile Parity
**Complexity**: Large
**Depends on**: Phases 1–4, 7–8

#### What to Build
Port the following to the Expo mobile app (`tempo-app/apps/mobile`):
- **Period notes navigator** with all five period types + date nav
- **Timeline Day view** with vertical scroll, hour markers, colored blocks
- **Drag-to-reschedule** on mobile (touch drag on timeline)
- **All view mode toggles** (List, Kanban, Table) with swipe-to-switch gesture

#### Affected Files
- `tempo-app/apps/mobile/app/` — Multiple screens
- `tempo-app/apps/mobile/components/` — New mobile components

#### Acceptance Criteria
- [ ] Period notes with 5 types + date navigator on mobile
- [ ] Day timeline view functional on mobile
- [ ] Touch drag-to-reschedule works
- [ ] View modes switchable via swipe

---

### Phase 25 — Mobile Parity: Links, Command Bar, Plugins, AI

**Domain**: F. Mobile Parity
**Complexity**: Large
**Depends on**: Phases 5–6, 13–14, 16, 20

#### What to Build
Port the following to the Expo mobile app:
- **Bi-directional links** with auto-complete in mobile editor
- **Backlinks panel** on mobile (collapsible at bottom of note)
- **Command Bar** as long-press or search icon action
- **Plugin panel** as bottom sheet
- **Voice capture** integrated into quick capture FAB
- **AI actions** accessible from note editor toolbar and long-press on tasks

#### Affected Files
- `tempo-app/apps/mobile/app/` — Multiple screens
- `tempo-app/apps/mobile/components/` — Command bar, plugin sheet, voice capture

#### Acceptance Criteria
- [ ] Wiki-links with auto-complete on mobile
- [ ] Backlinks panel collapsible on mobile
- [ ] Command Bar via long-press/search icon
- [ ] Plugin bottom sheet functional
- [ ] Voice capture in FAB
- [ ] AI actions on editor toolbar + task long-press

---

### Phase 26 — Settings Expansion + Final Polish

**Domain**: G. Settings & Polish
**Complexity**: Medium
**Depends on**: All previous phases

#### What to Build
- Add all remaining **Settings toggles**:
  - Layout preference: Unified vs. Separate tabs (if not done in Phase 3)
  - Default period note template per period type
  - AI auto-categorize toggle (if not done in Phase 15)
  - Voice transcription model selection
  - Plugin management (enable/disable per plugin)
  - Notification preferences (reminder lead time)
  - Memory reset / export
- **Final QA pass** across all pages, web and mobile.
- Ensure **Settings page** provides clean navigation to all feature areas.

#### Affected Files
- `artifacts/tempo/src/pages/Settings.tsx` — New sections
- `artifacts/api-server/src/routes/preferences.ts` — New fields
- `lib/db/src/schema.ts` — Extended preferences

#### Acceptance Criteria
- [ ] All settings toggles present and functional
- [ ] Memory reset and export work
- [ ] All features accessible from Settings navigation
- [ ] Full QA pass completed (no broken pages, no console errors)

---

## Dependency Graph

```
Phase 1 (Day View)
├── Phase 2 (Time Block D&D) → Phase 11 (Task Drag to Calendar)
└── Phase 3 (Unified Layout + Notifications)

Phase 4 (Period Notes) → Phase 12 (Templates Full)

Phase 5 (Markdown Editor)
├── Phase 6 (Auto-complete Links)
└── Phase 16 (AI Rewrite/Summarize) → Phase 22 (Deep Think)

Phase 7 (Views: Notes) → Phase 8 (Views: Projects)

Phase 9 (Task: Recurring/Sub-items)   [independent]
Phase 10 (Task: >today + Search)      [independent]

Phase 12 (Templates) ─┐
Phase 13 (Plugins) ────┤→ Phase 14 (Command Bar Full)
                       │
Phase 15 (AI Auto-Cat) → Phase 19 (AI Priority)
Phase 17 (AI Extract)  [independent]
Phase 18 (AI Plan)  ───┤→ Phase 21 (AI Memory Auto)
Phase 20 (AI Voice) ───┘

Phase 23 (Dark Mode) [independent]

Phases 1–4, 7–8 → Phase 24 (Mobile Core)
Phases 5–6, 13–14, 16, 20 → Phase 25 (Mobile AI+Links)

All → Phase 26 (Settings + Polish)
```

---

## File Index

### Pages (Web — `artifacts/tempo/src/pages/`)
| File | Phases Affected |
|---|---|
| `Calendar.tsx` | 1, 2, 3, 11 |
| `NoteEditor.tsx` | 5, 6, 12, 16, 17 |
| `PeriodNotes.tsx` | 4, 12 |
| `DailyPlan.tsx` | 18, 21 |
| `TodayView.tsx` | 11, 19 |
| `Notes.tsx` | 7 |
| `Projects.tsx` | 8 |
| `Inbox.tsx` | 11, 17, 19, 20 |
| `NoteTemplates.tsx` | 12 |
| `Settings.tsx` | 3, 15, 20, 23, 26 |
| `Memories.tsx` | 21 |
| `TaskFilters.tsx` | 8, 10 |
| `TaskDetail.tsx` | 9, 15 |
| `Chat.tsx` | — (already complete) |

### Components (Web — `artifacts/tempo/src/components/`)
| File | Phases Affected |
|---|---|
| `CommandBar.tsx` | 14, 20 |
| `TaskCard.tsx` | 2, 9, 11, 19 |
| `VoiceNote.tsx` | 20 |
| `QuickCapture.tsx` | 14 |
| `layout/AppLayout.tsx` | 13 |

### Backend (`artifacts/api-server/src/routes/`)
| File | Phases Affected |
|---|---|
| `ai.ts` | 12, 15, 16, 18, 19, 21, 22 |
| `tasks.ts` | 1, 9, 10, 11 |
| `notes.ts` | 4, 5, 6 |
| `calendarEvents.ts` | 1 |
| `preferences.ts` | 3, 15, 20, 26 |
| `noteTemplates.ts` | 12 |
| `search.ts` | 10 |
| `transcribe.ts` | 20 |
| `noteLinks.ts` | 6 |

### Shared Libraries (`lib/`)
| File | Phases Affected |
|---|---|
| `api-spec/openapi.yaml` | 1, 4, 5, 9 |
| `db/src/schema.ts` | 3, 4, 5, 9, 26 |

---

## Out of Scope

The following are explicitly **not** included in this roadmap:

- External calendar sync (Google Calendar, Outlook) — planned for Gamma/MVP phase
- Apple Reminders sync — future
- Teamspaces / collaboration — post-MVP
- Large knowledge base ingestion (YouTube, PDFs at scale) — post-MVP
- Plugin marketplace with community submissions — post-MVP (registry is internal/curated only)
- MCP server for external AI agent control — post-MVP
- Evernote/Obsidian importer — post-MVP
- Web clipper — post-MVP

---

## Recommended Execution Order

For maximum value delivery with minimal blocking, the recommended execution order is:

1. **Wave 1 (Independent foundations)**: Phases 4, 5, 7, 9, 10, 13, 15, 23
2. **Wave 2 (Build on Wave 1)**: Phases 1, 6, 8, 12, 16, 17, 18
3. **Wave 3 (Integration)**: Phases 2, 3, 11, 14, 19, 20, 21, 22
4. **Wave 4 (Mobile + Polish)**: Phases 24, 25, 26

This order ensures no phase is blocked by unfinished dependencies and allows parallel execution within each wave.
