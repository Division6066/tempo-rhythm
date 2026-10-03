// Phase 06 shared ticket-file helpers (promoter, ticket-writer check). Pure functions + fs reads.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { frontMatter } from "./scope-guard.mjs";
import { truthy, scopeOf } from "./factory-lib.mjs";

export const TICKETS_DIR = "docs/tickets";
export const MARKER = (path) => `<!-- ticket-file: ${path} -->`;
export const markerOf = (body) => ((body || "").match(/<!-- ticket-file: (\S+) -->/) || [])[1] || null;

// docs/tickets/<batch>/*.md only; never _templates/ or files directly in docs/tickets/.
export function isTicketPath(p) {
  const m = p.match(/^docs\/tickets\/([^/]+)\/([^/]+\.md)$/);
  return !!m && !m[1].startsWith("_") && m[2].toLowerCase() !== "readme.md";
}

export function goalOf(text) {
  const m = (text || "").match(/^\s*\**GOAL\**\s*:\s*(.+)$/m);
  return m ? m[1].trim().replace(/\*+$/, "").trim() : "";
}

// Validate one ticket file. Returns { ok, reason, fm, goal, batchDir }.
export function checkTicket(path, text) {
  const batchDir = path.split("/")[2];
  const fm = frontMatter(text);
  if (!fm) return { ok: false, reason: "no front-matter block" };
  for (const k of ["ticket", "batch", "type"]) if (!fm[k] || Array.isArray(fm[k])) return { ok: false, reason: `front-matter '${k}' missing` };
  if (!scopeOf(fm).length) return { ok: false, reason: "front-matter 'scope' missing/empty" };
  if (!["data", "component"].includes(fm.type)) return { ok: false, reason: `type '${fm.type}' is not data|component` };
  if (!/^[A-Za-z0-9._-]+$/.test(fm.ticket)) return { ok: false, reason: `ticket id '${fm.ticket}' has invalid characters` };
  if (fm.batch !== batchDir) return { ok: false, reason: `batch '${fm.batch}' != folder '${batchDir}'` };
  const goal = goalOf(text);
  if (!goal) return { ok: false, reason: "no GOAL: line" };
  return { ok: true, fm, goal, batchDir };
}

export function labelsFor(fm) {
  const l = ["factory", `ticket:${fm.type}`, `batch:${fm.batch}`];
  if (["claude", "codex", "cursor"].includes(fm.lane) && fm.type !== "data") l.push(`lane:${fm.lane}`);
  if (fm.type === "data") l.push("lane:claude");
  if (truthy(fm.overlap_test)) l.push("test:overlap");
  return l;
}

export async function listTicketFiles(root = ".") {
  const out = [], skipped = [];
  let batches = [];
  try { batches = await readdir(join(root, TICKETS_DIR), { withFileTypes: true }); } catch { return { files: out, skipped }; }
  for (const d of batches) {
    if (!d.isDirectory()) { if (!/^readme\.md$/i.test(d.name)) skipped.push({ path: `${TICKETS_DIR}/${d.name}`, reason: "not inside a batch folder" }); continue; }
    if (d.name.startsWith("_")) { skipped.push({ path: `${TICKETS_DIR}/${d.name}/`, reason: "templates folder" }); continue; }
    for (const f of await readdir(join(root, TICKETS_DIR, d.name), { withFileTypes: true })) {
      const p = `${TICKETS_DIR}/${d.name}/${f.name}`;
      if (!f.isFile() || !f.name.endsWith(".md")) { skipped.push({ path: p, reason: "not a .md file" }); continue; }
      if (!isTicketPath(p)) { skipped.push({ path: p, reason: "README / not a ticket file" }); continue; }
      out.push({ path: p, text: await readFile(join(root, p), "utf8") });
    }
  }
  return { files: out, skipped };
}
