import { describe, expect, test } from "bun:test";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { requireUser } from "./requireUser";

const USER_ID = "jd7abc123" as Id<"users">;
const mockUser = {
  _id: USER_ID,
  email: "planner@example.com",
} as Doc<"users">;

function makeCtx(options: {
  identity?: { subject: string; email?: string } | null;
  subjectUser?: Doc<"users"> | null;
  emailUser?: Doc<"users"> | null;
}): MutationCtx {
  const { identity, subjectUser, emailUser } = options;
  return {
    auth: {
      getUserIdentity: async () => identity ?? null,
    },
    db: {
      normalizeId: (_table: "users", part: string) => {
        if (part === USER_ID) {
          return USER_ID;
        }
        return null;
      },
      get: async (id: Id<"users">) => {
        if (id === USER_ID) {
          return subjectUser ?? null;
        }
        return null;
      },
      query: () => ({
        withIndex: () => ({
          unique: async () => emailUser ?? null,
        }),
      }),
    },
  } as unknown as MutationCtx;
}

describe("requireUser", () => {
  test("throws when identity is missing", async () => {
    const ctx = makeCtx({ identity: null });
    await expect(requireUser(ctx)).rejects.toThrow(/not authenticated/i);
  });

  test("resolves user from subject without requiring email (Phase 4 regression)", async () => {
    const ctx = makeCtx({
      identity: { subject: `authAccount|${USER_ID}` },
      subjectUser: mockUser,
    });
    const user = await requireUser(ctx);
    expect(user._id).toBe(USER_ID);
  });

  test("falls back to email lookup when subject does not resolve", async () => {
    const ctx = makeCtx({
      identity: { subject: "authAccount|missing", email: "planner@example.com" },
      subjectUser: null,
      emailUser: mockUser,
    });
    const user = await requireUser(ctx);
    expect(user.email).toBe("planner@example.com");
  });

  test("throws when subject and email cannot resolve a user", async () => {
    const ctx = makeCtx({
      identity: { subject: "authAccount|missing" },
      subjectUser: null,
      emailUser: null,
    });
    await expect(requireUser(ctx)).rejects.toThrow(/not authenticated/i);
  });

  test("throws user not found when email lookup misses", async () => {
    const ctx = makeCtx({
      identity: { subject: "authAccount|missing", email: "unknown@example.com" },
      subjectUser: null,
      emailUser: null,
    });
    await expect(requireUser(ctx)).rejects.toThrow(/user not found/i);
  });
});
