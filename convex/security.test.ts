import { describe, expect, test } from "bun:test";
import { resolveUserFromSubject } from "./lib/requireUser";
import { isRevenueCatWebhookAuthorized } from "./revenuecat";
import { isMockPaymentMutationAllowed } from "./users";

describe("security-critical auth helpers", () => {
  test("resolves the app user from any valid subject segment", async () => {
    const user = { _id: "user_real", email: "person@example.com" };
    const ctx = {
      db: {
        normalizeId: (_table: string, value: string) =>
          value.startsWith("user_") ? value : null,
        get: async (id: string) => (id === user._id ? user : null),
      },
    };

    await expect(
      resolveUserFromSubject(ctx as never, "authAccount_123|user_real"),
    ).resolves.toBe(user);
  });

  test("RevenueCat webhook auth fails closed when the secret is missing", () => {
    expect(isRevenueCatWebhookAuthorized("Bearer anything", undefined)).toBe(false);
    expect(isRevenueCatWebhookAuthorized("Bearer anything", "")).toBe(false);
    expect(isRevenueCatWebhookAuthorized("Bearer wrong", "Bearer right")).toBe(false);
    expect(isRevenueCatWebhookAuthorized("Bearer right", "Bearer right")).toBe(true);
  });

  test("mock payment mutations are disabled unless explicitly enabled", () => {
    expect(isMockPaymentMutationAllowed(undefined)).toBe(false);
    expect(isMockPaymentMutationAllowed("false")).toBe(false);
    expect(isMockPaymentMutationAllowed("true")).toBe(true);
  });
});
