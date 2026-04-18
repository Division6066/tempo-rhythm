# PRDs — Pointer

The canonical PRD files live under `docs/brain/PRDs/`. This folder does not copy them; it points.

## Current active phase

- **Phase 1 MVP** → [`docs/brain/PRDs/PRD_Phase_1_MVP.md`](../../PRDs/PRD_Phase_1_MVP.md) (1612 lines — the definition of "done" for MVP).

## Later phases (planning only — do not build against unless a ticket says otherwise)

Check `docs/brain/PRDs/` for phase 2+ PRDs as they land. Tickets tagged `phase:X` reference a specific PRD in their context block.

## Agent rule

> If a ticket's acceptance criteria conflict with the PRD, the ticket wins (it is the most specific scope).
> If the ticket and the PRD conflict with HARD_RULES, HARD_RULES wins.

That is the precedence order:

```
HARD_RULES  >  Ticket  >  PRD  >  Chat prompt
```
