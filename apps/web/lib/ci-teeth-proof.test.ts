// DISPOSABLE. Exists only to prove CI can fail. Delete after use. Never merge.
import { describe, expect, test } from "bun:test";

describe("ci-teeth-proof", () => {
  test("1 equals 2 (intentionally fails)", () => {
    expect(1).toBe(2);
  });
});
