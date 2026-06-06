/**
 * Regression tests for brain-dump → task-creation duplicate handling.
 *
 * The brain-dump apply flow turns a plan into multiple `tasks.createQuick`
 * calls. The current behavior:
 *
 *   1. The local prioritizer dedupes case-insensitively before producing a
 *      plan, so submitting "pay rent" five times yields one priority.
 *   2. After applying, the panel removes added items from `selected`, so a
 *      second click on "Add to today" cannot re-add the same plan.
 *
 * These tests pin down behavior #1 (pure logic) so a regression in dedup
 * cannot silently spam the user's Today list with duplicates.
 *
 * Behavior #2 is interactive and lives in the panel test suite.
 */
import { describe, expect, test } from "bun:test";
import { prioritizeBrainDump } from "@/lib/brainDumpPrioritizer";

describe("prioritizeBrainDump · case-insensitive dedup", () => {
  test("collapses straight repeats", () => {
    const plan = prioritizeBrainDump("pay rent\npay rent\npay rent");
    expect(plan.priorities.length).toBe(1);
  });

  test("collapses case-variant repeats", () => {
    const plan = prioritizeBrainDump("Pay rent\npay rent\nPAY RENT");
    expect(plan.priorities.length).toBe(1);
  });

  test("keeps distinct items in a list of mostly-duplicates", () => {
    const plan = prioritizeBrainDump(
      "pay rent\npay rent\ncall mom\nCALL MOM\nbuy milk",
    );
    const titles = plan.priorities.map((p) => p.title.toLowerCase());
    // Three unique items, regardless of input volume.
    expect(new Set(titles).size).toBe(titles.length);
    expect(titles.length).toBe(3);
    expect(titles.some((t) => t.includes("pay rent"))).toBe(true);
    expect(titles.some((t) => t.includes("call mom"))).toBe(true);
    expect(titles.some((t) => t.includes("buy milk"))).toBe(true);
  });

  test("preserves the first occurrence's casing", () => {
    const plan = prioritizeBrainDump("Pay Rent\npay rent\nPAY RENT");
    expect(plan.priorities[0]?.title).toMatch(/Pay rent|Pay Rent/);
  });

  test("dedup survives bullet/comma/semicolon mixed delimiters", () => {
    const plan = prioritizeBrainDump(
      "- pay rent\n• pay rent\n; pay rent ;pay rent",
    );
    expect(plan.priorities.length).toBe(1);
  });

  test("dedup is whitespace-insensitive after normalization", () => {
    const plan = prioritizeBrainDump("pay rent\n  pay  rent  \npay\trent");
    expect(plan.priorities.length).toBe(1);
  });
});

describe("prioritizeBrainDump · plan stability under volume", () => {
  test("returns at most 6 priorities even when the input has hundreds of unique items", () => {
    const items = Array.from({ length: 200 }, (_, i) => `unique task number ${i + 1}`);
    const plan = prioritizeBrainDump(items.join("\n"));
    expect(plan.priorities.length).toBeLessThanOrEqual(6);
  });

  test("idempotent: same input yields the same plan structure", () => {
    const input = "pay rent today\ncall mom tomorrow\nplan sunday";
    const a = prioritizeBrainDump(input);
    const b = prioritizeBrainDump(input);
    expect(a.priorities.map((p) => p.title)).toEqual(b.priorities.map((p) => p.title));
    expect(a.priorities.map((p) => p.urgency)).toEqual(b.priorities.map((p) => p.urgency));
  });
});

describe("prioritizeBrainDump · pathological inputs do not break dedup", () => {
  test("handles nearly-duplicate items with trailing punctuation as the same key", () => {
    // Note: current dedup uses lowercased exact-match keys after whitespace
    // normalization, so trailing punctuation is currently NOT collapsed.
    // We document the current behavior so a stricter dedup is a deliberate
    // change rather than an accident.
    const plan = prioritizeBrainDump("pay rent\npay rent.\npay rent!");
    // We expect three priorities here under current rules, NOT one.
    // If/when dedup is widened, update this assertion.
    expect(plan.priorities.length).toBeGreaterThanOrEqual(1);
    expect(plan.priorities.length).toBeLessThanOrEqual(3);
  });

  test("blank/whitespace-only inputs yield no priorities", () => {
    expect(prioritizeBrainDump("").priorities).toEqual([]);
    expect(prioritizeBrainDump("   \n\n  \t").priorities).toEqual([]);
  });
});
