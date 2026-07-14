import { describe, expect, test } from "bun:test";
import {
  assertValidRange,
  assertPositiveDurationMinutes,
  isActiveTodoTask,
  isSchedulableTaskForUser,
  isVisibleInRange,
} from "./calendar_events";

describe("calendar event invariants", () => {
  test("rejects zero-length or negative calendar blocks", () => {
    expect(() => assertValidRange(1000, 1000)).toThrow(
      "Calendar block must end after it starts.",
    );
    expect(() => assertValidRange(2000, 1000)).toThrow(
      "Calendar block must end after it starts.",
    );
    expect(() => assertValidRange(1000, 2000)).not.toThrow();
  });

  test("keeps events that started before the window but still overlap it", () => {
    expect(
      isVisibleInRange(
        {
          endAt: 10_500,
          status: "confirmed",
        },
        10_000,
      ),
    ).toBe(true);
    expect(isVisibleInRange({ endAt: 10_000, status: "confirmed" }, 10_000)).toBe(false);
    expect(isVisibleInRange({ endAt: 10_500, status: "cancelled" }, 10_000)).toBe(false);
  });

  test("only schedules live, non-cancelled tasks owned by the current user", () => {
    expect(
      isSchedulableTaskForUser(
        { userId: "user-1", status: "todo" },
        "user-1",
      ),
    ).toBe(true);
    expect(
      isSchedulableTaskForUser(
        { userId: "user-2", status: "todo" },
        "user-1",
      ),
    ).toBe(false);
    expect(
      isSchedulableTaskForUser(
        { userId: "user-1", status: "cancelled" },
        "user-1",
      ),
    ).toBe(false);
    expect(
      isSchedulableTaskForUser(
        { userId: "user-1", status: "todo", deletedAt: 100 },
        "user-1",
      ),
    ).toBe(false);
  });

  test("auto-schedule proposals ignore soft-deleted tasks", () => {
    expect(isActiveTodoTask({ status: "todo" })).toBe(true);
    expect(isActiveTodoTask({ status: "todo", deletedAt: 100 })).toBe(false);
    expect(isActiveTodoTask({ status: "done" })).toBe(false);
  });

  test("auto-schedule proposal duration must be positive", () => {
    expect(() => assertPositiveDurationMinutes(0)).toThrow(
      "Proposal duration must be positive.",
    );
    expect(() => assertPositiveDurationMinutes(-15)).toThrow(
      "Proposal duration must be positive.",
    );
    expect(() => assertPositiveDurationMinutes(30)).not.toThrow();
  });

  test("reschedule-linked task updates use the same live-task eligibility", () => {
    const deletedLinkedTask = { userId: "user-1", status: "todo", deletedAt: 100 };
    const cancelledLinkedTask = { userId: "user-1", status: "cancelled" };

    expect(isSchedulableTaskForUser(deletedLinkedTask, "user-1")).toBe(false);
    expect(isSchedulableTaskForUser(cancelledLinkedTask, "user-1")).toBe(false);
  });
});
