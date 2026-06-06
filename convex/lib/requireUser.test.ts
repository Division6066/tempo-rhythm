import { describe, expect, test } from "bun:test";
import { requireUser } from "./requireUser";

type FakeIdentity = {
  subject: string;
  email?: string;
};

type FakeUser = {
  _id: string;
  email: string;
};

function makeCtx({
  identity,
  usersById = new Map<string, FakeUser>(),
  usersByEmail = new Map<string, FakeUser>(),
}: {
  identity: FakeIdentity | null;
  usersById?: Map<string, FakeUser>;
  usersByEmail?: Map<string, FakeUser>;
}) {
  return {
    auth: {
      getUserIdentity: async () => identity,
    },
    db: {
      normalizeId: (_table: "users", value: string) => (usersById.has(value) ? value : null),
      get: async (id: string) => usersById.get(id) ?? null,
      query: (_table: "users") => ({
        withIndex: (_index: "by_email", build: (q: { eq: (field: string, value: string) => void }) => void) => {
          let email = "";
          build({
            eq: (_field: string, value: string) => {
              email = value;
            },
          });
          return {
            unique: async () => usersByEmail.get(email) ?? null,
          };
        },
      }),
    },
  };
}

describe("requireUser", () => {
  test("resolves the app user from any valid Convex user id in the auth subject", async () => {
    const user = { _id: "user_123", email: "subject@example.com" };
    const ctx = makeCtx({
      identity: { subject: "auth_account_456|user_123" },
      usersById: new Map([[user._id, user]]),
    });

    await expect(requireUser(ctx as never)).resolves.toEqual(user);
  });

  test("falls back to email lookup when the subject has no valid app user id", async () => {
    const user = { _id: "user_email", email: "email@example.com" };
    const ctx = makeCtx({
      identity: { subject: "auth_account_only", email: user.email },
      usersByEmail: new Map([[user.email, user]]),
    });

    await expect(requireUser(ctx as never)).resolves.toEqual(user);
  });

  test("rejects missing identity before touching user data", async () => {
    const ctx = makeCtx({ identity: null });

    await expect(requireUser(ctx as never)).rejects.toThrow("Not authenticated");
  });

  test("rejects identities that have neither a resolvable subject user nor an email fallback", async () => {
    const ctx = makeCtx({
      identity: { subject: "auth_account_only" },
    });

    await expect(requireUser(ctx as never)).rejects.toThrow("Not authenticated");
  });
});
