// Promoter (Phase 06 Step 6). docs/tickets/<batch>/*.md -> one GitHub issue per ticket file.
// on: push to integration (paths docs/tickets/**) and workflow_dispatch. NO pause check: promoting
// is not building; nothing is dispatched until the batch is in FACTORY_ACTIVE_BATCHES (Phase 04).
// Writes ONLY with the Factory App token (GH_TOKEN). --dry-run prints the plan and writes nothing
// (reads with any token, or none on a public repo).
//   create: title "[<ticket>] <GOAL>", body = file + hidden marker <!-- ticket-file: <path> -->,
//           labels status:ready, ticket:<type>, batch:<id>, factory, lane:<x> (if set), test:overlap.
//   update: same title/body; adds the non-status labels; never touches status:* labels.
//   deleted file (DELETED env: newline list from the push diff): comment + paused:dependency.
//           Never closes or deletes an issue.
// Env: GITHUB_REPOSITORY, GH_TOKEN, DRY_RUN=1 or --dry-run, DELETED, ROOT (default ".").
import { gh, ghAll, repoParts, summary } from "./gh-api.mjs";
import { listTicketFiles, checkTicket, labelsFor, MARKER, markerOf, isTicketPath } from "./tickets-lib.mjs";
import { labelNames } from "./factory-lib.mjs";

const dry = process.argv.includes("--dry-run") || process.env.DRY_RUN === "1";

export function plan({ files, issues, deleted = [] }) {
  const byMarker = new Map();
  for (const i of issues) { const m = markerOf(i.body); if (m && !byMarker.has(m)) byMarker.set(m, i); }
  const actions = [], skipped = [];
  for (const { path, text } of files) {
    const c = checkTicket(path, text);
    if (!c.ok) { skipped.push({ path, reason: c.reason }); continue; }
    const title = `[${c.fm.ticket}] ${c.goal}`.slice(0, 250);
    const body = `${text.replace(/\s+$/, "")}\n\n${MARKER(path)}\n`;
    const labels = labelsFor(c.fm);
    const existing = byMarker.get(path);
    if (!existing) actions.push({ op: "create", path, title, body, labels: ["status:ready", ...labels] });
    else {
      const have = labelNames(existing);
      const add = labels.filter((l) => !have.includes(l));
      if (existing.title !== title || existing.body !== body || add.length) actions.push({ op: "update", path, issue: existing.number, title, body, labels: add });
    }
  }
  for (const path of deleted.filter(isTicketPath)) {
    const existing = byMarker.get(path);
    if (existing && existing.state === "open" && !labelNames(existing).includes("paused:dependency")) actions.push({ op: "deleted", path, issue: existing.number });
  }
  return { actions, skipped };
}

async function main() {
  const { owner, repo } = repoParts();
  const { files, skipped: notTickets } = await listTicketFiles(process.env.ROOT || ".");
  const deleted = (process.env.DELETED || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const issues = await ghAll(`/repos/${owner}/${repo}/issues?state=all`, (j) => j.filter((i) => !i.pull_request && (i.body || "").includes("<!-- ticket-file: ")), 5000);
  const { actions, skipped } = plan({ files, issues, deleted });
  const lines = [`## Promoter ${dry ? "(DRY RUN — nothing written)" : ""} on ${owner}/${repo}`, "",
    `Ticket files: ${files.length}. Actions: ${actions.length} (create ${actions.filter((a) => a.op === "create").length}, update ${actions.filter((a) => a.op === "update").length}, deleted ${actions.filter((a) => a.op === "deleted").length}).`, ""];
  for (const a of actions) lines.push(a.op === "deleted" ? `- deleted file ${a.path} -> comment + paused:dependency on #${a.issue}` : `- ${a.op}${a.issue ? " #" + a.issue : ""}: "${a.title}" labels [${a.labels.join(", ")}] (${a.path})`);
  const allSkipped = [...notTickets, ...skipped];
  if (allSkipped.length) { lines.push("", "Skipped:"); for (const s of allSkipped) lines.push(`- ${s.path}: ${s.reason}`); }
  await summary(lines);
  if (dry || !actions.length) return;
  if (!process.env.GH_TOKEN) throw new Error("PARKED: no Factory App token (FACTORY_APP_ID / FACTORY_APP_PRIVATE_KEY).");
  const known = new Set((await ghAll(`/repos/${owner}/${repo}/labels`)).map((l) => l.name));
  for (const a of actions) {
    for (const l of a.labels || []) if (!known.has(l)) { await gh(`/repos/${owner}/${repo}/labels`, { method: "POST", body: { name: l, color: l.startsWith("batch:") ? "c2e0c6" : "ededed", description: "Factory (promoter)" } }); known.add(l); }
    if (a.op === "create") await gh(`/repos/${owner}/${repo}/issues`, { method: "POST", body: { title: a.title, body: a.body, labels: a.labels } });
    else if (a.op === "update") { await gh(`/repos/${owner}/${repo}/issues/${a.issue}`, { method: "PATCH", body: { title: a.title, body: a.body } }); if (a.labels.length) await gh(`/repos/${owner}/${repo}/issues/${a.issue}/labels`, { method: "POST", body: { labels: a.labels } }); }
    else if (a.op === "deleted") {
      await gh(`/repos/${owner}/${repo}/issues/${a.issue}/comments`, { method: "POST", body: { body: `Promoter: the ticket file \`${a.path}\` was deleted from integration. Labelled paused:dependency for Amit. Not closed.` } });
      await gh(`/repos/${owner}/${repo}/issues/${a.issue}/labels`, { method: "POST", body: { labels: ["paused:dependency"] } });
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch(async (e) => { await summary([`FAIL: ${e.message}`]); process.exit(1); });
