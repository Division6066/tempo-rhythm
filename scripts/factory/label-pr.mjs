// factory-label-pr (Phase 04 Step 3). For a PR into integration that links a factory ticket
// ("Closes #N", ticket has front-matter with `ticket:`), add: factory, batch:<id>,
// ticket:data|ticket:component, test:overlap (overlap_test: true), hold:stress-test (hold: true,
// never on data tickets). Also moves the ticket issue to status:in-pr.
// Env: GH_TOKEN (Factory App token), GITHUB_REPOSITORY, PR_NUMBER. --dry-run prints only.
import { gh, repoParts, summary, linkedTickets } from "./gh-api.mjs";
import { frontMatter, truthy, addLabels, removeLabel, BASE } from "./factory-lib.mjs";

export function labelsFor(fm) {
  const type = fm.type === "data" ? "data" : "component";
  const out = ["factory", `ticket:${type}`];
  if (fm.batch) out.push(`batch:${fm.batch}`);
  if (truthy(fm.overlap_test)) out.push("test:overlap");
  if (truthy(fm.hold) && type !== "data") out.push("hold:stress-test");
  return out;
}

async function main() {
  const dry = process.argv.includes("--dry-run");
  const { owner, repo } = repoParts();
  const n = Number(process.env.PR_NUMBER);
  const pr = await gh(`/repos/${owner}/${repo}/pulls/${n}`);
  if (pr.base.ref !== BASE) return summary([`PR #${n} targets ${pr.base.ref}, not ${BASE}: nothing to do.`]);
  const [ticket] = linkedTickets(pr.body);
  if (!ticket) return summary([`PR #${n} links no ticket: not a factory PR.`]);
  const issue = await gh(`/repos/${owner}/${repo}/issues/${ticket}`, { allow404: true });
  const fm = issue && !issue.pull_request ? frontMatter(issue.body) : null;
  if (!fm || !fm.ticket) return summary([`#${ticket} has no factory front-matter: not a factory PR.`]);
  const labels = labelsFor(fm);
  await summary([`PR #${n} -> ticket #${ticket} (${fm.ticket}): labels ${labels.join(", ")}; issue #${ticket} -> status:in-pr${dry ? " (dry run)" : ""}`]);
  if (dry) return;
  await addLabels(owner, repo, n, labels);
  await addLabels(owner, repo, ticket, ["status:in-pr"]);
  await removeLabel(owner, repo, ticket, "status:dispatched");
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
