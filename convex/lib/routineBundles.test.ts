import { describe, expect, test } from "bun:test";
import { countRoutineItems, trimmedRequiredString } from "./routineBundles";

describe("trimmedRequiredString", () => {
  test("returns trimmed text", () => {
    expect(trimmedRequiredString("  Morning reset  ", "Routine name")).toBe("Morning reset");
  });

  test("rejects blank labels with a calm error", () => {
    expect(() => trimmedRequiredString("   ", "Routine name")).toThrow(
      "Routine name cannot be empty.",
    );
  });
});

describe("countRoutineItems", () => {
  test("counts habit and task rows separately", () => {
    expect(
      countRoutineItems([
        { itemType: "habit" },
        { itemType: "task" },
        { itemType: "habit" },
      ]),
    ).toEqual({ habitCount: 2, taskCount: 1 });
  });

  test("empty bundle stays at zero", () => {
    expect(countRoutineItems([])).toEqual({ habitCount: 0, taskCount: 0 });
  });
});
