# Tempo Flow — Design System & Front-End

An overwhelm-first AI daily planner and personal operating system for ADHD, autistic, and neurodivergent brains. This project is the **front-end design** for the full product — all 42 screens, the public landing page, and the five-screen onboarding — so it can be imported into a production codebase.

> "Your brain's operating system."

## What's here

- `tokens.css` — color, type, spacing, motion, and shadow tokens. Light + dark.
- `shell.css` — app chrome and shared component styles.
- `components/` — React components: SoftCard, Button, Field, Pill, Ring, Sidebar, Topbar, TaskRow, HabitRing, CoachBubble, etc.
- `screens/` — one file per product area; together these render all 42 screens.
- `onboarding.jsx` — the deep interactive onboarding flow with three variants.
- `app.html` — full click-thru prototype. Sidebar navigates every screen; topbar has theme toggle.
- `landing.html` — public marketing page (hero, features, pricing, FAQ, footer).
- `canvas.html` — design canvas overview showing every screen + the landing + onboarding in one scrollable sheet.
- `preview/` — individual token and component cards registered as design-system assets.
- `assets/` — logo mark, wordmark, small illustrations.

## Entry points

- **Start here:** `canvas.html` — overview of the whole system.
- **Live prototype:** `app.html` — interact with every screen.
- **Landing page:** `landing.html`.

## Language & direction

English, LTR. Per the PRD copy patterns: warm, direct, specific, never shaming. See `brand-voice.md`.

## Brand in one line

Anthropic-adjacent (orange, serif, cream), NotePlan-adjacent (calm, portable), Craft-adjacent (spacious, typographic). Uncle Iroh with a notebook. Never Slack. Never Asana. Never rainbow confetti.
