// Review gate (B-5 = Cursor Bugbot, interim; set by vars.FACTORY_REVIEW_GATE = bugbot | off).
// bugbotState() is pure; fetchBugbot() reads GitHub. Used by merge-train.mjs (a factory PR merges only when
// Bugbot is clean on its head commit) and by review-fix.mjs (the Bugbot -> lane fix loop).
// "clean"    = a completed Bugbot check run on the head SHA without a failure conclusion AND no unresolved
//              Bugbot review thread.
// "findings" = at least one unresolved review thread started by Bugbot (cursor[bot]).
// "pending"  = Bugbot check running, or no Bugbot result for the head commit yet.
// "blocked"  = Bugbot answered that it can't run (e.g. "GitHub account mismatch": the PR author is a bot and
//              no Cursor team covers the repo) -> needs Amit, never auto-fixed.
import { gh, ghAll } from "./gh-api.mjs";

export const BUGBOT_LOGINS = ["cursor[bot]", "cursor"];
const isBugbotUser = (u) => !!u && BUGBOT_LOGINS.includes(u.login || u);
const isBugbotRun = (r) => /bugbot/i.test(r.name || "") || (r.app && /cursor/i.test(r.app.slug || "") && /review|bug/i.test(r.name || ""));

export function bugbotState({ headSha, checkRuns = [], threads = [], comments = [] }) {
  const blockedNote = comments.filter((c) => isBugbotUser(c.user) && /couldn.?t run|account mismatch/i.test(c.body || "")).pop();
  const findings = threads.filter((t) => !t.isResolved && !t.isOutdated && isBugbotUser(t.author));
  if (findings.length) return { state: "findings", findings, detail: `${findings.length} unresolved Bugbot thread(s)` };
  const runs = checkRuns.filter(isBugbotRun);
  if (runs.some((r) => r.status !== "completed")) return { state: "pending", findings: [], detail: "Bugbot running" };
  const done = runs.filter((r) => r.status === "completed");
  if (done.some((r) => ["failure", "timed_out", "action_required"].includes(r.conclusion))) return { state: "findings", findings: [], detail: "Bugbot check failed (see its check run)" };
  if (done.length) return { state: "clean", findings: [], detail: `Bugbot ${done.map((r) => r.conclusion).join(",")} on ${String(headSha).slice(0, 7)}` };
  if (blockedNote) return { state: "blocked", findings: [], detail: "Bugbot couldn't run (account mismatch: PR author not covered by a Cursor team)" };
  return { state: "pending", findings: [], detail: "no Bugbot result for the head commit yet" };
}

export async function fetchBugbot(owner, repo, number) {
  const pr = await gh(`/repos/${owner}/${repo}/pulls/${number}`);
  const checkRuns = await ghAll(`/repos/${owner}/${repo}/commits/${pr.head.sha}/check-runs`, (j) => j.check_runs);
  const comments = await ghAll(`/repos/${owner}/${repo}/issues/${number}/comments`);
  const q = `query($o:String!,$r:String!,$n:Int!){repository(owner:$o,name:$r){pullRequest(number:$n){reviewThreads(first:100){nodes{isResolved isOutdated path line comments(first:1){nodes{author{login} body url}}}}}}}`;
  const g = await gh("/graphql", { method: "POST", body: { query: q, variables: { o: owner, r: repo, n: Number(number) } } });
  const nodes = g?.data?.repository?.pullRequest?.reviewThreads?.nodes || [];
  const threads = nodes.map((t) => { const c = t.comments.nodes[0] || {}; return { isResolved: t.isResolved, isOutdated: t.isOutdated, path: t.path, line: t.line, author: c.author ? { login: c.author.login === "cursor" ? "cursor[bot]" : c.author.login } : null, body: c.body || "", url: c.url }; });
  return { pr, ...bugbotState({ headSha: pr.head.sha, checkRuns, threads, comments }) };
}

export function findingsNote(findings, max = 12000) {
  const s = ["BUGBOT REVIEW FINDINGS (fix every one; stay inside the ticket scope):", ...findings.map((f, i) => `${i + 1}. ${f.path}${f.line ? ":" + f.line : ""}\n${(f.body || "").slice(0, 1500)}`)].join("\n\n");
  return s.slice(0, max);
}
