// config-guard (Phase 03, Step 1.4). Runs on pull_request_target from the DEFAULT branch,
// so a PR can never change the guard that judges it. Reads the API only; never runs PR code.
//
// Rules
// 1. Guarded files (.github/**, scripts/factory/**, .cursor/**, AGENTS.md, plus the files that
//    decide what CI checks: Playwright/Vitest/Jest config, secret-scan config, scripts/ci/**,
//    scan scripts): only a PR that is labelled `config`, is opened by an account in
//    GUARDED_AUTHORS and is NOT a ticket PR may change them.
//    GUARDED_AUTHORS = Division6066 only. Division6066 is Amit's account and also the account
//    Grok Bot works through. The Factory GitHub App is deliberately NOT on this list
//    (OVERNIGHT-PLAN Phase 04 Step 6: it must never change workflows through a PR).
//    Known limit: Cursor cloud agents and Codex open PRs as Division6066 too, so authorship alone
//    can't tell them apart; what stops a lane is rule 3 (a ticket PR never may) + the label.
// 2. Ticket files (docs/tickets/**, docs/contracts/**): only a PR that changes nothing else,
//    is labelled `config` and is NOT a ticket PR (ticket writer / refresher PRs). Any author.
// 3. A ticket PR = any PR whose body links a ticket ("Closes #N"), whatever its branch name.
//    A ticket PR may change neither guarded files nor ticket files.
// 4. Kept from the E11 guard (so the rewrite is not weaker):
//    - a package.json change to `scripts` or test-config keys counts as a guarded file;
//    - for guarded files the `config` label must have been added by a GUARDED_AUTHORS account,
//      and it approves only the head commit it was added on: any later push means
//      Division6066 must remove and re-add the label (so a lane can't slip a change into an
//      approved config PR).
// Promotion PRs (integration -> master/main) pass: Amit reviews and merges those.
//
// To let the Factory GitHub App open config PRs later, add its bot login (for example
// "levidavids-factory[bot]") to GUARDED_AUTHORS through a config PR. Not done now on purpose.
import { gh, ghAll, repoParts, summary, linkedTickets, isPromotion } from "./gh-api.mjs";

