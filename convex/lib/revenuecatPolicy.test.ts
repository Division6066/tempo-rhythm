import { describe, expect, test } from "bun:test";
import {
  isRevenueCatWebhookAuthorized,
  userTypeFromRevenueCatEvent,
} from "./revenuecatPolicy";

describe("userTypeFromRevenueCatEvent", () => {
  test("maps purchase lifecycle events to paid", () => {
    for (const eventType of [
      "INITIAL_PURCHASE",
      "RENEWAL",
      "PRODUCT_CHANGE",
      "UNCANCELLATION",
    ]) {
      expect(userTypeFromRevenueCatEvent(eventType)).toBe("paid");
    }
  });

  test("maps expiration and cancellation events to free", () => {
    for (const eventType of ["EXPIRATION", "CANCELLATION", "SUBSCRIBER_ALIAS"]) {
      expect(userTypeFromRevenueCatEvent(eventType)).toBe("free");
    }
  });

  test("defaults unknown event types to free", () => {
    expect(userTypeFromRevenueCatEvent("UNKNOWN")).toBe("free");
    expect(userTypeFromRevenueCatEvent(undefined)).toBe("free");
  });
});

describe("isRevenueCatWebhookAuthorized", () => {
  test("allows any header when secret is unset", () => {
    expect(isRevenueCatWebhookAuthorized(undefined, null)).toBe(true);
    expect(isRevenueCatWebhookAuthorized(undefined, "wrong")).toBe(true);
  });

  test("requires exact header match when secret is set", () => {
    expect(isRevenueCatWebhookAuthorized("secret-token", "secret-token")).toBe(true);
    expect(isRevenueCatWebhookAuthorized("secret-token", "wrong")).toBe(false);
    expect(isRevenueCatWebhookAuthorized("secret-token", null)).toBe(false);
  });
});
