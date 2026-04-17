# Agent Orchestration Patterns

Playbook-Version: 1.0.0
Applies-To: $PROJECT (generic — fork and replace placeholder)

This document describes how to compose Cursor IDE, Cursor Cloud Background Agents,
Twin.so, Pokee AI, Zo Computer, and humans into a reliable, auditable, self-correcting
system. Each pattern is self-contained and can be adopted independently.

---

## 1. Overview

A multi-agent software project fails in predictable ways:
- Agents step on each other's work because task boundaries are not enforced.
- No one knows what any agent is doing at a given moment.
- A misbehaving agent makes changes with no record of what it did or why.
- There is no kill switch — stopping one agent requires logging into five dashboards.
- Retry storms: an agent retries a failed action repeatedly, creating duplicates.

The patterns in this document address each failure mode. They form a layered system:

```
Layer 1: Source of truth   — GitHub + repo-committed TASKS.md
Layer 2: Event routing     — Pokee as the central router
Layer 3: Observability     — Discord, one channel per agent
Layer 4: Runtime state     — Convex agent tables (or SQLite/JSON for non-Convex projects)
Layer 5: Safeguards        — Kill switch, audit log, idempotency, rate limiting
Layer 6: Escalation        — Human-in-the-loop at defined checkpoints
```

Adopt layers in order. A project with only Layers 1 and 3 is already dramatically better
than no system at all.

---

## 2. The GitHub-as-Spine Pattern

### Principle

Everything that matters in the project flows through GitHub: Issues track work, PRs
carry code changes, Releases mark shipped versions, Actions enforce quality gates, and
Projects optionally provide a Kanban view. No rented task-tracker — no Notion, no
Linear, no Airtable.

### Why GitHub

- It is version-controlled: every state change is a commit.
- It has a rich webhook API: every event can trigger downstream automation via Pokee.
- It is free for public repos and inexpensive for private.
- It survives vendor pivots — the data is text in a git repository.
- Pull requests are the natural unit of agent output: agents write code and open PRs;
  humans merge.

### Implementation

**Issues** — used for:
- Bug reports (label: `bug`)
- Feature requests (label: `enhancement`)
- Agent task tracking (label: `agent-task`, owner tag in body)
- Support tickets (label: `support`, created by Pokee from email)

**PRs** — used for:
- All code changes, including agent-generated changes
- Every PR must reference an Issue: `Closes #N`
- Agent PRs are labeled with the agent that created them: `zo-automated`, `cursor-cloud`
- Human review is required before merging (enforced by branch protection)

**Releases** — used for:
- Every shipped version, tagged semver
- Release body is the changelog (written by Cursor Cloud or Zo)
- Release event triggers Pokee cross-post workflow

**Actions** — used for:
- CI (type check, lint, test) on every PR
- Forbidden-tech scan on every PR
- Deploy preview on every PR (via Vercel webhook)
- Label-based routing (apply label → trigger Pokee → trigger agent)

**Projects (optional)** — a GitHub Project board provides a Kanban view of Issues.
Use it for human orientation, not for agent state. Agents read from TASKS.md and GitHub
Issue APIs, not from a Project board.

### Label Taxonomy

Define these labels in your repo (create them in Settings → Labels):

| Label | Color | Meaning |
|---|---|---|
| `bug` | red | Something is broken |
| `enhancement` | blue | New feature or improvement |
| `documentation` | yellow | Docs-only change |
| `question` | purple | Support question |
| `support` | orange | Customer support ticket |
| `agent-task` | grey | Created and owned by an agent |
| `zo-automated` | teal | Output of a Zo job |
| `cursor-cloud` | cyan | Output of a Cursor Cloud agent |
| `twin-action` | indigo | Result of a Twin.so session |
| `needs-review` | white | Awaiting human review |
| `pending-approval` | gold | Agent waiting for human sign-off |
| `zo-handoff` | teal | Zo → next agent handoff signal |
| `approved` | green | Human has reviewed and approved |
| `blocked` | dark red | Cannot proceed without input |
| `needs-triage` | grey | Unclassified incoming item |

---

## 3. The Pokee-as-Router Pattern

