import { describe, expect, test } from "bun:test";
import { isLiveRow, liveOnly, softDeletePatch } from "./soft_delete";

describe("soft_delete helpers", () => {
  test("isLiveRow is true when deletedAt is undefined", () => {
    expect(isLiveRow({ deletedAt: undefined })).toBe(true);
    expect(isLiveRow({})).toBe(true);
  });

  test("isLiveRow is false when deletedAt is set", () => {
    expect(isLiveRow({ deletedAt: 1 })).toBe(false);
  });

  test("liveOnly filters soft-deleted rows", () => {
    const rows = [
      { id: "a", deletedAt: undefined },
      { id: "b", deletedAt: 123 },
      { id: "c" },
    ];
    expect(liveOnly(rows).map((r) => r.id)).toEqual(["a", "c"]);
  });

  test("softDeletePatch sets deletedAt and updatedAt", () => {
    const now = 1_700_000_000_000;
    expect(softDeletePatch(now)).toEqual({ deletedAt: now, updatedAt: now });
  });
});
