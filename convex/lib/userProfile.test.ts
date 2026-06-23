import { describe, expect, test } from "bun:test";
import { deriveGreetingName } from "./userProfile";

describe("deriveGreetingName", () => {
  test("prefers trimmed full name", () => {
    expect(deriveGreetingName("  Amit  ", "amit@example.com")).toBe("Amit");
  });

  test("falls back to email local part", () => {
    expect(deriveGreetingName("", "amit@example.com")).toBe("amit");
    expect(deriveGreetingName(undefined, "sam@tempo.app")).toBe("sam");
  });

  test("uses neutral fallback when name and email are missing", () => {
    expect(deriveGreetingName(undefined, undefined)).toBe("there");
    expect(deriveGreetingName("   ", "   ")).toBe("there");
  });
});
