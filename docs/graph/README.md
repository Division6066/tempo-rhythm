# docs/graph — Graphify output

- CI (`.github/workflows/graphify.yml`, graphifyy==0.9.74) rebuilds the code graph on every push to
  `integration` and uploads `graphify-out/graph.json` as the Actions artifact `graphify-graph`
  (kept 14 days). It is not committed here yet: committing needs a Factory App PR (labelled
  `config`), and the Factory App doesn't exist yet.
- The older committed snapshot is `docs/graphs/tempo-rhythm.json` (see docs/TEMPLATE_STATE.md).
- Locally: `uv tool install graphifyy==0.9.74 && graphify update . --no-cluster` → `graphify-out/graph.json`.
- The ticket writer uses the graph to fill each ticket's `scope:` folders and to list the shared hot
  files a batch needs (those go to the data ticket or the merge agent, never to a component ticket).
