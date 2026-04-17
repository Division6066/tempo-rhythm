# Cursor Agent Patterns

Playbook-Version: 1.0.0
Applies-To: $PROJECT (generic — fork and replace placeholder)

---

## 1. Overview — Cursor IDE vs. Cursor Cloud Background Agents

Cursor provides two distinct execution modes that serve different purposes and should
not be confused with each other.

### Cursor IDE (Local, Interactive)

Cursor IDE is the desktop application. You run it locally on your machine. The AI
assistant operates in the context of your open files, your running terminal, and your
active debugging session. Feedback is immediate: you type, the agent responds, you see
the result in seconds.

Use Cursor IDE for work that benefits from fast iteration: refining a component,
debugging a specific error, exploring a new library, pair-programming through a tricky
algorithm, or reviewing an agent-generated PR.

### Cursor Cloud Background Agents (Async, VM-Isolated)

Cursor Cloud Background Agents are separate VMs that Cursor provisions and manages.
You give an agent a task via a kickoff prompt, and it works asynchronously — potentially
for hours — while you do other things. The agent's output is a GitHub PR.

Use Cursor Cloud for work that is well-specified, parallel, and long-running: building
out a feature you have fully designed, refactoring a module, adding test coverage across
a large surface, fixing a category of type errors.

### Key Differences

| Dimension | Cursor IDE | Cursor Cloud |
|---|---|---|
| Execution model | Synchronous, interactive | Asynchronous, headless VM |
| Duration | Minutes to 1–2 hours | Hours to overnight |
| Output format | Direct file edits in your workspace | GitHub PR |
| Supervision | Human watches and corrects in real time | Human reviews PR when done |
| Best for | Iteration, exploration, review | Parallelism, overnight work |
| Context | Your current open files | Cloned repo + kickoff prompt |
| Concurrency | One session at a time | Multiple clusters simultaneously |

The two modes are complementary. A typical day involves Cursor IDE for design-level
decisions and Cursor Cloud overnight for execution.

---

## 2. When to Use Cursor IDE

Use Cursor IDE when any of the following are true:

- **The task is under 1–2 hours**: If you expect the coding work to finish before you
  go to sleep, IDE is appropriate.
- **You want to observe and correct in real time**: Schema migrations, architectural
  changes, or anything where you want to steer the agent mid-task.
- **You are doing design-level iteration**: Trying different component structures,
  exploring API shapes, spiking a proof of concept before committing to an approach.
- **You are reviewing a Cursor Cloud PR**: Read the diff in IDE, leave comments,
  test-run locally, then merge or request changes.
- **The task requires your local tools**: Running a local emulator, connecting to a
  local dev database, using a tool that is not available in a cloud VM.
- **The task is paired work with another human**: You are screen-sharing and coding
  together with a contractor or co-founder.
- **You are debugging a specific error with a stack trace**: The IDE has access to
  your terminal output and can iterate on the fix in seconds.

Cursor IDE is also appropriate for writing kickoff prompts for Cursor Cloud — composing
a detailed, accurate spec takes IDE-quality iteration.

---

## 3. When to Use Cursor Cloud

Use Cursor Cloud Background Agents when any of the following are true:

- **You want to "ship while I sleep"**: Kick off an agent at night and review the PR
  in the morning.
- **The work is parallelizable**: Multiple agents can work on disjoint parts of the
  codebase simultaneously (see Section 6).
- **The task is well-specified**: You have written acceptance criteria, have the design
  decided, and are confident the agent can execute without mid-task steering.
- **The task involves repetitive mechanical changes**: Adding TypeScript types to 30
  files, converting class components to functional components, migrating an API to a
  new SDK version.
- **The task spans multiple files across the codebase**: Cross-repo refactors, renaming
  a concept everywhere, updating all usages of a deprecated API.
- **You want to run multiple tasks in parallel**: Three Cloud agents can work on three
  different features simultaneously, as long as their file scopes do not overlap.

Cursor Cloud is not appropriate for exploratory work where you do not yet know what the
right answer looks like. Spec it in IDE first, then hand off the execution to Cloud.

---

## 4. How to Spec a Cursor Cloud Cluster

A Cursor Cloud "cluster" is a conceptual grouping of related tasks assigned to a single
background agent. You might run 2–3 clusters simultaneously on different parts of the
codebase.

