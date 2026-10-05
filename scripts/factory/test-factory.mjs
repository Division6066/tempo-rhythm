// Unit tests for the Phase 04 factory scripts (pure functions; no API). Run: node scripts/factory/test-factory.mjs
import assert from "node:assert/strict";
import { pick, overlaps, activeBatches } from "./next-tickets.mjs";
import { order } from "./merge-train.mjs";
import { classify } from "./failures.mjs";
import { labelsFor } from "./label-pr.mjs";
import { agentBody } from "./cursor-lane.mjs";
import { ticketBranch } from "./factory-lib.mjs";
import { plan } from "./promote.mjs";
import { validate } from "./validate-tickets.mjs";
import { isTicketPath, MARKER } from "./tickets-lib.mjs";
import { linkedTickets } from "./gh-api.mjs";
import { shouldDeploy, assertLiveKeyTarget, judgeSmoke } from "./deploy-live-plan.mjs";
import { israelDate, isReleaseTitle, prNumbersFromMessage, renderReleaseBody } from "./release-pr.mjs";

let n = 0; const t = (name, fn) => { fn(); n++; console.log(`ok ${n} - ${name}`); };
const T = (number, ticket, batch, type, scope, labels = ["status:ready"], extra = {}) => ({ number, title: ticket, labels, fm: { ticket, batch, type, scope, ...extra } });
const ENV = { FACTORY_PAUSED_ALL: "false", FACTORY_PAUSED: "false", FACTORY_MAX_IN_FLIGHT: "15", FACTORY_ACTIVE_BATCHES: "B02" };

t("overlap: equal, inside, containing; siblings don't", () => {
  assert.ok(overlaps(["apps/web/a/"], ["apps/web/a"]));
  assert.ok(overlaps(["apps/web/a/b/"], ["apps/web/a/"]));
  assert.ok(overlaps(["apps/web/"], ["apps/web/a/"]));
  assert.ok(!overlaps(["apps/web/a/"], ["apps/web/ab/"]));
});
t("paused -> nothing ready", () => {
  const r = pick([T(1, "X-1", "B02", "component", ["a/"])], { ...ENV, FACTORY_PAUSED: "true" });
  assert.equal(r.paused, true); assert.equal(r.ready.length, 0);
});
t("force overrides pause (manual run only)", () => {
  assert.equal(pick([T(1, "X-1", "B02", "component", ["a/"])], { ...ENV, FACTORY_PAUSED_ALL: "true", FORCE: "true" }).ready.length, 1);
});
t("active batches: none / list / all", () => {
  assert.equal(activeBatches("none").size, 0); assert.equal(activeBatches("all"), "all"); assert.ok(activeBatches("B01,B02").has("B02"));
  assert.equal(pick([T(1, "X-1", "B03", "component", ["a/"])], ENV).ready.length, 0);
  assert.equal(pick([T(1, "X-1", "B03", "component", ["a/"])], { ...ENV, FACTORY_ACTIVE_BATCHES: "none" }).ready.length, 0);
});
t("scope overlap with an open ticket or an earlier pick is skipped; overlap_test pair allowed", () => {
  const r = pick([T(1, "B02-01", "B02", "component", ["apps/web/x/"]), T(2, "B02-02", "B02", "component", ["apps/web/x/y/"]), T(3, "B02-03", "B02", "component", ["apps/web/z/"], ["status:in-pr"]),
    T(4, "B02-04", "B02", "component", ["apps/web/z/q/"])], ENV);
  assert.deepEqual(r.ready.map((x) => x.ticket), ["B02-01"]);
  const o = pick([T(1, "B02-01", "B02", "component", ["s/"], ["status:ready"], { overlap_test: "true" }), T(2, "B02-02", "B02", "component", ["s/"], ["status:ready"], { overlap_test: "true" })], ENV);
  assert.equal(o.ready.length, 2);
});
t("depends_on must be status:done; max in flight", () => {
  const r = pick([T(1, "B02-01", "B02", "data", ["convex/"], ["status:in-pr"]), T(2, "B02-02", "B02", "component", ["a/"], ["status:ready"], { depends_on: ["B02-01"] })], ENV);
  assert.equal(r.ready.length, 0); assert.match(r.skipped[0].reason, /depends_on/);
  const m = pick([T(1, "B02-01", "B02", "component", ["a/"]), T(2, "B02-02", "B02", "component", ["b/"])], { ...ENV, FACTORY_MAX_IN_FLIGHT: "1" });
  assert.equal(m.ready.length, 1);
});
t("data tickets always claude; lane quota thirds; codex manual -> two lanes", () => {
  const all = Array.from({ length: 9 }, (_, i) => T(i + 1, `B02-0${i + 1}`, "B02", i === 0 ? "data" : "component", [`f${i}/`]));
  const r = pick(all, ENV);
  assert.equal(r.ready[0].lane, "claude"); assert.deepEqual(r.lane_quota.B02.remaining, { claude: 3, codex: 3, cursor: 3 });
  assert.deepEqual(pick(all, { ...ENV, FACTORY_CODEX_MODE: "manual" }).lane_quota.B02.remaining, { claude: 5, cursor: 4 });
});
t("merge order: per batch data first, then ticket order", () => {
  const o = order([{ fm: { batch: "B02", type: "component", ticket: "B02-10" } }, { fm: { batch: "B02", type: "data", ticket: "B02-05" } }, { fm: { batch: "B01", type: "component", ticket: "B01-02" } }, { fm: { batch: "B02", type: "component", ticket: "B02-2" } }]);
  assert.deepEqual(o.map((x) => x.fm.ticket), ["B01-02", "B02-05", "B02-2", "B02-10"]);
});
t("failure classification", () => {
  assert.equal(classify("src/a.tsx(3,10): error TS2305: Module '\"x\"' has no exported member 'Foo'."), "misalignment");
  assert.equal(classify("Property 'bar' does not exist on type 'Task'"), "misalignment");
  assert.equal(classify("expect(received).toBe(expected)"), "other");
});
t("PR labels from front-matter; data never held", () => {
  assert.deepEqual(labelsFor({ type: "data", batch: "B02", hold: "true" }), ["factory", "ticket:data", "batch:B02"]);
  assert.deepEqual(labelsFor({ type: "component", batch: "B02", hold: "true", overlap_test: "true" }), ["factory", "ticket:component", "batch:B02", "test:overlap", "hold:stress-test"]);
});
t("ticket branch is t/<issue>-<slug>", () => {
  assert.equal(ticketBranch(42, "TEMPO-B02-04"), "t/42-tempo-b02-04");
});
t("Cursor API body (v1)", () => {
  const b = agentBody({ prompt: "p", model: "grok-4.7", params: "fast=true", repoUrl: "https://github.com/o/r", ref: "factory/X-1", prUrl: "", name: "[X-1] t" });
  assert.deepEqual(b.model, { id: "grok-4.7", params: [{ id: "fast", value: "true" }] });
  assert.equal(b.autoCreatePR, true); assert.equal(b.repos[0].startingRef, "factory/X-1");
  const r = agentBody({ prompt: "p", model: "", params: "", repoUrl: "u", ref: "x", prUrl: "https://github.com/o/r/pull/5", name: "n" });
  assert.equal(r.autoCreatePR, false); assert.equal(r.repos[0].prUrl, "https://github.com/o/r/pull/5"); assert.equal(r.model, undefined);
});

