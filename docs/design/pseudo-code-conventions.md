# Pseudo-code annotation conventions

**Purpose:** Every interactive element in the ported frontend (web + mobile) carries a structured comment block describing *what it should do once wired to Convex*. Agents doing the backend-wiring run (Long Run 2) read these annotations to know exactly which query, mutation, or action to attach.

**Scope:** `apps/web/**/*.tsx`, `apps/mobile/**/*.tsx`, `packages/ui/**/*.tsx`.

## Shape

Annotations are JSX comments placed **immediately above** the interactive element they describe:

```tsx
{/*
  @action: completeTask
  @mutation: tasks.complete({ taskId })
  @optimistic: mark row as done, fade out 240ms
  @auth: required
  @errors: toast "couldn't save, retrying"
  @analytics: task_completed
*/}
<Button onClick={...}>Done</Button>
```

For TypeScript files that are not JSX (utils, types), use a regular block comment with the same tag set.

## Tag set

Use **only these tags**. Grep-able, machine-readable, no synonyms.

| Tag | Required when | Example |
|---|---|---|
| `@action` | Any interactive element | `@action: completeTask` — a short slug for the action |
| `@query` | Element renders reactive data | `@query: tasks.listToday({ userId })` |
| `@mutation` | Element writes data | `@mutation: tasks.complete({ taskId })` |
| `@action-call` | Element triggers a Convex action | `@action-call: coach.sendMessage({ threadId, text })` |
| `@navigate` | Click navigates | `@navigate: /tasks/{taskId}` or `@navigate: push(HabitDetail, { id })` |
| `@optimistic` | Mutation has optimistic UI | `@optimistic: add row locally, server reconciles` |
| `@auth` | Auth contract | `@auth: required` \| `@auth: public` \| `@auth: owner` |
| `@errors` | How failures render | `@errors: toast "couldn't sync"` |
| `@analytics` | PostHog event (opt-in) | `@analytics: task_completed` |
| `@source` | Origin in Claude export | `@source: screens-1.jsx:L120-L180` |
| `@todo` | Known gap for the backend-wire run | `@todo: wire optimistic reorder` |
| `@confirm` | Needs user confirm/undo per HARD_RULES | `@confirm: undoable 5s` |
| `@streaming` | Streamed response (coach, AI) | `@streaming: token stream via action` |
| `@convex-mutation-needed` | UI implies a Convex mutation not yet wired | `@convex-mutation-needed: tasks.complete` |
| `@convex-action-needed` | UI implies a Convex Node-runtime action not yet wired | `@convex-action-needed: voice.transcribe` |
| `@convex-query-needed` | UI depends on a Convex reactive read not yet wired | `@convex-query-needed: tasks.listToday` |
| `@provider-needed` | External provider required for this control | `@provider-needed: openrouter` |
| `@schema-delta` | UI implies schema field/table missing in `convex/schema.ts` | `@schema-delta: voiceSessions.mode` |
| `@tier-caps` | Tier cap/limits that must be enforced client + server | `@tier-caps: basic 30 min/day, pro 2h/day` |
| `@behavior` | Plain-language pseudocode for control behavior | `@behavior: Press and hold to record, release to transcribe, append transcript.` |

## Header per route

Every screen route file (e.g. `apps/web/app/(tempo)/today/page.tsx`) starts with a **screen header** block:

```tsx
/**
 * @screen: today
 * @category: Flow
 * @source: screens-1.jsx:L1-L436
 * @summary: Single-column daily canvas. Brain-dump composer + staged plan + coach suggestion.
 * @queries:
 *   - tasks.listToday
 *   - calendar.listToday
 *   - coach.latestSuggestion
 * @mutations:
 *   - tasks.capture
 *   - tasks.complete
 *   - tasks.stage
 * @auth: required
 * @routes-to:
 *   - /brain-dump (from composer expand)
 *   - /coach (from suggestion chip)
 * @notes: Copy is Claude placeholder; replace in copy pass.
 */
```

## Component primitive headers

Shared atoms in `packages/ui` carry a short JSDoc only — no runtime annotations unless the primitive is itself interactive (e.g. `TaskRow`, `CoachBubble`).

```tsx
/**
 * SoftCard — cream card surface with 1px border and whisper shadow.
 * Props match `HTMLAttributes<HTMLDivElement>`.
 * @source: components.jsx:L180-L210
 */
```

## Grep recipes

- Every action on the app: `rg "@action:" apps`
- Unwired mutations: `rg "@mutation:" apps | rg "@todo:"`
- Queries by vertical: `rg "@query: tasks\." apps`
- Source-trace a screen: open the `@source` line in the zip export.
- Convex wiring backlog: `rg "@convex-(mutation|action|query)-needed:" apps`
- Provider dependencies: `rg "@provider-needed:" apps`
- Schema deltas to review against `convex/schema.ts`: `rg "@schema-delta:" apps`
- Pseudocode quality pass: `rg "@behavior:" apps`

## What agents must NOT do

- Do not invent Convex function names. If the mutation doesn't exist yet, still use a concrete slug (`tasks.complete`) — Long Run 2 will create it.
- Do not leave `@todo` without context. Either describe the gap in ≤1 line or don't use the tag.
- Do not fill in stubs with fake data fetched from Convex — keep mocks from `@tempo/mock-data` until Long Run 2.