### Typical Cluster Assignments for a Mobile + Web Project

| Cluster | Owner Tag | Scope | Example tasks |
|---|---|---|---|
| Cluster 1 | `cursor-cloud-1` | Core Features | Auth flows, core data model, primary user screens |
| Cluster 2 | `cursor-cloud-2` | AI & Intelligence | Model integration, embeddings, smart features |
| Cluster 3 | `cursor-cloud-3` | Platform & Polish | Error handling, animations, performance, onboarding |

### Rules for Scoping a Cluster

1. **Disjoint directories**: Each cluster owns a subset of the codebase directories.
   No two clusters should be assigned tasks in the same directory at the same time.
   Example assignment:
   - Cluster 1: `src/features/auth/`, `src/features/home/`, `src/api/`
   - Cluster 2: `src/features/ai/`, `src/lib/ai/`, `convex/ai.ts`
   - Cluster 3: `src/components/`, `src/navigation/`, `src/utils/`
2. **Shared surfaces are locked**: Files touched by multiple clusters (e.g., `package.json`,
   `convex/schema.ts`, `TASKS.md`) must be modified by only one cluster at a time.
   Use a GitHub label `lock:schema` to signal that a shared surface is claimed.
3. **Each cluster references its tasks from TASKS.md**: The kickoff prompt tells the
   agent its cluster ID and points it to its section of TASKS.md.

---

## 5. How to Write a Master Kickoff Prompt

The kickoff prompt is the single instruction document you give a Cursor Cloud agent when
starting a session. A poorly written kickoff prompt leads to scope creep, hallucinated
files, and PRs that need to be completely rewritten.

### Template Scaffold

```
# $PROJECT — Cursor Cloud Kickoff — $CLUSTER_NAME (cluster-$CLUSTER_ID)

## Context

You are a senior software engineer working on $PROJECT.
$PROJECT is a [one-sentence description: e.g., "mobile productivity app for async
team communication, built with React Native (Expo), Convex, and TypeScript"].

The full codebase is in this repository. Read the following files before starting:
- TASKS.md (your assigned tasks are in the ## cursor-cloud-$CLUSTER_ID section)
- HARD_RULES.md (non-negotiable constraints — read every rule before writing any code)
- .cursorrules (condensed rules for quick reference)
- src/README.md (architecture overview)

## Your Scope (Cluster $CLUSTER_ID — $CLUSTER_NAME)

You are responsible for the following directories:
$DIRECTORY_LIST

You MUST NOT modify files outside these directories, with these exceptions:
- TASKS.md (update your task status only)
- package.json (only to add packages explicitly required by your tasks)
- Any shared type file explicitly listed in your tasks

## Your Tasks

Read TASKS.md → ## cursor-cloud-$CLUSTER_ID section.
Work through the tasks in order, top to bottom.
For each task:
1. Read the linked GitHub Issue for full acceptance criteria.
2. Implement the feature or fix.
3. Write or update tests for everything you touch.
4. Mark the task as in-progress in TASKS.md, then mark it done when the PR is opened.

## Acceptance Criteria

For each task, the acceptance criteria are in the linked GitHub Issue.
A task is complete when:
- [ ] The feature behaves as described in the Issue
- [ ] TypeScript reports no errors (`npx tsc --noEmit`)
- [ ] The linter reports no errors (`npx eslint .`)
- [ ] All tests pass (`npx jest` or equivalent)
- [ ] No files outside your scope are modified (run `git diff --name-only HEAD~1` to verify)

## Quality Bar

- All new code must be typed. No `any` without a comment explaining why.
- Every new React component must have at least one test.
- Every new API function must have at least one test.
- Follow existing patterns in the codebase — read 2–3 nearby files before writing new code.
- Do not add dependencies that are not in HARD_RULES.md's approved list without
  checking if an existing dependency can be used instead.

## Forbidden Technology

Read HARD_RULES.md for the full list. Summary:
$FORBIDDEN_TECH_LIST (e.g., "Do not use Moment.js. Do not use class components. Do not
use inline styles. Do not use any.")

## Pre-Flight

Before writing any code, do the following:
1. Read HARD_RULES.md completely.
2. Read TASKS.md, your cluster's section only.
3. For each task, open the linked GitHub Issue and read the full body.
4. Ask any clarifying questions by posting a comment on the relevant GitHub Issue.
   Tag @$FOUNDER_GITHUB_HANDLE in the comment.
5. Wait 30 minutes. If no response, proceed with the most reasonable interpretation.
6. Only then begin coding.

## Output

When all tasks are complete, open one GitHub PR per logical change (one PR per Issue,
or combine if Issues are tightly coupled). PR title format:
  feat($AREA): short description [cursor-cloud-$CLUSTER_ID]

PR body must include:
- Summary of what was done
- Link to the GitHub Issue(s) it closes
- Test instructions (how to verify the feature manually)
- Screenshot or screen recording for UI changes (use Zo or a local emulator)
```

