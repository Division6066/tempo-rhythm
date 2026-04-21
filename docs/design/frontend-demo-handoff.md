# Frontend demo handoff — T-0023

Source of truth for the "frontend is demoable, backend is next" state of the
Tempo Flow monorepo. Paired files:

- `docs/design/screen-inventory.md` — 42 web + 12 mobile screens expected.
- `docs/design/pseudo-code-conventions.md` — the tag vocabulary every interactive element carries.
- `docs/design/backend-wiring-spec.md` — dedup'd rows of every `@convex-*-needed`, `@provider-needed`, `@schema-delta` pulled from the UI.
- `docs/design/frontend-parity-audit.md` — automated audit of routes + tags.
- `docs/design/frontend-backend-handoff-stages.md` — staged wiring plan (auth → flow/library → you/settings → schema cleanup).
- `docs/design/demo-evidence/INDEX.md` — Playwright screenshots (42 × 2 viewports).

## TL;DR

- **All 42 web routes render a real product UI** (not metadata placeholder cards).
- **All 12 React Native routes render a real product UI** with mock data.
- Every interactive element carries `@behavior` + ≥1 of `@convex-{query,mutation,action}-needed | @navigate`.
- Demo mode short-circuits auth so every route is reachable without a Convex backend.
- Hard evidence: 84 Playwright PNGs (42 web-desktop + 42 web-mobile) all returning HTTP 200 under `docs/design/demo-evidence/`.

## How to run the demo locally

### Prereqs

```sh
git clone https://github.com/Division6066/tempo-rhythm
cd tempo-rhythm
git submodule update --init --recursive   # pulls docs/brain
bun install
```

### 1. Desktop + mobile web (Next.js PWA)

```sh
# Demo mode: no Convex, no auth, every route clickable
NEXT_PUBLIC_DEMO_MODE=1 bun run --filter tempo-rhythm-web dev
```

Open:

- http://127.0.0.1:3000/ — landing
- http://127.0.0.1:3000/today — the app shell's daily canvas
- http://127.0.0.1:3000/command — full index of every route
- press `⌘K` / `Ctrl+K` inside the app to jump to any screen

For mobile web, use Chrome DevTools device toolbar (Cmd+Shift+M) and pick an iPhone preset — the layout stacks into one column automatically.

### 2. React Native / Expo (mobile)

```sh
# Start Expo (Metro bundler)
bun run --filter tempo-rhythm-mobile dev

# Or for Expo web preview on desktop:
cd apps/mobile && bun x expo start --web
```

Then either:

- Install **Expo Go** on your phone, scan the QR code.
- Run an Android Emulator: `cd apps/mobile && bun x expo run:android`.
- Mac users: `cd apps/mobile && bun x expo run:ios`.

The app will boot into `(auth)/onboarding.tsx` → tap Continue through 5 steps → lands in the `(tempo)/(tabs)/today` tab. From there: Today · Coach · Tasks · Notes, plus modal capture and stack routes (journal, calendar, habits, routines, templates, settings).

### 3. Regenerate docs + evidence

```sh
bun scripts/docs/generate-html-screen-previews.ts
bun scripts/docs/consolidate-backend-wiring-spec.ts
bun scripts/docs/audit-frontend-screen-parity.ts

# Playwright evidence (requires demo-mode dev server running on :3000):
bun x playwright install chromium   # one-time
bun scripts/demo/playwright-demo-capture.ts
```

### 4. Quality gates

```sh
bun run --filter tempo-rhythm-web typecheck
bun run --filter tempo-rhythm-mobile typecheck
bun run lint --filter tempo-rhythm-web
bun run lint --filter tempo-rhythm-mobile
```

All four commands pass green on this branch.

## What's done — status split

### a) Visually verified (screenshot in `docs/design/demo-evidence/web-desktop/`)

All 42 web routes, captured via Playwright at 1440×900 + 390×844.

