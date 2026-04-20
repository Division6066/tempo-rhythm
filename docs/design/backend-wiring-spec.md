# Backend wiring spec (generated from UI labels)

This document captures backend wiring needs discovered during front-end labeling.

**Contract**
- During port tickets (`T-0023-b`, `T-0023-c`), contributors append rows as they add `@convex-*-needed`, `@provider-needed`, and `@schema-delta` tags.
- `T-0023-d` performs dedupe/normalization and groups by feature area.
- This is a map only. It does not authorize backend implementation in this run.

## Row schema

| source_file | screen | component | tag_type | slug_or_value | behavior_summary | prd_ref | schema_delta | provider | notes |
|---|---|---|---|---|---|---|---|---|---|
| `apps/web/app/(tempo)/coach/page.tsx` | `coach` | `WalkieTalkieButton` | `@convex-action-needed` | `voice.transcribe` | Hold to record, release to transcribe, append transcript to thread. | `PRD §9` | `voiceSessions.mode` | `openrouter` | Example row; replace with real rows during porting. |

## Validation commands

- `rg "@convex-(mutation|action|query)-needed:" apps/web apps/mobile`
- `rg "@provider-needed:" apps/web apps/mobile`
- `rg "@schema-delta:" apps/web apps/mobile`