export const GUARDED_AUTHORS = ["Division6066"];
export const CONFIG_LABEL = "config";
export const GUARDED = [
  /^\.github\//, /^scripts\/factory\//, /^\.cursor\//, /^AGENTS\.md$/,
  // files that decide what a check checks (kept from the E11 guard so no PR can weaken a check)
  /(^|\/)playwright\.config\.[^/]+$/, /(^|\/)(vitest|jest)\.(config|workspace)\.[^/]+$/,
  /(^|\/)\.gitleaks[^/]*$/, /(^|\/)\.trufflehog[^/]*$/, /(^|\/)bunfig\.toml$/,
  /(^|\/)codecov\.ya?ml$/, /^scripts\/ci\//, /^scripts\/(scan-|check-notices|secret-scan)[^/]*$/,
];
export const TICKET_FILES = [/^docs\/tickets\//, /^docs\/contracts\//];

export const PKG_KEYS = ["scripts", "jest", "c8", "nyc", "vitest", "playwright"];

export function judge({ pr, files, extraGuarded = [] }) {
  const problems = [], notes = [];
  if (isPromotion(pr)) return { problems, notes: ["Promotion PR (integration -> live branch): Amit's merge, guard passes."] };
  const labels = pr.labels.map((l) => l.name);
  const isConfig = labels.includes(CONFIG_LABEL);
  const tickets = linkedTickets(pr.body);
  const isTicketPR = tickets.length > 0;
  const author = pr.user && pr.user.login;
  const paths = [...new Set(files.flatMap((f) => [f.filename, f.previous_filename].filter(Boolean)))];
  const guarded = [...paths.filter((p) => GUARDED.some((r) => r.test(p))), ...extraGuarded];
  const ticketFiles = paths.filter((p) => TICKET_FILES.some((r) => r.test(p)));
  notes.push(`Author: ${author}. Label "${CONFIG_LABEL}": ${isConfig ? "yes" : "no"}. Ticket PR: ${isTicketPR ? "yes (#" + tickets.join(", #") + ")" : "no"}.`);
  notes.push(`Guarded files: ${guarded.join(", ") || "none"}. Ticket files: ${ticketFiles.join(", ") || "none"}.`);
  if (guarded.length) {
    if (isTicketPR) problems.push(`A ticket PR may not change guarded files: ${guarded.join(", ")}.`);
    if (!isConfig) problems.push(`Guarded files need the "${CONFIG_LABEL}" label.`);
    if (!GUARDED_AUTHORS.includes(author)) problems.push(`Guarded files may only be changed by PRs opened by ${GUARDED_AUTHORS.join(" or ")} (this PR: ${author}).`);
  }
  if (ticketFiles.length) {
    if (isTicketPR) problems.push(`A ticket PR may not change ticket files: ${ticketFiles.join(", ")}.`);
    if (!isConfig) problems.push(`Ticket files need the "${CONFIG_LABEL}" label.`);
    const other = paths.filter((p) => !TICKET_FILES.some((r) => r.test(p)));
    if (other.length) problems.push(`A PR that changes ticket files must change nothing else (also changes: ${other.join(", ")}).`);
  }
  return { problems, notes, guarded };
}

// package.json files whose CI-relevant keys changed (fail closed when a read fails).
async function pkgGuarded(owner, repo, pr, files) {
  const PKG = /(^|\/)package\.json$/;
  const out = [];
  let base = null;
  try { base = (await gh(`/repos/${owner}/${repo}/compare/${pr.base.sha}...${pr.head.sha}`)).merge_base_commit.sha; } catch { base = null; }
  const read = async (path, ref, missingOk) => {
    if (!ref) return null;
    try {
      const d = await gh(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}?ref=${ref}`, { allow404: missingOk });
      return d === null ? {} : JSON.parse(Buffer.from(d.content, "base64").toString("utf8"));
    } catch { return null; }
  };
  for (const f of files.filter((f) => PKG.test(f.filename) || PKG.test(f.previous_filename || ""))) {
    if (!["modified", "added", "changed"].includes(f.status) || !PKG.test(f.filename)) { out.push(`${f.previous_filename || f.filename} (package.json ${f.status})`); continue; }
    const before = await read(f.filename, base, f.status === "added");
    const after = await read(f.filename, pr.head.sha, false);
    if (before === null || after === null || PKG_KEYS.some((k) => JSON.stringify(before[k] ?? null) !== JSON.stringify(after[k] ?? null)))
      out.push(`${f.filename} (CI scripts/test config keys)`);
  }
  return out;
}

// The config label approves exactly the head commit it was added on (= head of the newest
// pull_request/push run on this branch created before the label).
async function labelApproval(owner, repo, pr) {
  const problems = [];
  const tl = await ghAll(`/repos/${owner}/${repo}/issues/${pr.number}/timeline`);
  const evts = tl.filter((e) => e.event === "labeled" && e.label && e.label.name === CONFIG_LABEL);
  const evt = evts[evts.length - 1];
  const who = evt && evt.actor ? evt.actor.login : null;
  if (!who) return [`Could not find who added "${CONFIG_LABEL}".`];
  if (!GUARDED_AUTHORS.includes(who)) return [`"${CONFIG_LABEL}" was added by ${who}; for guarded files it must be added by ${GUARDED_AUTHORS.join(" or ")}.`];
  const at = new Date(evt.created_at).toISOString();
  const runs = await ghAll(`/repos/${owner}/${repo}/actions/runs?branch=${encodeURIComponent(pr.head.ref)}&created=${encodeURIComponent("<" + at)}`, (j) => j.workflow_runs, 300);
  const mine = runs.filter((r) => ["pull_request", "push"].includes(r.event) && r.head_repository && r.head_repository.full_name === pr.head.repo.full_name)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const approved = mine.length ? mine[0].head_sha : null;
  if (!approved) problems.push(`No CI run on this branch before "${CONFIG_LABEL}" was added, so the approved commit is unknown. Failing closed.`);
  else if (approved !== pr.head.sha) problems.push(`The head commit changed after "${CONFIG_LABEL}" was added (approved ${approved.slice(0, 7)}, head now ${pr.head.sha.slice(0, 7)}).`);
  if (problems.length) problems.push(`${GUARDED_AUTHORS.join(" or ")} must remove and re-add "${CONFIG_LABEL}".`);
  return problems;
}

async function main() {
  const { owner, repo } = repoParts();
  const number = Number(process.env.PR_NUMBER);
  const pr = await gh(`/repos/${owner}/${repo}/pulls/${number}`);
  const files = await ghAll(`/repos/${owner}/${repo}/pulls/${number}/files`);
  const promo = isPromotion(pr);
  const extraGuarded = promo ? [] : await pkgGuarded(owner, repo, pr, files);
  const { problems, notes, guarded = [] } = judge({ pr, files, extraGuarded });
  if (!promo && guarded.length && pr.labels.some((l) => l.name === CONFIG_LABEL) && GUARDED_AUTHORS.includes(pr.user.login))
    problems.push(...(await labelApproval(owner, repo, pr)));
  if (files.length < pr.changed_files) problems.push(`Could only read ${files.length} of ${pr.changed_files} changed files. Failing closed.`);
  await summary(["## config-guard", ...notes.map((n) => `- ${n}`), ...problems.map((p) => `- FAIL: ${p}`), problems.length ? "" : "- PASS"]);
  if (problems.length) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(async (e) => { await summary([`- FAIL (error, failing closed): ${e.message}`]); process.exit(1); });
}
