import { describe, expect, test } from "bun:test";
import { resolveUserTypeFromRevenueCatEvent } from "./revenuecatEvents";

describe("resolveUserTypeFromRevenueCatEvent", () => {
  test("maps purchase lifecycle events to paid", () => {
    for (const eventType of [
      "INITIAL_PURCHASE",
      "RENEWAL",
      "PRODUCT_CHANGE",
      "UNCANCELLATION",
    ]) {
      expect(resolveUserTypeFromRevenueCatEvent(eventType)).toBe("paid");
    }
  });

  test("maps churn events to free", () => {
    for (const eventType of ["EXPIRATION", "CANCELLATION", "SUBSCRIBER_ALIAS"]) {
      expect(resolveUserTypeFromRevenueCatEvent(eventType)).toBe("free");
    }
  });

  test("defaults unknown event types to free", () => {
    expect(resolveUserTypeFromRevenueCatEvent("TRANSFER")).toBe("free");
    expect(resolveUserTypeFromRevenueCatEvent(undefined)).toBe("free");
  });
});
