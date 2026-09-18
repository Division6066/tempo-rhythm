import { describe, expect, test } from "bun:test";
import { isInactiveAccount, USER_OWNED_TABLES } from "./accountDeletion";

describe("isInactiveAccount", () => {
  test("live accounts are active", () => {
    expect(isInactiveAccount({})).toBe(false);
    expect(isInactiveAccount({ isActive: true })).toBe(false);
  });

  test("soft-deleted or deactivated accounts are inactive", () => {
    expect(isInactiveAccount({ deletedAt: 1 })).toBe(true);
    expect(isInactiveAccount({ isActive: false })).toBe(true);
  });
});

describe("USER_OWNED_TABLES", () => {
  test("covers current user-owned schema tables with by_userId", () => {
    expect([...USER_OWNED_TABLES].sort()).toEqual(
      [
        "calendarEvents",
        "goals",
        "habits",
        "memories",
        "notes",
        "routineItems",
        "routines",
        "taskRepeatCfgs",
        "tasks",
      ].sort(),
    );
  });
});