### Principle

Pokee is the single broker between all event sources and all agent executors. No agent
talks to another agent directly — they emit events to Discord or GitHub, and Pokee
observes and dispatches.

This means:
- You can modify the routing logic by editing one Pokee workflow, not every agent.
- You can add a new destination (a new social platform, a new agent) without touching
  the source agent.
- The kill switch (Section 8) works by disabling Pokee's webhook receiver — everything
  downstream pauses automatically.

### Event Sources Pokee Listens To

| Source | Event | Example trigger |
|---|---|---|
| GitHub webhook | `issues.opened` | New issue → triage workflow |
| GitHub webhook | `release.published` | New release → cross-post workflow |
| GitHub webhook | `pull_request.labeled` | Label applied → route to agent |
| Discord channel | `#handoffs` message | Agent A signals Agent B |
| Discord channel | `#approvals` reply | Human approval → resume agent |
| Zo HTTP POST | Job completion payload | Zo done → fan-out artifacts |
| Scheduled cron | Time-based | Daily digest, weekly newsletter |
| HTTP inbound webhook | Any JSON POST | Generic event from any source |

### Label-Based Routing

The most common routing pattern: a GitHub Action applies a label to an Issue or PR, and
Pokee routes based on that label.

Example routing table (configure in Pokee):

| Label applied | Pokee action |
|---|---|
| `zo-handoff` | Trigger Cursor Cloud agent to review the Zo-produced PR |
| `pending-approval` | Post to Discord #approvals with human prompt |
| `approved` | Remove `pending-approval` label; signal next agent |
| `blocked` | Post to Discord #blocked; start escalation timer |
| `needs-review` | Assign to `human-<name>` based on Issue category |
| `agent-task` + `cursor-cloud` | No routing action; Cursor Cloud owns this |

### Pokee Workflow Directory

Maintain a file `agent-playbooks/pokee-workflows.md` listing every Pokee workflow by
name, trigger, and purpose. Update it whenever you add or modify a workflow. This file
is the human-readable index of your automation layer.

---

## 4. The Discord-as-Observability Pattern

### Principle

Discord is the single glass pane for everything happening in the agent system. Every
agent posts structured status messages to its channel. Humans read Discord to understand
system state without logging into any agent dashboard.

### Channel Structure

```
$PROJECT Server
  Category: Agents
    #agent-cursor-cloud    — PR links, build status, notes from all Cursor Cloud agents
    #agent-twin            — Session logs and outcomes from Twin.so
    #agent-pokee           — Workflow execution logs from Pokee
    #agent-zo              — Job start, progress, and completion from Zo
  Category: Coordination
    #handoffs              — Cross-agent handoff signals
    #approvals             — Items requiring human decision
    #blocked               — Stuck tasks awaiting unblocking input
    #summary               — Daily digest of all activity (auto-posted by Pokee)
  Category: Product
    #announcements         — Public-facing announcements (release posts, etc.)
    #releases              — Internal release notes
```

### Message Format

Every agent message should follow this format to be machine-parseable by Pokee:

```
[STATUS] Agent: <agent_name> | Job: <job_id> | <message>
```

Status tags: `[START]`, `[DONE]`, `[ERROR]`, `[BLOCKED]`, `[HANDOFF]`, `[APPROVAL]`

Example:
```
[DONE] Agent: zo | Job: transcription-2025-01-13-001 | 3 files processed.
Download: https://s3.amazonaws.com/...
```

### Pokee as Discord Monitor

Configure Pokee to watch `#handoffs` and `#approvals` for human replies. When a human
posts a reply containing a keyword (`proceed`, `approve`, `done`, `skip`, `reject`),
Pokee parses the reply, identifies the job it refers to (by job_id in the original
message), and dispatches the next action.

This creates a natural human-in-the-loop mechanism with zero extra tooling.

---

## 5. The Repo-Committed TASKS.md Pattern

### Principle

A single `TASKS.md` file in the repo root is the authoritative list of what each agent
is currently working on. It is committed to the repo, so it is version-controlled and
visible to all agents and humans.

