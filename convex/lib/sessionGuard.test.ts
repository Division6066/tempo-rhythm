import { describe, expect, test } from "bun:test";
import { assertAccountActiveForSession } from "./sessionGuard";

describe("assertAccountActiveForSession", () => {
  test("allows active accounts with no soft delete", () => {
    expect(() =>
      assertAccountActiveForSession({ isActive: true, deletedAt: undefined }),
    ).not.toThrow();
    expect(() => assertAccountActiveForSession({})).not.toThrow();
  });

  test("rejects missing user", () => {
    expect(() => assertAccountActiveForSession(null)).toThrow(/load your account/i);
  });

  test("rejects soft-deleted accounts", () => {
    expect(() => assertAccountActiveForSession({ deletedAt: Date.now() })).toThrow(
      /not active/i,
    );
  });

  test("rejects explicitly inactive accounts", () => {
    expect(() => assertAccountActiveForSession({ isActive: false })).toThrow(/not active/i);
  });
});
