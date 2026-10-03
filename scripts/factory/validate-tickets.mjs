// Ticket-writer check (Phase 06 Step 5). Validates one batch written by factory-write-tickets:
//   node scripts/factory/validate-tickets.mjs --batch B11 --size 9 [--hold] [--changed changed.txt]
// size 3 = 3 components (lanes claude, codex, cursor; no data ticket); 9 = 1 data + 8 components;
// 15 = 1 data + 14 components. hold -> every component has hold: true (data never).
// Every component has its OWN scope folder (no two components share or nest folders); the data
// ticket is the only one touching convex/ or the database folder. docs/contracts/<batch>.md exists.
// --changed: the PR's changed files; only docs/tickets/<batch>/ and docs/contracts/<batch>.md allowed.
import { readFile, access } from "node:fs/promises";
import { listTicketFiles, checkTicket } from "./tickets-lib.mjs";
import { scopeOf, truthy } from "./factory-lib.mjs";
import { summary } from "./gh-api.mjs";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const norm = (s) => s.replace(/^\.\//, "").replace(/\/?$/, "/");
const nested = (a, b) => norm(a).startsWith(norm(b)) || norm(b).startsWith(norm(a));
const DATA_DIRS = ["convex/", "db/", "drizzle/", "prisma/", "migrations/"];

export function validate({ batch, size, hold, files, changed, contractExists }) {
  const problems = [], notes = [];
  const mine = files.filter((f) => f.path.startsWith(`docs/tickets/${batch}/`));
  const tickets = [];
  for (const f of mine) { const c = checkTicket(f.path, f.text); if (!c.ok) problems.push(`${f.path}: ${c.reason}`); else tickets.push({ ...c, path: f.path }); }
  const data = tickets.filter((t) => t.fm.type === "data"), comps = tickets.filter((t) => t.fm.type === "component");
  const want = { 3: [0, 3], 9: [1, 8], 15: [1, 14] }[size];
  if (!want) problems.push(`size ${size} is not 3|9|15`);
  else {
    if (mine.length !== size) problems.push(`expected ${size} ticket files in docs/tickets/${batch}/, found ${mine.length}`);
    if (data.length !== want[0]) problems.push(`expected ${want[0]} data ticket(s), found ${data.length}`);
    if (comps.length !== want[1]) problems.push(`expected ${want[1]} component tickets, found ${comps.length}`);
  }
  if (size === 3) { const lanes = comps.map((t) => t.fm.lane).sort().join(","); if (lanes !== "claude,codex,cursor") problems.push(`size 3 needs lanes claude, codex, cursor (one each); got ${lanes || "none"}`); }
  for (const t of tickets) {
    if (!t.path.endsWith(`/${t.fm.ticket}.md`)) problems.push(`${t.path}: file name should be ${t.fm.ticket}.md`);
    if (t.fm.type === "data" && truthy(t.fm.hold)) problems.push(`${t.path}: data ticket must not be on hold`);
    if (t.fm.type === "component" && hold && !truthy(t.fm.hold)) problems.push(`${t.path}: hold requested but hold is not true`);
    if (t.fm.type === "component" && !hold && truthy(t.fm.hold)) problems.push(`${t.path}: hold is true but hold was not requested`);
    if (t.fm.type === "component" && scopeOf(t.fm).some((s) => DATA_DIRS.some((d) => norm(s).startsWith(d)))) problems.push(`${t.path}: component scope touches the data folder`);
  }
  for (let i = 0; i < comps.length; i++) for (let j = i + 1; j < comps.length; j++)
    for (const a of scopeOf(comps[i].fm)) for (const b of scopeOf(comps[j].fm))
      if (nested(a, b)) problems.push(`${comps[i].fm.ticket} and ${comps[j].fm.ticket} share scope ${a} / ${b} (separate folders required)`);
  if (!contractExists) problems.push(`docs/contracts/${batch}.md is missing`);
  if (changed) for (const p of changed) if (!(p.startsWith(`docs/tickets/${batch}/`) || p === `docs/contracts/${batch}.md`)) problems.push(`PR changes a file outside the batch: ${p}`);
  notes.push(`${tickets.length} valid tickets: ${data.length} data, ${comps.length} component.`);
  return { problems, notes, tickets };
}

async function main() {
  const batch = arg("--batch"), size = Number(arg("--size")), hold = process.argv.includes("--hold");
  if (!/^[A-Za-z0-9-]+$/.test(batch || "")) throw new Error("--batch must match ^[A-Za-z0-9-]+$");
  const changedFile = arg("--changed");
  const changed = changedFile ? (await readFile(changedFile, "utf8")).split("\n").map((s) => s.trim()).filter(Boolean) : null;
  const { files } = await listTicketFiles(".");
  const contractExists = await access(`docs/contracts/${batch}.md`).then(() => true, () => false);
  const r = validate({ batch, size, hold, files, changed, contractExists });
  await summary([`## Ticket check: batch ${batch}, size ${size}${hold ? ", hold" : ""}`, ...r.notes,
    ...r.tickets.map((t) => `- ${t.fm.ticket} (${t.fm.type}${t.fm.lane ? ", lane " + t.fm.lane : ""}) scope ${scopeOf(t.fm).join(", ")} — ${t.goal}`),
    r.problems.length ? `\nFAIL (${r.problems.length}):\n${r.problems.map((p) => "- " + p).join("\n")}` : "\nPASS"]);
  if (r.problems.length) process.exit(1);
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch(async (e) => { await summary([`FAIL: ${e.message}`]); process.exit(1); });
