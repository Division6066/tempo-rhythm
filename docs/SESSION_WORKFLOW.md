# Coding session workflow (ADHD-friendly)

Use a **small batch** of tasks so each session has a clear start and end.

## Commands (Cursor)

In chat, type:

- **`/whats-next`** — Agent reads `docs/TASKS.md` and suggests **three** next tasks (deps checked, short descriptions).
- **`/tick-task`** — After you finish work: update `docs/TASKS.md` statuses, short summary of changes, then three next tasks again.

If slash commands are not enabled, say: *"Follow `.cursor/rules/session-start.mdc`"* or *"Follow `.cursor/rules/task-complete.mdc`"*.

## Rules (always on)

Root **`.cursor/rules/tempo-context.mdc`** reminds every session about HARD_RULES, TASKS, and repo layout.

## Source of truth

1. `docs/HARD_RULES.md` — non-negotiables  
2. `docs/TASKS.md` — what to do next; **edit this file when status changes**  
3. `docs/PRDs/PRD_Phase_1_MVP.md` — what “done” means for MVP features  

## Phase 0 first

Complete **Phase 0** rows in `docs/TASKS.md` (T-R001–T-R006) before assuming the older M0 wording matches the repo.