### Kickoff Prompt Anti-Patterns

- **Too vague**: "Build the AI features." — The agent has no scope, no acceptance
  criteria, and no file boundaries. It will invent things.
- **Too large**: A single kickoff prompt covering 30 tasks across the entire codebase.
  Split into clusters. One agent per cluster.
- **Missing HARD_RULES reference**: Without this, the agent will introduce banned
  dependencies, use deprecated patterns, and ignore architectural decisions.
- **No pre-flight questions step**: The agent makes assumptions instead of asking.
  Assumptions compound into expensive misunderstandings.
- **No test requirement**: The agent writes code but no tests. You have no confidence
  the code works.

---

## 6. Parallel-Agent Coordination

Running multiple Cursor Cloud agents simultaneously requires a coordination protocol to
prevent conflicts.

### Directory Assignment

Before starting any Cloud agents, produce a directory map:

```
# agent-playbooks/cursor-cloud-directory-map.md

Cluster 1 (cursor-cloud-1) OWNS:
  src/features/auth/
  src/features/home/
  src/features/settings/
  src/api/

Cluster 2 (cursor-cloud-2) OWNS:
  src/features/ai/
  src/lib/ai/
  convex/ai.ts
  convex/embeddings.ts

Cluster 3 (cursor-cloud-3) OWNS:
  src/components/
  src/navigation/
  src/utils/
  src/hooks/

SHARED SURFACES (any cluster can read, write requires lock):
  package.json
  convex/schema.ts
  TASKS.md
  tsconfig.json
  .env.example
```

Include this directory map in every kickoff prompt. Agents must not modify files outside
their assigned directories without explicit instruction.

### The Lock File Convention

For shared surfaces, use a GitHub label to signal ownership:

| Label | Meaning |
|---|---|
| `lock:schema` | A cluster is currently modifying `convex/schema.ts` |
| `lock:package` | A cluster is currently modifying `package.json` |
| `lock:tasks` | A cluster is currently modifying `TASKS.md` |

Before modifying a shared surface, a Cloud agent:
1. Checks if the lock label exists on any open PR.
2. If locked: waits until the PR is merged, then proceeds.
3. If unlocked: applies the lock label on its own PR, then modifies the shared surface.
4. The GitHub Action removes the lock label when the PR is merged.

### PR Label Handoff

When one Cloud agent finishes a piece of work that another agent depends on, it signals
via a GitHub PR label:

```
Cluster 1 finishes auth PR #110 (merged)
  → GitHub Action applies label "cluster-2-unblocked" to Issue #88
  → Pokee detects the label
  → Pokee posts to Discord #handoffs: "Cluster 1 unblocked Cluster 2. Issue #88 now ready."
  → Cluster 2's next kickoff includes Issue #88 in its task list
```

---

## 7. .cursorrules + HARD_RULES.md Pattern

### The Two-File System

`.cursorrules` is a short, fast-to-read rules file that Cursor loads into context
automatically before every agent response. Keep it under 100 lines. It contains the
most critical rules in condensed form.

`HARD_RULES.md` is a longer document with full rationale. Agents read it once at the
start of a session. It documents the "why" behind each rule so agents can extrapolate
to edge cases.

Both files live in the repo root.

### .cursorrules Template

