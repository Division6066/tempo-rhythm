# Frontend completion + backend wiring handoff (staged)

## Context

This document is the handoff from the frontend parity run to the backend wiring run.

- Web and mobile screen parity is complete against `docs/design/screen-inventory.md`.
- Generated HTML parity files are complete (`42 web`, `12 mobile`).
- Route-level pseudocode tags (`@behavior`, `@convex-*-needed`, `@navigate`, `@provider-needed`, `@schema-delta`) are in place for wiring.

Validation source:

- `docs/design/frontend-parity-audit.md`
- `docs/design/backend-wiring-spec.md`
- `docs/design/expo-go-handoff.md`

## What is complete now

1. Frontend route/file coverage:
   - Web: 42/42 mapped routes present.
   - Mobile: 12/12 mapped routes present.
2. HTML parity coverage:
   - Web: 42/42 generated HTML screens present.
   - Mobile: 12/12 generated HTML screens present.
3. Tag coverage:
   - All mapped web/mobile screens include `@screen`, `@behavior`, and at least one actionable tag.
4. Build health:
   - Web/mobile typecheck and lint pass in current branch.

## Staged backend wiring plan

### Stage 1 — Foundation wiring (auth + identity + public/private routing)

Goal: make auth/session flows stable for all required frontend routes.

Primary scope:

- `auth.currentUserIdentity`
- `auth.signIn`
- onboarding writes (`users.completeOnboarding`, profile preference mutations)
- middleware + route-access behavior

Acceptance:

- No auth-loading dead-ends.
- Public routes stay public.
- Private routes consistently redirect as expected.

### Stage 2 — Core product flows (Flow + Library)

Goal: wire daily execution surfaces first.

Primary scope:

- Flow screens:
  - `today`, `brain-dump`, `coach`, `plan`, `daily-note`
- Library screens:
  - `tasks`, `notes`, `journal`, `calendar`, `habits`, `routines`, `goals`, `projects`

Wiring source:

- `docs/design/backend-wiring-spec.md` rows under `Flow` and `Library`.

Acceptance:

- Core query/mutation/action paths are live.
- proposal/confirm pattern enforced where required.

### Stage 3 — You + Settings + provider integrations

Goal: wire non-core but high-value surfaces and external providers.

Primary scope:

- You screens (`templates`, `search`, `command`, `insights`, etc.)
- Settings and billing surfaces
- Provider integrations called out in tags:
  - OpenRouter
  - RevenueCat
  - PostHog (opt-in)

Acceptance:

- Settings and subscription surfaces function end-to-end.
- Provider calls routed through approved backend integration patterns.

### Stage 4 — Schema deltas + cleanup

Goal: close all schema gaps identified by frontend tags.

Primary scope:

- Resolve every `@schema-delta` token in `docs/design/backend-wiring-spec.md`.
- Update schema + migrations safely.
- Re-run parity and wiring audits to ensure no unresolved deltas remain.

Acceptance:

- No pending schema-delta blockers.
- Audits report clean status.

## Execution checklist for the next session

1. Pull latest branch and submodule updates.
2. Run:
   - `bun run --filter tempo-rhythm-web typecheck`
   - `bun run --filter tempo-rhythm-mobile typecheck`
   - `bun run lint --filter tempo-rhythm-web`
   - `bun run lint --filter tempo-rhythm-mobile`
3. Rebuild docs:
   - `bun scripts/docs/generate-html-screen-previews.ts`
   - `bun scripts/docs/consolidate-backend-wiring-spec.ts`
   - `bun scripts/docs/audit-frontend-screen-parity.ts`
4. Pick Stage 1 scope and wire only that stage end-to-end.
5. Re-run checks and update this document with completion notes.

## Notes for future agents

- This run intentionally keeps backend unwired; tags are the contract.
- Do not remove pseudocode tags when wiring; convert/update them to reflect real functions.
- If a screen is modified, keep HTML parity (`docs/design/generated-html/`) regenerated in the same PR.
