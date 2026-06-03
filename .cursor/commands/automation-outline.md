# /automation-outline — recurring agent outline

Use this when the user asks to configure or review background automations before
turning them loose.

## 1. Pick the automation

Choose exactly one lane:

- `bug-scan` — use `docs/CURSOR_PROMPTS.md` §13.8.
- `test-coverage` — use `docs/CURSOR_PROMPTS.md` §13.9.
- `docs-generation` — use `docs/CURSOR_PROMPTS.md` §13.10.
- `pr-readiness` — use `docs/CURSOR_PROMPTS.md` §13.11.
- `merge-steward` — use `docs/CURSOR_PROMPTS.md` §13.12.

## 2. Stay read-only first

Start with the matching prompt in `docs/CURSOR_PROMPTS.md` §13.

For the first pass:

- Read the relevant docs and changed files.
- Run only read-only checks.
- Return a short outline of proposed changes.
- Wait for explicit approval before editing files.

## 3. Execution rules after approval

- Use one branch and one worktree per task.
- Keep the diff narrow.
- Run `/run-qa` before opening or updating a PR.
- Do not merge your own PR.
- Do not deploy.
- Do not write secrets.

## 4. Report format

```
Automation outline — <lane>

Scope:
- <files / route / package>

Findings:
- <high-signal finding>

Proposed action:
- <smallest useful next step>

Blocked by:
- <human decision or none>
```
