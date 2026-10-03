// factory-failures (Phase 04 Step 8, R16). Runs when a run of the workflows holding `ci`
// (CI) or `e2e-preview` completes. Only acts on failures of PRs labelled `factory`; skips PRs
// labelled merge-fixing (a fix is already running).
// - component PR whose batch's data ticket is not status:done -> waiting:data, nothing else.
// - MISALIGNMENT (type errors, wrong import names, prop/shape mismatch, contract mismatch):
//   < 2 mergefix labels -> add the next (mergefix:1, mergefix:2) and dispatch factory-merge-fix.yml.
//   Not an attempt.
// - anything else (or misalignment with mergefix:2): back to the lane: attempt:1 -> 2 -> 3 and
//   re-dispatch factory-lane-<lane>.yml with the last 150 log lines as fix_note (the Codex lane
//   then posts "@codex fix ..." on the PR with CODEX_MENTION_PAT).
// - a failure while attempt:3 is on: blocked:amit + a 5-line summary; every ticket whose
//   depends_on includes it gets paused:dependency; if it is type: data or 3+ tickets depend on it:
//   repo variable FACTORY_PAUSED=true and an issue "Factory paused: <ticket>" assigned to Amit.
// Env: GH_TOKEN (Factory App token), GITHUB_REPOSITORY, RUN_ID, AMIT (login, default Division6066),
//      DRY_RUN=1 (print only).
import { gh, ghAll, repoParts, summary, linkedTickets } from "./gh-api.mjs";
import { labelNames, allTickets, addLabels, removeLabel, comment, listOf, BASE } from "./factory-lib.mjs";