Agents read TASKS.md at the start of their session to understand their scope. Agents
update TASKS.md when they start and complete tasks. Humans update TASKS.md to add or
reprioritize work.

### TASKS.md Schema

```markdown
# $PROJECT — Active Tasks

Last updated: YYYY-MM-DD HH:MM UTC

## cursor-cloud-1 (Core Features)
- [ ] Implement user authentication flow (Issue #42) — in-progress
- [ ] Add email verification (Issue #43) — queued

## cursor-cloud-2 (AI & Intelligence)
- [ ] Integrate OpenAI embeddings for search (Issue #51) — in-progress

## cursor-cloud-3 (Platform & Polish)
- [ ] Fix navigation animation on iOS (Issue #67) — queued
- [x] Add splash screen (Issue #60) — DONE, PR #89 merged

## twin
- [ ] Submit v1.0 to App Store (Issue #70) — pending-approval
- [ ] Create RevenueCat products (Issue #71) — queued

## pokee
- [ ] Configure release cross-post workflow — done, active
- [ ] Configure weekly digest — done, active

## zo
- [ ] Nightly error sweep — recurring (runs at 02:00 UTC)
- [ ] Asset batch for v1.0 launch — queued

## human-amit
- [ ] Review App Store submission screenshots (Issue #70)
- [ ] Record intro vlog for launch
```

### Owner Tag Conventions

| Tag | Meaning |
|---|---|
| `cursor-ide` | Active in local IDE session |
| `cursor-cloud-1` | Cursor Cloud cluster 1 |
| `cursor-cloud-2` | Cursor Cloud cluster 2 |
| `cursor-cloud-3` | Cursor Cloud cluster 3 |
| `twin` | Twin.so browser agent |
| `pokee` | Pokee AI workflow |
| `zo` | Zo Computer job |
| `human-<name>` | Specific human (lowercase first name) |
| `blocked` | Task halted, waiting for input |
| `pending-approval` | Awaiting human sign-off before proceeding |

### Update Protocol

- Agents prepend `[START]` and append `[DONE]` markers to their task entries when they
  begin and finish.
- Agents commit TASKS.md changes on a separate branch (e.g., `tasks/update-YYYY-MM-DD`)
  and open a tiny PR — this keeps the TASKS.md commit history clean and attributable.
- Alternatively, Pokee can maintain TASKS.md by listening for agent Discord messages and
  editing the file via GitHub API — this is more automated but requires careful conflict
  handling.
- Humans can directly edit TASKS.md on main — agents pull the latest before reading.

---

## 6. The Convex Agent Tables Pattern

### When to Use This

Use this pattern when your project already uses Convex as its backend database. Convex
provides real-time reactive queries, which means an agent can watch a table for new
tasks without polling.

If the project does not use Convex, use the fallback described at the end of this section.

### Table Definitions

Add these tables to your `convex/schema.ts`:

```typescript
// Agent execution runs — one row per job
agent_runs: defineTable({
  agent: v.string(),              // "zo", "twin", "pokee", "cursor-cloud-1", etc.
  job_id: v.string(),             // unique, e.g., "zo-transcription-20250113-001"
  status: v.string(),             // "started" | "running" | "done" | "error" | "blocked"
  prompt_hash: v.string(),        // SHA256 of the prompt used (for deduplication)
  started_at: v.number(),         // Unix timestamp
  completed_at: v.optional(v.number()),
  result_summary: v.optional(v.string()),
  artifact_urls: v.optional(v.array(v.string())),
  error_message: v.optional(v.string()),
}).index("by_agent", ["agent"])
  .index("by_status", ["status"])
  .index("by_job_id", ["job_id"]),

// Individual task items within a run
agent_tasks: defineTable({
  run_id: v.id("agent_runs"),
  task_description: v.string(),
  status: v.string(),             // "pending" | "done" | "failed" | "skipped"
  completed_at: v.optional(v.number()),
}).index("by_run", ["run_id"]),

// Handoff events between agents
agent_handoffs: defineTable({
  event_id: v.string(),           // unique UUID — used for idempotency
  from_agent: v.string(),
  to_agent: v.string(),
  payload: v.any(),               // JSON — job instructions for the target agent
  status: v.string(),             // "pending" | "received" | "processed"
  created_at: v.number(),
  processed_at: v.optional(v.number()),
}).index("by_to_agent", ["to_agent"])
  .index("by_event_id", ["event_id"]),

// Artifacts produced by agents
agent_artifacts: defineTable({
  run_id: v.id("agent_runs"),
  artifact_type: v.string(),      // "pr_url" | "s3_url" | "screenshot" | "report"
  url: v.string(),
  description: v.optional(v.string()),
  created_at: v.number(),
}).index("by_run", ["run_id"]),
```

