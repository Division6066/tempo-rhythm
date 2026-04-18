# /long-session — overnight / 4+ hour autonomous session

Use this when the user says "run an 8-hour session", "overnight", "long session", "marathon", or runs `/long-session`. Full rules: `.cursor/rules/tempo-long-running.mdc`.

## 1. Confirm scope

Ask ONCE (do not block the plan on this, propose while asking):

- How many hours?
- Which cluster / milestone to prioritize? (If unsaid, default: the longest dependency chain starting from the earliest Root ticket in `tickets/_INDEX.md`.)
- Any forbidden files or scopes to avoid?

## 2. Draft the plan

Produce an ordered list of ticket IDs totaling ≤ `budget × 0.8` (20 % slack for context switches / QA / PR openings). Format:

```
Session plan — N hours, M tickets

Phase A (parallel group — separate worktrees):
  T-XXXX — <title> — 30 min
  T-YYYY — <title> — 30 min
  T-ZZZZ — <title> — 30 min

Phase B (sequential, depends on A):
  T-WWWW — <title> — 45 min
  ...

Estimated completion: ~<hours> hours.
Backup tickets (if I finish early): T-..., T-...
```

## 3. Wait for "go"

Never start a long session silently. Require explicit confirmation.

## 4. Execute with checkpoints

Per `tempo-long-running.mdc`:

- One worktree per ticket: `git worktree add ../tempo-wt/T-XXXX <branch>`.
- Checkpoint every 30 min (WIP commit + chat status + ticket frontmatter update).
- Full QA (`/run-qa`) + PR open (`/pr`) before starting the next ticket.
- Flip ticket to `in-review` in the submodule. Bump parent pointer.

## 5. Escalate blocks

If a ticket needs a human decision for > 15 min, post `[BLOCKED] T-XXXX — <question>` and jump to the next parallelizable ticket in the plan.

## 6. End-of-session report

At session close, emit:

```
## Long-session report — <date>

**Closed (PR open, in-review):** T-XXXX, T-YYYY, ...
**Started but not closed:** T-ZZZZ (where: <file/step>, why: <reason>)
**Skipped:** T-WWWW (reason: <...>)
**Blocked:** T-AAAA — <question for Amit>
**Metrics:** <N commits, M lines +, K lines −, <duration>>

**Resume instructions:** to continue, say "/start-ticket T-ZZZZ" or "/whats-next".
```

## 7. Hard stops

See `tempo-long-running.mdc` §8. If any trigger fires, stop immediately and surface to the user.

## 8. Never

- Merge your own PRs.
- Force-push `master`.
- Edit `.cursor/rules/` or `docs/HARD_RULES.md` mid-session unless the user explicitly requested it.
- Skip QA "to save time".
