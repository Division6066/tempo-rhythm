import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import {
  buildTrackingDashboard,
  completeTrackingSession,
  formatSessionMinutes,
  type TrackingSessionLog,
} from "./trackingDashboard";

describe("tracking dashboard data contract", () => {
  test("completing sessions creates real logs, increments streaks, and charts from those logs", () => {
    const first = completeTrackingSession([], {
      completedAt: Date.UTC(2026, 6, 14, 9),
      durationMinutes: 25,
      intention: "settle into the first focus block",
    });
    const second = completeTrackingSession(first.logs, {
      completedAt: Date.UTC(2026, 6, 15, 10),
      durationMinutes: 30,
      intention: "continue the routine gently",
    });

    const dashboard = buildTrackingDashboard(second.logs);

    expect(second.createdLog.intention).toBe("continue the routine gently");
    expect(second.streakCount).toBe(2);
    expect(dashboard.enso.value).toBe(2);
    expect(dashboard.enso.label).toBe("2-day streak");
    expect(dashboard.chart.dataSource).toBe("session-logs");
    expect(dashboard.chart.points).toEqual([
      { day: "2026-07-14", sessions: 1, minutes: 25 },
      { day: "2026-07-15", sessions: 1, minutes: 30 },
    ]);
  });

  test("dashboard refuses placeholder or mock-only chart data", () => {
    const logs: TrackingSessionLog[] = [];
    const dashboard = buildTrackingDashboard(logs);

    expect(dashboard.chart.dataSource).toBe("session-logs");
    expect(dashboard.chart.points).toEqual([]);
    expect(dashboard.chart.placeholderDetected).toBe(false);
  });

  test("same-day sessions stack minutes without breaking the streak", () => {
    const first = completeTrackingSession([], {
      completedAt: Date.UTC(2026, 6, 14, 9),
      durationMinutes: 15,
      intention: "first block",
    });
    const second = completeTrackingSession(first.logs, {
      completedAt: Date.UTC(2026, 6, 14, 16),
      durationMinutes: 20,
      intention: "second block",
    });

    const dashboard = buildTrackingDashboard(second.logs);
    expect(second.streakCount).toBe(1);
    expect(dashboard.chart.points).toEqual([
      { day: "2026-07-14", sessions: 2, minutes: 35 },
    ]);
  });

  test("formats session minutes without shame", () => {
    expect(formatSessionMinutes(1)).toBe("1 minute");
    expect(formatSessionMinutes(25)).toBe("25 minutes");
  });
});

describe("TrackingDashboard leftover wiring", () => {
  test("uses landed streaks.getCurrent and the session-log helper", () => {
    const source = readFileSync(
      join(import.meta.dir, "../components/tracking/TrackingDashboard.tsx"),
      "utf8",
    );
    expect(source).toContain("api.streaks.getCurrent");
    expect(source).toContain("completeTrackingSession");
    expect(source).toContain("buildTrackingDashboard");
    expect(source).not.toContain("convex.query");
    expect(source).not.toContain("NEXT_PUBLIC_TRACKING");
  });
});
