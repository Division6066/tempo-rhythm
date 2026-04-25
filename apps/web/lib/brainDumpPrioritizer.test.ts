import { describe, expect, test } from "bun:test";
import { prioritizeBrainDump } from "./brainDumpPrioritizer";

describe("prioritizeBrainDump", () => {
  test("returns empty plan with helpful summary for empty string", () => {
    const plan = prioritizeBrainDump("");
    expect(plan.priorities).toEqual([]);
    expect(plan.summary).toContain("Nothing clear to organize");
  });

  test("returns empty plan for whitespace-only input", () => {
    const plan = prioritizeBrainDump("   \n\t\r\n   ");
    expect(plan.priorities).toEqual([]);
    expect(plan.summary).toContain("Nothing clear to organize");
  });

  test("splits a bulleted list into separate priorities", () => {
    const plan = prioritizeBrainDump("- pay rent\n- call mom\n- send email");
    expect(plan.priorities.length).toBe(3);
    const titles = plan.priorities.map((p) => p.title.toLowerCase());
    expect(titles).toEqual(expect.arrayContaining(["pay rent", "call mom", "send email"]));
  });

  test("splits a semicolon-delimited list", () => {
    const plan = prioritizeBrainDump("pay rent; call mom; send email");
    expect(plan.priorities.length).toBe(3);
  });

  test("caps total priorities at 6 even with many items", () => {
    const text = Array.from({ length: 30 }, (_, i) => `task ${i + 1} item to do today`).join("\n");
    const plan = prioritizeBrainDump(text);
    expect(plan.priorities.length).toBe(6);
  });

  test("classifies explicit deadline language as 'now'", () => {
    const plan = prioritizeBrainDump("URGENT: pay rent today");
    const top = plan.priorities[0];
    expect(top).toBeDefined();
    expect(top?.urgency).toBe("now");
  });

  test("classifies parking-lot language as 'later'", () => {
    const plan = prioritizeBrainDump("someday explore Italy");
    const top = plan.priorities[0];
    expect(top).toBeDefined();
    expect(top?.urgency).toBe("later");
  });

  test("classifies week-scoped follow-up as 'soon'", () => {
    const plan = prioritizeBrainDump("follow up with Sam tomorrow");
    const top = plan.priorities[0];
    expect(top).toBeDefined();
    expect(top?.urgency).toBe("soon");
  });

  test("deduplicates identical lines", () => {
    const plan = prioritizeBrainDump("pay rent\npay rent\npay rent");
    expect(plan.priorities.length).toBe(1);
  });

  test("strips control characters from titles", () => {
    const plan = prioritizeBrainDump("pay\u0000rent\nfinish\u0007report");
    // biome-ignore lint/suspicious/noControlCharactersInRegex: asserting absence of C0/C1 controls
    const controlChars = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/;
    for (const priority of plan.priorities) {
      expect(controlChars.test(priority.title)).toBe(false);
    }
    expect(plan.priorities.length).toBeGreaterThan(0);
  });

  test("trims filler prefixes like 'I need to'", () => {
    const plan = prioritizeBrainDump("I need to pay rent");
    expect(plan.priorities.length).toBe(1);
    const first = plan.priorities[0];
    expect(first).toBeDefined();
    expect(first?.title.toLowerCase()).not.toContain("i need to");
    expect(first?.title.toLowerCase()).toContain("pay rent");
  });

  test("shortens overly long single-line titles to <= ~80 chars", () => {
    const plan = prioritizeBrainDump("x".repeat(2000));
    const first = plan.priorities[0];
    expect(first).toBeDefined();
    if (first) {
      expect(first.title.length).toBeLessThanOrEqual(82);
    }
  });

  test("handles very large input without throwing", () => {
    const text = "task one. ".repeat(1100);
    const plan = prioritizeBrainDump(text);
    expect(plan.priorities.length).toBeGreaterThan(0);
    expect(plan.priorities.length).toBeLessThanOrEqual(6);
  });

  test("every priority has a non-empty title and reason", () => {
    const plan = prioritizeBrainDump(
      "pay rent today, call mom tomorrow, finish report this week, schedule dentist appointment, plan the trip for sunday, fix the bug, pick up the kids",
    );
    for (const priority of plan.priorities) {
      expect(priority.title.trim().length).toBeGreaterThan(0);
      expect(priority.reason.trim().length).toBeGreaterThan(0);
      expect(["now", "soon", "later"]).toContain(priority.urgency);
    }
  });

  test("summary always references the first priority when one exists", () => {
    const plan = prioritizeBrainDump("call dentist today\nmaybe plan sunday");
    expect(plan.priorities.length).toBeGreaterThan(0);
    const first = plan.priorities[0];
    expect(first).toBeDefined();
    if (first) {
      expect(plan.summary.toLowerCase()).toContain(first.title.toLowerCase());
    }
  });
});
