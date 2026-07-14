import { describe, expect, test } from "bun:test";
import {
  canUseCoreApp,
  getBillingNotice,
  getCurrentTierLabel,
  getEntitlementState,
  type EntitlementProfile,
} from "../../apps/web/lib/entitlement";

describe("entitlement state", () => {
  test("represents an approved tester as free promo access without a hard paywall", () => {
    const profile: EntitlementProfile = {
      betaAccess: "tester",
      entitlementTier: "none",
      userType: "free",
      isActive: true,
    };

    const state = getEntitlementState(profile);

    expect(state.accessKind).toBe("promo");
    expect(state.billingStatus).toBe("inactive");
    expect(getCurrentTierLabel(state)).toBe("Free beta");
    expect(getBillingNotice(state)).toContain("core app stays open");
    expect(canUseCoreApp(state)).toBe(true);
  });

  test("represents founder access as lifetime promo access", () => {
    const state = getEntitlementState({
      betaAccess: "founder",
      entitlementTier: "god",
      userType: "paid",
      isActive: true,
    });

    expect(state.accessKind).toBe("promo");
    expect(state.billingStatus).toBe("active");
    expect(getCurrentTierLabel(state)).toBe("Founder lifetime");
    expect(canUseCoreApp(state)).toBe(true);
  });

  test("represents a paid tier as payable access", () => {
    const state = getEntitlementState({
      betaAccess: "none",
      entitlementTier: "pro",
      userType: "paid",
      isActive: true,
    });

    expect(state.accessKind).toBe("paid");
    expect(state.billingStatus).toBe("active");
    expect(getCurrentTierLabel(state)).toBe("Pro");
    expect(canUseCoreApp(state)).toBe(true);
  });

  test("keeps an inactive non-tester clear without granting core access", () => {
    const state = getEntitlementState({
      betaAccess: "none",
      entitlementTier: "none",
      userType: "free",
      isActive: true,
    });

    expect(state.accessKind).toBe("free");
    expect(state.billingStatus).toBe("inactive");
    expect(getCurrentTierLabel(state)).toBe("Free");
    expect(getBillingNotice(state)).toContain("Payments are not live yet");
    expect(canUseCoreApp(state)).toBe(false);
  });
});
