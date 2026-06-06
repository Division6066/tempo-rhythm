import { describe, expect, test } from "bun:test";
import { isRevenueCatRequestAuthorized } from "./revenuecat";

describe("RevenueCat webhook authorization", () => {
  test("fails closed when the webhook secret is not configured", () => {
    expect(isRevenueCatRequestAuthorized(null, "anything")).toBe(false);
    expect(isRevenueCatRequestAuthorized(undefined, "anything")).toBe(false);
    expect(isRevenueCatRequestAuthorized("", "anything")).toBe(false);
  });

  test("requires an exact authorization header match", () => {
    expect(isRevenueCatRequestAuthorized("secret", "secret")).toBe(true);
    expect(isRevenueCatRequestAuthorized("secret", "Bearer secret")).toBe(false);
    expect(isRevenueCatRequestAuthorized("secret", null)).toBe(false);
  });
});
