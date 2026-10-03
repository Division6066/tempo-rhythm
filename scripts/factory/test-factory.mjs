// Unit tests for the Phase 04 factory scripts (pure functions; no API). Run: node scripts/factory/test-factory.mjs
import assert from "node:assert/strict";
import { pick, overlaps, activeBatches } from "./next-tickets.mjs";
import { order } from "./merge-train.mjs";
import { classify } from "./failures.mjs";
import { labelsFor } from "./label-pr.mjs";
import { agentBody } from "./cursor-lane.mjs";

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
t("Cursor API body (v1)", () => {
  const b = agentBody({ prompt: "p", model: "grok-4.7", params: "fast=true", repoUrl: "https://github.com/o/r", ref: "factory/X-1", prUrl: "", name: "[X-1] t" });
  assert.deepEqual(b.model, { id: "grok-4.7", params: [{ id: "fast", value: "true" }] });
  assert.equal(b.autoCreatePR, true); assert.equal(b.repos[0].startingRef, "factory/X-1");
  const r = agentBody({ prompt: "p", model: "", params: "", repoUrl: "u", ref: "x", prUrl: "https://github.com/o/r/pull/5", name: "n" });
  assert.equal(r.autoCreatePR, false); assert.equal(r.repos[0].prUrl, "https://github.com/o/r/pull/5"); assert.equal(r.model, undefined);
});
console.log(`all ${n} passed`);