```
# $PROJECT — Cursor Rules

## Tech Stack
- React Native (Expo SDK $EXPO_VERSION) + TypeScript
- Convex (backend, DB, realtime, auth)
- NativeWind for styling (Tailwind classes only — no arbitrary values)
- React Navigation for routing

## Forbidden
- Moment.js (use date-fns or Temporal)
- class components (use functional only)
- inline styles (use NativeWind classes)
- `any` type without a // @allow-any comment explaining why
- Lodash (use native array/object methods)
- $ADDITIONAL_FORBIDDEN_ITEMS

## Required Patterns
- Every screen component: functional, typed props interface, named export
- Every Convex mutation: validate with zod before writing
- Every async operation: handle errors with try/catch + user-facing error state
- Every PR: must close a GitHub Issue (Closes #N in body)

## File Naming
- Components: PascalCase.tsx
- Hooks: useFeatureName.ts
- Utils: camelCase.ts
- Convex functions: camelCase.ts (in convex/)

## Testing
- Tests live alongside source: ComponentName.test.tsx
- Use Jest + React Native Testing Library
- Minimum: one smoke test per component, one unit test per util function

## Read Before Coding
- HARD_RULES.md — full rules with rationale
- TASKS.md — your assigned tasks
- src/README.md — architecture overview
```

### HARD_RULES.md Structure

```markdown
# $PROJECT — Hard Rules

These rules are non-negotiable. Violating them will cause a PR to be rejected.
Every agent reads this document at the start of every session.

## 1. No banned dependencies
[Rule text + rationale + what to use instead]

## 2. No any type
[Rule text + rationale + how to type unknown values properly]

## 3. No direct database writes in UI components
[Rule text + rationale + the correct pattern]

## 4. All mutations must be validated
[Rule text + rationale + code example]

## 5. No hardcoded strings in UI
[Rule text + rationale + i18n pattern used in this project]

## [Continue for all project-specific rules]
```

---

## 8. Automation Patterns

These patterns use Cursor IDE or Cloud to run automated watchdog tasks. Each includes
a short prompt scaffold.

---

### 8.1 Continuous Test Watchdog

**Mode**: Cursor Cloud, long-running session

**Prompt scaffold**:
```
You are running as a continuous test watchdog for $PROJECT.

Every 5 minutes:
1. Run `npx jest --passWithNoTests --forceExit` in the repo root.
2. If all tests pass: post nothing. Update a counter file
   agent-state/test-watchdog.json with {last_run: timestamp, status: "passing"}.
3. If any test fails:
   a. Capture the failure output.
   b. Post to Discord webhook $DISCORD_WEBHOOK_CURSOR_CLOUD:
      "[ERROR] Test failure detected at $TIMESTAMP:\n```\n$FAILURE_OUTPUT\n```"
   c. Create or update a GitHub Issue labeled "test-failure" with the failure details.
      If an issue already exists from a previous failure, comment on it rather than
      creating a duplicate.
4. Continue running until instructed to stop.

Do not attempt to fix the failing tests — only report them. Fixing is a separate task.
```

---

### 8.2 Continuous Lint Watchdog

**Mode**: Cursor Cloud or local terminal session

**Prompt scaffold**:
```
You are running as a continuous lint watchdog for $PROJECT.

Every 10 minutes:
1. Run `npx eslint . --ext .ts,.tsx --max-warnings 0`.
2. If lint is clean: update agent-state/lint-watchdog.json {status: "clean"}.
3. If lint has warnings or errors:
   a. Post to Discord webhook $DISCORD_WEBHOOK_CURSOR_CLOUD:
      "[ERROR] Lint issues detected: $COUNT warnings/errors. Run eslint locally to see details."
   b. List the files with issues (file paths only, not the full error text, to keep the
      Discord message readable).
4. Continue running.
```

---

### 8.3 Continuous Type-Check Watchdog

**Mode**: Cursor Cloud or local terminal session

**Prompt scaffold**:
```
You are running as a continuous TypeScript type-check watchdog for $PROJECT.

Every 10 minutes:
1. Run `npx tsc --noEmit`.
2. If type-check passes: update agent-state/typecheck-watchdog.json {status: "clean"}.
3. If type errors exist:
   a. Count the total number of errors.
   b. Post to Discord webhook $DISCORD_WEBHOOK_CURSOR_CLOUD:
      "[ERROR] TypeScript errors detected: $COUNT errors. Files affected:
       $FILE_LIST (first 5)"
   c. Do not attempt to fix the errors — only report.
4. Continue running.
```

---

### 8.4 Schema Guard

**Mode**: GitHub Actions (triggered on every PR targeting main)

