// Shared helpers for the Phase 04 factory scripts (labeller, lanes, dispatcher, merge train, failures).
// API only; never runs PR code. Token: GH_TOKEN (Factory App token for writes, github.token for reads).
import { appendFile, readFile } from "node:fs/promises";
import { gh, ghAll, linkedTickets } from "./gh-api.mjs";
import { frontMatter } from "./scope-guard.mjs";

export { frontMatter };
export const BASE = "integration";

export const truthy = (v) => v === true || v === "true";
export const scopeOf = (fm) => (Array.isArray(fm?.scope) ? fm.scope : fm?.scope ? [fm.scope] : []);
export const listOf = (v) => (Array.isArray(v) ? v : v ? [v] : []);
export const labelNames = (item) => (item.labels || []).map((l) => (typeof l === "string" ? l : l.name));

// Multiline-safe $GITHUB_OUTPUT writer.
export async function setOutput(key, value) {
  const v = String(value ?? "");
  if (!process.env.GITHUB_OUTPUT) { console.log(`[output] ${key}=${v.length > 200 ? v.slice(0, 200) + "..." : v}`); return; }
  const d = `EOF_${Math.random().toString(36).slice(2)}`;
  await appendFile(process.env.GITHUB_OUTPUT, `${key}<<${d}\n${v}\n${d}\n`);
}

export async function renderLanePrompt({ issueUrl, issueNumber, ticketId }) {
  const t = await readFile(new URL("../../.github/factory/lane-prompt.md", import.meta.url), "utf8");
  return t.replaceAll("{{ISSUE_URL}}", issueUrl).replaceAll("{{ISSUE_NUMBER}}", String(issueNumber)).replaceAll("{{TICKET_ID}}", ticketId);
}

// The open PR into integration whose body links this issue ("Closes #N"), if any.
export async function findTicketPR(owner, repo, issueNumber) {
  const prs = await ghAll(`/repos/${owner}/${repo}/pulls?state=open&base=${BASE}`);
  return prs.find((p) => linkedTickets(p.body).includes(Number(issueNumber))) || null;
}

export async function addLabels(owner, repo, n, labels) {
  if (labels.length) await gh(`/repos/${owner}/${repo}/issues/${n}/labels`, { method: "POST", body: { labels } });
}
export async function removeLabel(owner, repo, n, label) {
  await gh(`/repos/${owner}/${repo}/issues/${n}/labels/${encodeURIComponent(label)}`, { method: "DELETE", allow404: true });
}
export async function comment(owner, repo, n, body) {
  return gh(`/repos/${owner}/${repo}/issues/${n}/comments`, { method: "POST", body: { body } });
}

// All factory tickets (issues with front-matter `ticket:`), any state. Used by the dispatcher,
// merge train and failure rule to resolve depends_on / batch / type by ticket id.
export async function allTickets(owner, repo) {
  const issues = await ghAll(`/repos/${owner}/${repo}/issues?state=all`, (j) => j.filter((i) => !i.pull_request), 5000);
  return issues.map((i) => ({ issue: i, fm: frontMatter(i.body) })).filter((t) => t.fm && t.fm.ticket);
}
