# Agent checkpoints — when to pause for Amit

**Principle:** autonomy is cheap until it's expensive. The cost of pausing briefly always beats the cost of a wrong-direction build.

## Hard checkpoints (must pause, wait for explicit OK)

| Trigger | Why |
|---|---|
| About to ship a proposed ticket batch to parallel agents (`/whats-next` has picked 3) | Amit confirms the scope before work starts. |
| About to merge any PR to `main` | HARD_RULES §12 — `main` must be deployable, and no agent auto-merges. |
| About to add a new dependency | HARD_RULES §2 forbidden list + license check. Even when a skill suggests it. |
| About to modify `convex/schema.ts` in a way that changes an existing table | Data migration risk. Amit approves the migration plan first. |
| About to add a new env var | HARD_RULES §13 — must be added to `.env.example` + Vercel/EAS env config. |
| About to modify `docs/HARD_RULES.md` | Rules only change via reviewed PR to that file. |
| About to delete anything from `docs/knowledge/` | Knowledge loss risk — Amit confirms. |
| Hitting an auth wall (Vercel login, Convex auth, Expo login, etc.) | Amit resolves interactively. Do not guess. |
| Forbidden-tech scanner fires on a PR | Amit either justifies an exception or the PR is rejected. |

## Soft checkpoints (surface, but may proceed unless Amit says stop)

| Trigger | Agent behavior |
|---|---|
| Adding a new file outside the scope declared in the ticket's `files_touched` | Surface it: "Adding `<path>` in addition to declared files. Proceeding unless you say stop." |
| Copy on a high-risk surface (empty / error / gap / confirm) differs from `brand/voice.md` pattern library | Surface the proposed copy. Proceed with a 60-second grace window. |
| Bundling a minor refactor with the ticket work | Surface it as a separate commit on the same PR. Mention it in the PR description. |
| Any AI-generated content that would ship without the accept-reject flow | Surface as a violation candidate; `tempo-accept-reject-checker` gets final say. |

## What "surface" means concretely

The agent emits a message to Amit in one of:

- Cursor chat (for synchronous sessions)
- PR description / review comment (for async cloud work)
- Discord bot channel (configured later — track in `agents-playbook/` when set up)

The message format:

```
[CHECKPOINT:SOFT | HARD] T-0042 · <agent-id>
Reason: <one-line>
Context: <two-to-five lines>
Proposed action: <what the agent wants to do>
Alternative: <what happens if denied>
```

## What agents must never do silently

- Disable a test because it's failing.
- Skip a scan because it's noisy.
- Modify `.cursorrules` or any `.mdc` rule file without explicit instruction.
- Install a package just because a skill recommended it (check `tempo-skills.mdc` + `HARD_RULES §2` first).
- Delete data during a migration.
- Merge their own PR.
