# Reusable Agent Workflow Playbooks

A project-agnostic library of agent workflow patterns for solo founders and small teams
running the Cursor + Twin + Pokee + Zo multi-agent stack.

---

## 1. What This Folder Is

This folder is a portable collection of playbooks that document how to delegate work to
specialized AI agents in a modern software project. The playbooks describe who does what,
when to hand off, how agents communicate, and where humans must remain in the loop.

The patterns here emerged from running multiple software projects with a five-agent stack.
They are intentionally generic: every reference to a specific project uses the `$PROJECT`
placeholder so you can fork and adapt without rewriting from scratch.

None of these playbooks require Notion, Linear, Airtable, or any rented task-tracking SaaS.
The orchestration spine is GitHub Issues, GitHub Projects, Discord, and a repo-committed
`TASKS.md` file. That combination is free, version-controlled, and survives vendor lock-in.

---

## 2. Who This Is For

These playbooks target:

- **Solo founders** building a software product with a small surface area but high automation
  ambition — you want agents doing the repetitive work so you focus on judgment calls.
- **Small teams (2–5 people)** where each person wears multiple hats and async communication
  is the default.
- **Anyone running the specific stack** described in this README: Cursor IDE for local coding,
  Cursor Cloud Background Agents for async parallel coding, Twin.so for GUI-gated dashboards,
  Pokee AI for SaaS orchestration and publishing, and Zo Computer for long-running cloud jobs.

If you are using a different stack the conceptual patterns (router agent, kill switch, audit
log, idempotency) still apply — you will need to swap the agent names for your equivalents.

---

## 3. Agent Philosophy

The core principle is **delegate to the right agent for the class of work**. Each agent in
this stack has a distinct strength and a clear boundary where it should hand off to another.

### Delegation Matrix

| Work Class | Agent | Why |
|---|---|---|
| GUI-gated dashboard action (no API) | Twin.so | Browser automation bypasses the missing API |
| SaaS orchestration, publishing, triage | Pokee AI | 50+ OAuth integrations, plain-text workflows |
| Long-running cloud job, batch, transcription | Zo Computer | Persistent VM, scheduled, artifact storage |
| Tight-loop coding, schema iteration, spike | Cursor IDE | Fast feedback, local context, paired watching |
| Parallel overnight coding, cross-repo refactor | Cursor Cloud | Isolated VMs, async, PR-based output |
| Human judgment, legal sign-off, payment entry | Human | Cannot and should not be delegated |

### Principles

1. **No agent touches production without a human confirmation step.** Every workflow that
   mutates a production resource (App Store submission, Stripe product, DNS record) must
   have a human-in-the-loop checkpoint before the final write.

2. **Every agent action is logged.** Each agent emits a structured event with a unique ID
   to a shared audit store. Retries use the same ID so duplicates are detected.

3. **The kill switch is always one step away.** Disabling the Pokee webhook pauses the
   entire routing layer. Every other agent waits for a Pokee trigger or a GitHub label to
   proceed.

4. **Discord is the single observability surface.** One Discord channel per agent, plus
   `#handoffs`, `#approvals`, `#blocked`, and `#summary`. Humans do not need to log into
   any agent dashboard to know what is happening.

5. **The repo is the source of truth.** `TASKS.md` in the repo root tracks what each agent
   is working on. GitHub Issues track bugs and features. GitHub Releases track shipped
   versions. Nothing important lives only in an agent's memory or a SaaS dashboard.

---

## 4. How to Fork These Playbooks Into a New Project

### Step 1: Copy this folder

```bash
cp -r /path/to/reusable-workflows /path/to/$PROJECT/agent-playbooks
```

Or add it as a git submodule if you want to pull upstream updates:

```bash
git submodule add https://github.com/your-org/agent-playbooks.git agent-playbooks
```

### Step 2: Replace `$PROJECT` placeholders

Each playbook uses `$PROJECT` as a generic stand-in for your project name. Run a
find-and-replace across the folder:

```bash
grep -rl '\$PROJECT' /path/to/$PROJECT/agent-playbooks | \
  xargs sed -i 's/\$PROJECT/YourActualProjectName/g'
```

### Step 3: Wire in project-specific environment variables

Each playbook has a section listing the env vars it expects. Copy those variable names
into your project's `.env.example` and populate the real values in your secrets manager
(for example, a `universal.env` file stored outside the repo, or 1Password).

Never commit real secrets. The playbooks reference env var names only, never values.

### Step 4: Update owner tags in TASKS.md

Owner tags identify which agent is responsible for a task. The standard tags are:

```
cursor-ide
cursor-cloud-1
cursor-cloud-2
cursor-cloud-3
twin
pokee
zo
human-<name>
```

Open `TASKS.md` in your project root and assign owner tags to every task. See the
`AGENT_ORCHESTRATION_PATTERNS.md` playbook for the full TASKS.md schema.

### Step 5: Create Discord channels

Create a Discord server (or a category in an existing server) with these channels:

```
#agent-cursor-cloud
#agent-twin
#agent-pokee
#agent-zo
#handoffs
#approvals
#blocked
#summary
```

Configure each agent's webhook to post to its own channel. Pokee posts to all channels
as the router.

### Step 6: Wire GitHub webhooks to Pokee

