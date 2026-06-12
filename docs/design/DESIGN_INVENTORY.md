# Tempo Flow — Design inventory

**Source:** `claude-export/design-system/` (Design System v1.0, April 2026)  
**Tokens file:** `docs/design/tokens.css` (extracted from `claude-export/design-system/tokens.css`)

## Color (light)

| Token | Value | Use |
|-------|-------|-----|
| `--ink` | `#131312` | Primary text |
| `--cream` | `#F3EBE2` | Page background |
| `--cream-raised` | `#FAF6F0` | Cards |
| `--cream-deep` | `#EBE0D2` | Sunken surfaces |
| `--tempo-orange` | `#D97757` | Primary accent, CTAs |
| `--soft-orange` | `#E8A87C` | Gradient end |
| `--dust-grey` | `#6B6864` | Muted text |
| `--line` | `#D7CEC2` | Borders |
| `--moss` | `#4A7C59` | Success / habits |
| `--brick` | `#C8553D` | Destructive |
| `--amber` | `#D4A44C` | Warning / due |
| `--slate-blue` | `#6E88A7` | Info / reminders |

## Typography

| Token | Stack |
|-------|-------|
| `--font-serif` | Newsreader, Georgia |
| `--font-sans` | Inter, system-ui |
| `--font-mono` | IBM Plex Mono |

| Scale | Size |
|-------|------|
| Display | 56px |
| H1 | 32px |
| H2 | 24px |
| H3 | 20px |
| Body | 16px |
| Small | 14px |
| Caption | 12px |

## Spacing (8pt grid)

`--space-1` (4px) through `--space-16` (64px). Prefer `gap` on parents over margin on children.

## Layout chrome

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Sidebar width | 260px | 64px icon rail | hidden (drawer) |
| Topbar height | 56px | 56px | 48px |
| Page max-width | 1120px | 100% | 100% |
| Bottom nav | — | — | 64px + safe area |

## Component surfaces

- **Card:** `--surface-card`, `--radius-xl`, `--shadow-whisper`
- **Sunken card:** `--surface-sunken`, no shadow
- **Coach bubble:** serif 17px, sunken background
- **Primary button:** `--tempo-orange` or `--gradient-tempo`
- **Task row:** checkbox + title + meta pills

## Motion

- `--dur-snap`: 120ms
- `--dur-default`: 200ms
- `--ease`: cubic-bezier(0.4, 0, 0.2, 1)

## Voice / brand

Anti-shame copy. No hustle/grind language. See `claude-export/design-system/brand-voice.md`.
