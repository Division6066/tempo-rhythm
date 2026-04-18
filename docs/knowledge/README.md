# Tempo Knowledge Base

This folder is **the agent brain**. Every Cursor agent, every Claude Code agent, every cloud agent reads from here before writing code.

## What lives here

| Folder | What it is | Who reads it |
|---|---|---|
| `brand/` | Brand identity, voice, visual tokens, do-and-dont examples. Enforced when touching UI. | Design skills + `tempo-brand` skill |
| `tickets/` | One self-contained prompt per `todo`/`in-progress` task in `docs/TASKS.md`. `_INDEX.md` groups by time budget and parallelizability. | `/whats-next` command, parallel build agents |
| `prds/` | Pointers to canonical PRDs under `docs/PRDs/`. Never copy content — always reference. | Every agent starting a feature |
| `rules/` | Pointers to `docs/HARD_RULES.md` + `.cursor/rules/*`. | Every agent, every session |
| `agents-playbook/` | How agents run the Sunday-morning 45-minute workflow, when to checkpoint with Amit, how sub-agents verify diffs. | Orchestrator agents, `/whats-next` |
| `sources/` | Raw source folders/docs that get ingested into the above. **Drop new source material here**; a distillation agent folds it upward. | The ingestion agent only |

## How an agent uses this folder

1. Open `_INDEX.md` (top-level map). Follow the link for the task domain you're working on.
2. If touching UI → read `brand/_INDEX.md` + `brand/visual-tokens.md`.
3. If executing a ticket → your ticket file in `tickets/T-XXXX.md` has everything. Do not hunt.
4. If in doubt → re-read `docs/HARD_RULES.md`. That file wins over everything here.

## How humans update this folder

- **Brand changes** → edit the file in `brand/`, then bump the revision header.
- **New tickets** → run `/tick-task` after finishing a task; the ticket generator updates `tickets/_INDEX.md` and the relevant `T-XXXX.md`.
- **New source material** → drop it in `sources/` with a short README, then run the ingestion agent.

## What this folder is NOT

- Not a runtime RAG database (no embeddings here). If the product grows past what fits in an agent's context window, we add embeddings on top of these files using the `rag-implementation` skill. Today the structure + Cursor rules + skill auto-attach is enough.
- Not a replacement for `docs/HARD_RULES.md`. Hard rules are short, flat, and non-negotiable. This folder is the *why* and the *how*.
- Not a dumping ground. Every file here has a named owner in its header.
