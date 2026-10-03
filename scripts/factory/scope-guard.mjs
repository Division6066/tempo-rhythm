// scope-guard (Phase 03, Step 1.5). Runs on pull_request_target from the DEFAULT branch and
// reads the API only (never runs PR code).
// a. Find the ticket from "Closes #N" in the PR body. None and not a `config` PR -> fail.
//    A `config` PR without a ticket passes here (config-guard judges it).
// b. Read the ticket's front-matter: `scope:` (folders) and `type:` (data | component).
// c. Every changed file must be inside `scope:`.
// d. component tickets: no file in the data folders and no shared hot file
//    (package.json, lockfiles, route files, shared config). Those belong to the data ticket or
//    the merge agent.
// e. data tickets: may change the data folders + generated files (inside scope) and hot files.
// f. Commits with the trailer "Factory-Merge-Fix: true" are checked by this rule instead of c/d:
//    they may change hot files and any component folder, never the data folders.
//    Every other commit in the PR is still checked by c-e. Merge commits (branch updates) are
//    skipped: what they bring in is already on the base branch.
// g. The `test:overlap` label only skips the dispatcher's "no two open tickets share a folder"
//    check (Phase 04). It changes nothing here.
// Promotion PRs (integration -> master/main) pass.
// Per repo (scripts/factory/scope-guard.config.json): dataFolders, and extraHotFiles (regex strings
// added to the shared hot-file list, e.g. the backend's own config file).
import { readFile } from "node:fs/promises";
import { gh, ghAll, repoParts, summary, linkedTickets, isPromotion } from "./gh-api.mjs";

export const HOT = [
  /(^|\/)package\.json$/,
  /(^|\/)(bun\.lockb?|pnpm-lock\.yaml|package-lock\.json|yarn\.lock|npm-shrinkwrap\.json)$/,
  /(^|\/)pnpm-workspace\.yaml$/, /^turbo\.json$/, /^vercel\.json$/,
  /(^|\/)tsconfig[^/]*\.json$/, /(^|\/)(next|vite|tailwind|postcss|eslint|metro|babel)\.config\.[^/]+$/,
  /(^|\/)biome\.jsonc?$/, /(^|\/)app\.json$/, /(^|\/)\.env[^/]*$/,
  /(^|\/)routes?\.(t|j|mj)sx?$/,
];
export const MERGE_FIX = /^Factory-Merge-Fix:\s*true\s*$/im;

