import { describe, expect, test } from "bun:test";
import { clampBody, isDateKey } from "./journal";

describe("isDateKey", () => {
  test("accepts a valid YYYY-MM-DD date", () => {
    expect(isDateKey("2026-10-02")).toBe(true);
  });

  test.each(["2026-13-01", "x"])("rejects %s", (value) => {
    expect(isDateKey(value)).toBe(false);
  });
});

describe("clampBody", () => {
  test("cuts bodies at 20,000 characters", () => {
    expect(clampBody("a".repeat(20_001))).toHaveLength(20_000);
  });
});