### Usage Pattern

1. When an agent starts a job, it inserts a row into `agent_runs` with status `started`.
2. As it completes each step, it updates `agent_tasks` rows.
3. When the job finishes, it updates `agent_runs` to `done` and inserts into
   `agent_artifacts`.
4. To hand off to another agent, it inserts into `agent_handoffs`. The target agent
   either polls this table or is triggered by a Convex scheduled function.
5. A Convex scheduled function sweeps `agent_handoffs` every 60 seconds, finds pending
   rows addressed to each agent, and posts to that agent's webhook.

### Non-Convex Fallback

If the project does not use Convex, maintain agent state in two files in the repo:

- `agent-state/agent-runs.json` — array of run objects (append-only log)
- `agent-state/agent-handoffs.json` — array of handoff events (append-only log)

Agents read and write these files via GitHub API (read file → parse JSON → append →
write back). Add file locking by having agents create a `agent-state/.lock` file and
check for it before writing. This is less elegant than Convex but sufficient for low
concurrency.

---

## 7. The Human-Escalation Pattern

### Principle

Any task that is blocked for more than N hours without human attention triggers an
escalation. Pokee is the escalation engine.

### Escalation Levels

| Time since block | Escalation action |
|---|---|
| 30 minutes | Post to Discord #blocked (already done by agent) |
| 2 hours | Pokee posts a reminder to #blocked: "Still blocked: $JOB. 2h elapsed." |
| 4 hours | Pokee sends Twilio SMS to $FOUNDER_PHONE |
| 8 hours | Pokee sends Resend email to $FOUNDER_EMAIL |
| 24 hours | Pokee auto-cancels the blocked job and files a GitHub Issue |

### Pokee Escalation Workflow

```
Trigger: Pokee scheduled check every 30 minutes

Steps:
1. Read the last 24 hours of messages in Discord #blocked.
2. For each [BLOCKED] message that does not have a subsequent human reply
   (look for "proceed", "done", "approve", "skip", "reject"):
   a. Calculate time elapsed since the [BLOCKED] message was posted.
   b. Apply escalation level based on elapsed time (table above).
3. For Twilio SMS: POST to Twilio API (account SID + auth token + from number).
   Message: "$PROJECT: Agent $AGENT_NAME has been blocked for $HOURS hours.
   Check Discord #blocked. Job: $JOB_DESCRIPTION"
4. For email: send via Resend to $FOUNDER_EMAIL with the full blocked message content.
5. For auto-cancel: add comment to relevant GitHub Issue (if one exists), change
   Issue label from "agent-task" to "blocked", and post to #blocked:
   "[AUTO-CANCELLED] Job $JOB_ID cancelled after 24h without resolution.
   Manual intervention required. GitHub Issue: $ISSUE_URL"
```

### Required Env Vars

```
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_FROM_NUMBER
FOUNDER_PHONE
FOUNDER_EMAIL
RESEND_API_KEY
```

---

## 8. The Kill-Switch Pattern

### Principle

When something goes wrong — an agent misbehaves, a loop fires unexpectedly, a
third-party API returns corrupt data — you need to stop everything in one action.

The kill switch is: **disable Pokee's inbound webhook receiver**.

Because Pokee sits between all event sources and all agent executors (Pattern 3), disabling
Pokee's ability to receive webhooks means:
- No new agent jobs are triggered.
- No cross-posts fire.
- No escalations are sent.
- Active running jobs (Zo, Cursor Cloud) continue until their current step finishes,
  then have no new work dispatched.

This is the correct granularity for an emergency stop: you halt new work without
interrupting an in-flight database write or file save that would leave things corrupt.

