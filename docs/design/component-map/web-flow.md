# Flow screens (Tier A — full pseudocode)

**Source bundle:** `docs/design/claude-export/design-system/screens-1.jsx`, `screens-7.jsx` (daily note), `app.html` (`SCREENS`).

---

## daily-note

- **@screen:** daily-note
- **@category:** Flow
- **@source:** `design-system/screens-7.jsx` (`ScreenDailyNote`)
- **@route (web):** `apps/web/app/(tempo)/daily-note/page.tsx`
- **@prd:** §4 (Daily note / NotePlan-style canvas); §13 Library (notes, links); §6 AI (`/summarize`, slash commands); §11 RAG (linked mentions — conceptual)
- **@auth:** required
- **@summary:** Three-pane layout: calendar rail · markdown day note · right rail (rhythm, focus, time blocks, quick capture).

### Interactive components

- **Left rail — month prev/next**
  - @action: calendarPrevMonth / calendarNextMonth
  - @navigate: shift visible month in daily-note rail
  - @prd: §4

- **Left rail — day cell buttons (1–30)**
  - @action: selectDay
  - @query: notes.getDailyNote({ date })
  - @navigate: load `YYYY-MM-DD.md` body
  - @prd: §4

- **Left rail — Period notes (Today / This week / April / year)**
  - @action: openPeriodNote
  - @navigate: period aggregate note
  - @prd: §4

- **Left rail — Folders (Projects, Meetings, Journal, Inbox)**
  - @action: filterByFolder
  - @query: notes.listByFolder
  - @prd: §13

