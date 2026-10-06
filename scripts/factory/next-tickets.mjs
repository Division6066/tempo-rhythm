// next-tickets (Phase 04 Step 4) - the dispatcher's deterministic pre-step. Writes ready.json.
// A ticket is dispatchable only if ALL hold:
//  1. it has status:ready, and not blocked:amit / paused:dependency / status:dispatched / status:in-pr;
//  2. every depends_on ticket has status:done;
//  3. no OPEN ticket (status:dispatched or status:in-pr), and no ticket picked earlier in this run,
//     has a scope folder equal to, inside, or containing one of its scope folders
//     (exception: both have overlap_test: true);
//  4. open factory tickets < FACTORY_MAX_IN_FLIGHT (picks fill the remaining capacity);
//  5. not paused (FACTORY_PAUSED_ALL / FACTORY_PAUSED, unless FORCE=true from a manual run);
//  6. its batch is in FACTORY_ACTIVE_BATCHES (comma list) or that is `all` (`none`/empty = nothing).
// Also: the lane quota per batch (equal thirds; data tickets always claude) for the agent, and
// codex_mode (FACTORY_CODEX_MODE: issue | pr | manual; manual = codex gets no tickets, its share
// goes to the other two lanes).
// Usage: node next-tickets.mjs [--out ready.json] [--local <dir-of-ticket-.md-files>]
//   --local reads tickets from files (dry run): front-matter + optional `labels:` line in the
//   front-matter for status labels. No API calls in --local mode.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { frontMatter, scopeOf, listOf, labelNames, truthy, allTickets } from "./factory-lib.mjs";
import { repoParts, summary } from "./gh-api.mjs";