### Kill-Switch Steps

1. **Log into Pokee** → Settings → Webhooks → Inbound Endpoint → Toggle to "Disabled".
2. **Post to Discord #summary**: "[KILL SWITCH ACTIVATED] All agent automation paused.
   Manual review in progress."
3. **Investigate**: Check Discord channels for the most recent [ERROR] or [DONE] messages
   to understand what happened.
4. **Resolve**: Fix the root cause (rotate a key, fix a bug, remove a bad prompt).
5. **Re-enable**: Toggle Pokee webhook receiver back to "Enabled".
6. **Post to Discord #summary**: "[KILL SWITCH RELEASED] Agent automation resumed."
7. **File a GitHub Issue** describing the incident, the timeline, and the fix. Label:
   `incident`. This becomes part of the audit trail.

### Per-Agent Kill Switches

For finer-grained control, each agent has its own pause mechanism:

| Agent | Kill mechanism |
|---|---|
| Pokee | Disable inbound webhook (pauses all Pokee-routed work) |
| Zo | Cancel the active session from the Zo dashboard |
| Twin | Close the active browser session from Twin dashboard |
| Cursor Cloud | Cancel the background agent from Cursor's cloud panel |
| Cursor IDE | Close the chat panel or type "Stop" |

---

## 9. The Audit-Log Pattern

### Principle

Every agent action that modifies external state (creates a file, opens a PR, posts to
social media, sends an email, submits a form) must be logged with:
- A unique event ID
- The agent that performed the action
- A timestamp (UTC)
- The action type
- The target (URL, Issue number, platform, etc.)
- The outcome (success, failure, pending)

The audit log is the record of what your system did. Without it, debugging an incident
is guesswork.

### Audit Log Schema

Each log entry is a JSON object:

```json
{
  "event_id": "zo-20250113-transcription-001-step-3",
  "agent": "zo",
  "timestamp": "2025-01-13T02:14:33Z",
  "action_type": "s3_upload",
  "target": "s3://my-bucket/project/transcripts/2025-01-13/transcripts.zip",
  "outcome": "success",
  "metadata": {
    "file_size_bytes": 2048576,
    "presigned_url_expires": "2025-01-27T02:14:33Z"
  }
}
```

### Storage Options

**Option A: Append to a file in the repo** (simplest)
```
agent-playbooks/audit-logs/YYYY-MM-agent-name.jsonl
```
Each line is one JSON log entry (JSONL format). Agents write via GitHub API.

**Option B: Convex `agent_runs` table** (if project uses Convex)
The `agent_runs` and `agent_tasks` tables already serve as a structured audit log.
Add an `audit_log` table for finer granularity if needed.

**Option C: S3 bucket**
Each agent appends to a log file in S3. The bucket has versioning enabled so entries
cannot be deleted. Use this for compliance-sensitive projects.

### Log Retention

Retain audit logs for a minimum of 90 days. For regulated industries, retain for the
legally required period. Archive logs older than 90 days to S3 Glacier.

---

## 10. The Idempotency Pattern

### Principle

Agents retry on failure. Without idempotency, retries create duplicates: two GitHub
Issues for the same email, two tweets for the same release, two S3 uploads of the same
file.

Every agent action that has an observable side effect must be idempotent: running it
twice with the same input produces the same result as running it once.

### Implementation

**Step 1: Assign an event ID to every trigger event**

The event ID is a deterministic hash of the trigger inputs:
```
event_id = SHA256(agent_name + "|" + trigger_type + "|" + trigger_payload_hash)
```

For scheduled jobs, use:
```
event_id = SHA256(agent_name + "|" + job_name + "|" + ISO_date_of_scheduled_run)
```

**Step 2: Check before acting**

Before performing any side-effecting action, the agent checks if an entry with this
event ID already exists in the audit log or `agent_runs` table. If it does, the agent
skips the action and returns the cached result.

```python
# Pseudocode
def create_github_issue(event_id, title, body, labels):
    existing = db.query("SELECT * FROM agent_runs WHERE job_id = ?", event_id)
    if existing and existing.status == "done":
        return existing.result_summary  # already created — return cached issue URL
    issue_url = github_api.create_issue(title, body, labels)
    db.insert("agent_runs", {job_id: event_id, status: "done", result_summary: issue_url})
    return issue_url
```

