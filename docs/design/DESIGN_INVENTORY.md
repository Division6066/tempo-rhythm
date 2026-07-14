# Tempo Flow Design Inventory

Phase 0 design-to-code inventory for the Claude export in `docs/design/claude-export/design-system/`.

## Source status

- Requested source `Tempo Flow - All Screens.html` with `#tf-data` is not present in this checkout.
- Canonical screen source used here: `docs/design/claude-export/design-system/app.html` router map plus exported JSX/HTML screens.
- Canonical design tokens used here: `docs/design/claude-export/design-system/tokens.css` and `shell.css`.
- Frozen schema source used here: `docs/design/claude-export/design-system/uploads/Tempo_Flow_Master_Document.md` Part 6 schema section.
- Current `docs/brain/` is absent in this checkout, so `docs/brain/TASKS.md` and Phase 1 PRD could not be read from their usual paths.

## Canonical 44-screen set

The available prototype has 42 router keys. Phase 0 uses those 42 plus the standalone landing page and the mobile capture modal spec from the existing screen inventory.

| Group | Screens |
|---|---|
| Flow | `daily-note`, `today`, `brain-dump`, `coach`, `plan` |
| Library | `tasks`, `notes`, `note-detail`, `journal`, `calendar`, `habits`, `habit-detail`, `routines`, `routine-detail`, `goals`, `goal-detail`, `goals-progress`, `projects`, `project-detail`, `project-kanban` |
| You | `analytics`, `activity`, `templates`, `template-builder`, `template-run`, `template-editor`, `template-sketch`, `search`, `command`, `empty-states` |
| Settings | `settings`, `settings-prefs`, `settings-integrations`, `billing`, `trial-end`, `ask-founder`, `notifications` |
| Marketing | `landing`, `about`, `changelog` |
| Onboarding | `sign-in`, `onboarding` |
| Mobile reference | `mobile-today`, `capture` |

## Tailwind v4 `@theme` token map

Use semantic tokens first. Primitive aliases stay available for rare brand-specific work.

```css
@theme {
  --color-ink: #131312;
  --color-cream: #F3EBE2;
  --color-cream-raised: #FAF6F0;
  --color-cream-deep: #EBE0D2;
  --color-tempo-orange: #D97757;
  --color-soft-orange: #E8A87C;
  --color-dust-grey: #6B6864;
  --color-dust-grey-soft: #9A968F;
  --color-line: #D7CEC2;
  --color-line-soft: #E6DDD1;

  --color-background: var(--color-cream);
  --color-foreground: var(--color-ink);
  --color-card: var(--color-cream-raised);
  --color-card-foreground: var(--color-ink);
  --color-surface-sunken: var(--color-cream-deep);
  --color-surface-inverse: var(--color-ink);
  --color-muted-foreground: var(--color-dust-grey);
  --color-subtle-foreground: var(--color-dust-grey-soft);
  --color-primary: var(--color-tempo-orange);
  --color-primary-foreground: #fff;
  --color-border: var(--color-line);
  --color-border-soft: var(--color-line-soft);
  --color-ring: var(--color-tempo-orange);

  --color-moss: #4A7C59;
  --color-moss-bg: rgb(74 124 89 / 10%);
  --color-brick: #C8553D;
  --color-brick-bg: rgb(200 85 61 / 10%);
  --color-amber: #D4A44C;
  --color-amber-bg: rgb(212 164 76 / 14%);
  --color-slate-blue: #6E88A7;
  --color-slate-blue-bg: rgb(110 136 167 / 12%);

  --font-serif: "Newsreader", "Iowan Old Style", Georgia, serif;
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", "JetBrains Mono", monospace;

  --text-display: 56px;
  --text-h1: 32px;
  --text-h2: 24px;
  --text-h3: 20px;
  --text-body: 16px;
  --text-lede: 17px;
  --text-coach: 17px;
  --text-small: 14px;
  --text-caption: 12px;
  --text-eyebrow: 11px;

  --leading-display: 1.15;
  --leading-heading: 1.2;
  --leading-body: 1.5;
  --leading-dyslexia: 1.7;
  --tracking-display: -0.02em;
  --tracking-eyebrow: 0.08em;
  --tracking-dyslexia: 0.01em;

  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;
  --spacing-24: 96px;

  --radius-sm: 4px;
  --radius: 8px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-pill: 9999px;

  --shadow-whisper: 0 1px 1px 0 rgb(19 19 18 / 4%);
  --shadow-card: 0 1px 2px 0 rgb(19 19 18 / 5%), 0 0 0 1px rgb(19 19 18 / 4%);
  --shadow-lift: 0 6px 16px -8px rgb(19 19 18 / 10%), 0 0 0 1px rgb(19 19 18 / 4%);
  --shadow-modal: 0 30px 60px -30px rgb(19 19 18 / 35%);

  --ease-tempo: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-snap: 120ms;
  --duration-default: 220ms;
  --duration-hero: 420ms;

  --container-tempo: 1200px;
  --width-page: 1120px;
  --width-page-narrow: 720px;
  --width-page-tight: 960px;
  --breakpoint-mobile: 767px;
  --breakpoint-tablet: 1023px;
  --breakpoint-desktop: 1280px;
}
```

