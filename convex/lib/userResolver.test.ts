import { describe, expect, test } from "bun:test";
import {
  legacyUserIdFromAuthSubject,
  resolveUserFromSubject,
  splitAuthSubject,
} from "./userResolver";

describe("splitAuthSubject", () => {
  test("splits pipe-separated Convex Auth subject", () => {
    expect(splitAuthSubject("account_abc|users_jd7xyz")).toEqual([
      "account_abc",
      "users_jd7xyz",
    ]);
  });

  test("returns single segment when no pipe present", () => {
    expect(splitAuthSubject("only-one-part")).toEqual(["only-one-part"]);
  });
});

describe("legacyUserIdFromAuthSubject", () => {
  test("returns second segment for standard auth subject", () => {
    expect(legacyUserIdFromAuthSubject("account_abc|users_jd7xyz")).toBe(
      "users_jd7xyz",
    );
  });

  test("returns null when subject has fewer than two segments", () => {
    expect(legacyUserIdFromAuthSubject("only-one-part")).toBeNull();
  });
});

describe("resolveUserFromSubject", () => {
  test("tries each pipe segment until a users row is found", async () => {
    const user = { _id: "users_jd7xyz", email: "amit@example.com" } as const;
    const ctx = {
      db: {
        normalizeId: (_table: "users", part: string) =>
          part === "users_jd7xyz" ? "users_jd7xyz" : null,
        get: async (id: string) => (id === "users_jd7xyz" ? user : null),
      },
    };

    const resolved = await resolveUserFromSubject(
      ctx as Parameters<typeof resolveUserFromSubject>[0],
      "account_abc|users_jd7xyz",
    );
    expect(resolved).toEqual(user);
  });

  test("returns null when no segment resolves to a user", async () => {
    const ctx = {
      db: {
        normalizeId: () => null,
        get: async () => null,
      },
    };

    const resolved = await resolveUserFromSubject(
      ctx as Parameters<typeof resolveUserFromSubject>[0],
      "account_abc|missing_user",
    );
    expect(resolved).toBeNull();
  });
});
