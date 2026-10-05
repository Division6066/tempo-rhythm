// Lane context (Phase 04 Step 5). Reads the ticket issue and writes step outputs for the lane
// workflows: ticket, type, branch (factory/<ticket>), issue_url, prompt (lane-prompt.md filled
// in), pr_number / pr_url / pr_branch (an open PR for this ticket already exists = retry).
// Env: GH_TOKEN, GITHUB_REPOSITORY, ISSUE_NUMBER, FIX_NOTE (optional, failure-rule retry).
import { gh, repoParts, summary } from "./gh-api.mjs";
import { frontMatter, renderLanePrompt, findTicketPR, setOutput, assertDispatchable } from "./factory-lib.mjs";

const { owner, repo } = repoParts();
const n = Number(process.env.ISSUE_NUMBER);
const issue = await gh(`/repos/${owner}/${repo}/issues/${n}`);
if (issue.pull_request) throw new Error(`#${n} is a pull request, not a ticket`);
assertDispatchable(issue);
const fm = frontMatter(issue.body);
if (!fm || !fm.ticket || !/^[A-Za-z0-9._-]+$/.test(fm.ticket)) throw new Error(`#${n} has no valid front-matter ticket id`);
let prompt = await renderLanePrompt({ issueUrl: issue.html_url, issueNumber: n, ticketId: fm.ticket });
const pr = await findTicketPR(owner, repo, n);
if (process.env.FIX_NOTE) {
  const review = /^BUGBOT REVIEW FINDINGS/.test(process.env.FIX_NOTE);
  prompt += review
    ? `\n\nRETRY: Cursor Bugbot left review findings on ${pr ? pr.html_url : "your PR"}. Fix each finding (or, if one is wrong, explain why in a PR comment); stay in scope. Push to the same branch; do not open a new PR.\n<bugbot-findings>\n${process.env.FIX_NOTE}\n</bugbot-findings>\n`
    : `\n\nRETRY: a required check failed on ${pr ? pr.html_url : "your PR"}. Fix the failing check; stay in scope. Push to the same branch; do not open a new PR.\n<failing-log>\n${process.env.FIX_NOTE}\n</failing-log>\n`;
}
await setOutput("ticket", fm.ticket);
await setOutput("type", fm.type || "");
await setOutput("branch", pr ? pr.head.ref : `factory/${fm.ticket}`);
await setOutput("issue_url", issue.html_url);
await setOutput("title", issue.title);
await setOutput("body", issue.body || "");
await setOutput("prompt", prompt);
await setOutput("pr_number", pr ? pr.number : "");
await setOutput("pr_url", pr ? pr.html_url : "");
await summary([`Ticket #${n} ${fm.ticket} (${fm.type}); ${pr ? `existing PR ${pr.html_url} (retry)` : "no PR yet"}.`]);
