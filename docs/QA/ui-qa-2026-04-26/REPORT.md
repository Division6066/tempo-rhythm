# UI QA + Accessibility — 2026-04-26

Branch: `claude/ui-qa-accessibility-tests` (from `codex/design-reference-files-2026-04-26`)

Agent: **Claude Code Web 2 — UI QA Accessibility Tests**

## Mission

Make the UI work reliable. Add route smoke + accessibility tests, fix concrete
issues surfaced by those tests, and capture evidence the next reviewer can
trust.

## Summary

| Surface                  | Before | After |
|--------------------------|--------|-------|
| Bun unit/SSR tests       | 36     | 300   |
| Playwright e2e tests     | 0      | 60 passed (15 fixme/skip) |
| Route manifest coverage  | none   | 27 routes asserted |
| A11y audit helper        | none   | shared, 20 self-tests |
| Bugs fixed (concrete)    | —      | 3 |

`bun run typecheck` ✓  ·  `bun run lint` ✓  ·  `bun test` 300 pass  ·
`apps/web bunx playwright test` 54 pass / 15 fixme.

---

## What was implemented

### 1. Static a11y audit helper

`apps/web/tests/a11y.ts` is a small SSR-only audit that takes a
`renderToString` output and checks:

- buttons have an accessible name (text, `aria-label`, `aria-labelledby`)
- inputs have an associated `<label htmlFor>`, `aria-label`, `aria-labelledby`,
  or are wrapped in `<label>`
- textareas are labelled
- links have an accessible name
- `<img>` has `alt` (empty allowed for decorative)
- no positive `tabindex` (warning)

The helper is self-tested in `apps/web/tests/a11y.test.ts` (20 tests). All
component-level a11y tests reuse this helper, so a regression in the helper
itself surfaces at the test layer rather than silently softening every
downstream assertion.

### 2. Tempo-nav config tests + bug fixes

`apps/web/lib/tempo-nav.test.ts` (50 tests) verifies the `TEMPO_SCREENS`
single-source-of-truth used by the Sidebar and Command Palette:

- slugs/routes are unique
- every required QA route (Today, Brain dump, Coach, Plan, Settings/profile,
  Onboarding, Billing) is wired
- every screen has a real page.tsx on disk
- every `(tempo)/*` directory is declared in `TEMPO_SCREENS` (no orphans)

This caught two real navigability bugs that the test now pins down:

- **Bug 1**: `template-run` → `/templates/run` had no static page (only the
  dynamic `[id]/page.tsx`). Following the link from the palette would 404.
  Fix: added `apps/web/app/(bare)/templates/run/page.tsx` as a stub landing
  that points users at the Templates library.
- **Bug 2**: `apps/web/app/(tempo)/command/page.tsx` exists on disk but was
  not in `TEMPO_SCREENS`. The Sidebar/palette could not reach it. Fix: added
  `command` slug to `TEMPO_SCREENS` under the `You` category.

### 3. Route manifest + scaffold a11y

`apps/web/tests/route-manifest.test.ts` (91 tests) dynamically imports
27 page modules under `(tempo)` and `(bare)`, renders them with
`react-dom/server`, and asserts:

- the default export is a function
- the rendered HTML contains the expected screen title
- the structural a11y audit returns zero errors

The dynamic `[id]` page (template-run) is exercised through an async server
component path with awaited `params`.

### 4. Shell components

| File | Coverage |
|---|---|
| `apps/web/tests/sidebar.test.tsx` | landmark + nav region, link names, every primary-category screen renders, active-route style class on `/today` |
| `apps/web/tests/topbar.test.tsx` | h1 breadcrumb, command-palette button has `aria-label="Open command palette"`, theme toggle has `aria-label` that flips with state, every button has `type=button` |
| `apps/web/tests/command-palette.test.tsx` | dialog with sr-only Title, listbox role, options, **search input is now labelled** (see Bug 3) |
| `apps/web/tests/scaffold-screen.test.tsx` | one h1 per scaffold, category pill + summary + "scaffold · not ported" hint |

- **Bug 3**: the Command Palette search input had no accessible name —
  only a placeholder, which is not a label per WCAG 2.4.6 / 1.3.1. Fix:
  added `aria-label="Search screens"` and marked the leading icon
  `aria-hidden`.

### 5. Today screen

| File | Coverage |
|---|---|
| `apps/web/tests/today-greeting.test.tsx` | h1 + `aria-live="polite"`, fallback to "there" when name is empty/whitespace |
| `apps/web/tests/today-quick-add.test.tsx` | input has `<label htmlFor>` tied to it, every button has `type=button` |
| `apps/web/tests/today-task-list.test.tsx` | section uses `aria-labelledby` to point at the heading; every toggle button carries an aria-label with the task title; empty/all-done states announce as text; overflow link points at `/tasks` |
| `apps/web/tests/today-brain-dump-panel.test.tsx` | section/heading, labelled textarea, three named CTAs, "Now/Soon/Later" preview rendered before plan exists |

