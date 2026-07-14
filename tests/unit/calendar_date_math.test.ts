import { describe, expect, test } from "bun:test";
import {
  buildCalendarRange,
  buildMonthGrid,
  buildWeekDays,
  getDayRange,
  layoutOverlappingEvents,
  moveEventByMinutes,
  toMinuteOfDay,
} from "../../apps/web/lib/calendar/date-math";

const utc = (iso: string) => new Date(iso).getTime();

describe("calendar date math", () => {
  test("builds local day, week, and month ranges from one event source anchor", () => {
    const anchor = utc("2026-07-14T12:00:00.000Z");

    expect(getDayRange(anchor)).toEqual({
      startMs: utc("2026-07-14T00:00:00.000Z"),
      endMs: utc("2026-07-15T00:00:00.000Z"),
    });

    expect(buildWeekDays(anchor).map((day) => day.label)).toEqual([
      "Mon 13",
      "Tue 14",
      "Wed 15",
      "Thu 16",
      "Fri 17",
      "Sat 18",
      "Sun 19",
    ]);

    expect(buildCalendarRange("month", anchor)).toEqual({
      startMs: utc("2026-06-29T00:00:00.000Z"),
      endMs: utc("2026-08-10T00:00:00.000Z"),
    });
  });

  test("builds a stable 6-week month grid with outside-month cells", () => {
    const grid = buildMonthGrid(utc("2026-07-14T12:00:00.000Z"));

    expect(grid).toHaveLength(42);
    expect(grid[0]).toMatchObject({ label: "29", isCurrentMonth: false });
    expect(grid[15]).toMatchObject({ label: "14", isToday: true, isCurrentMonth: true });
    expect(grid[41]).toMatchObject({ label: "9", isCurrentMonth: false });
  });

  test("moves blocks by minute increments without changing duration", () => {
    const moved = moveEventByMinutes(
      {
        id: "event-1",
        title: "Draft plan",
        startAt: utc("2026-07-14T09:00:00.000Z"),
        endAt: utc("2026-07-14T09:45:00.000Z"),
      },
      30,
    );

    expect(moved.startAt).toBe(utc("2026-07-14T09:30:00.000Z"));
    expect(moved.endAt).toBe(utc("2026-07-14T10:15:00.000Z"));
    expect(toMinuteOfDay(moved.startAt)).toBe(570);
  });

  test("assigns overlapping events to separate lanes with shared width", () => {
    const laidOut = layoutOverlappingEvents([
      {
        id: "deep-work",
        title: "Deep work",
        startAt: utc("2026-07-14T09:00:00.000Z"),
        endAt: utc("2026-07-14T10:00:00.000Z"),
      },
      {
        id: "call",
        title: "Call",
        startAt: utc("2026-07-14T09:30:00.000Z"),
        endAt: utc("2026-07-14T10:30:00.000Z"),
      },
      {
        id: "review",
        title: "Review",
        startAt: utc("2026-07-14T10:30:00.000Z"),
        endAt: utc("2026-07-14T11:00:00.000Z"),
      },
    ]);

    expect(laidOut.map((event) => [event.id, event.lane, event.laneCount])).toEqual([
      ["deep-work", 0, 2],
      ["call", 1, 2],
      ["review", 0, 1],
    ]);
  });
});
