import { describe, expect, test } from "bun:test";
import { assertSelfUserId } from "./profileAccess";

describe("assertSelfUserId", () => {
  test("allows matching user ids", () => {
    expect(() => assertSelfUserId("users_a", "users_a")).not.toThrow();
  });

  test("rejects cross-user profile updates", () => {
    expect(() => assertSelfUserId("users_a", "users_b")).toThrow(/unauthorized/i);
  });
});