// Phase 06: promoter + ticket-writer check
const TF = (id, type, scope, extra = "") => ({ path: `docs/tickets/DRY/${id}.md`, text: `---\nticket: ${id}\nbatch: DRY\ntype: ${type}\nlane: ${type === "data" ? "claude" : "auto"}\nscope:\n  - ${scope}\nhold: false\n${extra}---\n\nFOR: x\nGOAL: Goal of ${id}\n` });
const BATCH9 = [TF("T-DRY-01", "data", "convex/"), ...Array.from({ length: 8 }, (_, i) => TF(`T-DRY-0${i + 2}`, "component", `apps/web/components/f${i + 2}/`))];
t("ticket paths: batch files only, never _templates/README", () => {
  assert.ok(isTicketPath("docs/tickets/B1/T-1.md"));
  assert.ok(!isTicketPath("docs/tickets/_templates/component.md"));
  assert.ok(!isTicketPath("docs/tickets/README.md"));
  assert.ok(!isTicketPath("docs/tickets/B1/README.md"));
});
t("promoter: 9 creates with labels; invalid skipped", () => {
  const bad = { path: "docs/tickets/DRY/bad.md", text: "no front matter" };
  const r = plan({ files: [...BATCH9, bad], issues: [] });
  assert.equal(r.actions.length, 9); assert.equal(r.skipped.length, 1);
  assert.deepEqual(r.actions[0].labels, ["status:ready", "factory", "ticket:data", "batch:DRY", "lane:claude"]);
  assert.deepEqual(r.actions[1].labels, ["status:ready", "factory", "ticket:component", "batch:DRY"]);
  assert.equal(r.actions[1].title, "[T-DRY-02] Goal of T-DRY-02");
  assert.ok(r.actions[1].body.endsWith(MARKER("docs/tickets/DRY/T-DRY-02.md") + "\n"));
});
t("promoter: existing marker -> no duplicate; status labels untouched; deleted -> paused:dependency", () => {
  const first = plan({ files: BATCH9, issues: [] }).actions;
  const issues = first.map((a, i) => ({ number: 100 + i, state: "open", title: a.title, body: a.body, labels: a.labels.filter((l) => l !== "status:ready").concat("status:in-pr") }));
  assert.equal(plan({ files: BATCH9, issues }).actions.length, 0);
  const r = plan({ files: BATCH9.slice(1), issues, deleted: [BATCH9[0].path] });
  assert.deepEqual(r.actions, [{ op: "deleted", path: BATCH9[0].path, issue: 100 }]);
});
t("writer check: 9 = 1 data + 8 separate components, contract, only batch files", () => {
  const ok = validate({ batch: "DRY", size: 9, hold: false, files: BATCH9, changed: [...BATCH9.map((f) => f.path), "docs/contracts/DRY.md"], contractExists: true });
  assert.deepEqual(ok.problems, []);
  const shared = [...BATCH9.slice(0, 8), TF("T-DRY-09", "component", "apps/web/components/f2/sub/")];
  assert.ok(validate({ batch: "DRY", size: 9, hold: false, files: shared, contractExists: true }).problems.some((p) => p.includes("share scope")));
  assert.ok(validate({ batch: "DRY", size: 9, hold: true, files: BATCH9, contractExists: false }).problems.length >= 9);
  assert.ok(validate({ batch: "DRY", size: 9, hold: false, files: BATCH9, changed: ["package.json"], contractExists: true }).problems.some((p) => p.includes("outside the batch")));
});

