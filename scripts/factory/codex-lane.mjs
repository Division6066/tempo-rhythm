// Codex lane (Phase 04 Step 5b). Codex is started by an "@codex ..." comment posted as Amit
// (secret CODEX_MENTION_PAT: fine-grained, Issues + Pull requests write ONLY, no Contents).
// Codex uses the model set in Codex settings (record: vars.FACTORY_MODEL_CODEX). Never an OpenAI key (R4).
// Modes (repo/org variable FACTORY_CODEX_MODE, default "issue"):
//   issue  - A: comment "@codex <lane prompt>" on the ticket issue. UNKNOWN whether this starts a
//            task that opens a PR (Phase 07 rung 1 tests it).
//   pr     - B: the Factory App opens a draft PR "[<ticket>] scaffold" on factory/<ticket> (one empty
//            commit on integration), and the @codex comment goes on that PR.
//   manual - C: nothing is posted; Amit starts Codex from the Codex web app. The dispatcher gives
//            Codex's share to the other lanes (next-tickets.mjs reads the same variable).
// Retry (FIX_NOTE set): "@codex fix the failing check; stay in scope" + the log goes on the PR.
// Env: GH_TOKEN (Factory App token for mode pr; APP_OK=true when it is one), MENTION_TOKEN (CODEX_MENTION_PAT),
//      GITHUB_REPOSITORY, ISSUE_NUMBER, CODEX_MODE, FIX_NOTE.
import { gh, repoParts, summary } from "./gh-api.mjs";
import { frontMatter, renderLanePrompt, findTicketPR, BASE } from "./factory-lib.mjs";

const API = process.env.GITHUB_API_URL || "https://api.github.com";
async function postAsAmit(owner, repo, n, body) {
  const res = await fetch(`${API}/repos/${owner}/${repo}/issues/${n}/comments`, {
    method: "POST",
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${process.env.MENTION_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error(`comment on #${n} -> ${res.status} ${await res.text()}`);
  return (await res.json()).html_url;
}

const { owner, repo } = repoParts();
const n = Number(process.env.ISSUE_NUMBER);
const mode = process.env.CODEX_MODE || "issue";
if (!["issue", "pr", "manual"].includes(mode)) throw new Error(`FACTORY_CODEX_MODE must be issue | pr | manual (got ${mode})`);
if (mode === "manual") { await summary([`Codex mode is manual: nothing posted for #${n}. Amit starts the Codex task by hand.`]); process.exit(0); }
if (mode === "pr" && process.env.APP_OK !== "true") { await summary(["PARKED: mode pr needs the Factory App token (never GITHUB_TOKEN for PRs, R15)."]); process.exit(1); }
if (!process.env.MENTION_TOKEN) { await summary(["PARKED: secret CODEX_MENTION_PAT is not set."]); process.exit(1); }

const issue = await gh(`/repos/${owner}/${repo}/issues/${n}`);
const fm = frontMatter(issue.body);
if (!fm || !fm.ticket || !/^[A-Za-z0-9._-]+$/.test(fm.ticket)) throw new Error(`#${n} has no valid front-matter ticket id`);
const prompt = await renderLanePrompt({ issueUrl: issue.html_url, issueNumber: n, ticketId: fm.ticket });
let pr = await findTicketPR(owner, repo, n);

if (process.env.FIX_NOTE) {
  if (!pr) throw new Error(`retry for #${n} but no open PR links it`);
  const url = await postAsAmit(owner, repo, pr.number, `@codex fix the failing check; stay in scope (ticket ${issue.html_url}, rules in AGENTS.md "Factory rules"). Push to this PR's branch.\n\n<details><summary>failing log (last 150 lines)</summary>\n\n\`\`\`\n${process.env.FIX_NOTE}\n\`\`\`\n</details>`);
  await summary([`Retry comment: ${url}`]); process.exit(0);
}

let target = n;
if (mode === "pr") {
  if (!pr) {
    const branch = `factory/${fm.ticket}`;
    const base = await gh(`/repos/${owner}/${repo}/git/ref/heads/${BASE}`);
    const head = await gh(`/repos/${owner}/${repo}/git/commits/${base.object.sha}`);
    const commit = await gh(`/repos/${owner}/${repo}/git/commits`, { method: "POST", body: { message: `[${fm.ticket}] scaffold (empty commit for the Codex lane)`, tree: head.tree.sha, parents: [base.object.sha] } });
    const existing = await gh(`/repos/${owner}/${repo}/git/ref/heads/${branch}`, { allow404: true });
    if (!existing) await gh(`/repos/${owner}/${repo}/git/refs`, { method: "POST", body: { ref: `refs/heads/${branch}`, sha: commit.sha } });
    pr = await gh(`/repos/${owner}/${repo}/pulls`, { method: "POST", body: { title: `[${fm.ticket}] scaffold`, head: branch, base: BASE, draft: true, body: `Closes #${n}\n\nScaffold PR for the Codex lane (fallback B). Codex pushes the work here; REPORT and EVIDENCE get filled in before it leaves draft.` } });
  }
  target = pr.number;
}
const url = await postAsAmit(owner, repo, target, `@codex ${prompt}`);
await summary([`Codex lane (${mode}) for #${n} ${fm.ticket}: ${url}`]);