**Prompt scaffold** (for a GitHub Action that calls Cursor):
```
You are a schema guard. A PR has been opened that may contain Convex schema changes.

1. Diff the PR against the base branch. Check if convex/schema.ts was modified.
2. If schema.ts was NOT modified: exit cleanly with "Schema guard: no schema changes detected."
3. If schema.ts WAS modified:
   a. Read the full diff of convex/schema.ts.
   b. Check these rules:
      - No table was dropped (removing a table = fail)
      - No required field was removed from an existing table (= fail)
      - No field type was changed in a way that is not backward-compatible (e.g., string → number = fail)
      - New optional fields are allowed (= pass)
      - New tables are allowed (= pass)
      - New optional fields on existing tables are allowed (= pass)
   c. If any rule is violated: fail the check with a descriptive error message listing
      each violation.
   d. If all rules pass: exit cleanly with "Schema guard: changes are backward-compatible."
```

---

### 8.5 Forbidden-Tech Scanner

**Mode**: GitHub Actions (triggered on every PR)

**Prompt scaffold** (for a shell script in GitHub Actions):
```bash
#!/bin/bash
# Forbidden technology scanner for $PROJECT
# Run on every PR to catch banned dependencies before merge

FORBIDDEN_PACKAGES=(
  "moment"
  "lodash"
  "axios"        # use native fetch
  "react-navigation/v4"
  "$ADD_OTHERS"
)

FAILED=0
for pkg in "${FORBIDDEN_PACKAGES[@]}"; do
  if grep -q "\"$pkg\"" package.json; then
    echo "FAIL: Forbidden package '$pkg' found in package.json"
    FAILED=1
  fi
done

if [ $FAILED -eq 1 ]; then
  echo ""
  echo "Remove all forbidden packages before merging. See HARD_RULES.md for alternatives."
  exit 1
fi

echo "Forbidden-tech scan: clean."
exit 0
```

---

### 8.6 Design-Token Enforcer

**Mode**: GitHub Actions or Cursor Cloud watchdog

**Prompt scaffold**:
```
You are a design-token enforcer for $PROJECT.

The project uses NativeWind (Tailwind). All colors, spacing, and typography must use
design tokens (Tailwind class names). No arbitrary values and no hardcoded hex colors
are allowed.

Patterns to flag:
- Any JSX className or style prop containing a hex color (e.g., "#3B82F6", "#fff")
- Any NativeWind arbitrary value (e.g., "w-[342px]", "text-[14px]")
- Any inline style object with a color value (e.g., style={{ color: '#333' }})

Steps:
1. Run: grep -rn --include="*.tsx" --include="*.ts" \
     -E '(#[0-9a-fA-F]{3,8}|\[[0-9]+px\]|style=\{\{.*color)' \
     src/ > /tmp/design-violations.txt
2. If the file is empty: print "Design-token check: clean." and exit 0.
3. If violations exist: print each violation with file path and line number.
   Exit 1.
```

---

### 8.7 PR Review Automation

**Mode**: Cursor Cloud, triggered by Pokee on every PR opened

**Prompt scaffold**:
```
You are a PR reviewer for $PROJECT. Review the PR at $PR_URL against HARD_RULES.md.

Steps:
1. Fetch the PR diff.
2. Read HARD_RULES.md completely.
3. For each changed file, check:
   a. Does it violate any rule in HARD_RULES.md?
   b. Does it use any forbidden dependency?
   c. Does it contain untested code (new functions or components with no corresponding
      test file change)?
   d. Does it contain hardcoded strings that should be i18n keys?
   e. Does it contain `any` types without the required // @allow-any comment?
4. Write a review summary:
   - PASS items: list what the PR does correctly.
   - FAIL items: list each specific violation with file path, line number, and the
     HARD_RULES.md rule that is violated.
   - SUGGESTIONS: list non-blocking improvement suggestions.
5. Post the review as a GitHub PR review comment using the GitHub API.
   - If any FAIL items exist: request changes.
   - If only PASS and SUGGESTIONS: approve.
6. Post to Discord #agent-cursor-cloud:
   "[DONE] PR review complete for #$PR_NUMBER. Result: $PASS/FAIL. Issues: $COUNT"
```

---

## 9. Human-in-the-Loop Patterns

