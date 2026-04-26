# `claude-web-onboarding` — Sign-in + Onboarding checklist

> **Owner of:** `sign-in`, `onboarding`.

---

## Pre-flight

- [ ] Read `docs/HARD_RULES.md` §6 (AI), §10 (privacy & opt-in).
- [ ] Confirm Convex Auth scaffolding from PR #19 still applies.

## Source of truth

| Slug | Source |
|---|---|
| `sign-in` | `screens-5.jsx#ScreenSignIn` |
| `onboarding` | `screens-5.jsx#ScreenOnboarding` (5 steps) |

## Acceptance

### `sign-in`
- [ ] Bare layout
- [ ] Email + magic-link via Convex Auth
- [ ] Passkey option visible (T-0010 follow-up)
- [ ] Error states: anti-shame copy

### `onboarding` (5-step flow)
- [ ] Bare layout
- [ ] Steps: welcome → privacy → preferences → first brain dump → confirmation
- [ ] **Privacy step** sets `profiles.analyticsOptIn` (HARD_RULES §10)
- [ ] **Preferences step** sets theme + dyslexia + read-aloud
- [ ] **First brain dump step** uses the same `brain-dump` flow as the post-onboarding screen (with anonymous-allowed `userId: v.optional(v.string())` per HARD_RULES §5)
- [ ] Confirmation step lands the user on `/today`

## Insufficient evidence

- Whether the prototype's onboarding has 5 steps or 4. Confirm against
  `screens-5.jsx#ScreenOnboarding` body copy.
- Whether the brain-dump-during-onboarding flow auto-creates a user
  account or stays anonymous until confirmation. The HARD_RULES schema
  rule allows both — confirm with Amit.

## Hand-off

Update `screens.json`. After both screens are `wired`, mark in
`docs/SHIP_STATE.md` once preview-tested.
