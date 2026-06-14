import { describe, expect, test } from "bun:test";
import { assertAccountCanSignIn, INACTIVE_ACCOUNT_MESSAGE } from "./accountAccess";

describe("assertAccountCanSignIn", () => {
  test("allows active, non-deleted users", () => {
    expect(() => assertAccountCanSignIn({ isActive: true })).not.toThrow();
    expect(() => assertAccountCanSignIn({})).not.toThrow();
  });

  test("blocks soft-deleted users", () => {
    expect(() => assertAccountCanSignIn({ deletedAt: Date.now() })).toThrow(
      INACTIVE_ACCOUNT_MESSAGE,
    );
  });

  test("blocks explicitly inactive users", () => {
    expect(() => assertAccountCanSignIn({ isActive: false })).toThrow(
      INACTIVE_ACCOUNT_MESSAGE,
    );
  });
});
