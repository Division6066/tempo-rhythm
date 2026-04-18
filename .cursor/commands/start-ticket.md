# /start-ticket — begin executing a specific ticket

Use this when the user says "execute T-XXXX", "start T-XXXX", or runs `/start-ticket T-XXXX`. Full rules: `.cursor/rules/tempo-tickets.mdc`.

## Steps

### 1. Read the ticket file in full

Open `docs/brain/tickets/T-XXXX.md`. If `Parent:` is set, also read `docs/brain/tickets/<parent-id>-cluster.md`.

### 2. Gate

Check and stop if any fail:

- `Status: todo` (not `in-progress`, not `done`).
- Every `Blocked by:` ID is `Status: done`.
- `Assignee:` matches your identity (or a valid Cursor fallback — see `tempo-context.mdc`).

If gated out, explain why and propose an unblocked alternative (run `/whats-next` mentally).

### 3. Branch

Derive a short kebab from the ticket title (3–5 words max). Create the branch:

```bash
git checkout master
git pull --ff-only
git checkout -b <feat|fix|chore|docs>/T-XXXX-<kebab>
```

For cloud-background execution mode, create a worktree instead:

```bash
git worktree add ../tempo-wt/T-XXXX <feat|fix|chore|docs>/T-XXXX-<kebab>
cd ../tempo-wt/T-XXXX
bun install
```

### 4. Flip ticket status to `in-progress`

Inside `docs/brain/`:

```bash
cd docs/brain
# edit tickets/T-XXXX.md: Status: todo → in-progress
git add tickets/T-XXXX.md
git commit -m "docs(brain): start T-XXXX"
git push
cd ../..
git add docs/brain
git commit -m "chore(submodule): bump brain for T-XXXX start"
```

### 5. Execute

- Touch ONLY files in the ticket's `Files to touch`. If you need more, stop and explain in chat.
- Follow `Implementation guidance` bullet by bullet.
- Respect every rule cited in `Applicable HARD_RULES`.

### 6. Commit in small logical steps

Conventional Commits, scoped to the ticket. Example:

```
feat(convex): add tasks table schema [T-0007-a]
feat(convex): wire tasks list query [T-0007-a]
```

### 7. Run QA

Invoke `/run-qa`. All green before the next step.

### 8. Open PR

Invoke `/pr`. The PR body cites `T-XXXX`, copies the ticket's `Acceptance criteria`, and includes screenshots for UI tickets.

### 9. Flip ticket status to `in-review`

Inside `docs/brain/`, update the ticket frontmatter, commit, bump parent pointer.

### 10. Stop

Do NOT merge. Reviewer is `human-amit`. Do NOT self-approve.
