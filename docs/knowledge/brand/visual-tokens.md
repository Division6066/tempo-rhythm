# Tempo Flow — Visual Design Tokens

**Revision:** 0.1 (scaffold — authoritative source lives in code)
**Canonical sources:**
- Web: `apps/web/app/globals.css` (Tailwind v4 `@theme` variables)
- Cross-platform tokens: `packages/ui/src/tokens/`
- Mobile mapping: `packages/ui/src/native/` via NativeWind

**This file is a digest.** When code and this file disagree, code wins; update the digest.

## Palette — Soft Editorial

Pairs a small warm-paper neutral set with two saturated accents. Light and dark modes are both first-class.

| Token | Purpose | Notes |
|---|---|---|
| `--background` | Page background | Off-white warm in light, deep muted in dark |
| `--foreground` | Primary text | WCAG AA min against `--background` |
| `--muted` | Secondary surface | Cards, subtle panels |
| `--muted-foreground` | Secondary text | |
| `--accent` | Primary action color | Saturated but not neon |
| `--accent-foreground` | Text on accent surfaces | |
| `--secondary` | Secondary action | |
| `--destructive` | Warnings, deletions | Never used for AI proposals |
| `--border` | Hairlines | 1px on web, 0.5px equivalent on mobile |
| `--ring` | Focus ring | Visible. Never `outline: none` without a replacement |

**Rule:** do not add arbitrary hex values. If a needed token is missing, add it to `packages/ui/src/tokens/` first, then use the semantic name.

## Typography

| Role | Family | Weight | Size range |
|---|---|---|---|
| Display + headings | Newsreader (serif) | 400 / 500 | 20 → 72 |
| Body | Inter (sans) | 400 / 500 | 14 → 18 |
| Monospace accents | IBM Plex Mono | 400 | 12 → 14 |
| Dyslexic override | OpenDyslexic | 400 | body sizes |

OpenDyslexic is a user toggle under Settings → Accessibility. When on, all body copy switches. Secondary toggle switches headings.

## Spacing

Use the standard Tailwind spacing scale. **Do not** use arbitrary values (`p-[17px]`). If a genuinely new gap is needed, add a named token.

Common surfaces:

- Content max width: 72ch for reading, 1200px for dashboards.
- Card padding: `p-4` mobile, `p-6` desktop.
- Form field vertical rhythm: `space-y-4` as default.

## Radii

| Token | Value (approx) |
|---|---|
| `--radius-sm` | 0.375rem |
| `--radius` | 0.75rem |
| `--radius-lg` | 1rem |
| `--radius-full` | 9999px — pills, avatars |

## Motion

- Default duration: 200–280 ms.
- Default easing: `ease-out` for enter, `ease-in` for exit.
- **Respect `prefers-reduced-motion`.** Animations collapse to crossfade at 60 ms.
- Skeletons (not spinners) for content areas with expected latency > 100 ms.

## Haptics (mobile only)

- Tap on task complete: `light` / `selection`.
- Celebration milestone: `medium`.
- **Never on errors.** Errors are visual + auditory (optional), never haptic.

## Iconography

- Primary set: `lucide-react` (web) and `lucide-react-native` (mobile).
- Stroke width: 1.5px default on web.
- Color: inherit from `currentColor`. Never hard-code icon colors.

## Focus and interaction

- Focus ring visible on every interactive element.
- Touch target minimum: 44×44 dp mobile, 24×24 px web with padding.
- Disabled state: 50% opacity + `cursor-not-allowed` (web) + no haptic (mobile).

## Checks (run these before merging a UI PR)

- `pnpm scan:design-tokens` — fails if arbitrary hex values appear in component source.
- `pnpm lint` — catches most Tailwind arbitrary-value usage.
- Manual: VoiceOver / TalkBack walkthrough on changed screens.
- Manual: keyboard-only traversal of any new interactive flow.
