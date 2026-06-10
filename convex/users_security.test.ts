import { describe, expect, test } from "bun:test";
import { isMockPaymentsEnabled } from "./lib/payments";
import { validateRevenueCatWebhookAuth } from "./lib/revenuecat_webhook";

describe("isMockPaymentsEnabled", () => {
  const original = process.env.MOCK_PAYMENTS;

  test("is false unless MOCK_PAYMENTS is exactly true", () => {
    process.env.MOCK_PAYMENTS = "";
    expect(isMockPaymentsEnabled()).toBe(false);
    process.env.MOCK_PAYMENTS = "false";
    expect(isMockPaymentsEnabled()).toBe(false);
    process.env.MOCK_PAYMENTS = "true";
    expect(isMockPaymentsEnabled()).toBe(true);
    process.env.MOCK_PAYMENTS = original;
  });
});

describe("validateRevenueCatWebhookAuth", () => {
  test("rejects when webhook secret is unset (fail closed)", () => {
    const result = validateRevenueCatWebhookAuth("secret", undefined);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(503);
    }
  });

  test("rejects mismatched authorization header", () => {
    const result = validateRevenueCatWebhookAuth("wrong", "expected-secret");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(401);
    }
  });

  test("accepts matching authorization header", () => {
    const result = validateRevenueCatWebhookAuth("expected-secret", "expected-secret");
    expect(result.ok).toBe(true);
  });
});
