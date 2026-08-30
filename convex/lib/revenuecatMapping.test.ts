import { describe, expect, test } from "bun:test";
import { revenueCatEventToUserType } from "./revenuecatMapping";

describe("revenueCatEventToUserType", () => {
  test.each([
    ["INITIAL_PURCHASE", "paid"],
    ["RENEWAL", "paid"],
    ["PRODUCT_CHANGE", "paid"],
    ["UNCANCELLATION", "paid"],
  ] as const)("maps %s to paid", (eventType, expected) => {
    expect(revenueCatEventToUserType(eventType)).toBe(expected);
  });

  test.each([
    ["EXPIRATION", "free"],
    ["CANCELLATION", "free"],
    ["SUBSCRIBER_ALIAS", "free"],
  ] as const)("maps %s to free", (eventType, expected) => {
    expect(revenueCatEventToUserType(eventType)).toBe(expected);
  });

  test("unknown event types default to free", () => {
    expect(revenueCatEventToUserType("BILLING_ISSUE")).toBe("free");
    expect(revenueCatEventToUserType(undefined)).toBe("free");
    expect(revenueCatEventToUserType("")).toBe("free");
  });
});