### When to Require Human Approval on a Cloud Agent PR

Not all agent PRs require human review before merge. Use this matrix:

| PR type | Review required | Automation safe? |
|---|---|---|
| Automated error sweep (`zo-automated`) | Yes — human skims the diff | Never auto-merge |
| New feature (`feat:`) | Yes — human reviews and tests | Never auto-merge |
| Dependency update | Yes — check for breaking changes | Never auto-merge |
| Style/token fix | Yes, lightweight review | Could allow auto-merge after CI passes |
| Test-only change | Yes, lightweight review | Could allow auto-merge after CI passes |
| Type annotation only | Yes, lightweight review | Could allow auto-merge after CI passes |
| Documentation | Yes, lightweight review | Could allow auto-merge after CI passes |
| Schema migration | Always — senior human reviews | Never auto-merge |
| Dependency addition | Always — check HARD_RULES | Never auto-merge |

### PR Review Gate Implementation

1. All agent PRs are created with `needs-review` label.
2. A GitHub branch protection rule requires at least 1 approval and no pending reviews
   before merge is allowed.
3. The PR review automation (Section 8.7) runs and posts a review. If it requests
   changes, merge is blocked until a human overrides.
4. When a human approves and merges the PR, Pokee detects the `approved` label and
   removes `needs-review`.
5. After merge, Pokee posts to Discord #summary: "PR #$N merged. Feature: $TITLE."

### Emergency Override

If a human needs to merge an urgent hotfix despite pending automated reviews:
1. Human must manually dismiss all pending reviews in GitHub.
2. Human posts in Discord #approvals: "[OVERRIDE] Merging #$PR_NUMBER as hotfix.
   Reason: $REASON"
3. Pokee logs the override event to the audit log.

---

## 10. Troubleshooting

### Agent Context Drift

**Symptom**: The agent starts implementing something that made sense in step 1 but by
step 15 has drifted from the original spec. The PR contains changes you did not ask for.

**Cause**: Long Cloud sessions accumulate context and the agent begins to infer intent
rather than following the spec.

**Fix**:
1. Break long task lists into smaller chunks. No more than 5–7 tasks per Cloud session.
2. Require the agent to re-read TASKS.md and the linked Issues at the start of each
   major task, not just at the beginning of the session.
3. Add a rule to the kickoff prompt: "If you are unsure whether a change is in scope,
   do not make it. Post a comment on the Issue asking for confirmation."

### Hallucinated Files

**Symptom**: The agent creates new files that do not correspond to any task or existing
pattern in the codebase. These files reference imports that do not exist.

**Cause**: The agent inferred that a file should exist based on the codebase pattern,
but the file was not part of the task.

**Fix**:
1. Add to the kickoff prompt: "Do not create files that are not explicitly required by
   your tasks. If you need a new file, describe what it would contain in a GitHub Issue
   comment and wait for confirmation before creating it."
2. Add a GitHub Action that posts a comment on the PR listing all newly created files.
   A human reviews this list before approving.

### Repeated Fixes of the Same Bug

**Symptom**: A Cloud agent fixes a bug in one place, but the same pattern exists in 10
other places. The agent only touches one instance because the task said "fix the bug in
$FILE."

**Fix**:
1. When filing the task for a Cloud agent, explicitly state: "Search the entire codebase
   for this pattern and fix all instances." Include the grep pattern to search for.
2. After the PR is merged, run the design-token enforcer or forbidden-tech scanner
   to confirm the pattern is gone.

### Scope Creep

**Symptom**: The PR is 3,000 lines and touches files in all three cluster directories.
The agent clearly went beyond its assigned scope.

**Cause**: The kickoff prompt was too open-ended, or the agent found a "while I'm here"
improvement opportunity.

**Fix**:
1. Close the PR. Do not merge it. File a GitHub Issue documenting what happened.
2. Re-spec the tasks with stricter directory boundaries.
3. Add to the kickoff prompt: "If you find an improvement opportunity outside your
   assigned directories, file a GitHub Issue describing it and do not implement it."
4. Add the scope-check to the CI: a GitHub Action that fails if the PR touches files
   outside the `ALLOWED_DIRECTORIES` list extracted from the directory map.

### Agent Stops Mid-Task Without Explanation

**Symptom**: The agent opened a PR with incomplete work. Some tasks in TASKS.md were
never attempted.

