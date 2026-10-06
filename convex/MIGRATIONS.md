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

## 2026-10-05 — TEMPO-B04-01 templates, preferences, notifications

Branch `t/585-tempo-b04-01`, ticket #585. Additive only — new tables and one
optional field. No backfill.

- **`users.onboardedAt`** — optional number.
- **New table `templates`** — person-saved page templates. Indexes `by_userId`,
  `by_userId_deletedAt`. Starter templates stay in code, not rows.
- **New table `userPreferences`** — one settings row per person. Indexes
  `by_userId`, `by_userId_deletedAt`.
- **New table `notifications`** — indexes `by_userId`, `by_userId_createdAt`,
  `by_userId_deletedAt`.

Deployed to: **not deployed by this ticket**. Merge to `integration` deploys
the test deployment `ceaseless-dog-617` via `convex-deploy-test`. Live
(`precious-wildcat-890`) is not touched here.

## 2026-10-06 — TEMPO-GATE-01 sign-up approval gate + DeepInfra model seam

Additive only. No backfill required.

- **`users.approvalStatus`** — optional `"pending" | "approved" | "revoked"`, plus
  `approvalUpdatedAt` (number) and `approvalUpdatedBy` (admin email, `"cli"` or
  `"backfill"`). New index `by_approvalStatus`.
- New accounts (both write paths: `auth.ts` callback and `users.createOrUpdateUser`)
  start **`pending`**. Emails in Convex env **`TEMPO_ADMIN_EMAILS`** (comma separated)
  start approved and are always approved (admins).
- Rows with no `approvalStatus` created before `APPROVAL_GATE_EPOCH_MS`
  (7 Oct 2026 00:00 IDT) count as approved, so existing users and e2e test users
  keep working. Rows after it with no status count as pending (fail closed).
- Server-side rejection (`ACCOUNT_PENDING_APPROVAL`) for non-approved accounts in:
  `brain_dump.prioritize`, `nags.proposePhrases`, `memories.extractMemories`
  (actions, via `lib/aiGate.requireApprovedForAi`), `coach.sendMessage`,
  `messages.create`, `conversations.create` (via `lib/approval.requireApprovedUser`).
  Rule for new code: every action that calls an LLM, STT or TTS calls
  `requireApprovedForAi(ctx)` first.
- Admin surface: `approval.listForAdmin` (query) and `approval.setStatus` (mutation),
  admin-only. CLI (internal, deploy key needed):
  `npx convex run approval:setStatusByEmail '{"email":"x@y.z","status":"approved"}'`
  (`"revoked"` to revoke), `npx convex run approval:listByStatus '{"status":"pending"}'`,
  optional `npx convex run approval:approveExistingUsers`.
- **AI model seam:** `lib/ai_router.ts` now calls DeepInfra's OpenAI-compatible
  endpoint (`https://api.deepinfra.com/v1/openai/chat/completions`) with
  `TEMPO_AI_MODEL` (default `deepseek-ai/DeepSeek-V4.1-Flash`) and `DEEPINFRA_API_KEY`.
  `memories.extractMemories` uses the same seam (no more AI_PROVIDER/AI_MODEL/AI_API_KEY
  reads). `ai_smoke.pingMistral` → `ai_smoke.pingModel`. `MISTRAL_API_KEY` is no longer read.

Deployed to: **not deployed by this ticket**. Merge to `integration` deploys the test
deployment `ceaseless-dog-617` via `convex-deploy-test`. Live is Amit's.
