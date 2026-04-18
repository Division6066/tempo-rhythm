# /pr — open a pull request against `master`

Use this when the user types `/pr`. Source of truth: @docs/HARD_RULES.md §12 and
@.cursor/rules/tempo-git-workflow.mdc.

Follow these steps in order. Stop and surface a checkpoint on any failure.

## 1. Confirm the branch is a feature branch

Run `git branch --show-current`. It MUST match one of:

- `feat/T-XXXX-<short-kebab>`
- `fix/T-XXXX-<short-kebab>`
- `chore/<scope>-<short-kebab>`
- `docs/<scope>-<short-kebab>`

If the branch is `master` or the pattern does not match, stop and tell the user
to create a correctly-named branch first. Never push to `master`.

## 2. Confirm the working tree is clean and commits are conventional

- `git status --porcelain` must be empty. If not, ask the user whether to commit
  or stash — do not silently commit for them.
- `git log origin/master..HEAD --pretty=%s` should show Conventional Commits
  messages. If any commit is non-conventional, offer to `git commit --amend` or
  add a conventional reword, but only with explicit user approval.

## 3. Push the branch

```
git push -u origin HEAD
```

## 4. Build the PR body from the template

- Read `.github/pull_request_template.md` into a temp file.
- Extract `T-XXXX` from the branch name (if present) and fill the `Task:` line.
- Derive the summary from the last 1–3 commit messages on this branch
  (`git log origin/master..HEAD --pretty=%B`).
- Leave placeholders intact for screenshots, test plan, and acceptance criteria,
  and remind the user to fill them in.
- Tick the correct owner tag checkbox based on the agent's identity (per §14).
  Code agents never tick `human-amit`, `twin`, `pokee`, or `zo`.

## 5. Open the PR

```
gh pr create --base master \
  --title "<Conventional Commits title derived from the branch>" \
  --body-file <tempfile>
```

Use `--draft` when the user asks for a draft; otherwise open it for review.

## 6. Report back

- Print the PR URL returned by `gh pr create`.
- Remind the user to fill in the screenshots / test plan / acceptance criteria
  sections before requesting review.

## 7. Stop

Do not merge. Do not self-approve. Do not run `gh pr merge`. A code agent never
merges its own PR (HARD_RULES §12). Reviewer is Amit (`human-amit`) unless a
second agent is explicitly tagged `reviewer` by the user.