t("release date uses Asia/Jerusalem", () => {
  assert.equal(israelDate(new Date("2026-10-04T22:30:00.000Z")), "2026-10-05");
  assert.equal(israelDate(new Date("2026-10-04T20:30:00.000Z")), "2026-10-04");
  assert.equal(isReleaseTitle("Release 2026-10-05"), true);
  assert.equal(isReleaseTitle("Release notes"), false);
});
t("release body lists PRs without a closing keyword", () => {
  assert.deepEqual(prNumbersFromMessage("feat(tasks): add a card (#482)\n\nbody mentions #9"), [482]);
  assert.deepEqual(prNumbersFromMessage("Merge pull request #12 from org/branch"), [12]);
  assert.deepEqual(prNumbersFromMessage("see #12 in the body only"), []);
  const body = renderReleaseBody({
    date: "2026-10-05", masterSha: "abc123", ahead: 2, truncated: false,
    rows: [{ number: 482, title: "feat(tasks): add a card", closes: [12] }],
  });
  assert.match(body, /#482 feat\(tasks\): add a card \(links #12\)/);
  assert.deepEqual(linkedTickets(body), []);
});
t("dry_run never deploys, including a master push", () => {
  for (const eventName of ["push", "workflow_dispatch"]) {
    const d = shouldDeploy({ eventName, ref: "refs/heads/master", dryRun: "true", pausedAll: "false", force: "true", actor: "Division6066" });
    assert.equal(d.action, "dry_run");
    assert.equal(d.exitCode, 0);
  }
});
t("real deploy only on master, and paused refuses unless a person forces a dispatch", () => {
  assert.equal(shouldDeploy({ eventName: "push", ref: "refs/heads/master", dryRun: "false", pausedAll: "false", force: "false", actor: "" }).action, "deploy");
  assert.equal(shouldDeploy({ eventName: "push", ref: "refs/heads/master", dryRun: "false", pausedAll: "true", force: "true", actor: "Division6066" }).action, "refuse");
  assert.equal(shouldDeploy({ eventName: "workflow_dispatch", ref: "refs/heads/integration", dryRun: "false", pausedAll: "false", force: "false", actor: "Division6066" }).action, "refuse");
  assert.equal(shouldDeploy({ eventName: "workflow_dispatch", ref: "refs/heads/master", dryRun: "false", pausedAll: "true", force: "true", actor: "some-app[bot]" }).action, "refuse");
  assert.equal(shouldDeploy({ eventName: "workflow_dispatch", ref: "refs/heads/master", dryRun: "false", pausedAll: "true", force: "true", actor: "Division6066" }).action, "deploy");
  assert.equal(shouldDeploy({ eventName: "", ref: "", dryRun: "", pausedAll: "", force: "", actor: "" }).action, "dry_run");
});
t("live key target is checked without echoing the key", () => {
  const bad = assertLiveKeyTarget("dev:ceaseless-dog-617|example-not-a-key");
  assert.equal(bad.ok, false);
  assert.equal(bad.error.includes("example-not-a-key"), false);
  assert.equal(bad.error.includes("dev:ceaseless-dog-617"), false);
  assert.equal(assertLiveKeyTarget("").ok, false);
  assert.equal(assertLiveKeyTarget("no-pipe").ok, false);
  assert.equal(assertLiveKeyTarget("prod:precious-wildcat-890|example-not-a-key").ok, true);
});
t("smoke requires tempoflow.dev and /api/health", () => {
  assert.equal(judgeSmoke(200, 200, JSON.stringify({ ok: true, service: "tempo-web" })).ok, true);
  assert.equal(judgeSmoke(500, 200, JSON.stringify({ ok: true, service: "tempo-web" })).ok, false);
  assert.equal(judgeSmoke(200, 200, JSON.stringify({ ok: true, service: "other" })).ok, false);
  assert.equal(judgeSmoke(200, 404, "missing").ok, false);
});

console.log(`all ${n} passed`);
