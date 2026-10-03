import { afterEach, describe, expect, test } from "bun:test";
import {
  assertClientMaySetUserType,
  isMockPaymentsEnabled,
} from "./subscriptionGuards";

describe("subscriptionGuards", () => {
  const originalMockPayments = process.env.MOCK_PAYMENTS;

  afterEach(() => {
    if (originalMockPayments === undefined) {
      delete process.env.MOCK_PAYMENTS;
    } else {
      process.env.MOCK_PAYMENTS = originalMockPayments;
    }
  });

  test("isMockPaymentsEnabled is true only when env is exactly 'true'", () => {
    process.env.MOCK_PAYMENTS = "true";
    expect(isMockPaymentsEnabled()).toBe(true);

    process.env.MOCK_PAYMENTS = "false";
    expect(isMockPaymentsEnabled()).toBe(false);

    delete process.env.MOCK_PAYMENTS;
    expect(isMockPaymentsEnabled()).toBe(false);
  });

  test("assertClientMaySetUserType allows free downgrades without mock payments", () => {
    delete process.env.MOCK_PAYMENTS;
    expect(() => assertClientMaySetUserType("free")).not.toThrow();
  });

  test("assertClientMaySetUserType blocks paid upgrades unless mock payments enabled", () => {
    delete process.env.MOCK_PAYMENTS;
    expect(() => assertClientMaySetUserType("paid")).toThrow(/RevenueCat/i);

    process.env.MOCK_PAYMENTS = "true";
    expect(() => assertClientMaySetUserType("paid")).not.toThrow();
  });
});