**Cause**: The agent's Cloud session timed out, or the agent encountered an error it
could not handle and stopped without reporting.

**Fix**:
1. Check the agent's session log in Cursor Cloud dashboard.
2. Look for the last action before the session ended.
3. Re-start the agent with a kickoff prompt that acknowledges the partial state:
   "Continue from where you left off. The following tasks are done (marked in TASKS.md).
   The following tasks remain. Start from: $NEXT_TASK."
4. The partially complete PR should be left open. The agent can push additional commits
   to the same branch.

---

## 11. "Day in the Life" Example

This example shows how Cursor IDE and three Cloud agents coexist over a single workday
on `$PROJECT`. All five agents are active in overlapping windows.

### 07:00 — Morning Review

**Human (Cursor IDE)**:
- Opens Cursor IDE.
- Reviews the three PRs opened overnight by Cloud agents 1, 2, and 3.
- Runs the test suite locally.
- Merges two PRs. Requests changes on one (leaves comments in GitHub).
- Updates TASKS.md with new tasks for today.
- Writes three kickoff prompts for new Cloud agent sessions.

### 08:00 — Cloud Agents Start

**Cursor Cloud 1 (Core Features)**: Kicks off on a new session with 5 tasks from
TASKS.md §cursor-cloud-1. Posts to Discord #agent-cursor-cloud:
```
[START] Agent: cursor-cloud-1 | Session: 2025-01-14-morning | Tasks: #91, #92, #93, #94, #95
```

**Cursor Cloud 2 (AI)**: Kicks off with 4 tasks. Posts to #agent-cursor-cloud similarly.

**Cursor Cloud 3 (Platform)**: Picks up the change-request comments from last night's PR.
Kicks off with the goal of addressing all review comments.

### 09:00 — Human in IDE

**Human (Cursor IDE)**: Works on a spike for a new feature (exploring a third-party
audio processing library). This is exploratory work — not yet well-specified enough for
a Cloud agent.

Meanwhile, all three Cloud agents are working in their respective directories.

### 11:00 — Handoff Signal

**Cursor Cloud 1**: Completes task #91 (auth feature). Pushes commit. Notices that
Cluster 2's embeddings feature depends on the auth token being available, which #91 just
wired up.

Cluster 1 applies label `cluster-2-unblocked` to Issue #88.

Pokee detects the label. Posts to Discord #handoffs:
```
[HANDOFF] cursor-cloud-1 completed auth token setup.
cursor-cloud-2 can now proceed with embeddings (Issue #88).
```

Cursor Cloud 2 reads the Discord message at its next context refresh and adds Issue #88
to its active task list.

### 12:00 — Twin Session

**Human**: Sees that the RevenueCat products for the new AI feature tier need to be
created. Triggers a Twin.so session from the Twin dashboard using the recipe in
TWIN_PLAYBOOK.md §4.4.

Twin creates the products and posts to Discord #agent-twin:
```
[DONE] Agent: twin | RevenueCat "ai-tier" entitlement created. 2 products configured.
```

### 14:00 — Approval Gate

**Cursor Cloud 3**: Finishes addressing all review comments. Opens a new PR #116.
CI passes. Labels `needs-review`.

Pokee detects `needs-review` on PR #116 and posts to Discord #approvals:
```
[APPROVAL] PR #116 is ready for review. Agent: cursor-cloud-3.
Changes: addressed 8 review comments from PR #112. Review: https://github.com/...
```

**Human** reviews in Cursor IDE (10 minutes), approves and merges.

### 17:00 — Human in IDE (End of Day)

**Human (Cursor IDE)**: Writes the three kickoff prompts for tomorrow's overnight Cloud
sessions. Commits them as `prompts/2025-01-15-morning.md` for reference.

Updates TASKS.md with tonight's overnight tasks. Pushes.

### 22:00 — Overnight Cloud Sessions Start

Human kicks off all three Cloud agents with overnight prompts.

**Zo Computer**: Scheduled nightly backup runs at 02:00 UTC automatically.

**Pokee**: Weekly newsletter draft scheduled to fire at 18:00 UTC Friday.

By the next morning, the cycle repeats: three new PRs are waiting for human review.

---

*End of CURSOR_AGENT_PATTERNS.md*
