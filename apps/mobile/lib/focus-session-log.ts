import type { SessionLogEntry } from "./session-player";
import type { LoggedTrackingSession } from "./tracking-dashboard-data";

function isSessionLogEntry(value: unknown): value is SessionLogEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<SessionLogEntry>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.routineId === "string" &&
    typeof candidate.startedAt === "number" &&
    typeof candidate.completedAt === "number" &&
    typeof candidate.elapsedMs === "number" &&
    typeof candidate.stepCount === "number"
  );
}

/** Parse stored session-player logs. Invalid JSON or rows become an empty list. */
export function parseSessionLogEntries(rawValue: string | null): SessionLogEntry[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isSessionLogEntry);
  } catch {
    return [];
  }
}

export function serializeSessionLogEntries(
  entries: ReadonlyArray<SessionLogEntry>,
): string {
  return JSON.stringify(entries);
}

/** Append a finished session. Same id is a no-op so a retry does not double-count. */
export function appendSessionLogEntry(
  entries: ReadonlyArray<SessionLogEntry>,
  entry: SessionLogEntry,
): SessionLogEntry[] {
  if (entries.some((item) => item.id === entry.id)) {
    return [...entries];
  }
  return [...entries, entry];
}

export function sessionLogsToTrackingSessions(
  entries: ReadonlyArray<SessionLogEntry>,
): LoggedTrackingSession[] {
  return entries.map((entry) => ({
    id: entry.id,
    loggedAt: entry.completedAt,
    focusMinutes: entry.elapsedMs / 60_000,
  }));
}
