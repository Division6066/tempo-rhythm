# Nightly Run Intake Workflow

Use this workflow when the user pastes an overnight run summary, Cursor Cloud recap, PR status dump, or any "here's what the agent did" message and wants Claude Code in Cursor to act on it.

The goal is not to trust the summary.
The goal is to convert it into verified local reality and then decide the next move.

## 1. Treat the summary as input, not truth

A pasted summary is evidence.
It is not the source of truth until the local branch or linked PR proves it.

Never say "done" just because the summary sounds complete.

## 2. Capture the claims

Extract the concrete claims first:

- branch name
- PR number
- CI/check status
- routes/screens said to be live
- files or modules said to be changed
- env vars or setup tasks still required
- remaining caveats

Do this in a short checklist, not a long essay.

## 3. Reconcile against the local checkout

Before proposing next steps:

1. Check `git status --short --branch`.
2. Inspect the actual local files touched by the claims.
3. Verify route files, Convex files, and redirects if the summary mentions them.
4. Verify that the local branch actually contains the claimed screens or functions.
5. If the summary references green CI or a PR, verify live status only if the user asked for it or if it is critical to the answer.

## 4. Classify each claim

Every major claim should land in one of these buckets:

- `confirmed locally`
- `contradicted locally`
- `unverified from local checkout`

If the summary and local checkout disagree, prefer the local checkout and say so directly.

## 5. Choose the next move based on the mismatch

Use this order:

1. If the local checkout is missing claimed work, create a reconciliation task first.
2. If the work is present locally but blocked by env or dashboard setup, surface the exact blocker.
3. If the work is real and verified, move to the next bounded slice.

Do not widen scope because the summary sounds ambitious.

## 6. Update planning state when asked

If the user asks to update tasks or planning:

- create or update a Planning Hub intake item for the new event
- keep the human-readable version at the top
- keep any machine-readable block at the bottom
- turn contradictions into explicit tasks

Examples of valid follow-up tasks:

- reconcile cloud output with local branch
- pull or cherry-pick missing work
- re-run the slice locally if the cloud changes never landed
- set required env vars only after the corresponding code is actually present

## 7. Output shape

Use this response shape:

1. `What the summary claims`
2. `What is real locally`
3. `What is missing or contradicted`
4. `Smallest next move`
5. `Today's tasks` if the user asked for planning

## 8. Anti-patterns

- trusting the summary without opening files
- updating tickets as if cloud work is local work
- scheduling env setup for screens that are not even in the branch
- rolling straight into a bigger feature because the nightly run sounded productive
