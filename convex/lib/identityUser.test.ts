import { describe, expect, test } from "bun:test";
import type { Doc, Id } from "../_generated/dataModel";
import { resolveUserFromSubject, userIdFromAuthSubject } from "./identityUser";

const USER_ID = "jd7abc123" as Id<"users">;
const mockUser = { _id: USER_ID, email: "test@example.com" } as Doc<"users">;

function makeCtx(users: Record<string, Doc<"users"> | null>) {
  return {
    db: {
      normalizeId: (_table: "users", part: string) => {
        if (part === USER_ID || part === "jd7abc123") {
          return USER_ID;
        }
        return null;
      },
      get: async (id: Id<"users">) => users[id] ?? null,
    },
  };
}

describe("userIdFromAuthSubject", () => {
  test("extracts the users id from a pipe-delimited subject", () => {
    expect(userIdFromAuthSubject(`authAccount|${USER_ID}`)).toBe(USER_ID);
  });

  test("returns null when subject has no user segment", () => {
    expect(userIdFromAuthSubject("only-account-id")).toBeNull();
  });
});

describe("resolveUserFromSubject", () => {
  test("resolves user from second pipe segment (Convex Auth subject shape)", async () => {
    const ctx = makeCtx({ [USER_ID]: mockUser });
    const user = await resolveUserFromSubject(ctx, `authAccount|${USER_ID}`);
    expect(user?._id).toBe(USER_ID);
  });

  test("tries later segments when earlier parts are not user ids", async () => {
    const ctx = makeCtx({ [USER_ID]: mockUser });
    const user = await resolveUserFromSubject(
      ctx,
      `authAccount|not-a-user-id|${USER_ID}`,
    );
    expect(user?._id).toBe(USER_ID);
  });

  test("returns null when no segment resolves to a user row", async () => {
    const ctx = makeCtx({});
    const user = await resolveUserFromSubject(ctx, "authAccount|missing-user");
    expect(user).toBeNull();
  });
});
