// Waits for the Vercel preview of THIS PR's head SHA (GitHub Deployments API, written by the
// Vercel app) and writes url=<preview url> to $GITHUB_OUTPUT.
// If Vercel's commit status says the build was skipped ("Ignored Build Step": no app changes),
// writes skipped=true instead: there is no new preview to test.
// Env: HEAD_SHA, PREVIEW_ENVIRONMENT (exact deployment environment; default: any "Preview*"),
//      PREVIEW_STATUS_CONTEXT (Vercel commit status name; default "Vercel"), WAIT_MINUTES (default 25).
import { appendFile } from "node:fs/promises";
import { gh, repoParts, summary } from "./gh-api.mjs";

const { owner, repo } = repoParts();
const sha = process.env.HEAD_SHA;
const env = process.env.PREVIEW_ENVIRONMENT || "";
const ctx = process.env.PREVIEW_STATUS_CONTEXT || "Vercel";
const deadline = Date.now() + Number(process.env.WAIT_MINUTES || 25) * 60_000;
const out = async (k, v) => process.env.GITHUB_OUTPUT && appendFile(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function once() {
  const deps = (await gh(`/repos/${owner}/${repo}/deployments?sha=${sha}&per_page=100`))
    .filter((d) => (env ? d.environment === env : /^preview/i.test(d.environment)));
  for (const d of deps) {
    const [st] = await gh(`/repos/${owner}/${repo}/deployments/${d.id}/statuses?per_page=1`);
    if (!st) continue;
    if (st.state === "success") return { url: st.environment_url || st.target_url, env: d.environment };
    if (["failure", "error"].includes(st.state)) return { fail: `Vercel deployment ${d.environment} is ${st.state}: ${st.target_url || ""}` };
  }
  if (!deps.length) {
    const statuses = await gh(`/repos/${owner}/${repo}/commits/${sha}/statuses?per_page=100`);
    const st = statuses.find((s) => s.context === ctx);
    if (st && st.state === "success" && /ignored build step|canceled/i.test(st.description || "")) return { skipped: st.description };
    if (st && ["failure", "error"].includes(st.state)) return { fail: `${ctx}: ${st.state} ${st.description || ""}` };
  }
  return null;
}

(async () => {
  while (Date.now() < deadline) {
    const r = await once().catch((e) => ({ retry: e.message }));
    if (r && r.url) { await out("url", r.url); await out("skipped", "false"); await summary([`Preview (${r.env}) for ${sha.slice(0, 7)}: ${r.url}`]); return; }
    if (r && r.skipped) { await out("skipped", "true"); await summary([`Vercel skipped the build for ${sha.slice(0, 7)} (${r.skipped}): no new preview to test. Passing.`]); return; }
    if (r && r.fail) { await summary([`FAIL: ${r.fail}`]); process.exit(1); }
    if (r && r.retry) console.log(`API error, retrying: ${r.retry}`);
    await sleep(20_000);
  }
  await summary([`FAIL: no Vercel preview for ${sha.slice(0, 7)} (environment ${env || "Preview*"}) within ${process.env.WAIT_MINUTES || 25} min.`]);
  process.exit(1);
})();
