export type CalendarView = "today" | "day" | "week" | "month" | "planner";

export type CalendarRangeView = Exclude<CalendarView, "planner">;

export type CalendarEventLike = {
  id: string;
  title: string;
  startAt: number;
  endAt: number;
};

export type CalendarRange = {
  startMs: number;
  endMs: number;
};

export type CalendarDay = CalendarRange & {
  date: Date;
  label: string;
  isoDate: string;
};

export type MonthCell = CalendarDay & {
  isCurrentMonth: boolean;
  isToday: boolean;
};

export type LaidOutCalendarEvent<T extends CalendarEventLike = CalendarEventLike> = T & {
  lane: number;
  laneCount: number;
};

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const minutesToMs = (minutes: number) => minutes * 60 * 1000;

export function startOfDayMs(ms: number): number {
  const date = new Date(ms);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function addDays(ms: number, days: number): number {
  return startOfDayMs(ms) + days * 24 * 60 * 60 * 1000;
}

export function getDayRange(ms: number): CalendarRange {
  const startMs = startOfDayMs(ms);
  return {
    startMs,
    endMs: addDays(startMs, 1),
  };
}

export function startOfWeekMs(ms: number): number {
  const start = startOfDayMs(ms);
  const day = new Date(start).getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addDays(start, mondayOffset);
}

export function buildWeekDays(ms: number): CalendarDay[] {
  const weekStart = startOfWeekMs(ms);
  return Array.from({ length: 7 }, (_, index) => {
    const startMs = addDays(weekStart, index);
    const date = new Date(startMs);
    return {
      date,
      startMs,
      endMs: addDays(startMs, 1),
      label: `${weekdayLabels[date.getDay()]} ${date.getDate()}`,
      isoDate: isoDateFormatter.format(date),
    };
  });
}

export function buildMonthGrid(ms: number): MonthCell[] {
  const anchor = new Date(ms);
  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1).getTime();
  const gridStart = startOfWeekMs(monthStart);
  const todayStart = startOfDayMs(ms);

  return Array.from({ length: 42 }, (_, index) => {
    const startMs = addDays(gridStart, index);
    const date = new Date(startMs);
    return {
      date,
      startMs,
      endMs: addDays(startMs, 1),
      label: String(date.getDate()),
      isoDate: isoDateFormatter.format(date),
      isCurrentMonth: date.getMonth() === anchor.getMonth(),
      isToday: startMs === todayStart,
    };
  });
}

export function buildCalendarRange(view: CalendarRangeView, anchorMs: number): CalendarRange {
  if (view === "week") {
    const startMs = startOfWeekMs(anchorMs);
    return { startMs, endMs: addDays(startMs, 7) };
  }

  if (view === "month") {
    const grid = buildMonthGrid(anchorMs);
    return {
      startMs: grid[0]?.startMs ?? startOfDayMs(anchorMs),
      endMs: grid[41]?.endMs ?? addDays(anchorMs, 1),
    };
  }

  return getDayRange(anchorMs);
}

export function toMinuteOfDay(ms: number): number {
  const date = new Date(ms);
  return date.getHours() * 60 + date.getMinutes();
}

export function moveEventByMinutes<T extends CalendarEventLike>(
  event: T,
  minutes: number,
): T {
  const delta = minutesToMs(minutes);
  return {
    ...event,
    startAt: event.startAt + delta,
    endAt: event.endAt + delta,
  };
}

function overlaps(a: CalendarEventLike, b: CalendarEventLike): boolean {
  return a.startAt < b.endAt && b.startAt < a.endAt;
}

export function layoutOverlappingEvents<T extends CalendarEventLike>(
  events: T[],
): LaidOutCalendarEvent<T>[] {
  const sorted = [...events].sort((a, b) => a.startAt - b.startAt || a.endAt - b.endAt);
  const result: LaidOutCalendarEvent<T>[] = [];
  const active: LaidOutCalendarEvent<T>[] = [];

  for (const event of sorted) {
    for (let index = active.length - 1; index >= 0; index -= 1) {
      if (active[index].endAt <= event.startAt) {
        active.splice(index, 1);
      }
    }

    const usedLanes = new Set(active.map((item) => item.lane));
    let lane = 0;
    while (usedLanes.has(lane)) {
      lane += 1;
    }

    const overlappingActive = active.filter((item) => overlaps(item, event));
    const laneCount = Math.max(1, overlappingActive.length + 1);
    for (const activeEvent of overlappingActive) {
      activeEvent.laneCount = Math.max(activeEvent.laneCount, laneCount);
    }

    const laidOut = { ...event, lane, laneCount };
    active.push(laidOut);
    result.push(laidOut);
  }

  return result;
}