Dark mode overrides mirror `tokens.css`: page becomes ink, card `#1C1C1A`, sunken `#161615`, foreground cream, muted `#A8A49F`, ring soft orange, and status backgrounds use stronger alpha. OpenDyslexic swaps `--font-serif` and `--font-sans`, increases body leading to `1.7`, and adds `0.01em` tracking.

## Component inventory

See `COMPONENT_REGISTRY.json` for machine-readable details. Stable component IDs are grouped as:

- Foundation: `TF.Brand.*`, `TF.Icon.Set`, `TF.Theme.Controller`, `TF.App.Provider`
- Layout and navigation: `TF.Layout.*`, `TF.Nav.*`, `TF.Mobile.*`
- Actions: `TF.Button.*`, `TF.Toggle`, `TF.Tabs`, `TF.SegmentedControl`
- Surfaces and data: `TF.Card.*`, `TF.TaskRow`, `TF.Pill`, `TF.Ring`, `TF.ProgressBar`, `TF.EnergyBar`, `TF.EmptyState`
- Coach, AI, and voice: `TF.Coach.*`, `TF.Voice.*`, `TF.Overlay.*`
- Domain composites: `TF.Kanban.*`, `TF.Template.*`, `TF.Screen.*`

## Per-screen details

Machine-readable sections, components, interactive elements, data fields, and RN notes live in `SCREEN_MANIFEST.json`.

## Batch split G1-G7

| Batch | Scope | Screen IDs |
|---|---|---|
| G1 | Foundation, shell, accessibility, auth/onboarding | `sign-in`, `onboarding`, shared shell/components |
| G2 | Flow surfaces | `daily-note`, `today`, `brain-dump`, `coach`, `plan`, `capture` |
| G3 | Core library | `tasks`, `notes`, `note-detail`, `journal`, `calendar` |
| G4 | Habits, routines, goals, projects | `habits`, `habit-detail`, `routines`, `routine-detail`, `goals`, `goal-detail`, `goals-progress`, `projects`, `project-detail`, `project-kanban` |
| G5 | Templates, search, command, insights | `templates`, `template-builder`, `template-run`, `template-editor`, `template-sketch`, `search`, `command`, `analytics`, `activity`, `empty-states` |
| G6 | Settings and billing | `settings`, `settings-prefs`, `settings-integrations`, `billing`, `trial-end`, `ask-founder`, `notifications` |
| G7 | Marketing and mobile reference | `landing`, `about`, `changelog`, `mobile-today`, RN adaptation pass |

## Accessibility and product constraints

- Body copy target: 16-19px, line-height 1.5; OpenDyslexic increases line-height to 1.7.
- Every screen should present one dominant primary action; secondary actions remain quiet.
- No shame copy. Use "let it rest", "start fresh", "when you're ready", and "small, gentle, specific" patterns.
- Desktop target: Chrome at 1280px and up. Tablet: 768-1023px. Mobile web: 767px and below.
- React Native is a third surface. Mobile components must use native navigation, 44dp touch targets, NativeWind token mapping, and list virtualization where lists can grow.
- AI-originated UI changes are proposal cards with accept/edit/reject and undo. No silent state mutation.