// Minimal front-matter reader: `key: value` and `key:` + `  - item` lists. Enough for the ticket schema.
export function frontMatter(body) {
  const m = (body || "").replace(/^\uFEFF/, "").match(/^\s*(?:<!--[\s\S]*?-->\s*)*---\s*\n([\s\S]*?)\n---\s*(\n|$)/);
  if (!m) return null;
  const out = {}; let listKey = null;
  for (const raw of m[1].split("\n")) {
    const line = raw.replace(/\s+#.*$/, "");
    if (!line.trim()) continue;
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && listKey) { out[listKey].push(item[1].trim().replace(/^["']|["']$/g, "")); continue; }
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const [, k, v] = kv;
    if (v === "") { out[k] = []; listKey = k; continue; }
    listKey = null;
    out[k] = v.startsWith("[") ? v.replace(/^\[|\]$/g, "").split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean)
      : v.trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const norm = (p) => p.replace(/^\.\//, "").replace(/^\/+/, "");
export function inFolders(path, folders) {
  return folders.some((f) => { const n = norm(f); return n.endsWith("/") ? path.startsWith(n) : path === n || path.startsWith(n + "/"); });
}

export function judge({ pr, labels, ticket, fm, files, commitFiles, config }) {
  const problems = [], notes = [];
  if (isPromotion(pr)) return { problems, notes: ["Promotion PR (integration -> live branch): passes."] };
  const isConfig = labels.includes("config");
  if (!ticket) {
    if (isConfig) return { problems, notes: ['No ticket linked and the PR is labelled "config": scope-guard passes (config-guard judges config PRs).'] };
    return { problems: ['No ticket found ("Closes #N" in the PR body) and the PR is not a "config" PR.'], notes };
  }
  if (!fm) return { problems: [`Ticket #${ticket} has no front-matter (--- block with scope: and type:).`], notes };
  const scope = Array.isArray(fm.scope) ? fm.scope : fm.scope ? [fm.scope] : [];
  const type = fm.type;
  if (!scope.length) problems.push(`Ticket #${ticket} front-matter has no scope: list.`);
  if (!["data", "component"].includes(type)) problems.push(`Ticket #${ticket} front-matter type must be data or component (got: ${type ?? "none"}).`);
  if (problems.length) return { problems, notes };
  const data = config.dataFolders || [];
  const hot = [...HOT, ...(config.extraHotFiles || []).map((x) => new RegExp(x))];
  notes.push(`Ticket #${ticket} (${fm.ticket ?? "?"}), type ${type}, scope: ${scope.join(", ")}. Data folders: ${data.join(", ") || "none configured"}.`);
  if (labels.includes("test:overlap")) notes.push("test:overlap: only the dispatcher's folder-overlap check is skipped; rules c-f still apply.");

  // Which commits touched each file? (merge commits are skipped)
  const touch = new Map();
  for (const c of commitFiles) for (const f of c.files) {
    if (!touch.has(f)) touch.set(f, { normal: false, fix: false });
    touch.get(f)[c.mergeFix ? "fix" : "normal"] = true;
  }
  const paths = [...new Set(files.flatMap((f) => [f.filename, f.previous_filename].filter(Boolean)))];
  for (const p of paths) {
    const t = touch.get(p) || { normal: true, fix: false }; // unknown origin -> strict rules (fail closed)
    const isData = inFolders(p, data), isHot = hot.some((r) => r.test(p)), inScope = inFolders(p, scope);
    if (t.fix && isData) problems.push(`${p}: a Factory-Merge-Fix commit may not change the data folders (rule f).`);
    if (!t.normal) continue;
    if (type === "component") {
      if (isData) problems.push(`${p}: component tickets may not change the data folders (rule d).`);
      else if (isHot) problems.push(`${p}: component tickets may not change shared hot files (rule d).`);
      else if (!inScope) problems.push(`${p}: outside the ticket scope (rule c).`);
    } else if (!inScope && !isHot) problems.push(`${p}: outside the ticket scope (rule c).`);
  }
  return { problems, notes };
}

async function main() {
  const { owner, repo } = repoParts();
  const number = Number(process.env.PR_NUMBER);
  const config = JSON.parse(await readFile(new URL("./scope-guard.config.json", import.meta.url), "utf8").catch(() => "{}"));
  const pr = await gh(`/repos/${owner}/${repo}/pulls/${number}`);
  const labels = pr.labels.map((l) => l.name);
  const tickets = linkedTickets(pr.body);
  const extra = [];
  if (tickets.length > 1) extra.push(`One ticket per PR: this PR links #${tickets.join(", #")}.`);
  const ticket = tickets[0] ?? null;
  let fm = null;
  if (ticket) {
    const issue = await gh(`/repos/${owner}/${repo}/issues/${ticket}`, { allow404: true });
    if (!issue) extra.push(`Ticket #${ticket} not found in this repo.`);
    else if (issue.pull_request) extra.push(`#${ticket} is a pull request, not a ticket.`);
    else fm = frontMatter(issue.body);
  }
  const files = await ghAll(`/repos/${owner}/${repo}/pulls/${number}/files`);
  if (files.length < pr.changed_files) extra.push(`Could only read ${files.length} of ${pr.changed_files} changed files. Failing closed.`);
  const commits = await ghAll(`/repos/${owner}/${repo}/pulls/${number}/commits`, (j) => j, 250);
  const commitFiles = [];
  for (const c of commits) {
    if ((c.parents || []).length > 1) continue;
    const full = await gh(`/repos/${owner}/${repo}/commits/${c.sha}`);
    commitFiles.push({ sha: c.sha, mergeFix: MERGE_FIX.test(c.commit.message), files: (full.files || []).flatMap((f) => [f.filename, f.previous_filename].filter(Boolean)) });
  }
  const { problems, notes } = judge({ pr, labels, ticket, fm, files, commitFiles, config });
  problems.unshift(...extra);
  await summary(["## scope-guard", ...notes.map((n) => `- ${n}`), ...problems.map((p) => `- FAIL: ${p}`), problems.length ? "" : "- PASS"]);
  if (problems.length) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(async (e) => { await summary([`- FAIL (error, failing closed): ${e.message}`]); process.exit(1); });
}
