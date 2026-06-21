import { describe, expect, test } from "bun:test";
import { userTypeFromRevenueCatEvent } from "./revenueCatEvents";

describe("userTypeFromRevenueCatEvent", () => {
  test.each([
    "INITIAL_PURCHASE",
    "RENEWAL",
    "PRODUCT_CHANGE",
    "UNCANCELLATION",
  ] as const)("maps %s to paid", (eventType) => {
    expect(userTypeFromRevenueCatEvent(eventType)).toBe("paid");
  });

  test.each([
    "EXPIRATION",
    "CANCELLATION",
    "SUBSCRIBER_ALIAS",
  ] as const)("maps %s to free", (eventType) => {
    expect(userTypeFromRevenueCatEvent(eventType)).toBe("free");
  });

  test("defaults unknown event types to free", () => {
    expect(userTypeFromRevenueCatEvent("TRANSFER")).toBe("free");
    expect(userTypeFromRevenueCatEvent(undefined)).toBe("free");
  });
});
