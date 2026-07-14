import { describe, expect, test } from "bun:test";
import {
  appendChecklistItem,
  normalizeChecklistItems,
  toggleChecklistItemState,
} from "../../convex/lib/checklist";

describe("toggleChecklistItemState", () => {
  test("checks an item without mutating the original checklist", () => {
    const checklist = [
      { id: "first", text: "Open the bill", completed: false },
      { id: "second", text: "Pay it", completed: false },
    ];

    const updated = toggleChecklistItemState(checklist, "second", true, 1_783_528_800_000);

    expect(updated).toEqual([
      { id: "first", text: "Open the bill", completed: false },
      { id: "second", text: "Pay it", completed: true, completedAt: 1_783_528_800_000 },
    ]);
    expect(checklist[1]).toEqual({ id: "second", text: "Pay it", completed: false });
  });

  test("unchecks an item and clears its completed timestamp", () => {
    const checklist = [
      { id: "first", text: "Open the bill", completed: true, completedAt: 1_783_528_700_000 },
    ];

    const updated = toggleChecklistItemState(checklist, "first", false, 1_783_528_800_000);

    expect(updated).toEqual([{ id: "first", text: "Open the bill", completed: false }]);
  });

  test("throws a clear error when the item is not part of the task", () => {
    expect(() => toggleChecklistItemState([], "missing", true, 1_783_528_800_000)).toThrow(
      "Checklist item not found",
    );
  });

  test("rejects duplicate checklist item ids before toggling", () => {
    const checklist = [
      { id: "duplicate", text: "First", completed: false },
      { id: "duplicate", text: "Second", completed: false },
    ];

    expect(() =>
      toggleChecklistItemState(checklist, "duplicate", true, 1_783_528_800_000),
    ).toThrow("Checklist item ids must be unique");
  });
});

describe("appendChecklistItem", () => {
  test("adds a trimmed unchecked item with a unique id", () => {
    const updated = appendChecklistItem([], "  Call the clinic  ", "clinic");

    expect(updated).toEqual([{ id: "clinic", text: "Call the clinic", completed: false }]);
  });

  test("rejects empty checklist text", () => {
    expect(() => appendChecklistItem([], "   ", "empty")).toThrow("Checklist text cannot be empty");
  });
});

describe("normalizeChecklistItems", () => {
  test("trims text and clears completedAt when an item is not completed", () => {
    const normalized = normalizeChecklistItems([
      { id: "first", text: "  Attach receipt  ", completed: false, completedAt: 1_783_528_700_000 },
    ]);

    expect(normalized).toEqual([{ id: "first", text: "Attach receipt", completed: false }]);
  });

  test("rejects duplicate ids", () => {
    expect(() =>
      normalizeChecklistItems([
        { id: "same", text: "One", completed: false },
        { id: "same", text: "Two", completed: false },
      ]),
    ).toThrow("Checklist item ids must be unique");
  });
});