In your GitHub repo settings, add a webhook pointing to your Pokee instance endpoint.
Pokee will receive push, pull_request, issues, and release events and route them to the
appropriate downstream agents.

---

## 5. Table of Contents

| File | Summary |
|---|---|
| `README.md` | This file. Overview, philosophy, and how to fork. |
| `ZO_PLAYBOOK.md` | Zo Computer setup, job templates, and handoff patterns for long-running cloud work. |
| `TWIN_PLAYBOOK.md` | Twin.so setup, dashboard recipes, and human-handoff points for GUI-gated actions. |
| `POKEE_PLAYBOOK.md` | Pokee AI setup, workflow templates, and routing patterns for SaaS orchestration. |
| `AGENT_ORCHESTRATION_PATTERNS.md` | Cross-agent coordination patterns: GitHub-as-spine, Discord-as-observability, kill switches, audit logs, idempotency. |
| `CURSOR_AGENT_PATTERNS.md` | Cursor IDE vs. Cloud usage patterns, kickoff prompt templates, parallel-agent coordination, watchdog automations. |

---

## 6. Glossary

### Owner Tags

Owner tags appear in `TASKS.md` and GitHub Issue labels. They identify which agent or
human is responsible for a task at any given moment.

| Tag | Meaning |
|---|---|
| `cursor-ide` | Work is being done interactively in Cursor IDE by the founder |
| `cursor-cloud-1` | Cursor Cloud Background Agent cluster 1 (typically Core Features) |
| `cursor-cloud-2` | Cursor Cloud Background Agent cluster 2 (typically AI & Intelligence) |
| `cursor-cloud-3` | Cursor Cloud Background Agent cluster 3 (typically Platform & Polish) |
| `twin` | Twin.so browser automation agent |
| `pokee` | Pokee AI orchestration and publishing agent |
| `zo` | Zo Computer long-running cloud job |
| `human-<name>` | A specific human (e.g., `human-amit`, `human-contractor-1`) |
| `blocked` | Task cannot proceed; waiting for unblocking input |
| `pending-approval` | Task completed by agent; waiting for human review |

### Discord Channel Conventions

| Channel | Purpose |
|---|---|
| `#agent-cursor-cloud` | PR links, build status, and notes from all Cursor Cloud agents |
| `#agent-twin` | Session logs and results from Twin automation runs |
| `#agent-pokee` | Workflow execution logs from Pokee |
| `#agent-zo` | Job start, progress, and completion notices from Zo |
| `#handoffs` | Cross-agent handoff events (agent A signals agent B to begin) |
| `#approvals` | Items requiring human decision before an agent continues |
| `#blocked` | Tasks stuck waiting for input, credentials, or manual action |
| `#summary` | Daily digest of all agent activity (posted by Pokee at midnight) |

### Webhook Patterns

All inter-agent communication uses one of these patterns:

1. **GitHub label webhook**: A GitHub Action fires when a specific label is applied to
   an Issue or PR. Pokee listens and routes to the appropriate agent.

2. **Convex HTTP action**: When the project uses Convex as its backend, agents post
   events to a Convex HTTP endpoint that writes to `agent_handoffs` and triggers a
   scheduled function.

3. **Discord mention**: An agent posts to `#handoffs` with a structured message. Pokee
   reads the channel and dispatches the next step.

4. **Direct HTTP webhook**: Agent A calls Agent B's webhook URL directly with a JSON
   payload containing `event_id`, `source_agent`, `target_agent`, `payload`, and
   `timestamp`.

### Status Emojis in Discord Posts

Agents are expected to prefix their Discord messages with a status indicator:

| Prefix | Meaning |
|---|---|
| `[START]` | Agent is beginning a job |
| `[DONE]` | Agent has completed a job successfully |
| `[BLOCKED]` | Agent cannot continue without input |
| `[ERROR]` | Agent encountered a failure |
| `[HANDOFF]` | Agent is passing work to another agent |
| `[APPROVAL]` | Agent is requesting human sign-off |

---

## 7. Versioning

### Option A: Commit inside your project repo

Place this `agent-playbooks/` folder inside your project repo and commit it alongside
your code. This is the simplest approach. Every project commit captures the state of the
playbooks in use at that point.

Recommended location:

```
$PROJECT/
  agent-playbooks/        # this folder
  docs/
    HARD_RULES.md
  TASKS.md                # or docs/brain/TASKS.md — single source of truth
  .cursorrules
```

### Option B: Shared submodule

If you maintain multiple projects and want playbook updates to propagate automatically,
host this folder as a separate repository and include it as a submodule:

```bash
# Adding to a project
git submodule add https://github.com/your-org/agent-playbooks.git agent-playbooks

# Pulling upstream updates in a project
git submodule update --remote agent-playbooks
git add agent-playbooks
git commit -m "chore: update agent playbooks to latest"
```

### Option C: Version tag the playbooks

Inside each playbook file, add a `Playbook-Version` header (already present in each
file). When you fork and modify a playbook, increment the minor version. When you pull
an upstream breaking change, increment the major version.

```
Playbook-Version: 1.0.0
Last-Updated: 2025-01-01
Applies-To: $PROJECT
```

### Change Log

Keep a brief `CHANGELOG.md` inside the `agent-playbooks/` folder to track what changed
between versions and why. This is especially useful when multiple projects share the
same submodule and you need to audit which version a project was running when an
incident occurred.

---

*End of README*
