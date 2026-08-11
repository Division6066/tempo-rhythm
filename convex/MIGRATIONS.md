# Convex schema migrations

Chronological log of schema changes. Every entry names the change, the
deployment(s) it was pushed to, and the date. Additive-only changes (new
tables, new optional fields) deploy without a migration; anything destructive
needs a widen–migrate–narrow plan documented here **before** it ships.

Deployments:

- **prod**: `precious-wildcat-890` (`https://precious-wildcat-890.eu-west-1.convex.cloud`)

---

## 2026-08-11 — TF-OSS-01 keystone + T-005a/T-006a tables

Branch `cursor/tfoss01-tasks-calendar-alpha-fb84`, tickets #306 (TF-OSS-01,
Linear TEMPO-227), #161 (T-005a), #164 (T-006a).

Additive only — no destructive migration, no backfill required:

- **New table `taskRepeatCfgs`** — recurrence series config (design lifted from
  super-productivity, MIT, nothing vendored). Indexes `by_userId`,
  `by_userId_deletedAt`.
- **New fields on `tasks`** (all `v.optional(...)` — the deployment is
  populated): `energy`, `timeEstimate`, `timeSpentOnDay`, `repeatCfgId`,
  `parentTaskId`, `projectId`, `projectName`. New index
  `by_userId_projectId`.
- **New table `calendarEvents`** — single event source for Day/Week/Month
  views. Indexes `by_userId`, `by_userId_deletedAt_startsAtMs`,
  `by_userId_deletedAt`.

Deployed to: **pending** — requires `bun x convex deploy` with the prod deploy
key after this PR merges to `integration` (deploy key is not available to
cloud agents; needs Amit or a `CONVEX_DEPLOY_KEY` secret). Update this line
with the deployment name + date when pushed.
