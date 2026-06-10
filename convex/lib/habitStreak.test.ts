import { describe, expect, test } from "bun:test";
import { computeStreakAfterCompletion } from "./habitStreak";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("computeStreakAfterCompletion", () => {
  test("starts streak at 1 on first completion", () => {
    const result = computeStreakAfterCompletion(undefined, 1_000_000, 0);
    expect(result).toEqual({ currentStreak: 1, alreadyDone: false });
  });

  test("returns alreadyDone when completed earlier the same day", () => {
    const now = 1_000_000;
    const last = now - 2 * 60 * 60 * 1000;
    const result = computeStreakAfterCompletion(last, now, 5);
    expect(result).toEqual({ currentStreak: 5, alreadyDone: true });
  });

  test("increments streak after exactly one day", () => {
    const now = 1_000_000;
    const last = now - DAY_MS;
    const result = computeStreakAfterCompletion(last, now, 4);
    expect(result).toEqual({ currentStreak: 5, alreadyDone: false });
  });

  test("resets streak to 1 after a gap longer than one day", () => {
    const now = 1_000_000;
    const last = now - 3 * DAY_MS;
    const result = computeStreakAfterCompletion(last, now, 10);
    expect(result).toEqual({ currentStreak: 1, alreadyDone: false });
  });
});
