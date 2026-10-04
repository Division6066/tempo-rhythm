import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import {
  mapCalendarEventsToAgenda,
  visibleHabitsFrom,
} from "./todayAgenda";

describe("mapCalendarEventsToAgenda", () => {
  test("sorts by start time and formats a label", () => {
    const events = mapCalendarEventsToAgenda([
      { _id: "later", title: "Walk", startsAtMs: 2_000 },
      { _id: "earlier", title: "Tea", startsAtMs: 1_000 },
    ]);

    expect(events.map((event) => event.id)).toEqual(["earlier", "later"]);
    expect(events[0]?.title).toBe("Tea");
    expect(events[0]?.timeLabel.length).toBeGreaterThan(0);
  });

  test("empty input stays empty", () => {
    expect(mapCalendarEventsToAgenda([])).toEqual([]);
  });
});

describe("visibleHabitsFrom", () => {
  test("keeps the first five and counts the rest", () => {
    const habits = ["a", "b", "c", "d", "e", "f", "g"];
    expect(visibleHabitsFrom(habits)).toEqual({
      visible: ["a", "b", "c", "d", "e"],
      hiddenCount: 2,
    });
  });

  test("no overflow when the list is short", () => {
    expect(visibleHabitsFrom(["one"])).toEqual({
      visible: ["one"],
      hiddenCount: 0,
    });
  });
});

describe("TodayScreen leftover wiring", () => {
  test("keeps energy recs and the unauth task-views path", () => {
    const source = readFileSync(
      join(import.meta.dir, "../components/today/TodayScreen.tsx"),
      "utf8",
    );
    expect(source).toContain("TodayAgenda");
    expect(source).toContain("TodayHabitStrip");
    expect(source).toContain("TodayEnergyRecommendations");
    expect(source).toContain('view="today"');
    expect(source).toContain("api.calendar_events.listInRange");
    expect(source).toContain("api.habits.list");
  });
});