- **Left rail — Tag chips (#writing, …)**
  - @action: filterByTag
  - @query: tags.search
  - @prd: §12

- **Center topbar — back/forward (chevrons)**
  - @action: noteHistoryBack / noteHistoryForward
  - @prd: §4

- **Center topbar — Quick switch (⌘K)**
  - @action: openCommandPalette
  - @navigate: command palette overlay (`cmdOpen`)
  - @prd: §4; §6 (AI slash commands)

- **Command palette — search input**
  - @query: command.search({ query })
  - @action: runCommand (jump, pomodoro, AI summarize, tag search, insert link)
  - @streaming: `/summarize` via `@action-call` when selected
  - @prd: §6

- **Command palette — result rows**
  - @action: executePaletteItem
  - @navigate: per item metadata
  - @prd: §6

- **Share / Settings icon buttons**
  - @action: shareNote / openNoteSettings
  - @mutation: shares.create (if sharing)
  - @prd: §16 Compliance (export/share scope)

- **MD task rows — checkbox**
  - @action: toggleTaskInNote
  - @mutation: tasks.complete({ taskId }) or inline task id from block
  - @optimistic: strike + delight animation
  - @prd: §4; §7 Goblin surfaces

- **MD wiki-link `[[...]]`**
  - @navigate: /notes/... or graph target
  - @prd: §13

- **Backlinks card — row**
  - @navigate: open linked note file
  - @query: notes.backlinks({ noteId })
  - @prd: §11 RAG / graph (UX)

- **BreathBubble (focus nudge)**
  - @action: dismissBreathNudge / startBreathingExercise (optional)
  - @prd: §4 (accessibility / gentle nudge)

- **Right rail — Focus ring −5m / Pause / +5m**
  - @action: adjustFocusTimer / pauseFocusSession
  - @mutation: focusSessions.update (conceptual)
  - @prd: §4

- **Right rail — Time blocks + Add (+)**
  - @action: addTimeBlock
  - @mutation: calendarBlocks.create
  - @prd: §4

- **Right rail — Quick dump textarea**
  - @action: submitQuickCaptureToBrainDump
  - @mutation: brainDump.appendFromQuickCapture (proposal → approve)
  - @confirm: per HARD_RULES if creates tasks
  - @prd: §4; §6

- **Insert template buttons**
  - @action: insertTemplateSnippet
  - @query: templates.getSnippet
  - @prd: §10 Template system

---

## today

- **@screen:** today
- **@category:** Flow
- **@source:** `design-system/screens-1.jsx` (`ScreenToday`)
- **@route (web):** `apps/web/app/(tempo)/today/page.tsx`
- **@prd:** §4 Flow / Today; §6 AI (coach bubble); §7 Goblin (Magic ToDo / staging); §8 Coach; §12 Tagging
- **@auth:** required
- **@summary:** Greeting, anchors list, coach whisper, habits snapshot, up-next, pebble.

### Interactive components

- **Topbar — "Plan with Coach"**
  - @action: openCoachPlanner
  - @navigate: `plan` screen (`setScreen("plan")`)
  - @prd: §8

- **Ring + "Add" (anchors card)**
  - @action: openQuickAddTask
  - @mutation: tasks.capture (draft)
  - @prd: §4

- **TaskRow — row / checkbox**
  - @action: completeTask
  - @mutation: tasks.complete({ taskId })
  - @optimistic: toggle + fade
  - @prd: §4; §12

- **AcceptStrip (carry overdue)**
  - @action: carryOverdueTasks / letRest (dismiss)
  - @mutation: tasks.carryOver | tasks.snooze
  - @confirm: undoable 5s
  - @prd: §4; brand §14 (anti-shame copy)

- **CoachBubble + "Stage the outline" / "Not now"**
  - @action: acceptCoachSuggestion / dismissCoachSuggestion
  - @action-call: coach.proposeOutline (AI proposal, not direct write)
  - @confirm: preview accept/reject
  - @prd: §6; §8

- **Habits card / Up next / Pebble** (read-only in prototype — wire if tappable)
  - @query: habits.today, calendar.nextEvents
  - @prd: §4

---

## brain-dump

- **@screen:** brain-dump
- **@category:** Flow
- **@source:** `design-system/screens-1.jsx` (`ScreenBrainDump`)
- **@route (web):** `apps/web/app/(tempo)/brain-dump/page.tsx`
- **@prd:** §4 Brain Dump; §6 AI classification; §16 privacy; §7 (sorted items → tasks)
- **@auth:** required
- **@summary:** Free-text dump, sort into typed items, review/approve.

### Interactive components

- **Dictate icon (mic)**
  - @action: startDictation
  - @action-call: voice.transcribe (RAM-only per HARD_RULES — no raw persist)
  - @prd: §9

- **Textarea**
  - @mutation: brainDump.saveDraft (encrypted blob — product decision)
  - @prd: §16

- **"Sort it"**
  - @action: requestSortBrainDump
  - @action-call: ai.sortBrainDump → returns proposal rows
  - @prd: §6

- **Sorted row — Accept / Skip**
  - @action: acceptSortedItem / skipSortedItem
  - @mutation: tasks.create | notes.create | tags.apply (per type)
  - @confirm: batch "Approve all" uses proposal ledger
  - @prd: §6; §7

- **"Approve all" / "Skip all"**
  - @action: acceptAllSorted / skipAllSorted
  - @mutation: bulk proposal apply
  - @confirm: required
  - @prd: §6

---

## coach

- **@screen:** coach
- **@category:** Flow
- **@source:** `design-system/screens-1.jsx` (`ScreenCoach`); voice: `voice-chat.jsx`; dock: `coach-dock.jsx`
- **@route (web):** `apps/web/app/(tempo)/coach/page.tsx`
- **@prd:** §8 Coach personality; §6 AI messaging; §9 Voice; §11 scope/RAG
- **@auth:** required
- **@summary:** Threaded chat, composer, walkie + voice mode, personality dial, scope, chips.

### Interactive components

- **Composer textarea**
  - @action: sendCoachMessage
  - @action-call: coach.sendMessage (stream)
  - @streaming: token stream
  - @prd: §6; §8

- **Mic / Volume — opens `window.__vcOpen('walkie'|'voice')`**
  - @action: openWalkieTalkie / openVoiceMode
  - @action-call: voice sessions (see `voice-chat.jsx`)
  - @prd: §9

- **Send**
  - @action: sendCoachMessage
  - @prd: §6

- **Quick pills (Stage tasks / Draft journal / Review week)**
  - @action: injectCoachPromptPill
  - @action-call: coach.sendMessage with template
  - @prd: §8

- **Personality dial track (slider — static in prototype)**
  - @action: setCoachWarmth
  - @mutation: settings.setCoachPersonality({ level: 0–10 })
  - @prd: §8

- **Scope — Add to scope**
  - @action: openScopePicker
  - @mutation: coachThread.setScope({ noteIds, projectIds })
  - @prd: §11

- **Past conversations rows**
  - @navigate: /coach?thread=…
  - @query: coach.listThreads
  - @prd: §8

---

## plan

- **@screen:** plan
- **@category:** Flow
- **@source:** `design-system/screens-1.jsx` (`ScreenPlan`)
- **@route (web):** `apps/web/app/(tempo)/plan/page.tsx`
- **@prd:** §4 Planning / time blocking; §6 Coach re-plan; §8
- **@auth:** required
- **@summary:** Day/week toggle, AI re-plan, timeline blocks, energy + anchors + coach bubble.

### Interactive components

- **Seg control Day / Week**
  - @action: setPlanHorizon
  - @query: plans.getBlocks({ horizon })
  - @prd: §4

- **"Re-plan"**
  - @action: requestCoachReplan
  - @action-call: coach.replanDay
  - @confirm: preview diff before apply
  - @prd: §6; §8

- **Timeline blocks (absolute positioned)**
  - @action: selectBlock / dragBlock (future)
  - @mutation: calendarBlocks.update
  - @prd: §4

- **Energy bar + anchors list** (read-only display; editing is future)
  - @query: user.energyCheckIn, habits.anchors
  - @prd: §4

- **CoachBubble (sidebar)**
  - @query: coach.latestPlanComment
  - @prd: §8