- **Marketing**: landing, about, changelog
- **Onboarding**: sign-in, onboarding
- **Flow**: today, daily-note, brain-dump, coach, plan
- **Library**: tasks, notes, note-detail, journal, calendar, habits, habit-detail, routines, routine-detail, goals, goal-detail, goals-progress, projects, project-detail, project-kanban
- **You**: insights (analytics), activity, templates, template-builder, template-run, template-editor, template-sketch, search, command, empty-states
- **Settings**: settings/profile, settings/preferences, settings/integrations, billing, billing/trial-end, notifications, ask-founder

### b) Compile-verified only (mobile RN shell — no screenshots on this VM)

All 12 React Native routes pass `bun run --filter tempo-rhythm-mobile typecheck` + `lint`. Screens use `@tempo/mock-data`, carry pseudocode tags, and the onboarding flow routes into Today on finish.

- today (tab), coach (tab), tasks (tab), notes (tab), capture (modal), journal, habits, calendar, routines, templates, settings, (auth)/onboarding

Screenshots of the RN bundle require a physical device (Expo Go) or emulator. Static HTML previews mirroring each RN screen's structure are at `docs/design/generated-html/mobile/<slug>.html`.

### c) Still incomplete / known gaps

- **Expo on-device evidence not captured** — this cloud VM can't run Expo Go or a simulator. Run `bun run --filter tempo-rhythm-mobile dev` locally and scan the QR to see the RN app on your phone.
- **RTL mirroring for right-to-left locales** — not visually verified, likely needs a polish pass when the copy run happens.
- **Drag-and-drop** on Kanban and Plan-staging — currently implemented as buttons (`→ Stage`, `← Unstage`, lane advance). Real drag wiring (dnd-kit for web, gesture handler for RN) is deferred.
- **Playwright capture for Expo web** — not included in the automated script because Metro can sometimes require a second boot. Manual eyeball works.

## How pseudocode tags work (for the backend wiring run)

Every interactive element in `apps/web/**/*.tsx` and `apps/mobile/**/*.tsx` has a JSX comment block directly above it. The block always includes:

- `@behavior` — plain English description of what the button *should* do.
- At least one of:
  - `@convex-query-needed: foo.listX`
  - `@convex-mutation-needed: foo.doY`
  - `@convex-action-needed: foo.callZ`
  - `@navigate: /route/or/expression`

Plus optional context tags where they matter: `@provider-needed: openrouter|revenuecat|convex-auth|google-calendar|...`, `@schema-delta: tableName.fieldName`, `@tier-caps: basic 30/pro 90/max 180`, `@confirm: undoable 5s`.

### Grep recipes

```sh
# Everything that needs a Convex mutation, grouped by slug:
rg "@convex-mutation-needed:" apps

# Every UI control implying an OpenRouter call:
rg "@provider-needed: openrouter" apps

# Every schema delta the UI assumes:
rg "@schema-delta:" apps

# Unresolved navigation targets (sanity check):
rg "@navigate:" apps

# Per-screen wiring summary lives in each page.tsx header:
rg "@queries:|@mutations:|@actions:|@providers:" apps/web/app/\(tempo\)
```

## Backend-wiring playbook — the next session

Recommended stages (mirrors `frontend-backend-handoff-stages.md`).

### Stage 1 — Foundation (auth + users)

1. Set `NEXT_PUBLIC_CONVEX_URL` in `.env.local` → real Convex URL.
2. `cd convex && bun x convex dev`.
3. Flip `NEXT_PUBLIC_DEMO_MODE` off (unset or `0`).
4. Wire: `auth.currentUserIdentity`, `auth.signIn`, `users.completeOnboarding`, `users.startOnboardingSession`.
5. Verify: `/sign-in` → real form → `/today` loads; middleware redirects unknown sessions to `/sign-in`; onboarding flow completes to `/today`.
6. Delete the `IS_DEMO_MODE` dead branch inside `apps/web/middleware.ts` + `providers.tsx` only after a green run, and only if you intend to lose the demo fallback. Keep it behind the env flag otherwise.

### Stage 2 — Flow + Library (hero product path)

Wire queries + mutations in this order (each already has its tag block in source):