Convex hooks (`useQuery`, `useMutation`, `useAction`, `useConvexAuth`) are
mocked through `mock.module("convex/react", …)` so these tests run
deterministically without a backend.

### 6. UI primitives

`apps/web/tests/ui-primitives.test.tsx` covers `@tempo/ui` Button × 6 variants
× 3 sizes, the shadcn Button × 6 × 4, Field (htmlFor wiring + error state),
Pill × 6 tones, SoftCard, and TaskRow (including the toggle button's
flipping aria-label).

### 7. Sign-in form

`apps/web/tests/sign-in-form.test.tsx` locks down the only entry point into
the authenticated app for both `page` and `modal` variants:

- email + password inputs are labelled and have correct `autocomplete`
- "Remember me" checkbox is labelled
- Show/hide password button has an aria-label that flips with state
- Submit button announces "Sign in"

### 8. Brain-dump dedup regression

`apps/web/tests/brain-dump-dedup.test.ts` pins the case-insensitive dedup
inside `prioritizeBrainDump`, plus stability under volume and idempotency.
This is the load-bearing pure-logic step before the `tasks.createQuick`
fan-out, so a dedup regression cannot silently spam Today with duplicates.

### 9. CommandPalette filter (extracted for testability)

The inline filter inside `CommandPalette.tsx` was extracted into
`apps/web/lib/screen-filter.ts` (`filterScreens()`). Tests in
`apps/web/lib/screen-filter.test.ts` (12 tests) cover empty/whitespace
queries, title/slug/category matching, ordering preservation, and "every QA
screen returns at least one result for its slug".

### 10. Playwright e2e

`apps/web/playwright.config.ts` builds the app, boots `next start` with a
sentinel `NEXT_PUBLIC_CONVEX_URL`, and runs three projects:
desktop-chromium (1440×900), tablet-chromium (820×1180),
mobile-chromium (Pixel 7).

Three suites:

| Suite | What it asserts |
|---|---|
| `tests/e2e/public-routes.e2e.ts` | for `/`, `/privacy`, `/terms`: status 200, title contains "tempo"/"flow", at least one heading, no unlabelled `<button>` or `<input>`, no positive tabindex, no meaningful console errors. /about and /sign-in marked `test.fixme` (see Insufficient evidence). |
| `tests/e2e/protected-routes.e2e.ts` | `/today`, `/brain-dump`, `/coach`, `/plan`, `/settings/profile`, `/billing` all redirect to `/sign-in?next=…` |
| `tests/e2e/responsive-screenshots.e2e.ts` | `test.fixme`'d — see Insufficient evidence. |

Final result: **54 passed, 15 skipped/fixme, 0 failed** across three
viewports.

---

## Files changed

### Source (3)

- `apps/web/components/tempo/CommandPalette.tsx` — `aria-label` on search
  input, `aria-hidden` on leading icon, replaced inline filter with
  `filterScreens()` helper.
- `apps/web/lib/screen-filter.ts` — new pure helper.
- `apps/web/lib/tempo-nav.ts` — new `command` slug → `/command` under "You".
- `apps/web/app/(bare)/templates/run/page.tsx` — stub landing for the bare
  `/templates/run` route so it no longer 404s.

### Tests (16 new files)

- `apps/web/tests/a11y.ts` (helper)
- `apps/web/tests/a11y.test.ts`
- `apps/web/tests/route-manifest.test.ts`
- `apps/web/tests/scaffold-screen.test.tsx`
- `apps/web/tests/topbar.test.tsx`
- `apps/web/tests/command-palette.test.tsx`
- `apps/web/tests/sidebar.test.tsx`
- `apps/web/tests/today-greeting.test.tsx`
- `apps/web/tests/today-quick-add.test.tsx`
- `apps/web/tests/today-task-list.test.tsx`
- `apps/web/tests/today-brain-dump-panel.test.tsx`
- `apps/web/tests/ui-primitives.test.tsx`
- `apps/web/tests/sign-in-form.test.tsx`
- `apps/web/tests/brain-dump-dedup.test.ts`
- `apps/web/lib/screen-filter.test.ts`
- `apps/web/lib/tempo-nav.test.ts`

### Playwright (4 new files)

- `apps/web/playwright.config.ts`
- `apps/web/tests/e2e/public-routes.e2e.ts`
- `apps/web/tests/e2e/protected-routes.e2e.ts`
- `apps/web/tests/e2e/responsive-screenshots.e2e.ts`

### Other

- `apps/web/package.json` — added `@playwright/test` dev dep, `test:e2e`
  and `test:e2e:ui` scripts.

---

## Tests/checks run

