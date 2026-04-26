# `claude-web-marketing` — Marketing surface checklist

> **Owner of:** `landing` (`/`), `about`, `changelog`.

---

## Pre-flight

- [ ] Read `docs/design/claude-export/design-system/landing.html` — that's the source for the marketing site, not a JSX screen.
- [ ] Read `docs/design/claude-export/design-system/about.html` and `changelog.html`.
- [ ] HARD RULE: do **not** publish legal pages as final. Privacy/Terms come from GetTerms.io (HARD_RULES §10).

## Source of truth

| Slug | Source |
|---|---|
| `landing` | `landing.html` (+ `screens-6.jsx` for any light-variant cross-checks) |
| `about` | `about.html` + `screens-6.jsx#ScreenAbout` |
| `changelog` | `changelog.html` + `screens-6.jsx#ScreenChangelog` |

## Constraints

- Bare layout — no app sidebar/topbar; uses `Navbar` + `Footer` from
  `apps/web/components/`.
- Marketing "dark strips" use `--mkt-dark-*` CSS vars (already in
  `globals.css`).
- Sign-in CTA opens `SignInModal`; no router push.
- Insufficient evidence: hero copy + section ordering may have drifted between
  prototype and brand-voice draft. Cross-check with
  `docs/design/claude-export/design-system/brand-voice.md`.

## Acceptance

- [ ] Lighthouse a11y ≥ 95 on `/`.
- [ ] Open Graph + Twitter Card metadata.
- [ ] CTA buttons all open `SignInModal` or `SignUpModal`.
- [ ] Footer links: about, changelog, privacy (GetTerms link), terms (GetTerms link), contact.
- [ ] Reduced-motion respected per HARD_RULES §7.4.

## Hand-off

Update `screens.json`. Coordinate any new asset (image, video) with
`packages/ui/assets`.
