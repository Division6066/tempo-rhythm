# Mobile — component map (Tier B)

**@category:** Mobile (Expo)  
**@source:** `design-system/mobile/mobile-screens-a.jsx`, `mobile-screens-b.jsx`, `mobile-shell.jsx`  
**@prd:** §4 parity with web where applicable; §9 Voice on Coach; shell in `mobile-shell.jsx`.

---

## today

- **@screen:** today  
- **@route:** `apps/mobile/app/(tempo)/(tabs)/today.tsx`  
- **@source:** `MobileToday`  
- **@prd:** §4  
- **@summary:** Week rail, coach card, energy chips, today note, time blocks, evening prompt.

### Interactive (stub)

- Week day select — `@action: selectDay`  
- Search / calendar icons — `@navigate:` `/search`, `/calendar`  
- Task rows — `@mutation: tasks.complete`  
- Re-plan — `@navigate: planning flow`

---

## capture

- **@screen:** capture  
- **@route:** `(tempo)/capture.tsx`  
- **@source:** Composer row in `MobileBrainDump` / quick capture patterns in `mobile-screens-a.jsx`  
- **@prd:** §4 quick capture  
- **@summary:** Modal or route for fast task/note capture.

### Interactive (stub)

- Mic — `@action-call: voice.transcribe` (RAM-only per `HARD_RULES`)  
- Submit — `@mutation: captures.create`

---

## coach

- **@screen:** coach  
- **@route:** `(tempo)/(tabs)/coach.tsx`  
- **@source:** `MobileCoachScreen`  
- **@prd:** §8; §9 walkie  
- **@summary:** Full-screen coach thread; extraction card; composer + mic.

### Interactive (stub)

- Send — `@action-call: coach.sendMessage`  
- Pills — `@action: injectPrompt`  
- Add all to today — `@mutation: tasks.bulkCreate`

---

## tasks

- **@screen:** tasks  
- **@route:** `(tempo)/(tabs)/tasks.tsx`  
- **@source:** `MobileTasks`  
- **@prd:** §4; §12  
- **@summary:** Search, filters, grouped sections, FAB new task.

### Interactive (stub)

- Filter chips — `@query: tasks.list`  
- New task FAB — `@mutation: tasks.create`

---

## notes

- **@screen:** notes  
- **@route:** `(tempo)/(tabs)/notes.tsx`  
- **@source:** `mobile-screens-a.jsx` (if separate) — confirm in source tree  
- **@prd:** §13  
- **@summary:** Notes list / entry.

### Interactive (stub)

- Open note — `@navigate: detail`

---

## journal

- **@screen:** journal  
- **@route:** `(tempo)/journal.tsx`  
- **@source:** `MobileJournal`  
- **@prd:** §4; §16 encryption copy  
- **@summary:** Entries feed, prompts.

### Interactive (stub)

- Start writing — `@navigate: editor`

---

## habits

- **@screen:** habits  
- **@route:** `(tempo)/habits.tsx`  
- **@source:** `mobile-screens-b.jsx`  
- **@prd:** §4  
- **@summary:** Habits list / rings.

### Interactive (stub)

- Log — `@mutation: habitCompletions.log`

---

## calendar

- **@screen:** calendar  
- **@route:** `(tempo)/calendar.tsx`  
- **@source:** `mobile-screens-b.jsx`  
- **@prd:** §4  
- **@summary:** Mobile month/agenda.

### Interactive (stub)

- Create — `@mutation: calendarEvents.create`

---

## routines

- **@screen:** routines  
- **@route:** `(tempo)/routines.tsx`  
- **@source:** `mobile-screens-b.jsx`  
- **@prd:** §4; §13  
- **@summary:** Routine list.

### Interactive (stub)

- Start — `@navigate: /routines/[id]`

---

## templates

- **@screen:** templates  
- **@route:** `(tempo)/templates.tsx`  
- **@source:** `mobile-screens-b.jsx`  
- **@prd:** §10  
- **@summary:** Template picker.

### Interactive (stub)

- Run — `@navigate: run flow`

---

## settings

- **@screen:** settings  
- **@route:** `(tempo)/settings.tsx`  
- **@source:** `mobile-screens-b.jsx`  
- **@prd:** §4; §15; §16  
- **@summary:** Mobile settings hub.

### Interactive (stub)

- AI & Coach row — `@navigate: /settings/ai` (when exists)

---

## onboarding (mobile)

- **@screen:** onboarding  
- **@route:** `(auth)/onboarding.tsx`  
- **@source:** `mobile-screens-b.jsx`  
- **@prd:** §4  
- **@summary:** Mobile-first onboarding flow.

### Interactive (stub)

- Complete — `@mutation: users.completeOnboarding`

---

## Shell primitives (see also `shared-primitives.md`)

- **TabBar** — `@navigate:` tab routes  
- **ChatBall / CoachPanel** — `@action:` open coach overlay (`mobile-shell.jsx`)  
- **Walkie entry** — `@action:` `window.__vcOpen` pattern mirrored on native
