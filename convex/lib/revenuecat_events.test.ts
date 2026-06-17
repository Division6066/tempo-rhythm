import { describe, expect, test } from "bun:test";
import { mapRevenueCatEventToUserType } from "./revenuecat_events";

describe("mapRevenueCatEventToUserType", () => {
  test("maps purchase lifecycle events to paid", () => {
    for (const eventType of [
      "INITIAL_PURCHASE",
      "RENEWAL",
      "PRODUCT_CHANGE",
      "UNCANCELLATION",
    ]) {
      expect(mapRevenueCatEventToUserType(eventType)).toBe("paid");
    }
  });

  test("maps cancellation/expiration events to free", () => {
    for (const eventType of ["EXPIRATION", "CANCELLATION", "SUBSCRIBER_ALIAS"]) {
      expect(mapRevenueCatEventToUserType(eventType)).toBe("free");
    }
  });

  test("defaults unknown or missing event types to free", () => {
    expect(mapRevenueCatEventToUserType(undefined)).toBe("free");
    expect(mapRevenueCatEventToUserType("UNKNOWN_EVENT")).toBe("free");
    expect(mapRevenueCatEventToUserType("")).toBe("free");
  });
});
