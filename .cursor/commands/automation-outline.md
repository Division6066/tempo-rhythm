# /automation-outline — B13 recurring automation outline

Use this when the user asks to configure, review, or start one of the eight B13
Cursor background automations before turning it loose.

## 1. Pick the automation

Choose exactly one B13 lane:

- `critical-bug-scan` — every 12 hours; use `.cursor/agents/tempo-critical-bug-agent.md` and `docs/CURSOR_PROMPTS.md` §13.8.
- `ci-fix` — every 12 hours or on failed checks; use `.cursor/agents/tempo-ci-fix-agent.md` and `docs/CURSOR_PROMPTS.md` §13.9.
- `security-scan` — every 24 hours or on security-sensitive PRs; use `.cursor/agents/tempo-security-scan-agent.md` and `docs/CURSOR_PROMPTS.md` §13.10.
- `test-coverage` — every 24 hours or after risky PRs; use `.cursor/agents/tempo-test-coverage-agent.md` and `docs/CURSOR_PROMPTS.md` §13.11.
- `docs-generation` — every 24 hours or after workflow/API changes; use `.cursor/agents/tempo-docs-generation-agent.md` and `docs/CURSOR_PROMPTS.md` §13.12.
- `pr-readiness` — on PR open/update/ready; use `.cursor/agents/tempo-reviewer.md` and `docs/CURSOR_PROMPTS.md` §13.13.
- `pr-approval-advisor` — on approval/merge-readiness questions; use `.cursor/agents/tempo-pr-approval-advisor.md` and `docs/CURSOR_PROMPTS.md` §13.14.
- `merge-steward` — on finished PRs only; use `.cursor/agents/tempo-merge-agent.md` and `docs/CURSOR_PROMPTS.md` §13.15.

The full contract table is `docs/CURSOR_AUTOMATION_CONTRACTS.md`. Other utility
agents may exist, but they are not part of the B13 eight-automation baseline.

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
- For merge stewardship, default to Cursor Composer 2.5 and write a merge report before recommending any human merge action.
- Do not deploy.
- Do not write secrets.
- Keep PRs draft/open unless Amit explicitly asks to make them ready or merge.
- Apply the risk policy:
  - GREEN: non-critical, checks green, no protected areas; may continue.
  - YELLOW: notify Amit before merge/action, then verify after.
  - RED: secrets, OAuth, billing, production deploy, EAS ownership, destructive
    schema/data, or branch-protection bypass; ask Amit.

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