- `tasks.listToday`, `tasks.complete`, `tasks.captureQuickAdd`, `tasks.rescheduleToToday`
- `plans.getTodayPlan`, `plans.stageTask`, `plans.unstageTask`, `plans.commitPlan`, `plans.setEnergyCheckIn`
- `brainDumps.processCapture` (action, OpenRouter), `brainDumps.acceptProposal`, `brainDumps.discardProposal`
- `coach.sendMessage` (streaming action), `coach.acceptSuggestion`, `coach.dismissSuggestion`, `profiles.setCoachDial`
- `notes.listAll`, `notes.byId`, `notes.createBlank`, `notes.updateBody`, `notes.renameTitle`, `notes.extractActions` (action)
- `journalEntries.listRecent`, `journalEntries.saveDraft`, `journalEntries.commitEntry`, `journalEntries.getDailyPrompt`
- `calendar.listForDate`, `calendar.listRange`, `calendar.createEvent`, `calendar.scheduleFromIntake`
- `habits.listAll`, `habits.logCompletion`, `habits.undoCompletion`, `habits.updateSettings`
- `routines.listAll`, `routines.startRun`, `routines.logStepComplete`, `routines.skipStep`, `routines.pauseRun`, `routines.endRun`
- `goals.listAll`, `goals.create`, `goals.addMilestone`, `goals.toggleMilestoneDone`, `goals.coachDecompose` (action)
- `projects.listAll`, `projects.byId`, `projects.create`, `kanban.moveCard`

### Stage 3 — You / Settings / providers

- `analytics.*`, `activity.listByType`, `search.unified`
- `templates.listAll`, `templates.startRun`, `templates.parseSketch` (action, OpenRouter vision), `templates.createFromSketch`
- `profiles.savePreferences`, `profiles.setNotificationPreference`, `profiles.setQuietHours`, `profiles.setThemePreference`
- `integrations.connect/revoke` (OAuth providers), `billing.*` (RevenueCat server-side webhooks)
- `founderInbox.*`, `notifications.*`

### Stage 4 — Schema deltas + cleanup

`docs/design/backend-wiring-spec.md` lists every `@schema-delta` referenced from the UI. Walk them, reconcile with `convex/schema.ts`, migrate.

## Next-session prompt (paste into a new chat)

> Continue from `cursor/t-0023-long-session-prep-eb1c` after the frontend demo
> handoff. The frontend is complete. Now execute backend wiring:
>
> 1. Read `docs/design/frontend-demo-handoff.md` and
>    `docs/design/frontend-backend-handoff-stages.md`.
> 2. Set `NEXT_PUBLIC_CONVEX_URL` in `.env.local` and start `npx convex dev`.
> 3. Complete Stage 1 (auth + onboarding) end-to-end. Manual QA: sign-in → today,
>    onboarding → today. Commit after each mutation lands.
> 4. Complete Stage 2 (flow + library) in the order listed in the handoff doc.
>    For every `@convex-mutation-needed` tag, create the mutation in
>    `convex/<vertical>.ts`, replace the `useDemoToast` call with the real
>    `useMutation(api.<vertical>.<name>)`. Keep the JSX comment tags updated to
>    reflect the real function names rather than deleting them.
> 5. Stages 3 + 4 per the handoff doc.
> 6. Do NOT bypass HARD_RULES §2 (no forbidden tech), §3 (RAM-only scanners),
>    §6 (accept/reject for AI mutations), §12 (PR not to master).
>
> Each stage ends with: regenerate parity audit + consolidate wiring spec +
> open a PR.

## Links

- Branch: `cursor/t-0023-long-session-prep-eb1c`
- PR: https://github.com/Division6066/tempo-rhythm/pull/16
- Evidence: `docs/design/demo-evidence/INDEX.md` + PNGs under `web-desktop/` + `web-mobile/`
- Audit: `docs/design/frontend-parity-audit.md` (42/42 + 12/12, zero tag gaps)
- Wiring spec: `docs/design/backend-wiring-spec.md`
- Handoff stages: `docs/design/frontend-backend-handoff-stages.md`
- Pseudocode conventions: `docs/design/pseudo-code-conventions.md`