**Step 3: Use GitHub's idempotency features**

- PRs: check if a branch already exists before creating it. If it does, update the
  existing branch rather than creating a new PR.
- Issues: search for an existing issue with the same title before creating a new one.
- Labels: GitHub label application is naturally idempotent (applying an existing label
  is a no-op).

**Step 4: Use platform idempotency keys where available**

- Stripe API: pass an `Idempotency-Key` header on all POST requests.
- Resend: pass an `Idempotency-Key` header.
- Twilio: Twilio deduplicates SMS with the same `MessagingServiceSid` + body within
  4 hours.

---

## 11. The Rate-Limiting Pattern

### Principle

Agents run faster than human contributors and can exhaust API quotas in minutes. Every
agent must implement client-side rate limiting.

### Per-Integration Limits (Reference)

| Integration | Limit | Agent-side backoff |
|---|---|---|
| GitHub REST API | 5,000 req/hour | Exponential backoff after 429; check `X-RateLimit-Remaining` header |
| GitHub GraphQL | 5,000 points/hour | Same |
| X (Twitter) API v2 | 1,500 tweets/month (free), 300 reads/15min | Sleep 60s on 429 |
| LinkedIn Content API | 100 posts/day | Track count in agent state |
| Instagram Content Publish | 25 calls/hour | Sleep between posts |
| Sentry REST API | 100 req/s | Rarely hit; exponential backoff if 429 |
| PostHog Cloud API | Plan-dependent | Exponential backoff |
| Resend | 2 req/s (free), 10 req/s (paid) | Sleep between sends |
| Twilio SMS | Configurable; check account limits | Add 1s between SMS sends |
| OpenAI API | Token-based; model-specific | Exponential backoff on 429 |
| Anthropic API | Message-based; tier-specific | Exponential backoff on 429 |
| S3 | 3,500 PUT/s, 5,500 GET/s per prefix | Rarely hit in agent workloads |

### Agent-Side Backoff Template

```python
# Pseudocode — implement in the language your agent's pipeline uses
import time, random

def call_with_backoff(fn, max_retries=5, base_delay=1.0):
    for attempt in range(max_retries):
        try:
            return fn()
        except RateLimitError as e:
            if attempt == max_retries - 1:
                raise
            delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
            log(f"Rate limited. Retry {attempt + 1}/{max_retries} in {delay:.1f}s")
            time.sleep(delay)
        except TransientError as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(base_delay * (2 ** attempt))
```

### Quota Tracking

For integrations with monthly limits (X tweets, LinkedIn posts), maintain a counter in
the `agent_runs` table or in a JSON file in the repo:

```json
// agent-state/quota-usage.json
{
  "twitter_tweets_this_month": 87,
  "linkedin_posts_this_month": 12,
  "month": "2025-01"
}
```

Pokee checks this file before firing any cross-posting workflow. If a quota is within
10% of the limit, Pokee posts a warning to Discord #blocked.

---

## 12. The Credential-Rotation Pattern

### Rotation Schedule

| Integration | Rotation Frequency | Owner | Notes |
|---|---|---|---|
| GitHub Personal Access Token | 90 days | human-amit | Set expiry in GitHub token settings |
| Anthropic API key | 90 days | human-amit | Rotate in Anthropic console |
| OpenAI API key | 90 days | human-amit | Rotate in OpenAI platform |
| Replicate API token | 90 days | human-amit | Rotate in Replicate settings |
| AWS access key | 60 days | human-amit | Use IAM — create new, update, then delete old |
| Twilio auth token | On incident | human-amit | Rotate only if compromised |
| Resend API key | 90 days | human-amit | Rotate in Resend dashboard |
| Discord bot token | 180 days | human-amit | Rotate in Discord Developer Portal |
| LinkedIn OAuth token | 60 days | Pokee auto-refresh | Monitor for refresh failures |
| X OAuth token | Auto-refresh | Pokee auto-refresh | Monitor for expired refresh tokens |
| Instagram OAuth token | 60 days | Pokee auto-refresh | Monitor for expired refresh tokens |
| TikTok refresh token | 365 days | human-amit | Calendar reminder to re-authenticate |

