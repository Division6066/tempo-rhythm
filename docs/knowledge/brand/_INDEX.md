# Brand Knowledge — Index

**Revision:** 0.1 (scaffold — awaiting source material ingestion)
**Owner:** human-amit
**Auto-attached by:** `.cursor/rules/tempo-brand.mdc` (to be authored in Phase 3)

## Read this first when you are...

| Task | Files |
|---|---|
| Writing any UI copy (buttons, errors, empty states, notifications) | [`voice.md`](voice.md) + HARD_RULES §1 |
| Designing a new screen, component, or card | [`visual-tokens.md`](visual-tokens.md) + [`do-and-dont.md`](do-and-dont.md) + HARD_RULES §7 |
| Naming a feature, setting product tone | [`identity.md`](identity.md) |
| Reviewing someone else's UI work for brand fit | [`do-and-dont.md`](do-and-dont.md) |

## Non-negotiables (distilled from HARD_RULES §1 and §7)

- **Never shame the user.** Not in copy, not in UX, not in AI responses. Missing a streak for 10 days = "welcome back, want to start fresh?" never "streak broken."
- **Accept-reject is law.** AI never silently mutates. Every AI-originating change previews as confirm / edit / reject.
- **Undo is a feature.** 5-minute undo window on every AI-applied mutation.
- **Personalization at render, not schema.** The schema is generic.
- **Soft Editorial palette.** Colors, typography, motion tokens live in `packages/ui`. Avoid arbitrary Tailwind values.
- **Accessibility is non-negotiable.** WCAG 2.1 AA minimum. OpenDyslexic toggle must always work.
- **Color is never the only channel.** Every color-coded meaning pairs with an icon, label, or pattern.

## Source material pipeline

1. User drops raw brand documents, mood boards, old decks, Figma exports, style guides into [`../sources/`](../sources/README.md) under a named subfolder.
2. The brand-ingestion agent reads those, distills into the four files above.
3. Each of the four files gets its revision bumped when source material changes.

## Red-list — skills that conflict with Tempo brand

Do not invoke these skills for Tempo brand work (they enforce other brands):

- `anthropics/skills@brand-guidelines` — enforces Anthropic's brand palette and voice.

Instead, use the **`tempo-brand`** skill (authored in Phase 3 via `skill-creator`) paired with `brand-voice-enforcement`.
