import { mockAtUtcHour } from "./constants";
import type { MockCalendarEvent } from "./types";

/** Week of April 21 — screens-2.jsx ScreenCalendar */
export const mockCalendarWeekLabel = "Week of April 21.";

type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

const baseForDay: Record<DayKey, number> = {
  Mon: mockAtUtcHour(10, 0) - 3 * 86400000,
  Tue: mockAtUtcHour(10, 0) - 2 * 86400000,
  Wed: mockAtUtcHour(10, 0) - 1 * 86400000,
  Thu: mockAtUtcHour(10, 0),
  Fri: mockAtUtcHour(10, 0) + 1 * 86400000,
  Sat: mockAtUtcHour(10, 0) + 2 * 86400000,
  Sun: mockAtUtcHour(10, 0) + 3 * 86400000,
};

function ev(
  day: DayKey,
  hour: number,
  title: string,
  source: MockCalendarEvent["source"] = "tempo",
): MockCalendarEvent {
  const start = baseForDay[day] + hour * 60 * 60 * 1000;
  return {
    id: `cal-${day}-${hour}-${title.replace(/\s+/g, "-").toLowerCase()}`,
    title,
    startAt: start,
    endAt: start + 60 * 60 * 1000,
    source,
  };
}

export const mockCalendarEvents: MockCalendarEvent[] = [
  ev("Mon", 10, "PR review"),
  ev("Mon", 14, "Deep work"),
  ev("Tue", 9, "Pages"),
  ev("Tue", 11, "Sam 1:1"),
  ev("Wed", 9, "Pages"),
  ev("Wed", 13, "Draft launch"),
  ev("Thu", 9, "Launch post"),
  ev("Thu", 12, "Walk"),
  ev("Thu", 14, "Founder Qs"),
  ev("Fri", 10, "Weekly review"),
  ev("Fri", 15, "Deep work"),
  ev("Sat", 11, "Tea w/ mum"),
  ev("Sun", 17, "Recap draft"),
];
