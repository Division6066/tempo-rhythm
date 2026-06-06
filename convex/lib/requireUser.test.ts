import { describe, expect, test } from "bun:test";
import type { QueryCtx } from "../_generated/server";
import { fetchCurrentUser } from "../users";
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
  users,
}: {
  identity: FakeIdentity | null;
  users: FakeUser[];
}) {
  const byId = new Map(users.map((user) => [user._id, user]));
  const byEmail = new Map(users.map((user) => [user.email, user]));

  return {
    auth: {
      getUserIdentity: async () => identity,
    },
    db: {
      normalizeId: (_table: "users", id: string) => (byId.has(id) ? id : null),
      get: async (id: string) => {
        if (!byId.has(id)) {
          throw new Error(`Invalid id: ${id}`);
        }
        return byId.get(id) ?? null;
      },
      query: (_table: "users") => ({
        withIndex: (
          _indexName: "by_email",
          buildQuery: (q: {
            eq: (_field: "email", value: string) => string;
          }) => string,
        ) => {
          const email = buildQuery({
            eq: (_field, value) => value,
          });
          return {
            unique: async () => byEmail.get(email) ?? null,
          };
        },
      }),
    },
  } as unknown as QueryCtx;
}

describe("auth user resolution", () => {
  test("requireUser resolves a user from any normalized auth subject part without email", async () => {
    const user = { _id: "users:found", email: "alex@example.com" };
    const ctx = makeCtx({
      identity: { subject: "auth-account|invalid-user-id|users:found" },
      users: [user],
    });

    await expect(requireUser(ctx)).resolves.toMatchObject(user);
  });

  test("requireUser falls back to email when subject parts do not resolve", async () => {
    const user = { _id: "users:email", email: "alex@example.com" };
    const ctx = makeCtx({
      identity: {
        subject: "auth-account|missing-user",
        email: "alex@example.com",
      },
      users: [user],
    });

    await expect(requireUser(ctx)).resolves.toMatchObject(user);
  });

  test("requireUser throws when no authenticated identity is available", async () => {
    const ctx = makeCtx({ identity: null, users: [] });

    await expect(requireUser(ctx)).rejects.toThrow("Not authenticated");
  });

  test("requireUser throws not authenticated when identity has no email and no matching subject user", async () => {
    const ctx = makeCtx({
      identity: { subject: "auth-account|missing-user" },
      users: [],
    });

    await expect(requireUser(ctx)).rejects.toThrow("Not authenticated");
  });

  test("fetchCurrentUser uses the same subject resolver as mutations and does not require email", async () => {
    const user = { _id: "users:found", email: "alex@example.com" };
    const ctx = makeCtx({
      identity: { subject: "auth-account|invalid-user-id|users:found" },
      users: [user],
    });

    await expect(fetchCurrentUser(ctx)).resolves.toMatchObject(user);
  });

  test("fetchCurrentUser returns null instead of throwing when identity is missing", async () => {
    const ctx = makeCtx({ identity: null, users: [] });

    await expect(fetchCurrentUser(ctx)).resolves.toBeNull();
  });

  test("fetchCurrentUser returns null when subject and email do not match an app user", async () => {
    const ctx = makeCtx({
      identity: {
        subject: "auth-account|missing-user",
        email: "missing@example.com",
      },
      users: [],
    });

    await expect(fetchCurrentUser(ctx)).resolves.toBeNull();
  });
});
