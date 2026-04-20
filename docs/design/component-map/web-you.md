# You (insights & templates) — component map (Tier B)

**@category:** You  
**@prd:** §4; §6 AI surfaces; §10 Template system; §15 paywall hints on template runs.

---

## analytics

- **@screen:** analytics (`insights`)  
- **@route:** `(tempo)/insights/page.tsx`  
- **@source:** `screens-5.jsx`  
- **@prd:** §4; §17 Analytics (PostHog opt-in)  
- **@summary:** Charts and trends.

### Interactive (stub)

- Date range — `@action: setInsightsRange` · `@analytics: insights_date_changed` (opt-in)

---

## activity

- **@screen:** activity  
- **@route:** `(tempo)/activity/page.tsx`  
- **@source:** `screens-5.jsx`  
- **@prd:** §4; §17  
- **@summary:** Recent activity feed.

### Interactive (stub)

- Row — `@navigate: contextual deep link`

---

## templates

- **@screen:** templates  
- **@route:** `(tempo)/templates/page.tsx`  
- **@source:** `screens-templates.jsx`  
- **@prd:** §10 Template system  
- **@summary:** Template gallery; run / edit entry points.

### Interactive (stub)

- Run template — `@navigate: /templates/run/[id]`

---

## template-builder

- **@screen:** template-builder  
- **@route:** `(tempo)/templates/builder/page.tsx`  
- **@source:** `screens-template-builder.jsx`, `-ui.jsx`, `-slash.jsx`  
- **@prd:** §10; §6 natural-language + slash commands  
- **@summary:** Bare builder shell; slash AI, block UI.

### Interactive (stub)

- Slash command — `@action-call: templates.aiExpandBlock` (proposal pattern)

---

## template-run

- **@screen:** template-run  
- **@route:** `(tempo)/templates/run/[id]/page.tsx`  
- **@source:** `screens-template-run.jsx`  
- **@prd:** §10; §15 if paywalled  
- **@summary:** Execute template flow.

### Interactive (stub)

- Complete step — `@mutation: templateRuns.completeStep`

---

## template-editor

- **@screen:** template-editor  
- **@route:** `(tempo)/templates/editor/[id]/page.tsx`  
- **@source:** `screens-5.jsx`  
- **@prd:** §10  
- **@summary:** Legacy editor path.

### Interactive (stub)

- Save — `@mutation: templates.update`

---

## template-sketch

- **@screen:** template-sketch  
- **@route:** `(tempo)/templates/sketch/page.tsx`  
- **@source:** `screens-5.jsx`  
- **@prd:** §10 picture-sketch generator  
- **@summary:** Sketch → template proposal.

### Interactive (stub)

- Submit sketch — `@action-call: templates.generateFromSketch`

---

## search

- **@screen:** search  
- **@route:** `(tempo)/search/page.tsx`  
- **@source:** `screens-5.jsx`  
- **@prd:** §4; §11 RAG-assisted search (product decision)  
- **@summary:** Global search results.

### Interactive (stub)

- Query submit — `@query: search.global({ q })`

---

## command

- **@screen:** command  
- **@route:** `(tempo)/command/page.tsx`  
- **@source:** `screens-5.jsx`  
- **@prd:** §4; §6  
- **@summary:** Command bar / palette full-page variant.

### Interactive (stub)

- Execute — `@action: runCommand`

---

## empty-states

- **@screen:** empty-states  
- **@route:** `(tempo)/empty-states/page.tsx`  
- **@source:** `screens-6.jsx`  
- **@prd:** §4; brand empty/error patterns  
- **@summary:** Showcase of empty states for QA.

### Interactive (stub)

- Preview only — no live mutations
