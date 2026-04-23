# Cross-Surface Operator Guide

You use Claude Code in three places and sometimes route to other tools. This file says where each kind of work belongs.

Companion to [`executor-advisor.md`](./executor-advisor.md). Read that first.

## Cursor (desktop) — primary surface

What it is best at:

- Repo-aware coding with full project context.
- Editing files, running tests, driving Convex codegen, running smoke tests.
- Running the executor/advisor pattern in-process: Opus main thread delegates to Sonnet subagents.

Defaults here:

- Main thread: Opus (planning, orchestration, user-facing answers).
- Subagents for execution: `Agent({ subagent_type: "general-purpose", model: "sonnet", prompt: ... })`.
- Manual escalation to advisor: `/advise` or "get a second opinion."

Use Cursor when:

- You are actively reading the diff as work happens.
- The task is bounded (< ~45 min of real work) and you will review before merging.
- You need file edits, shell commands, or Convex/Vercel CLI touching your local checkout.

Do not use Cursor for:

- A run you want to leave unattended for hours. The desktop session is not a cloud runner.
- Work that needs credentials you only have in a browser (Mistral console, Stripe dashboard, EAS web UI).

## Claude Code web (`claude.ai/code`) — long cloud runs and cross-repo

What it is best at:

- Multi-hour runs that continue after you close the laptop.
- Cross-repo work where the bundle model matters.
- `/ultrareview` (multi-agent cloud review of a branch or PR). This is user-triggered and billed; it cannot be launched from Cursor.

Use the web surface when:

- The task spans more than one bounded slice and you want the work to keep moving overnight.
- You want a PR reviewed by multiple reviewers before you wake up.
- You want to kick off a refactor that will touch 10+ files and come back to a finished branch.

Kickoff template for a long cloud run:

```
Task: {one-sentence goal}
Bounded slice: {one ticket, one module, one acceptance test}
Constraints:
- Respect docs/HARD_RULES.md.
- Do not trust nightly/cloud summaries blindly — reconcile against master.
- Do not commit to master. Open a draft PR.
Escalation: if you hit any trigger from .claude/workflows/executor-advisor.md §3, stop and write the reason into the PR body, do not push past it.
Acceptance test: {the one command that proves it works}
```

Do not use the web surface for:

- Work you will review line-by-line as it happens. That's Cursor's job.
- Tasks that need your local `.env` or unpushed branches.

## Claude mobile — triage and follow-up

What it is best at:

- Reading PR summaries, commit messages, check status.
- Kicking off a cloud run from a phone when you spot something in the morning.
- Asking a one-shot advisor question (no code context needed).
- Pinging you when a cloud run finishes, if you have notifications on.

Use mobile for:

- "What's the status of PR #16?"
- "Summarize this error log I'm pasting from Convex dashboard."
- "Should I merge #14 or wait?" — advisor-style question, no code.
- Kicking off a cloud run that will be done by the time you're back at the laptop.

Do not use mobile for:

- Writing non-trivial code. You can't review the diff on a phone.
- Security-sensitive decisions. Small screen, easy to miss details.

## External tools — when to route away from Claude Code

You also use Codex / ChatGPT Pro and separate browser automation. Route deliberately:

| Task | Route here |
|---|---|
| Repo-aware coding with full project context | Claude Code (Cursor or web) |
| Brainstorm without codebase constraints, novel problem framing | ChatGPT Pro |
| Reading / summarizing research papers, long external docs | Either; Claude tends to stay grounded longer |
| UI verification of a running frontend (click, fill, screenshot) | Separate browser automation — Claude Code's WebFetch is read-only |
| Dashboard access behind a login (Vercel, Convex, Mistral console) | Your browser. Claude can't authenticate to these. |
| GitHub repo / PR / Actions / issues | `gh` CLI via Claude Code — fully authenticated |

A decision that hits both Claude and ChatGPT at once means you're not sure what you want. Pick one, commit, and escalate if you were wrong.

## Cross-surface anti-patterns

- Starting in Cursor, switching to web halfway, and losing the context. If you need the web surface, start there.
- Using the mobile surface to approve merges without reading the diff on desktop.
- Treating ChatGPT's answer about your codebase as authoritative. It doesn't see the repo.
- Assuming a cloud run "probably finished correctly." Read the diff in Cursor before merge.
