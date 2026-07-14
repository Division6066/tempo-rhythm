import { describe, expect, test } from "bun:test";
import {
  getCalendarRangeMs,
  getEventsInRange,
  parseDateInputValue,
  type CalendarEvent,
} from "../../apps/web/lib/calendar/date-math";

const dayMs = 24 * 60 * 60 * 1000;

function eventAt(id: string, date: Date): CalendarEvent {
  return {
    id,
    title: id,
    startsAtMs: date.getTime(),
  };
}

describe("calendar date math", () => {
  test("day, week, and month ranges use half-open boundaries", () => {
    const selected = new Date(2026, 6, 14, 12);
    const day = getCalendarRangeMs("day", selected);
    const week = getCalendarRangeMs("week", selected);
    const month = getCalendarRangeMs("month", selected);
    const events = [
      eventAt("before-day", new Date(day.startMs - 1)),
      eventAt("day-start", new Date(day.startMs)),
      eventAt("day-end-minus-one", new Date(day.endMs - 1)),
      eventAt("day-end", new Date(day.endMs)),
      eventAt("week-end-minus-one", new Date(week.endMs - 1)),
      eventAt("week-end", new Date(week.endMs)),
      eventAt("month-end-minus-one", new Date(month.endMs - 1)),
      eventAt("month-end", new Date(month.endMs)),
    ];

    expect(getEventsInRange(events, day).map((event) => event.id)).toEqual([
      "day-start",
      "day-end-minus-one",
    ]);
    expect(getEventsInRange(events, week).map((event) => event.id)).toContain(
      "week-end-minus-one",
    );
    expect(getEventsInRange(events, week).map((event) => event.id)).not.toContain("week-end");
    expect(getEventsInRange(events, month).map((event) => event.id)).toContain(
      "month-end-minus-one",
    );
    expect(getEventsInRange(events, month).map((event) => event.id)).not.toContain("month-end");
  });

  test("week range rolls across month boundaries from Monday to Monday", () => {
    const selected = new Date(2026, 7, 1, 12);
    const range = getCalendarRangeMs("week", selected);

    expect(new Date(range.startMs)).toEqual(new Date(2026, 6, 27, 0, 0, 0, 0));
    expect(new Date(range.endMs)).toEqual(new Date(2026, 7, 3, 0, 0, 0, 0));
    expect(range.endMs - range.startMs).toBe(7 * dayMs);
  });

  test("month range rolls from December into January", () => {
    const selected = new Date(2026, 11, 31, 23, 30);
    const range = getCalendarRangeMs("month", selected);

    expect(new Date(range.startMs)).toEqual(new Date(2026, 11, 1, 0, 0, 0, 0));
    expect(new Date(range.endMs)).toEqual(new Date(2027, 0, 1, 0, 0, 0, 0));
  });

  test("incomplete date input returns null instead of throwing during editing", () => {
    expect(parseDateInputValue("")).toBeNull();
    expect(parseDateInputValue("2026-")).toBeNull();
    expect(parseDateInputValue("2026-02-31")).toBeNull();
  });
});
