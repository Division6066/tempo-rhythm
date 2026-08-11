import type { CalendarEvent } from "./date-math";

const storageKey = "tempo:calendar-events:e2e:v1";

export type StoredCalendarEvent = CalendarEvent & {
  createdAtMs: number;
};

function isStoredCalendarEvent(value: unknown): value is StoredCalendarEvent {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.startsAtMs === "number" &&
    typeof candidate.createdAtMs === "number"
  );
}

export function loadCalendarEvents(): StoredCalendarEvent[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isStoredCalendarEvent).toSorted((a, b) => a.startsAtMs - b.startsAtMs);
  } catch {
    return [];
  }
}

export function saveCalendarEvents(events: readonly StoredCalendarEvent[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(events));
}

export function createLocalCalendarEvent({
  title,
  startsAtMs,
}: {
  title: string;
  startsAtMs: number;
}): StoredCalendarEvent {
  const cleanTitle = title.trim();
  if (!cleanTitle) {
    throw new Error("Give the event a gentle label first.");
  }

  const now = Date.now();
  return {
    id: `calendar-event-${now}-${Math.random().toString(36).slice(2)}`,
    title: cleanTitle,
    startsAtMs,
    createdAtMs: now,
  };
}
