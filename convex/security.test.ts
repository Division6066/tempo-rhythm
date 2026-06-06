import { describe, expect, test } from "bun:test";
import type { Doc } from "./_generated/dataModel";
import { resolveUserFromSubject } from "./lib/requireUser";
import { isRevenueCatWebhookAuthorized } from "./revenuecat";
import { isMockPaymentMutationAllowed } from "./users";

describe("security-critical auth helpers", () => {
  test("resolves the app user from any valid subject segment", async () => {
    const user = {
      _id: "user_real",
      _creationTime: 1,
      email: "person@example.com",
    } as Doc<"users">;
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

  test("authenticated user lookup ignores soft-deleted users", async () => {
    const deletedUser = {
      _id: "user_deleted",
      _creationTime: 1,
      email: "deleted@example.com",
      deletedAt: Date.now(),
    } as Doc<"users">;
    const ctx = {
      auth: {
        getUserIdentity: async () => ({
          subject: "authAccount_123|user_deleted",
          email: "deleted@example.com",
        }),
      },
      db: {
        normalizeId: (_table: string, value: string) =>
          value.startsWith("user_") ? value : null,
        get: async (id: string) => (id === deletedUser._id ? deletedUser : null),
        query: () => ({
          withIndex: () => ({
            unique: async () => deletedUser,
          }),
        }),
      },
    };

    const { findUserByIdentity } = await import("./lib/requireUser");
    await expect(findUserByIdentity(ctx as never)).resolves.toBeNull();
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
