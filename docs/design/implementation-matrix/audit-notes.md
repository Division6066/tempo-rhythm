# Audit Notes — `claude/ui-prototype-route-inventory`

> Findings from the matrix run that need a human or another agent to resolve.
> Generated 2026-04-26.

---

## PR #21 references — status: stale unless verified

`docs/SHIP_STATE.md` and `docs/phase4-brain-dump-validation.md` reference
`PR #21` in evidentiary / state-of-the-world claims. Locations:

- `docs/SHIP_STATE.md:21` — `/today route … PR #21 still open at ed39e45 …`
- `docs/phase4-brain-dump-validation.md:15` — `PR #21: OPEN, mergeStateStatus=BLOCKED …`
- `docs/phase4-brain-dump-validation.md:235` — `PR #21 state: OPEN, merge status BLOCKED, latest observed head 1631d4d …`
- `docs/QA/pr21-local-merge-gate-evidence-2026-04-25.md` — entire file
- `docs/QA/phase3-audit-2026-04-24.md` — referenced in audit

**Verification done by this run:** none. This agent cannot query the
GitHub API and the PR state may have moved. **Insufficient evidence**
to revise the claims.

**Suggested next step (Amit / Codex desktop):**

1. `gh pr view 21 --json state,mergeStateStatus,mergeable,mergedAt,closedAt`
2. If merged or closed, replace the `PR #21 still open` language in
   `SHIP_STATE.md` with the resolved state, plus the merge SHA if
   merged.
3. If still open and now older than the matrix run date (2026-04-26),
   re-evaluate whether `/today` should remain `locally-tested` in
   `SHIP_STATE.md`.

---

## Source-file drift in scaffold pages — fixed by this run

Twenty-six page scaffolds in `apps/web/app/**/page.tsx` previously
declared `@source: …/screens-N.jsx` values that did not match the
prototype source files. The bulk fix-up rewrote every scaffold from the
canonical generator `scripts/gen-route-scaffolds.ts`, which now points
each scaffold at the correct `screens-N.jsx#ScreenFoo` symbol. Rerun:

```bash
bun run scripts/gen-route-scaffolds.ts
```

Idempotent — only files still tagged `@generated-by: T-F004 scaffold`
are overwritten.

The `today` page (the only "diverged" entry in the run output) was
intentionally skipped because it has been ported to a real `TodayScreen`
and is no longer a scaffold.

---

## (bare)/sign-in collision — fixed by this run

`scripts/gen-route-scaffolds.ts` previously listed
`(bare)/sign-in/page.tsx` as a scaffold target, which would conflict
with the real `apps/web/app/sign-in/page.tsx` (Convex Auth, PR #19).
Removed the entry from the generator and deleted the spuriously
generated directory.

---

## Missing `tempo-nav.ts` entries — added by this run

The following screens have routes in the repo but were missing from
`apps/web/lib/tempo-nav.ts` and therefore could not be reached via the
⌘K palette:

`note-detail`, `habit-detail`, `routine-detail`, `goal-detail`,
`goals-progress`, `project-detail`, `project-kanban`, `command`,
`template-editor`, `template-sketch`.

Added with `dynamic: true` (detail routes) and `deprecated: true`
(`template-editor`, `template-sketch`) so they're filtered out of
the sidebar but visible in the palette where useful.

---

## Components flagged "missing" — needs Phase 0 follow-up

See `components.json` for the full list. The blockers for screen-port
work are:

- `AcceptStrip` (HARD_RULES §6.2 — every AI mutation needs this)
- `ProgressBar`, `EnergyBar`
- `ReadAloudIndicator`, `ListenBtn`
- All `*-bg` semantic tone backgrounds, layout tokens, shadow tokens

Owner: `claude-ui-pkg`.

---

## Tokens flagged "missing" — needs Phase 0 follow-up

See `tokens.json` for the full list. The most impactful gaps:

- `shadow-whisper`, `shadow-card`, `shadow-lift`, `shadow-modal`
  (used everywhere in the prototype CSS).
- Marketing gradient `mkt-feat-warm`.
- Layout tokens `container`, `sidebar-w`, `topbar-h` (currently
  hardcoded to Tailwind utilities `w-64`, `h-14`, etc).

Owner: `claude-ui-pkg`.

---

## Insufficient-evidence flags

Restated here so they don't get lost in the screens.json:

- `mobile-paywall` — no prototype source; RevenueCat-driven; UX TBD.
- `mobile-calendar`, `mobile-routines` — no matching `Mobile<Name>`
  export found.
- Voice provider — HARD_RULES §6.1 mandates Mistral via fetch but
  voice-to-text vendor not specified.
- `voiceSessions` schema field set beyond `startedAt`/`endedAt`/`durationMs`.
- Onboarding step count (4 vs 5).
- Browser preview / production state of every web screen — see
  `docs/SHIP_STATE.md`. None of `screens.json` is `shipped` because
  none has crossed the four-mode bar.
