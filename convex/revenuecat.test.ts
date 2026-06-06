import { describe, expect, test } from "bun:test";
import { isRevenueCatWebhookAuthorized } from "./revenuecat";

describe("isRevenueCatWebhookAuthorized", () => {
  test("fails closed when the webhook secret is missing", () => {
    expect(isRevenueCatWebhookAuthorized("secret", undefined)).toBe(false);
    expect(isRevenueCatWebhookAuthorized("secret", "")).toBe(false);
  });

  test("rejects missing or mismatched Authorization headers", () => {
    expect(isRevenueCatWebhookAuthorized(null, "secret")).toBe(false);
    expect(isRevenueCatWebhookAuthorized("wrong", "secret")).toBe(false);
  });

  test("accepts the exact configured webhook secret", () => {
    expect(isRevenueCatWebhookAuthorized("secret", "secret")).toBe(true);
  });
});
