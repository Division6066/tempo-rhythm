# Library screens — component map (Tier B)

**@category:** Library  
**@prd:** §4 (42 screens — Library vertical); §13 Library system; §12 Tagging where lists expose tags.

Tier B: each screen has `@screen`, route, source, PRD refs, and stub affordances. Deep `@action` / `@mutation` tags land with the Next.js port (`T-0022` follow-up or per-route tickets).

---

## tasks

- **@screen:** tasks  
- **@route:** `apps/web/app/(tempo)/tasks/page.tsx`  
- **@source:** `design-system/screens-2.jsx` (`ScreenTasks`)  
- **@prd:** §4; §12; §7 Goblin (AI-flagged rows)  
- **@summary:** List/board/timeline switcher; tabs All/Today/Upcoming/Someday/Done; energy + tag filters; `TaskRow` list.

### Interactive (stub)

- View switcher — `@action: setTasksView` · `@navigate: same route, query view=`  
- Tabs — `@query: tasks.listFiltered`  
- New task — `@mutation: tasks.create`  
- Filter Energy / Tag — `@action: openFilterSheet`

---

## notes

- **@screen:** notes  
- **@route:** `(tempo)/notes/page.tsx`  
- **@source:** `screens-2.jsx`  
- **@prd:** §4; §13  
- **@summary:** Note list / capture entry to editor.

### Interactive (stub)

- New note — `@mutation: notes.create`  
- Row open — `@navigate: /notes/[id]`

---

## note-detail

- **@screen:** note-detail  
- **@route:** `(tempo)/notes/[id]/page.tsx`  
- **@source:** `screens-2.jsx`  
- **@prd:** §4; §13; §11 wiki-links / graph (if shown)  
- **@summary:** Markdown editor; wiki-links `[[...]]`.

### Interactive (stub)

- Editor onChange — `@mutation: notes.update`  
- Link insertion — `@action: insertWikiLink`

---

## journal

- **@screen:** journal  
- **@route:** `(tempo)/journal/page.tsx`  
- **@source:** `screens-2.jsx`  
- **@prd:** §4; §16 privacy copy for encrypted journal  
- **@summary:** Journal list + entry affordances.

### Interactive (stub)

- New entry — `@mutation: journalEntries.create`

---

## calendar

- **@screen:** calendar  
- **@route:** `(tempo)/calendar/page.tsx`  
- **@source:** `screens-3.jsx`  
- **@prd:** §4; in-app `calendarEvents` (MVP) vs §2 non-goals external sync  
- **@summary:** Month/week/day; time blocks.

### Interactive (stub)

- Create event — `@mutation: calendarEvents.create`  
- Navigate date — `@action: setCalendarDate`

---

## habits

- **@screen:** habits  
- **@route:** `(tempo)/habits/page.tsx`  
- **@source:** `screens-3.jsx`  
- **@prd:** §4  
- **@summary:** Habit list with streak / rings.

### Interactive (stub)

- Toggle completion — `@mutation: habitCompletions.log`  
- Open detail — `@navigate: /habits/[id]`

---

## habit-detail

- **@screen:** habit-detail  
- **@route:** `(tempo)/habits/[id]/page.tsx`  
- **@source:** `screens-3.jsx`  
- **@prd:** §4  
- **@summary:** Single habit history + edit.

### Interactive (stub)

- Edit — `@mutation: habits.update`

---

## routines

- **@screen:** routines  
- **@route:** `(tempo)/routines/page.tsx`  
- **@source:** `screens-3.jsx`  
- **@prd:** §4; §13 typed routine items  
- **@summary:** Routine list; start routine.

### Interactive (stub)

- Start — `@navigate: /routines/[id]`

---

## routine-detail

- **@screen:** routine-detail  
- **@route:** `(tempo)/routines/[id]/page.tsx`  
- **@source:** `screens-3.jsx`  
- **@prd:** §4  
- **@summary:** Guided steps checklist.

### Interactive (stub)

- Step check — `@mutation: routineRuns.advanceStep`

---

## goals

- **@screen:** goals  
- **@route:** `(tempo)/goals/page.tsx`  
- **@source:** `screens-4.jsx`  
- **@prd:** §4  
- **@summary:** Active goals grid/list.

### Interactive (stub)

- Add goal — `@mutation: goals.create`

---

## goal-detail

- **@screen:** goal-detail  
- **@route:** `(tempo)/goals/[id]/page.tsx`  
- **@source:** `screens-4.jsx`  
- **@prd:** §4  
- **@summary:** Goal detail + milestones.

### Interactive (stub)

- Edit milestone — `@mutation: goals.update`

---

## goals-progress

- **@screen:** goals-progress  
- **@route:** `(tempo)/goals/progress/page.tsx`  
- **@source:** `screens-4.jsx`  
- **@prd:** §4; §17 analytics (opt-in)  
- **@summary:** Chart / progress visualization.

### Interactive (stub)

- Range selector — `@action: setProgressRange` · `@analytics:` opt-in only

---

## projects

- **@screen:** projects  
- **@route:** `(tempo)/projects/page.tsx`  
- **@source:** `screens-4.jsx`  
- **@prd:** §4; §13  
- **@summary:** Project list.

### Interactive (stub)

- New project — `@mutation: projects.create`

---

## project-detail

- **@screen:** project-detail  
- **@route:** `(tempo)/projects/[id]/page.tsx`  
- **@source:** `screens-4.jsx`  
- **@prd:** §4  
- **@summary:** Project overview + linked tasks.

### Interactive (stub)

- Link task — `@mutation: tasks.setProject`

---

## project-kanban

- **@screen:** project-kanban  
- **@route:** `(tempo)/projects/[id]/kanban/page.tsx`  
- **@source:** `screens-4.jsx`  
- **@prd:** §4  
- **@summary:** Board columns by status.

### Interactive (stub)

- Card move — `@mutation: tasks.reorder` · `@optimistic:` column update