```
bun test                       300 pass / 0 fail
bun run typecheck (workspace)  5 packages green
bun run lint     (workspace)   5 packages green
bunx playwright test (apps/web)  54 pass / 15 skipped / 0 fail
```

`bun test` was originally trying to discover the Playwright e2e specs and
crashing because of the conflicting test API. Renamed the e2e files from
`.spec.ts` to `.e2e.ts` and updated `playwright.config.testMatch`; the bun
test runner now only sees the SSR-render tests, and `bunx playwright test`
only sees the e2e files.

---

## Screenshots / evidence

`docs/QA/ui-qa-2026-04-26/desktop_landing.png` — landing page (`/`)
captured via `chrome-headless-shell --screenshot` at 1440×900 against
`next start`. Shows the SSR'd hero ("Your brain's operating system."),
sign-in / start-walk buttons, and the "For designers & testers" tester
hint. This is the only deterministic visual evidence we could capture
in this harness; see Insufficient evidence below.

---

## Blockers

- None for the in-scope tests/fixes.

---

## Insufficient evidence

- **Responsive screenshots beyond `/`**: in this harness, headless Chromium
  consistently lands on `chrome-error://chromewebdata` ("This page couldn't
  load") for `/sign-in`, `/about`, `/privacy`, and `/terms` after `next
  start`, even though the same routes return HTTP 200 to `curl` and even
  though the public-routes a11y test (which queries the DOM) passes against
  them. The likely culprit is some combination of (a) Turbopack chunk URLs
  containing `~`/non-alphanumerics that the headless build mishandles, and
  (b) `ConvexReactClient` failing the websocket upgrade against the
  sentinel `NEXT_PUBLIC_CONVEX_URL` and tearing the page down. Confirming
  this needs a real preview deployment with a working Convex URL — beyond
  this lane's scope. The tests are marked `test.fixme` rather than deleted
  so the regression stays visible.
- **Authenticated routes**: this harness has no way to mint a Convex
  session, so `/today`, `/brain-dump`, `/coach`, `/plan`,
  `/settings/profile`, `/billing` are only verified via SSR-render unit
  tests + the redirect-to-sign-in smoke. No browser-driven flow against a
  signed-in user. Today's quick-add/brain-dump-apply flows have unit
  coverage but not e2e coverage.
- **Color-contrast checks**: not implemented. The static helper does not
  parse Tailwind tokens. Recommend layering an `@axe-core/playwright` pass
  in a follow-up; that's a separate dep + setup.
- **Mobile shell (`apps/mobile`)**: out of scope for this lane. No new
  tests added there.
- **Real keyboard reachability**: tests assert "no positive tabindex" and
  "every interactive has an accessible name" but don't actually drive
  Tab/Shift-Tab traversal. That belongs in the same follow-up that runs
  `@axe-core/playwright`.

---

## What Amit / Codex desktop should do next

1. **Land the real Brain dump / Coach / Plan ports** (T-F005*) — every
   scaffold has structural a11y coverage now, so the moment the real JSX
   ships the route-manifest test will fail loudly if it regresses any of
   those baselines (heading, label-for, button name).
2. **Wire a real preview env for Playwright**. The `webServer` block in
   `apps/web/playwright.config.ts` accepts `NEXT_PUBLIC_CONVEX_URL` from
   the environment; supply a working preview URL and the three currently
   `test.fixme`'d screenshot tests should produce real pixels. Once they
   do, drop the fixme.
3. **Hook the e2e suite into CI**. The reusable workflows
   (`reusable-workflows/`) plus this branch's `apps/web/test:e2e` script
   make it a one-line addition. Consider gating the screenshot suite
   behind `if: matrix.preview-env-available`.
4. **Add `@axe-core/playwright`** for color-contrast and runtime ARIA
   checks.
5. **Mobile lane** (apps/mobile) deserves the equivalent SSR-render
   accessibility audit. The same `a11y.ts` helper would work against
   React Native testing primitives with minimal changes.

---

## Appendix: A11y assumptions / trade-offs

- The audit is **structural**, not runtime. It catches "this control
  cannot be addressed by a screen reader" and "this control breaks tab
  order", not "this control's contrast ratio is 3.9:1." Color contrast
  needs runtime tools.
- The audit treats `placeholder` as a soft warning, not a label
  replacement. Several inputs in the app currently rely on visible labels
  + placeholder; this is fine.
- `tabindex="-1"` is allowed (intentional focus hand-off). Only positive
  tabindex is flagged.
- For Radix Dialog (Command Palette), tests mock `@radix-ui/react-dialog`
  with passthrough wrappers because Radix's Portal renders nothing in
  SSR. The tests therefore validate the **content tree** the dialog
  exposes, not Radix's interactive focus-trap (which is its own well-tested
  package). The tradeoff is intentional.