### Rotation Process

1. Create the new credential in the external service.
2. Update the secret in every location that holds it:
   - Your `universal.env` or project secrets file
   - Zo Computer → API Keys
   - Pokee → Integrations
   - Any GitHub Actions secrets
   - Any Convex environment variables
3. Verify: run a test action for each agent that uses the credential.
4. Delete the old credential in the external service.
5. Log the rotation in the audit log with action type `credential_rotation`.
6. Update the rotation date in `agent-state/credential-rotation-log.json`.

### Rotation Reminders

Add a Pokee workflow that fires on the 1st of each month:

```
On the 1st of each month, check agent-state/credential-rotation-log.json.
For each credential where (today - last_rotation_date) >= rotation_frequency_days:
  Post to Discord #blocked: "[CREDENTIAL] $INTEGRATION key due for rotation.
  Owner: $OWNER. Last rotated: $DATE. Instructions: see AGENT_ORCHESTRATION_PATTERNS.md §12"
```

---

## 13. Anti-Patterns to Avoid

### 13.1 Rented Task-Tracker Lock-In

**Anti-pattern**: Storing all task state in Notion, Linear, Airtable, Jira, or any SaaS
task tracker as the primary record.

**Problem**: When the SaaS changes pricing, deprecates an API, or suffers an outage, your
task history is inaccessible. Agent workflows break when the API schema changes. Data export
is painful and lossy.

**Correct approach**: GitHub Issues + repo-committed TASKS.md. These are text in git.
They will outlast any SaaS.

### 13.2 Agents with Write Access to Production Without Confirmation

**Anti-pattern**: An agent that can directly modify a production database, production env
vars, or a live user-facing service without a human-in-the-loop checkpoint.

**Problem**: A hallucinated or malformed action corrupts production data. There is no
undo. Users are affected.

**Correct approach**: All agent actions that mutate production resources must go through
`#approvals`. The agent proposes, the human approves, the agent executes. For low-risk
writes (GitHub Issue comment, Discord message, draft newsletter), agents can act without
approval. For irreversible writes (delete, submit, publish, charge), always require
approval.

### 13.3 Agents That Mutate State Without Audit Logging

**Anti-pattern**: An agent modifies files, creates records, or posts content without
writing to the audit log.

**Problem**: When something goes wrong, you cannot reconstruct what the agent did. You
cannot tell a customer "this is what happened to your account." You cannot debug the
error because you have no trail.

**Correct approach**: Every side-effecting action writes to the audit log. This is non-
negotiable. If an agent framework does not support audit logging, add it at the wrapper
layer.

### 13.4 No Kill Switch

**Anti-pattern**: Agents are wired together with no single point where you can stop all
automation.

**Problem**: A misbehaving agent triggers a cascade. You need to log into five dashboards
and manually cancel five sessions while the agent continues to act.

**Correct approach**: Pokee is the single kill switch. All routing flows through Pokee.
Disabling Pokee's webhook stops new work from being dispatched.

### 13.5 Agents Sharing File System Access

**Anti-pattern**: Two agents write to the same directory or file at the same time without
locking.

**Problem**: Race conditions corrupt files. One agent overwrites the other's output.
Debugging is very difficult because both agents report success.

**Correct approach**: Assign disjoint directory ownership. In Cursor Cloud, each agent
cluster owns a specific set of directories (see CURSOR_AGENT_PATTERNS.md §6). For shared
surfaces (TASKS.md, audit logs), use file locks or sequential writes via GitHub API.

### 13.6 Hardcoded Secrets in Prompts

**Anti-pattern**: A prompt scaffold contains a real API key value, password, or session
token inline.

**Problem**: The prompt is stored in a repo or in an agent's history. The secret leaks
to anyone with repo access or who can read the agent's conversation history.

**Correct approach**: Use named environment variable references in prompts. Never paste
real credential values into prompt text.

---

## 14. End-to-End Feature Lifecycle Example

