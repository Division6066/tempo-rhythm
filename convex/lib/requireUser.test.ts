import { describe, expect, test } from "bun:test";
import { isActiveUser } from "./requireUser";

describe("isActiveUser", () => {
  test("accepts users with no deletion marker and no explicit inactive flag", () => {
    expect(isActiveUser({ deletedAt: undefined, isActive: undefined })).toBe(true);
    expect(isActiveUser({ deletedAt: undefined, isActive: true })).toBe(true);
  });

  test("rejects soft-deleted or inactive users", () => {
    expect(isActiveUser({ deletedAt: 123, isActive: true })).toBe(false);
    expect(isActiveUser({ deletedAt: undefined, isActive: false })).toBe(false);
    expect(isActiveUser({ deletedAt: 123, isActive: false })).toBe(false);
  });
});
