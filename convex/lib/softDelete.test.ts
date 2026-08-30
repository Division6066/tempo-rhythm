import { describe, expect, test } from "bun:test";
import { filterLive, isLive, softDeleteOnly, softDeleteWithUpdatedAt } from "./softDelete";

describe("soft-delete helpers", () => {
  test("isLive only accepts docs without deletedAt", () => {
    expect(isLive(undefined)).toBe(false);
    expect(isLive(null)).toBe(false);
    expect(isLive({ _id: "live", deletedAt: undefined })).toBe(true);
    expect(isLive({ _id: "deleted", deletedAt: 123 })).toBe(false);
  });

  test("filterLive removes soft-deleted rows without cloning live rows", () => {
    const live = { _id: "live", title: "Keep", deletedAt: undefined };
    const rows = [live, { _id: "deleted", deletedAt: 123 }];

    expect(filterLive(rows)).toEqual([live]);
  });

  test("softDeleteOnly stamps deletedAt without updatedAt", () => {
    expect(softDeleteOnly(456)).toEqual({ deletedAt: 456 });
  });

  test("softDeleteWithUpdatedAt stamps both deletedAt and updatedAt", () => {
    expect(softDeleteWithUpdatedAt(789)).toEqual({
      deletedAt: 789,
      updatedAt: 789,
    });
  });
});
