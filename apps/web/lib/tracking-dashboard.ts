export type TrackingSessionLog = {
  id: string;
  completedAt: number;
  durationMinutes: number;
  intention: string;
};

type CompleteSessionInput = {
  completedAt: number;
  durationMinutes: number;
  intention: string;
};

export type TrackingChartPoint = {
  day: string;
  sessions: number;
  minutes: number;
};

export type TrackingDashboard = {
  enso: {
    value: number;
    max: number;
    label: string;
  };
  chart: {
    dataSource: "session-logs";
    points: TrackingChartPoint[];
    placeholderDetected: false;
  };
};

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "UTC",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function toUtcDay(timestamp: number): string {
  return dayFormatter.format(new Date(timestamp));
}

function logIdFor(input: CompleteSessionInput, index: number): string {
  return `session-${input.completedAt}-${index}`;
}

function calculateCurrentStreak(logs: TrackingSessionLog[]): number {
  const days = Array.from(new Set(logs.map((log) => toUtcDay(log.completedAt)))).sort();
  if (days.length === 0) {
    return 0;
  }

  let streak = 1;
  for (let index = days.length - 1; index > 0; index -= 1) {
    const current = Date.parse(`${days[index]}T00:00:00.000Z`);
    const previous = Date.parse(`${days[index - 1]}T00:00:00.000Z`);
    const daysApart = Math.round((current - previous) / 86_400_000);
    if (daysApart !== 1) {
      break;
    }
    streak += 1;
  }

  return streak;
}

export function completeTrackingSession(
  logs: TrackingSessionLog[],
  input: CompleteSessionInput,
) {
  const createdLog = {
    id: logIdFor(input, logs.length + 1),
    completedAt: input.completedAt,
    durationMinutes: input.durationMinutes,
    intention: input.intention.trim(),
  };
  const nextLogs = [...logs, createdLog].sort((a, b) => a.completedAt - b.completedAt);

  return {
    logs: nextLogs,
    createdLog,
    streakCount: calculateCurrentStreak(nextLogs),
  };
}

export function buildTrackingDashboard(logs: TrackingSessionLog[]): TrackingDashboard {
  const pointsByDay = new Map<string, TrackingChartPoint>();
  for (const log of logs) {
    const day = toUtcDay(log.completedAt);
    const existing = pointsByDay.get(day);
    if (existing) {
      pointsByDay.set(day, {
        day,
        sessions: existing.sessions + 1,
        minutes: existing.minutes + log.durationMinutes,
      });
      continue;
    }
    pointsByDay.set(day, {
      day,
      sessions: 1,
      minutes: log.durationMinutes,
    });
  }

  const points = Array.from(pointsByDay.values()).sort((a, b) =>
    a.day.localeCompare(b.day),
  );
  const streakCount = calculateCurrentStreak(logs);

  return {
    enso: {
      value: streakCount,
      max: 7,
      label: `${streakCount}-day streak`,
    },
    chart: {
      dataSource: "session-logs",
      points,
      placeholderDetected: false,
    },
  };
}
