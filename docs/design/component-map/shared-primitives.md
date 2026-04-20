# Shared primitives — component map (Tier A / B mix)

**@target package:** `packages/ui/src/`  
**@source:** `design-system/components.jsx`, `coach-dock.jsx`, `voice-chat.jsx`, `ios-frame.jsx`  
**@prd:** §14 Design system summary; §8–§9 Coach + voice.

---

## Icon (`I.*`)

- **@source:** `components.jsx` L6–91  
- **@summary:** Lucide-style stroke icons; used app-wide.  
- **@action:** none (presentational)

---

## BrandMark / Wordmark

- **@source:** `components.jsx` L93–110  
- **@prd:** brand  
- **@summary:** Logo lockup for shell + marketing.

---

## AppProvider / useApp

- **@source:** `components.jsx` L112–160  
- **@summary:** Design-only screen state + theme mirror; **replace** with Next.js router + theme in app.  
- **@mutation:** N/A — context wiring only

---

## Sidebar

- **@source:** `components.jsx` L173–211  
- **@prd:** §4 navigation IA  
- **@summary:** `NAV` groups; `setScreen(id)` in prototype.

### Interactive

- Nav button — `@action: navigate` · `@navigate: /{slug}` in app  
- Ask the Founder — `@navigate: /ask-founder`  
- Badge counts — `@query: tasks.inboxCount`

---

## Topbar

- **@source:** `components.jsx` L277–296  
- **@summary:** Breadcrumb, optional `right` slot, search, notifications, theme cycle.

### Interactive

- Search — `@action: openSearchOverlay` · `@navigate: /search`  
- Notifications — `@navigate: /notifications`  
- Theme toggle — `@mutation: settings.setTheme` (cycles light/dark/system)

---

## Ring

- **@source:** `components.jsx` L299–314  
- **@summary:** Circular progress for habits / completion.

---

## Pill

- **@source:** `components.jsx` L316–320  
- **@summary:** Status chips (energy, tags, online).

---

## TaskRow

- **@source:** `components.jsx` L322–338  
- **@prd:** §4; §12  
- **@summary:** Checkbox, title, meta, AI pill.

### Interactive

- Row / check — `@action: completeTask` · `@mutation: tasks.complete` · `@optimistic:` toggle

---

## CoachBubble / UserBubble

- **@source:** `components.jsx` L341–351  
- **@prd:** §8  
- **@summary:** Chat affordances for Coach thread.

---

## AcceptStrip

- **@source:** `components.jsx` L354–363  
- **@prd:** §6 AI proposal; §1 confirm/undo  
- **@summary:** Accept / Tweak / Skip for AI suggestions.

### Interactive

- Accept — `@mutation: proposals.accept`  
- Tweak — `@action: openTweakComposer`  
- Skip — `@mutation: proposals.dismiss` · `@confirm:` undoable where required

---

## EnergyBar / ProgressBar

- **@source:** `components.jsx` L365–381  
- **@summary:** Visual-only in prototype; may bind to `user.energyCheckIn`.

---

## ReadAloudIndicator / ListenBtn

- **@source:** `components.jsx` L214–275  
- **@prd:** accessibility; TTS via `TempoTheme.speak`  
- **@summary:** Read-aloud toggle UX.

### Interactive

- Stop — `@action: TempoTheme.stopSpeaking`

---

## CoachDock (`coach-dock.jsx`)

- **@prd:** §8; §9; global FAB  
- **@summary:** FAB ⌘J; Coach tab + Brain dump tab; `open full` → coach screen.

### Interactive

- FAB open/close — `@action: toggleCoachDock`  
- Tab Chat / Brain dump — `@action: setDockTab`  
- CoachTab send — `@action-call: coach.sendMessage`  
- Walkie / Voice buttons — `@action:` `__vcOpen('walkie'|'voice')`  
- Quick pills — `@action: coachQuickAction`  
- Brain dump triage — `@mutation: brainDump.submitTriage`

---

## Voice overlays (`voice-chat.jsx`)

- **@prd:** §9 Voice feature spec  
- **@summary:** `VCWalkieTalkie`, `VCVoiceMode`, `VCGlobalRoot`, waveform.

### Interactive

- Hold to record — `@action-call: voice.pushToTalk`  
- Leave / mute / end — `@action: endVoiceSession`  
- **@analytics:** minute usage toward tier caps (product)

---

## iOSFrame

- **@source:** `ios-frame.jsx`  
- **@summary:** Preview-only; not shipped to production UI.
