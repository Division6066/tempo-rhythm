# UI Port — Merge Order & Ownership Boundaries

> **Audience:** every cloud agent that lands UI work on `tempo-rhythm`.
>
> **Promise:** if you respect the merge order, parallel agents won't
> stomp on each other and won't ship broken-on-master code.

---

## Phase order

The port is **not** a flat list of screens. The dependency graph forces this
ordering — earlier phases unblock later ones.

### Phase 0 — design-system foundation (must merge first)

**Owner:** `claude-ui-pkg`
**Blocks everyone else.**

1. `tokens.json` ↔ `globals.css` ↔ `packages/ui/src/theme/tokens.ts` reconciled
   (status: `ported` for every token; `missing` shadows + leadings + tracking
   pulled in).
2. Missing accessibility primitives: `ReadAloudIndicator`, `ListenBtn`,
   `AcceptStrip` shipped to `packages/ui/src/primitives/`.
3. Missing meters: `ProgressBar`, `EnergyBar`.
4. Native equivalents (`packages/ui/src/native/*`) audited; `BrandMark.native`,
   `Wordmark.native`, `Icon.native` confirmed exporting the same surface.

**Done means:** `bun run --cwd packages/ui build` clean, every primitive
exported from `@tempo/ui`, every entry in `tokens.json` has `status` ≠
`missing`.

### Phase 1 — app shell (must precede screen ports)

**Owner:** `claude-shell`

1. `Sidebar`, `Topbar`, `TempoShell`, `CommandPalette` parity-checked vs
   `screens.json`.
2. Add the **missing entries** to `apps/web/lib/tempo-nav.ts`:
   - `note-detail`, `habit-detail`, `routine-detail`, `goal-detail`,
     `goals-progress`, `project-detail`, `project-kanban`
   - `command`, `template-editor`, `template-sketch`
   - `mobile-*` (separate constants — they don't show in the desktop
     command palette).
   *(Done by this run — see commit history.)*
3. Confirm `(bare)` layout doesn't leak sidebar/topbar into pages with
   `bare: true`.

### Phase 2 — Flow screens (P0 / P1)

**Owner:** `claude-web-flow`

Order:
1. `today` (already partial — finish parity)
2. `brain-dump` (P0 — gates onboarding)
3. `daily-note`
4. `coach` (depends on `CoachDock` — Phase 3)
5. `plan` (depends on coach)

### Phase 3 — Coach + Voice components

**Owner:** `claude-coach`
**Runs in parallel with Phase 2 except for the `coach` and `plan`
screens that depend on it.**

1. `CoachDock`, `CoachTab`, `BrainDumpTab`, `CoachDotMark`, `FabBreath`.
2. Voice-chat components from `voice-chat.jsx`: walkie-talkie + live mode
   gated per HARD_RULES §9.
3. Mount points in `app/(tempo)/layout.tsx`.

### Phase 4 — Library screens

**Owner:** `claude-web-library`

Recommended order (matches user-need progression):
1. `tasks` (P0)
2. `notes` (+ `note-detail`)
3. `journal`
4. `habits` (+ `habit-detail`)
5. `routines` (+ `routine-detail`)
6. `calendar`
7. `goals` (+ `goal-detail`, `goals-progress`)
8. `projects` (+ `project-detail`, `project-kanban`)

### Phase 5 — Templates surface

**Owner:** `claude-web-templates`

1. Block-type registry (`TB_BLOCK_TYPES`) → `apps/web/components/templates/blockTypes.ts`.
2. `templates` index.
3. `template-builder` (canvas + palette + inspector + slash menu).
4. `template-run`.
5. **Skip** `template-editor` (legacy) and `template-sketch` (showcase) for
   Phase 1 launch.

### Phase 6 — You + Settings

**Owners:** `claude-web-you` (insights, activity, search, command,
empty-states), `claude-web-settings` (settings/profile, prefs,
integrations, billing, trial-end, ask-founder, notifications).

Lower priority than Flow/Library; can run in parallel.

### Phase 7 — Marketing + Onboarding

**Owner:** `claude-web-marketing` + `claude-web-onboarding`.
Runs **independently** of phases 2–6 because the routes are bare and
share zero shell.

### Phase 8 — Mobile

