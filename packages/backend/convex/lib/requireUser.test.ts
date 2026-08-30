import { describe, expect, test } from "bun:test";
import type { Doc, Id } from "../_generated/dataModel";
import { requireUser } from "./requireUser";

type FakeUser = Doc<"users">;

function makeUser(overrides: Partial<FakeUser> = {}): FakeUser {
  return {
    _id: "jd7users000000000000000000" as Id<"users">,
    _creationTime: 1,
    email: "tester@tempo.app",
    role: "user",
    userType: "free",
    isActive: true,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

function makeCtx(opts: {
  identity: { subject: string; email?: string } | null;
  usersById?: Map<string, FakeUser>;
  usersByEmail?: Map<string, FakeUser>;
}) {
  const usersById = opts.usersById ?? new Map<string, FakeUser>();
  const usersByEmail = opts.usersByEmail ?? new Map<string, FakeUser>();

  return {
    auth: {
      getUserIdentity: async () => opts.identity,
    },
    db: {
      normalizeId: (_table: string, id: string) => {
        // Accept any non-empty string as a users id for the fake
        return id.length > 0 ? (id as Id<"users">) : null;
      },
      get: async (id: Id<"users">) => usersById.get(id) ?? null,
      query: (_table: string) => ({
        withIndex: (_name: string, _fn: unknown) => ({
          unique: async () => {
            const email = opts.identity?.email;
            if (!email) return null;
            return usersByEmail.get(email) ?? null;
          },
        }),
      }),
    },
  };
}

describe("requireUser auth gate", () => {
  test("throws Not authenticated when identity is null", async () => {
    const ctx = makeCtx({ identity: null });
    await expect(requireUser(ctx as never)).rejects.toThrow(/Not authenticated/);
  });

  test("resolves user from subject userId part", async () => {
    const user = makeUser();
    const ctx = makeCtx({
      identity: { subject: `acct|${user._id}` },
      usersById: new Map([[user._id, user]]),
    });
    const got = await requireUser(ctx as never);
    expect(got._id).toBe(user._id);
    expect(got.email).toBe("tester@tempo.app");
  });

  test("falls back to email lookup when subject id missing", async () => {
    const user = makeUser();
    const ctx = makeCtx({
      identity: { subject: "acct|not-a-user-id", email: user.email },
      usersById: new Map(),
      usersByEmail: new Map([[user.email, user]]),
    });
    // normalizeId will treat "not-a-user-id" as an id, get returns null, then email fallback
    // Actually our fake normalizeId accepts any non-empty string, get returns null → email path
    const got = await requireUser(ctx as never);
    expect(got.email).toBe(user.email);
  });

  test("rejects soft-deleted users", async () => {
    const user = makeUser({ deletedAt: 99 });
    const ctx = makeCtx({
      identity: { subject: `acct|${user._id}` },
      usersById: new Map([[user._id, user]]),
    });
    await expect(requireUser(ctx as never)).rejects.toThrow(/Not authenticated|User not found/);
  });
});
