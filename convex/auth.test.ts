import { describe, expect, test } from "bun:test";
import { buildExistingUserPatch } from "./lib/authUserPatch";

describe("Convex Auth user callback helpers", () => {
  test("non-founder re-login preserves existing beta and entitlement fields", () => {
    const patch = buildExistingUserPatch({
      email: "tester@example.com",
      emailVerified: true,
      fullName: "Tester",
      isFounder: false,
      now: 123,
    });

    expect(patch).toEqual({
      email: "tester@example.com",
      emailVerified: true,
      fullName: "Tester",
      updatedAt: 123,
    });
    expect("betaAccess" in patch).toBe(false);
    expect("entitlementTier" in patch).toBe(false);
    expect("isGodTier" in patch).toBe(false);
    expect("userType" in patch).toBe(false);
  });

  test("founder re-login keeps founder entitlement override", () => {
    const patch = buildExistingUserPatch({
      email: "founder@example.com",
      emailVerified: false,
      fullName: "Founder",
      isFounder: true,
      now: 456,
    });

    expect(patch).toEqual({
      email: "founder@example.com",
      emailVerified: false,
      fullName: "Founder",
      betaAccess: "founder",
      entitlementTier: "god",
      isGodTier: true,
      userType: "paid",
      updatedAt: 456,
    });
  });
});
