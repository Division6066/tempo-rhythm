# graphify reference: commit hook and native AGENTS.md integration

Load this when the user asked to install the post-commit hook or wire graphify into a project's AGENTS.md.

## For git commit hook

Install a post-commit hook that auto-rebuilds the graph after every commit. No background process needed - triggers once per commit, works with any editor.

```bash
graphify hook install    # install
graphify hook uninstall  # remove
graphify hook status     # check
```

After every `git commit`, the hook detects which code files changed (via `git diff HEAD~1`), re-runs AST extraction on those files, and rebuilds `graph.json` and `GRAPH_REPORT.md`. Doc/image changes are ignored by the hook - run `/graphify --update` manually for those.

If a post-commit hook already exists, graphify appends to it rather than replacing it.

**Tempo Flow:** do not install this hook by default. Parallel cloud agents share the repo; a local post-commit rebuild is not checked in and can surprise other sessions. After merge, regenerate with `graphify update . --no-cluster` and record paths in `docs/TEMPLATE_STATE.md`.

---

## For native AGENTS.md integration

Run once per project to make graphify always-on in your agent sessions:

```bash
graphify agents install
```

This writes a `## graphify` section to the local `AGENTS.md` that instructs your agent to check the graph before answering codebase questions and rebuild it after code changes. No manual `/graphify` needed in future sessions.

```bash
graphify agents uninstall  # remove the section
```