export const MISALIGNMENT = [
  /error TS(2305|2307|2339|2345|2322|2324|2353|2551|2554|2555|2559|2561|2614|2724|2741|2769)\b/,
  /has no exported member/i, /Module ['"][^'"]+['"] has no exported/i, /Cannot find name ['"]/i,
  /Property ['"][^'"]+['"] does not exist on type/i, /is not assignable to (type|parameter)/i,
  /Expected \d+ arguments?, but got \d+/i, /is missing the following properties/i,
  /Attempted import error/i, /export ['"][^'"]+['"] \(imported as/i, /does not provide an export named/i,
];
export const classify = (text) => (MISALIGNMENT.some((r) => r.test(text)) ? "misalignment" : "other");

const DRY = process.env.DRY_RUN === "1";
const act = async (what, fn) => { console.log(`${DRY ? "[dry-run] would " : ""}${what}`); if (!DRY) return fn(); };

async function failingLog(owner, repo, runId) {
  const jobs = await ghAll(`/repos/${owner}/${repo}/actions/runs/${runId}/jobs`, (j) => j.jobs);
  const failed = jobs.filter((j) => j.conclusion === "failure");
  let text = "";
  for (const j of failed) {
    const res = await fetch(`${process.env.GITHUB_API_URL || "https://api.github.com"}/repos/${owner}/${repo}/actions/jobs/${j.id}/logs`, { headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: "application/vnd.github+json" } });
    text += `\n=== job: ${j.name} ===\n` + (res.ok ? await res.text() : `(log unavailable: ${res.status})`);
  }
  const lines = text.split("\n").map((l) => l.replace(/^\d{4}-\d\d-\d\dT[\d:.]+Z\s/, ""));
  return { jobs: failed.map((j) => j.name), tail: lines.slice(-150).join("\n").slice(-20000) };
}

async function main() {
  const { owner, repo } = repoParts();
  const run = await gh(`/repos/${owner}/${repo}/actions/runs/${process.env.RUN_ID}`);
  if (run.conclusion !== "failure") return summary([`Run ${run.id} (${run.name}) concluded ${run.conclusion}: nothing to do.`]);
  let prNum = run.pull_requests?.[0]?.number;
  if (!prNum) { const prs = await ghAll(`/repos/${owner}/${repo}/pulls?state=open&base=${BASE}`); prNum = prs.find((p) => p.head.sha === run.head_sha)?.number; }
  if (!prNum) return summary([`Run ${run.id}: no open PR into ${BASE} for ${run.head_sha.slice(0, 7)}.`]);
  const pr = await gh(`/repos/${owner}/${repo}/pulls/${prNum}`);
  if (pr.head.sha !== run.head_sha) return summary([`PR #${prNum} moved on (head ${pr.head.sha.slice(0, 7)} != ${run.head_sha.slice(0, 7)}): stale failure, ignored.`]);
  const labels = labelNames(pr);
  if (!labels.includes("factory")) return summary([`PR #${prNum} is not a factory PR.`]);
  if (labels.includes("merge-fixing")) return summary([`PR #${prNum}: merge-fix running; skipped.`]);
  if (labels.includes("blocked:amit")) return summary([`PR #${prNum}: already blocked:amit.`]);
  const [ticketNo] = linkedTickets(pr.body);
  const tickets = await allTickets(owner, repo);
  const me = tickets.find((t) => t.issue.number === ticketNo);
  if (!me) return summary([`PR #${prNum}: linked ticket #${ticketNo} has no front-matter.`]);
  const fm = me.fm, batch = String(fm.batch);
  const data = tickets.find((t) => t.fm.type === "data" && String(t.fm.batch) === batch);
  if (fm.type !== "data" && data && !labelNames(data.issue).includes("status:done")) {
    await act(`label #${prNum} waiting:data (batch ${batch} data ${data.fm.ticket} not merged)`, () => addLabels(owner, repo, prNum, ["waiting:data"]));
    return summary([`PR #${prNum}: waiting:data (not a failure).`]);
  }
  if (labels.includes("waiting:data")) await act(`remove waiting:data from #${prNum}`, () => removeLabel(owner, repo, prNum, "waiting:data"));
  const { jobs, tail } = await failingLog(owner, repo, run.id);
  const kind = classify(tail);
  const mergefix = labels.filter((l) => /^mergefix:\d$/.test(l)).length;
  const dispatch = (wf, inputs) => gh(`/repos/${owner}/${repo}/actions/workflows/${wf}/dispatches`, { method: "POST", body: { ref: BASE, inputs } });

  if (kind === "misalignment" && mergefix < 2) {
    const next = `mergefix:${mergefix + 1}`;
    await act(`label #${prNum} ${next} and dispatch factory-merge-fix.yml`, async () => { await addLabels(owner, repo, prNum, [next]); await dispatch("factory-merge-fix.yml", { pr_number: String(prNum), log: tail }); });
    return summary([`PR #${prNum} (${fm.ticket}): misalignment in ${jobs.join(", ")} -> ${next}, merge-fix dispatched.`]);
  }
  const attempt = [3, 2, 1].find((k) => labels.includes(`attempt:${k}`)) || 0;
  if (attempt < 3) {
    const lane = (labelNames(me.issue).find((l) => l.startsWith("lane:")) || "lane:claude").slice(5);
    await act(`label #${prNum} attempt:${attempt + 1} and re-dispatch factory-lane-${lane}.yml for #${ticketNo}`, async () => {
      if (attempt) await removeLabel(owner, repo, prNum, `attempt:${attempt}`);
      await addLabels(owner, repo, prNum, [`attempt:${attempt + 1}`]);
      await dispatch(`factory-lane-${lane}.yml`, { issue_number: String(ticketNo), fix_note: `fix the failing check; stay in scope\n${tail}` });
    });
    return summary([`PR #${prNum} (${fm.ticket}): ${kind} failure in ${jobs.join(", ")} -> attempt:${attempt + 1}, lane ${lane} re-dispatched.`]);
  }
  // attempt:3 failed -> blocked
  const dependents = tickets.filter((t) => listOf(t.fm.depends_on).includes(fm.ticket) && t.issue.state === "open");
  const amit = process.env.AMIT || "Division6066";
  await act(`block #${prNum} / #${ticketNo} (blocked:amit) + summary`, async () => {
    await addLabels(owner, repo, prNum, ["blocked:amit"]); await addLabels(owner, repo, ticketNo, ["blocked:amit"]);
    await comment(owner, repo, prNum, [`Factory: ${fm.ticket} failed after attempt:3 -> blocked:amit.`, `Failing jobs: ${jobs.join(", ") || "?"} (run ${run.html_url}).`, `Kind: ${kind}; merge-fixes used: ${mergefix}.`, `Dependents paused: ${dependents.map((d) => d.fm.ticket).join(", ") || "none"}.`, `Last log line: ${tail.trim().split("\n").pop()?.slice(0, 200) || "-"}`].join("\n"));
  });
  for (const d of dependents) await act(`label #${d.issue.number} ${d.fm.ticket} paused:dependency`, () => addLabels(owner, repo, d.issue.number, ["paused:dependency"]));
  if (fm.type === "data" || dependents.length >= 3) {
    await act(`set repo variable FACTORY_PAUSED=true and open "Factory paused: ${fm.ticket}" for ${amit}`, async () => {
      await gh(`/repos/${owner}/${repo}/actions/variables/FACTORY_PAUSED`, { method: "PATCH", body: { name: "FACTORY_PAUSED", value: "true" } });
      await gh(`/repos/${owner}/${repo}/issues`, { method: "POST", body: { title: `Factory paused: ${fm.ticket}`, assignees: [amit], labels: ["blocked:amit"], body: `${fm.ticket} (#${ticketNo}, PR #${prNum}) is blocked after 3 attempts${fm.type === "data" ? " and it is the batch's DATA ticket" : ""}; ${dependents.length} ticket(s) depend on it. FACTORY_PAUSED was set to true on this repo. Run: ${run.html_url}` } });
    });
  }
  await summary([`PR #${prNum} (${fm.ticket}): failed with attempt:3 -> blocked:amit; ${dependents.length} dependents paused.`]);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch(async (e) => { await summary([`FAIL: ${e.message}`]); process.exit(1); });
