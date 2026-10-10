// Unit tests for aiReviewState() in review-gate.mjs (pure; no I/O, no API).
// Run: node scripts/factory/test-review-evaluator.mjs
import assert from "node:assert/strict";
import { aiReviewState, SUPPORTED_AI_PROVIDERS } from "./review-gate.mjs";

let n = 0; const t = (name, fn) => { fn(); n++; console.log(`ok ${n} - ${name}`); };

const HEAD = "007d28add63476f80e4146948d1f117aff79d9e9";
const BASE = "1a2b3c4d5e6f7081920314253647586970819203";
const identity = { repo: "tempo/tempo-rhythm", pr: 700, headSha: HEAD, baseSha: BASE, requestId: "req-1" };
const clean = () => ({
  expected: { ...identity },
  observed: { ...identity },
  result: { provider: "claude", status: "completed", evidenceKind: "verified-provider", tuple: { ...identity }, findings: [] },
});

t("clean: exact tuple match, verified evidence, no findings anywhere", () => {
  assert.equal(SUPPORTED_AI_PROVIDERS.includes("claude"), true);
  const r = aiReviewState(clean());
  assert.equal(r.state, "clean");
  assert.deepEqual(r.findings, []);
  assert.ok(r.detail.includes("claude"));
});

t("pending: every tuple field mismatch between expected and observed", () => {
  for (const key of ["repo", "pr", "headSha", "baseSha", "requestId"]) {
    const f = clean();
    f.observed = { ...f.observed, [key]: key === "pr" ? 999 : `other-${key}` };
    const r = aiReviewState(f);
    assert.equal(r.state, "pending", key);
    assert.ok(r.detail.includes(key), r.detail);
  }
});

t("pending: abbreviated (short) head or base SHA", () => {
  const f1 = clean(); f1.expected = { ...f1.expected, headSha: HEAD.slice(0, 7) }; f1.observed = { ...f1.observed, headSha: HEAD.slice(0, 7) };
  assert.equal(aiReviewState(f1).state, "pending");
  const f2 = clean(); f2.expected = { ...f2.expected, baseSha: BASE.slice(0, 7) }; f2.observed = { ...f2.observed, baseSha: BASE.slice(0, 7) };
  assert.equal(aiReviewState(f2).state, "pending");
});

t("pending: unsupported or missing provider", () => {
  const f = clean(); f.result = { ...f.result, provider: "gemini" };
  assert.equal(aiReviewState(f).state, "pending");
  const f2 = clean(); f2.result = { ...f2.result, provider: undefined };
  assert.equal(aiReviewState(f2).state, "pending");
});

t("pending: unsupported evidence kinds (reaction, generic summary, Actions success, self-attestation)", () => {
  for (const evidenceKind of ["reaction", "summary", "actions-success", "self-attestation", undefined]) {
    const f = clean(); f.result = { ...f.result, evidenceKind };
    assert.equal(aiReviewState(f).state, "pending", String(evidenceKind));
  }
});

t("pending: review result's own tuple does not match the expected/observed request", () => {
  const f = clean(); f.result = { ...f.result, tuple: { ...identity, pr: 1 } };
  assert.equal(aiReviewState(f).state, "pending");
});

t("findings: P2 severity, unknown severity, and outdated-but-unresolved findings from another reviewer all block clean", () => {
  const withOther = (other) => { const f = clean(); f.otherFindings = [other]; return f; };
  assert.equal(aiReviewState(withOther({ resolved: true, severity: "P2" })).state, "findings");
  assert.equal(aiReviewState(withOther({ resolved: true, severity: "unknown" })).state, "findings");
  assert.equal(aiReviewState(withOther({ resolved: true, severity: undefined })).state, "findings");
  assert.equal(aiReviewState(withOther({ resolved: false, outdated: true, severity: "P1" })).state, "findings");
  // Resolved + a recognized non-P2 severity + not outdated: does not block.
  assert.equal(aiReviewState(withOther({ resolved: true, severity: "P1" })).state, "clean");
});

t("findings: unresolved findings from an already-used reviewer, including Cursor, block clean", () => {
  const f = clean(); f.otherFindings = [{ resolved: false, severity: "P1", reviewer: "cursor[bot]" }];
  const r = aiReviewState(f);
  assert.equal(r.state, "findings");
  assert.equal(r.findings.length, 1);
});

t("findings: unresolved findings in the AI reviewer's own result block clean", () => {
  const f = clean(); f.result = { ...f.result, findings: [{ resolved: false, severity: "P1" }] };
  const r = aiReviewState(f);
  assert.equal(r.state, "findings");
});

t("pending: active competing review prevents clean", () => {
  const f = clean(); f.competingReview = true;
  assert.equal(aiReviewState(f).state, "pending");
});

t("blocked: provider usage limit", () => {
  const f = clean(); f.result = { ...f.result, status: "usage_limit" };
  assert.equal(aiReviewState(f).state, "blocked");
});

t("pending: incomplete, error, and malformed review data", () => {
  for (const status of ["incomplete", "error", "malformed"]) {
    const f = clean(); f.result = { ...f.result, status };
    assert.equal(aiReviewState(f).state, "pending", status);
  }
});

t("pending: missing result (genuinely missing/in-flight)", () => {
  const f = clean(); f.result = undefined;
  assert.equal(aiReviewState(f).state, "pending");
});

console.log(`all ${n} passed`);
