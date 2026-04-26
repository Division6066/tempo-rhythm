# `claude-coach` — Coach + Voice components checklist

> **Owner of:** every component under `coach-dock.jsx` and `voice-chat.jsx`.
> **Consumes:** primitives from `@tempo/ui`. **Provides:** `CoachDock`, `CoachTab`,
> `BrainDumpTab`, `VCWalkieTalkie`, `VCVoiceMode`, etc., to the Flow agent and the
> global `(tempo)/layout.tsx` mount.

---

## Pre-flight

- [ ] Read `docs/HARD_RULES.md` §6 (AI routing, accept-reject, confidence), §9 (voice budgets).
- [ ] Confirm `AcceptStrip`, `CoachBubble` primitives are available from `@tempo/ui`.
- [ ] `claude-ui-pkg` must have shipped Phase 0 first.

## Components to create

Create under `apps/web/components/coach/` (and a `native/` mirror under
`apps/mobile/components/coach/` if applicable).

| Source | Component |
|---|---|
| `coach-dock.jsx#CoachDock` | `CoachDock.tsx` — global floating panel |
| `coach-dock.jsx#CoachTab` | `CoachTab.tsx` — chat tab |
| `coach-dock.jsx#BrainDumpTab` | `BrainDumpTab.tsx` — capture tab |
| `coach-dock.jsx#CoachDotMark` | `CoachDotMark.tsx` — animated indicator |
| `coach-dock.jsx#FabBreath` | `FabBreath.tsx` — breathing pulse FAB |
| `voice-chat.jsx#VCWaveform` | `VCWaveform.tsx` — animated bars |
| `voice-chat.jsx#VCTranscript` | `VCTranscript.tsx` — live transcript |
| `voice-chat.jsx#VCWalkieTalkie` | `VCWalkieTalkie.tsx` — push-to-talk modal |
| `voice-chat.jsx#VCVoiceMode` | `VCVoiceMode.tsx` — live streaming modal |
| `voice-chat.jsx#VCLauncher` | `VCLauncher.tsx` |
| `voice-chat.jsx#VoiceDockButtons` | `VoiceDockButtons.tsx` |
| `voice-chat.jsx#VCGlobalRoot` | `VCGlobalRoot.tsx` — top-level mount |

## Acceptance

- [ ] Walkie-talkie is universal (HARD_RULES §9). No tier gating.
- [ ] Live mode is minute-capped. Read remaining budget from
      `voiceSessions` aggregate; if < 1 min, show the upgrade prompt
      and keep walkie-talkie available.
- [ ] Confidence badges render per `confidence` field on every
      AI-originating proposal.
- [ ] AcceptStrip never silently mutates state.
- [ ] Streaming uses Convex action token streams.

## Mount

- Web: in `apps/web/app/(tempo)/layout.tsx` add `<VCGlobalRoot />` and
  `<CoachDock />` once.
- Mobile: corresponding mount in `apps/mobile/app/(tempo)/_layout.tsx`.

## Insufficient evidence

- Voice provider — HARD_RULES §6.1 mandates Mistral via native `fetch`,
  but voice-to-text vendor isn't named. Confirm with Amit before wiring
  the actual transport.
- `voiceSessions` table shape — schema rule §5 applies but field set
  beyond `startedAt`/`endedAt`/`durationMs` is not yet defined.

## Hand-off

Update `components.json` (set status `ported` per component) and
notify `claude-web-flow` once `CoachDock` is mountable so they can
finish `coach` and `plan` screens.