export const CODEX_MODE_DEFAULT = "pr"; // pr | issue | manual (override: FACTORY_CODEX_MODE)
const OPEN = ["status:dispatched", "status:in-pr"];
const norm = (f) => f.replace(/^\.\//, "").replace(/^\/+/, "").replace(/\/?$/, "/");
export const overlaps = (a, b) => a.some((x) => b.some((y) => { const p = norm(x), q = norm(y); return p.startsWith(q) || q.startsWith(p); }));

export function activeBatches(v) {
  const s = (v || "none").trim();
  if (s === "all") return "all";
  if (s === "none" || !s) return new Set();
  return new Set(s.split(",").map((x) => x.trim()).filter(Boolean));
}

// tickets: [{ number, title, labels: [..], fm }]
export function pick(tickets, env) {
  const paused = (env.FACTORY_PAUSED_ALL === "true" || env.FACTORY_PAUSED === "true") && env.FORCE !== "true";
  const max = Number(env.FACTORY_MAX_IN_FLIGHT || 15);
  const batches = activeBatches(env.FACTORY_ACTIVE_BATCHES);
  const codexMode = env.FACTORY_CODEX_MODE || CODEX_MODE_DEFAULT;
  const byId = new Map(tickets.map((t) => [t.fm.ticket, t]));
  const open = tickets.filter((t) => t.labels.some((l) => OPEN.includes(l)));
  const out = { paused, codex_mode: codexMode, max_in_flight: max, open: open.length, active_batches: batches === "all" ? "all" : [...batches], ready: [], skipped: [], lane_quota: {} };
  if (paused) { out.reason = "paused (FACTORY_PAUSED_ALL or FACTORY_PAUSED is true)"; return out; }
  let capacity = max - open.length;
  const taken = open.map((t) => t);
  const ready = tickets.filter((t) => t.labels.includes("status:ready"))
    .sort((a, b) => String(a.fm.batch).localeCompare(String(b.fm.batch)) || String(a.fm.ticket).localeCompare(String(b.fm.ticket), undefined, { numeric: true }));
  for (const t of ready) {
    const id = t.fm.ticket, skip = (reason) => out.skipped.push({ issue: t.number, ticket: id, reason });
    if (t.labels.includes("blocked:amit")) { skip("blocked:amit"); continue; }
    if (t.labels.includes("paused:dependency")) { skip("paused:dependency"); continue; }
    if (t.labels.some((l) => OPEN.includes(l))) { skip("already dispatched / in PR"); continue; }
    if (batches !== "all" && !batches.has(String(t.fm.batch))) { skip(`batch ${t.fm.batch} not in FACTORY_ACTIVE_BATCHES`); continue; }
    const deps = listOf(t.fm.depends_on).filter((d) => !(byId.get(d)?.labels || []).includes("status:done"));
    if (deps.length) { skip(`depends_on not done: ${deps.join(", ")}`); continue; }
    const scope = scopeOf(t.fm);
    if (!scope.length) { skip("no scope:"); continue; }
    const clash = taken.find((o) => overlaps(scope, scopeOf(o.fm)) && !(truthy(t.fm.overlap_test) && truthy(o.fm.overlap_test)));
    if (clash) { skip(`scope overlaps open/picked ticket ${clash.fm.ticket} (${scopeOf(clash.fm).join(", ")})`); continue; }
    if (capacity <= 0) { skip(`FACTORY_MAX_IN_FLIGHT (${max}) reached`); continue; }
    capacity--; taken.push(t);
    out.ready.push({ issue: t.number, ticket: id, batch: t.fm.batch, type: t.fm.type, lane: t.fm.type === "data" ? "claude" : (t.fm.lane || "auto"), scope, title: t.title });
  }
  // Lane quota per batch: equal thirds over ALL tickets of the batch; lanes already used
  // (lane:* labels) count; data -> claude. codex manual -> codex share split over the others.
  const lanes = codexMode === "manual" ? ["claude", "cursor"] : ["claude", "codex", "cursor"];
  for (const b of new Set(out.ready.map((r) => String(r.batch)))) {
    const all = tickets.filter((t) => String(t.fm.batch) === b);
    const per = Math.floor(all.length / lanes.length), extra = all.length % lanes.length;
    const quota = Object.fromEntries(lanes.map((l, i) => [l, per + (i < extra ? 1 : 0)]));
    for (const t of all) { const l = t.labels.find((x) => x.startsWith("lane:"))?.slice(5); if (l && quota[l] !== undefined) quota[l]--; }
    out.lane_quota[b] = { total: all.length, remaining: quota };
  }
  return out;
}

async function loadLocal(dir) {
  const out = [];
  for (const f of (await readdir(dir)).filter((x) => x.endsWith(".md")).sort()) {
    const body = await readFile(join(dir, f), "utf8");
    const fm = frontMatter(body);
    if (!fm || !fm.ticket) continue;
    out.push({ number: Number(fm.issue || out.length + 1), title: (body.match(/^#\s+(.+)$/m) || [, f])[1], labels: listOf(fm.labels), fm });
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const outFile = args.includes("--out") ? args[args.indexOf("--out") + 1] : "ready.json";
  const local = args.includes("--local") ? args[args.indexOf("--local") + 1] : null;
  let tickets;
  if (local) tickets = await loadLocal(local);
  else {
    const { owner, repo } = repoParts();
    tickets = (await allTickets(owner, repo)).map(({ issue, fm }) => ({ number: issue.number, title: issue.title, labels: labelNames(issue), fm, state: issue.state }))
      .filter((t) => t.state === "open" || t.labels.includes("status:done"));
  }
  const result = pick(tickets, process.env);
  await writeFile(outFile, JSON.stringify(result, null, 2) + "\n");
  await summary([`## next-tickets`, `paused: ${result.paused}${result.reason ? ` (${result.reason})` : ""}; open ${result.open}/${result.max_in_flight}; active batches: ${JSON.stringify(result.active_batches)}; codex_mode: ${result.codex_mode}`,
    ...result.ready.map((r) => `- READY #${r.issue} ${r.ticket} (${r.type}, lane ${r.lane}) scope ${r.scope.join(", ")}`),
    ...result.skipped.map((s) => `- skip #${s.issue} ${s.ticket}: ${s.reason}`)]);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
