# `claude-ui-pkg` — Shared UI package checklist

> **Owner of:** `packages/ui/src/**` (every primitive, brand component, icon, token, native variant).
> **Blocks:** every screen-port agent until Phase 0 is done.

---

## Pre-flight

- [ ] Read `docs/HARD_RULES.md` §2 (forbidden tech), §7 (UI rules), §8 (accessibility).
- [ ] Read [`../tokens.json`](../tokens.json) for the source-of-truth token list.

## Phase 0 deliverables

### Tokens

For every token in `tokens.json` with `status: "missing"`:
- Add to `apps/web/app/globals.css` as a `--…` custom property.
- Mirror in `packages/ui/src/theme/tokens.ts` if mobile needs it.

Specifically missing today:
- All `*-bg` semantic background variants (`moss-bg`, `brick-bg`, `amber-bg`, `slate-blue-bg`).
- All four shadows (`shadow-whisper`, `shadow-card`, `shadow-lift`, `shadow-modal`).
- Layout tokens (`container`, `sidebar-w`, `topbar-h`).
- Type tokens: `leading-display`, `leading-heading`, `leading-body`, `tracking-display`, `tracking-eyebrow`.
- Marketing gradient `mkt-feat-warm`.

### Missing primitives

| Component | Source | Reason it matters |
|---|---|---|
| `AcceptStrip` | `components.jsx#AcceptStrip` | HARD_RULES §6.2 — every AI mutation needs it. Blocks brain-dump, coach, plan. |
| `ProgressBar` | `components.jsx#ProgressBar` | Used in template-run, today schedule. |
| `EnergyBar` | `components.jsx#EnergyBar` | Today screen needs it. |
| `ReadAloudIndicator` | `components.jsx#ReadAloudIndicator` | HARD_RULES §7.2 read-aloud + §8 a11y. |
| `ListenBtn` | `components.jsx#ListenBtn` | Same. |

### Native equivalents to confirm

For every `packages/ui/src/primitives/<X>.tsx`, an `<X>.native.tsx`
equivalent should exist (or be explicitly justified as web-only).

- `BrandMark.native`, `Wordmark.native` — insufficient evidence: file path
  not located in this run. Verify presence; if missing, add.
- `Icon.native` (`@tempo/ui/icons/native`) — confirm SVG → `react-native-svg`
  set is at parity with web set (73 icons).

## Acceptance

- [ ] Every `tokens.json` entry has `status` ≠ `missing`.
- [ ] Every primitive listed above lives in `packages/ui/src/primitives/`
      with a render test in `packages/ui/src/primitives/__tests__/`.
- [ ] Every primitive exported from `@tempo/ui` (re-export from `index.ts`).
- [ ] `@tempo/ui/native` parallel index exports the RN versions.
- [ ] No new dependencies that violate HARD_RULES §2.

## Hand-off

Update `tokens.json` and `components.json` `status` columns. Notify
the screen-port agents that Phase 0 is done by closing this checklist
in the next matrix-update PR.
