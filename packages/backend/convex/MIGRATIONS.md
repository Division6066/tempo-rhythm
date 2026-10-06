# Convex migrations

Append-only log of schema changes and the data-migration state of the prod / staging deployments.

## 2026-04-18 — Add `deletedAt` to every user-owned table

**Ticket:** (pending — see `docs/brain/TASKS.md`)
**Compliance:** HARD_RULES §9 (soft-delete only for user-visible data).

### Schema change

Added `deletedAt: v.optional(v.number())` to:

- `users`
- `conversations`
- `messages`
- `memories`
- `tasks`
- `notes`
- `habits`
- `goals`

Added compound index `by_userId_deletedAt` (or `by_conversationId_deletedAt` on `messages`, `by_deletedAt` on `users`) to every affected table so active-row queries do not scan.

### Data backfill

**Not required.** `v.optional(v.number())` accepts `undefined`, which is the "live" state by convention. Existing rows will read as `deletedAt === undefined` and behave as active. No action needed on prod or staging data.

### Application-layer follow-up (separate tickets)

Every existing `ctx.db.delete(...)` call site for user-visible data must be replaced with a patch setting `deletedAt: Date.now()`.

Rows remaining hard-deletable (HARD_RULES §9 exceptions):

- RAM-only scanner staging rows
- Expired rate-limit buckets
- Test fixtures

### Query-layer follow-up

Every `ctx.db.query("<table>").withIndex("by_userId", ...)` stream should be updated to also filter `deletedAt === undefined` (or to use the new `by_userId_deletedAt` index). This is a non-blocking follow-up — queries that ignore `deletedAt` will still read existing data correctly until the application starts writing `deletedAt` values.

### userId type

`userId: v.id("users")` is intentionally preserved on every table. HARD_RULES §9 "Current repository" explicitly permits this transitional state. A future migration will move to `userId: v.optional(v.string())` to support anonymous onboarding; that migration is tracked separately in `docs/brain/TASKS.md`.
