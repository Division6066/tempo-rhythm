import { describe, expect, test } from "bun:test";
import { parsePlanFromModelContent } from "../../convex/brain_dump";
import { prioritizeBrainDump } from "../../apps/web/lib/brainDumpPrioritizer";

describe("brain dump parser day-one behavior", () => {
  test("local fallback turns messy input into editable proposal candidates", () => {
    const plan = prioritizeBrainDump(
      "reply to Maya today, pay phone bill tonight; maybe plan Sunday\n- schedule dentist appointment\n- someday explore Italy",
    );

    expect(plan.priorities.length).toBeGreaterThanOrEqual(4);
    expect(plan.priorities.length).toBeLessThanOrEqual(6);
    expect(plan.priorities.map((item) => item.title.toLowerCase())).toEqual(
      expect.arrayContaining([
        "reply to maya today",
        "pay phone bill tonight",
        "schedule dentist appointment",
      ]),
    );
  });

  test("model parser keeps only valid proposals and caps the plan", () => {
    const modelContent = JSON.stringify({
      summary: "Start with the concrete open loops.",
      priorities: [
        { title: "Reply to Maya", reason: "She is waiting today.", urgency: "now" },
        { title: "Pay phone bill", reason: "Money item due tonight.", urgency: "now" },
        { title: "", reason: "Invalid blank title.", urgency: "soon" },
        { title: "Plan Sunday", reason: "Useful but not urgent.", urgency: "later" },
        { title: "Task 4", reason: "Reason.", urgency: "soon" },
        { title: "Task 5", reason: "Reason.", urgency: "soon" },
        { title: "Task 6", reason: "Reason.", urgency: "soon" },
        { title: "Task 7", reason: "Reason.", urgency: "soon" },
      ],
    });

    const plan = parsePlanFromModelContent(modelContent);

    expect(plan.summary).toContain("open loops");
    expect(plan.priorities).toHaveLength(6);
    expect(plan.priorities.some((item) => item.title === "")).toBe(false);
  });
});