**Owner:** `claude-mobile` + `claude-mobile-ui`.
Mobile screens depend on `@tempo/ui/native/*` (Phase 0) but not on web
screens. Can ship in parallel with phases 2–6.

---

## Ownership boundaries (do-not-cross)

| Zone | Owner | Anyone else may… |
|---|---|---|
| `packages/ui/src/**` | `claude-ui-pkg` | Read; consume via `@tempo/ui`. **Do not** add new exports. If you need one, file a request in your checklist file. |
| `apps/web/lib/tempo-nav.ts` | `claude-web-1` (this matrix) | Read. **Do not** edit — the matrix is the source of truth and `tempo-nav.ts` is generated from it. |
| `apps/web/components/tempo/{Sidebar,Topbar,TempoShell,CommandPalette}.tsx` | `claude-shell` | Read; consume. |
| `apps/web/components/coach/**` (when created) | `claude-coach` | Read; consume. |
| `apps/web/components/today/**` | `claude-web-flow` | Read. Only the Flow agent edits these. |
| `apps/web/app/(tempo)/<your-route>/page.tsx` | the screen's `owner` per `screens.json` | Add cross-cutting dependencies (provider, layout) only with prior coordination. |
| `apps/mobile/app/**` | `claude-mobile` | Read. |
| `convex/**` | the agent listed for that mutation/action; default `claude-backend` | Add `@queries` / `@mutations` JSDoc comments referencing intended Convex calls; **do not** implement them. |
| `docs/HARD_RULES.md`, `docs/SHIP_STATE.md` | human-amit | Never edit silently. |

---

## Tiny compatibility fixes — the documented exception

This matrix run touches files outside its strict scope to keep the codebase
honest. All such edits are explicitly justified here so they can be reviewed:

| File | Edit | Justification |
|---|---|---|
| `apps/web/lib/tempo-nav.ts` | Add missing entries (`note-detail`, `habit-detail`, `routine-detail`, `goal-detail`, `goals-progress`, `project-detail`, `project-kanban`, `command`, `template-editor`, `template-sketch`). | These routes already exist as `page.tsx` files; not exposing them in `tempo-nav.ts` means the ⌘K palette can't reach them. Pure data-only change, no behavior shift. |
| `apps/web/app/(tempo)/<various>/page.tsx` | Update `@source:` comments to point at the correct `screens-N.jsx`. | Comment-only change. Removes stale references that would mislead the porting agent. |
| `apps/web/app/(bare)/daily-note/page.tsx` | Update `@source:` to `screens-7.jsx`. | Same. |
| `docs/design/screen-inventory.md` | Add a "stale — see implementation-matrix" banner; do not delete. | Backwards compatibility for any agent following the old path. |

If your PR needs a similar tiny fix to land cleanly, document it the same way.

---

## How to add a new screen

1. Add the entry to `screens.json` (slug, route, sourceFiles, owner,
   priority).
2. Run the route-constants regen if it lands as a script (else edit
   `tempo-nav.ts` by hand and keep the comment block in sync).
3. Add the `page.tsx` with the standard header (see
   `docs/design/pseudo-code-conventions.md`).
4. Reference the slug from your owner's `agent-checklists/<owner>.md`.

---

## How to claim a screen mid-run

1. Open `screens.json` and **propose** the owner change in your PR.
2. Tag the previous owner in the PR description.
3. Do not start the actual implementation until the rename is acknowledged
   in a comment / next PR review.

---

## Insufficient evidence — items waiting on humans

These items in the matrix have `notes: "insufficient evidence: …"`. They
should not be implemented until clarified:

- **`mobile-paywall`** — RevenueCat paywall has no prototype source. Need
  Amit to confirm desired UX (single screen vs. multi-step? annual vs.
  monthly default?).
- **`mobile-calendar`, `mobile-routines`** — no matching `Mobile<Name>`
  export found in `mobile-screens-b.jsx`. Confirm whether these are
  expected to exist or share UI with their web counterparts.
- **All `status: shipped` claims** — must reference a row in
  `docs/SHIP_STATE.md`. Today only the four-mode environment contract,
  CI typecheck/lint, and Convex-Auth scaffolding are shipped.

When evidence arrives, the corresponding entry's `notes` should be
amended to record what changed and why.
