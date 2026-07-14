"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildTrackingDashboard,
  completeTrackingSession,
  type TrackingSessionLog,
} from "@/lib/tracking-dashboard";

const storageKey = "tempo:tracking-dashboard:v1";
const defaultSessionMinutes = 25;
const defaultIntention = "Session completed";

function isTrackingSessionLog(value: unknown): value is TrackingSessionLog {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.completedAt === "number" &&
    typeof candidate.durationMinutes === "number" &&
    typeof candidate.intention === "string"
  );
}

function loadStoredLogs(): TrackingSessionLog[] {
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
    return parsed.filter(isTrackingSessionLog);
  } catch {
    return [];
  }
}

function storeLogs(logs: TrackingSessionLog[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(logs));
  } catch {
    // Storage can fail in private browsing or under quota. The on-screen log still updates.
  }
}

function formatLogTime(timestamp: number): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

type EnsoRingProps = {
  value: number;
  max: number;
  label: string;
};

function EnsoRing({ value, max, label }: EnsoRingProps) {
  const radius = 54;
  const stroke = 9;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.max(0, Math.min(1, value / max));

  return (
    <div
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={value}
      className="relative grid size-40 place-items-center rounded-full bg-card shadow-[0_24px_80px_rgba(0,0,0,0.08)]"
      data-testid="enso-ring"
      role="progressbar"
    >
      <svg aria-hidden="true" className="absolute inset-0" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          fill="none"
          r={radius}
          stroke="var(--color-border-soft)"
          strokeWidth={stroke}
        />
        <circle
          cx="70"
          cy="70"
          fill="none"
          r={radius}
          stroke="var(--color-tempo-orange)"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent)}
          strokeLinecap="round"
          strokeWidth={stroke}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div className="relative text-center">
        <div className="font-serif text-5xl leading-none" data-testid="streak-count">
          {value}
        </div>
        <div className="mt-1 text-caption uppercase tracking-[0.22em] text-muted-foreground">
          day streak
        </div>
      </div>
    </div>
  );
}

type TrackingChartProps = {
  points: ReturnType<typeof buildTrackingDashboard>["chart"]["points"];
};

function TrackingChart({ points }: TrackingChartProps) {
  const maxMinutes = Math.max(1, ...points.map((point) => point.minutes));

  return (
    <div
      className="rounded-[2rem] border border-border bg-card p-5"
      data-chart-points={JSON.stringify(points)}
      data-placeholder-detected="false"
      data-session-count={String(points.reduce((total, point) => total + point.sessions, 0))}
      data-source="session-logs"
      data-testid="tracking-chart"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl">Logged sessions</h2>
          <p className="mt-1 text-small text-muted-foreground">
            Every bar is built from session logs created on this screen.
          </p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-caption font-medium text-secondary-foreground">
          Source: session logs
        </span>
      </div>

      <div className="mt-8 flex h-48 items-end gap-3" aria-label="Logged session chart">
        {points.length > 0 ? (
          points.map((point) => (
            <div className="flex flex-1 flex-col items-center gap-2" key={point.day}>
              <div
                aria-label={`${point.day}: ${point.sessions} session, ${point.minutes} minutes`}
                className="w-full rounded-t-2xl bg-primary/80 shadow-[0_14px_30px_rgba(0,0,0,0.12)]"
                style={{ height: `${Math.max(12, (point.minutes / maxMinutes) * 100)}%` }}
              />
              <span className="text-caption text-muted-foreground">{point.day.slice(5)}</span>
            </div>
          ))
        ) : (
          <div className="grid h-full w-full place-items-center rounded-2xl border border-dashed border-border bg-muted/40 text-center">
            <p className="max-w-sm text-small text-muted-foreground">
              No sessions logged yet. One gentle completion will draw the first real chart point.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function TrackingDashboardClient() {
  const [logs, setLogs] = useState<TrackingSessionLog[]>([]);

  useEffect(() => {
    setLogs(loadStoredLogs());
  }, []);

  const dashboard = useMemo(() => buildTrackingDashboard(logs), [logs]);
  const latestLog = logs.at(-1);

  function handleCompleteSession() {
    setLogs((currentLogs) => {
      const result = completeTrackingSession(currentLogs, {
        completedAt: Date.now(),
        durationMinutes: defaultSessionMinutes,
        intention: defaultIntention,
      });
      storeLogs(result.logs);
      return result.logs;
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="font-eyebrow text-primary">Tracking</p>
          <h1 className="mt-3 font-serif text-5xl tracking-tight md:text-6xl">
            Tracking dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-body leading-relaxed text-muted-foreground">
            Finish one session, then see the log, streak, enso ring, and chart update from the
            same recorded data.
          </p>
        </div>
        <button
          className="min-h-12 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(0,0,0,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={handleCompleteSession}
          type="button"
        >
          Complete session
        </button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-[2rem] border border-border bg-card p-6">
          <div className="flex flex-col items-center gap-5 text-center">
            <EnsoRing {...dashboard.enso} />
            <div>
              <h2 className="font-serif text-2xl">Enso streak ring</h2>
              <p className="mt-2 text-small text-muted-foreground">
                The ring uses the current streak derived from logged session days.
              </p>
            </div>
          </div>
        </div>

        <TrackingChart points={dashboard.chart.points} />
      </section>

      <section
        aria-label="Session log"
        className="rounded-[2rem] border border-border bg-card p-6"
        data-testid="session-log"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl">Session log</h2>
            <p className="mt-1 text-small text-muted-foreground">
              {logs.length === 0
                ? "No sessions logged yet."
                : `${logs.length} ${logs.length === 1 ? "session" : "sessions"} logged.`}
            </p>
          </div>
          {latestLog ? (
            <span className="rounded-full bg-secondary px-3 py-1 text-caption font-medium text-secondary-foreground">
              Session completed
            </span>
          ) : null}
        </div>

        <div className="mt-5 space-y-3">
          {logs.length > 0 ? (
            logs
              .toReversed()
              .map((log) => (
                <article
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/50 px-4 py-3"
                  key={log.id}
                >
                  <div>
                    <h3 className="font-medium text-foreground">{log.intention}</h3>
                    <p className="text-caption text-muted-foreground">
                      {formatLogTime(log.completedAt)}
                    </p>
                  </div>
                  <span className="font-tabular text-small text-muted-foreground">
                    {log.durationMinutes} min
                  </span>
                </article>
              ))
          ) : (
            <p className="rounded-2xl bg-muted/50 px-4 py-3 text-small text-muted-foreground">
              Start with one small session. The dashboard will draw from the first saved log.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
