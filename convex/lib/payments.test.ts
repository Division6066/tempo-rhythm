import { afterEach, describe, expect, test } from "bun:test";
import { isMockPaymentsEnabled } from "./payments";

describe("isMockPaymentsEnabled", () => {
  const original = process.env.MOCK_PAYMENTS;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.MOCK_PAYMENTS;
    } else {
      process.env.MOCK_PAYMENTS = original;
    }
  });

  test("returns true only when env is exactly 'true'", () => {
    process.env.MOCK_PAYMENTS = "true";
    expect(isMockPaymentsEnabled()).toBe(true);
  });

  test("returns false when env is unset", () => {
    delete process.env.MOCK_PAYMENTS;
    expect(isMockPaymentsEnabled()).toBe(false);
  });

  test("returns false for other truthy-looking values", () => {
    process.env.MOCK_PAYMENTS = "1";
    expect(isMockPaymentsEnabled()).toBe(false);
  });
});
