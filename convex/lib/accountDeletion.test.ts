import { describe, expect, test } from "bun:test";
import {
  ACCOUNT_RESTORE_GRACE_MS,
  isInactiveAccount,
  pickSignInUser,
  signInRestorePatch,
  USER_OWNED_TABLES,
} from "./accountDeletion";

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

describe("signInRestorePatch", () => {
  const deletedAt = 1_700_000_000_000;

  test("restores a soft-deleted account inside 30 days", () => {
    expect(signInRestorePatch({ deletedAt, isActive: false }, deletedAt + 1_000)).toEqual({
      deletedAt: undefined,
      isActive: true,
    });
  });

  test("does not restore admin deactivation or an expired grace window", () => {
    expect(signInRestorePatch({ isActive: false }, deletedAt)).toBeNull();
    expect(signInRestorePatch({ deletedAt, isActive: false }, deletedAt + ACCOUNT_RESTORE_GRACE_MS + 1)).toBeNull();
    expect(signInRestorePatch({ deletedAt }, deletedAt - 1)).toBeNull();
  });

  test("pickSignInUser prefers a live row over a soft-deleted one", () => {
    const live = { id: "live", isActive: true };
    const deleted = { id: "deleted", deletedAt, isActive: false };
    expect(pickSignInUser([deleted, live], deletedAt + 1_000)).toBe(live);
    expect(pickSignInUser([deleted], deletedAt + 1_000)?.id).toBe("deleted");
    expect(pickSignInUser([deleted], deletedAt + ACCOUNT_RESTORE_GRACE_MS + 1)?.id).toBe("deleted");
  });
});

describe("USER_OWNED_TABLES", () => {
  test("covers current user-owned schema tables with by_userId", () => {
    const expected = [
      "calendarEvents",
      "goals",
      "habits",
      "memories",
      "notes",
      "taskRepeatCfgs",
      "tasks",
    ] as const;
    expect([...USER_OWNED_TABLES].sort()).toEqual([...expected].sort());
  });
});