This example traces a single feature from idea to ship using all five agents. The project
is referred to as `$PROJECT`; for an illustrative reference, a mobile productivity app
like Tempo Flow would follow this exact sequence.

### Day 0 — Feature Entry

Human adds a task to TASKS.md:

```markdown
## cursor-cloud-2 (AI & Intelligence)
- [ ] Add smart notification scheduling based on user calendar (Issue #88) — queued
```

Human opens GitHub Issue #88 with full acceptance criteria, design notes, and links to
relevant files. Labels: `enhancement`, `agent-task`, `cursor-cloud-2`.

### Day 1 — Cursor Cloud Implementation

Cursor Cloud Agent 2 picks up Issue #88 at the start of its session. It reads TASKS.md
and the Issue body. It works through the implementation in its VM, writes tests, and
opens PR #112 with:
- Description referencing Issue #88
- `cursor-cloud` label applied automatically by the GitHub Action
- CI passes (type check, lint, test)

Cursor Cloud posts to Discord #agent-cursor-cloud:
```
[DONE] Agent: cursor-cloud-2 | PR #112 opened for Issue #88 (smart notifications).
All checks pass. Review: https://github.com/$REPO/pull/112
```

Pokee detects the `cursor-cloud` label on PR #112 and posts to Discord #approvals:
```
[APPROVAL] PR #112 ready for review. Feature: smart notification scheduling.
Review and merge, or reply 'reject' to send back.
```

### Day 1 — Human Review

Human reviews PR #112, leaves comments, Cursor Cloud addresses them, and the PR is
merged. The `approved` label is applied.

TASKS.md is updated (by Cursor Cloud or human):
```markdown
- [x] Add smart notification scheduling (Issue #88) — DONE, PR #112 merged
```

### Day 2 — Twin Dashboard Action

The feature requires a new RevenueCat entitlement for the premium tier. Human updates
TASKS.md:
```markdown
## twin
- [ ] Create RevenueCat entitlement "smart-notifications" (Issue #89) — queued
```

Human triggers the Twin RevenueCat recipe (Section 4.4 of TWIN_PLAYBOOK.md). Twin
creates the product and entitlement, posts the result to Discord #agent-twin:
```
[DONE] Agent: twin | RevenueCat entitlement "smart-notifications" created.
```

### Day 2 — Zo Asset Batch

The release requires updated App Store screenshots showing the new feature. Human adds
a Zo task and uploads a `asset-brief.json` to the Zo workspace inputs folder. Zo runs
the asset batch generation job overnight.

Next morning, Zo posts to Discord #agent-zo:
```
[DONE] Agent: zo | Job: asset-batch-v1.4 | 12 assets generated. Download:
https://s3.amazonaws.com/.../assets-2025-01-14.zip
```

### Day 3 — Release

Human bumps the version, tags the release, and publishes a GitHub Release. The release
event fires:

- Pokee receives `release.published` webhook.
- Pokee triggers the release cross-post workflow (POKEE_PLAYBOOK.md §5.1):
  posts to X, LinkedIn, Instagram, Facebook, TikTok, Discord #announcements.
- Pokee triggers Zo to bundle the release artifact (ZO_PLAYBOOK.md §4.4).
- Zo uploads the bundle to S3 and attaches it to the GitHub Release.

Twin is triggered by Pokee to submit the new build to App Store Connect
(TWIN_PLAYBOOK.md §4.1). Twin pauses at the final submit step and posts to #approvals:
```
[APPROVAL] App Store submission ready for v1.4. Review screenshot and reply 'proceed'.
```

Human approves. Twin submits.

### Day 4 — Post-Launch

Zo's nightly error sweep runs at 02:00 UTC, finds no new errors related to the feature,
and posts a clean report to Discord #agent-zo.

The Pokee weekly analytics digest (POKEE_PLAYBOOK.md §5.2) fires Monday morning,
showing increased retention for users who enabled smart notifications.

Human marks Issue #88 as closed with a comment linking the PR, the release, and the
analytics data. The feature lifecycle is complete and fully documented in GitHub.

---

*End of AGENT_ORCHESTRATION_PATTERNS.md*
