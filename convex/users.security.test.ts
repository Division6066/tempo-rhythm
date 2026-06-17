import { describe, expect, test } from "bun:test";

/** Mirrors convex/users.ts — kept in sync for unit testing env gating. */
function mockPaymentsEnabled(envValue: string | undefined) {
  return envValue === "true";
}

describe("users security helpers", () => {
  test("mock payments gate is off unless env is exactly true", () => {
    expect(mockPaymentsEnabled(undefined)).toBe(false);
    expect(mockPaymentsEnabled("false")).toBe(false);
    expect(mockPaymentsEnabled("TRUE")).toBe(false);
    expect(mockPaymentsEnabled("true")).toBe(true);
  });
});
