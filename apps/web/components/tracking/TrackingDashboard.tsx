"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { Flame } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import {
  buildTrackingDashboard,
  completeTrackingSession,
  formatSessionMinutes,
  type TrackingSessionLog,
} from "@/lib/trackingDashboard";

export function TrackingDashboard() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  const hasConvexUser = profile != null;
  const habitStreak = useQuery(
    api.streaks.getCurrent,
    isAuthenticated && hasConvexUser ? {} : "skip",
  );
  const [logs, setLogs] = useState<TrackingSessionLog[]>([]);
  const [intention, setIntention] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("25");

  const dashboard = useMemo(() => buildTrackingDashboard(logs), [logs]);

  const isLoading =
    isAuthLoading ||
    (isAuthenticated &&
      (profile === undefined || (hasConvexUser && habitStreak === undefined)));

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-4xl p-8">
        <div className="space-y-4">
          <div className="h-12 w-56 animate-pulse rounded-xl bg-muted" />
          <div className="h-28 animate-pulse rounded-3xl bg-muted" />
          <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !profile || !habitStreak) {
    return (
      <main className="mx-auto w-full max-w-4xl p-8 text-center">
        <SoftCard className="mx-auto max-w-xl">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Session tracking
          </h1>
          <p className="mt-3 text-muted-foreground">
            Sign in again to see habit streaks and log a focus block.
          </p>
          <Button asChild className="mt-6">
            <Link href="/sign-in?next=/tracking">Sign in</Link>
          </Button>
        </SoftCard>
      </main>
    );
  }

  const logSession = () => {
    const minutes = Number.parseInt(durationMinutes, 10);
    if (!Number.isFinite(minutes) || minutes <= 0 || intention.trim().length === 0) {
      return;
    }

    setLogs((current) => {
      return completeTrackingSession(current, {
        completedAt: Date.now(),
        durationMinutes: minutes,
        intention,
      }).logs;
    });
    setIntention("");
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Flame className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              You
            </p>
            <h1 className="font-heading text-4xl font-semibold text-foreground">
              Session tracking
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-muted-foreground">
          A quiet place to notice what you already did. Coming back later still
          counts — there is no falling behind here.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <SoftCard>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Habit streak
          </p>
          <p className="mt-3 font-heading text-3xl font-semibold text-foreground">
            {habitStreak.streakCount}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Longest among {habitStreak.habitCount}{" "}
            {habitStreak.habitCount === 1 ? "habit" : "habits"}:{" "}
            {habitStreak.longestAmongHabits}.{" "}
            <Link href="/habits" className="underline underline-offset-4">
              Open habits
            </Link>
          </p>
        </SoftCard>
        <SoftCard>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Focus blocks today
          </p>
          <p className="mt-3 font-heading text-3xl font-semibold text-foreground">
            {dashboard.enso.label}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Charted from the blocks you log on this page, not from placeholder
            data.
          </p>
        </SoftCard>
      </section>

      <form
        className="rounded-3xl border border-dashed border-border bg-muted/30 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          logSession();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="session-intention">What this block was for</Label>
            <Input
              id="session-intention"
              value={intention}
              onChange={(event) => setIntention(event.target.value)}
              placeholder="A gentle first stretch, inbox, meds..."
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-minutes">Minutes</Label>
            <Input
              id="session-minutes"
              type="number"
              min={1}
              inputMode="numeric"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
            />
          </div>
          <Button type="submit" disabled={intention.trim().length === 0}>
            Log this block
          </Button>
        </div>
      </form>

      {dashboard.chart.points.length === 0 ? (
        <div className="rounded-3xl border border-border/80 bg-card/90 px-6 py-10 text-center">
          <p className="text-base font-medium text-foreground">
            No focus blocks logged yet.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            When you finish a short stretch, log it here. One block is enough.
          </p>
        </div>
      ) : (
        <section aria-label="Logged focus blocks">
          <ul className="space-y-3">
            {logs
              .slice()
              .reverse()
              .map((log) => (
                <li
                  key={log.id}
                  className="rounded-3xl border border-border/80 bg-card/90 p-5"
                >
                  <p className="font-medium text-foreground">{log.intention}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatSessionMinutes(log.durationMinutes)}
                  </p>
                </li>
              ))}
          </ul>
          <ol className="mt-6 grid gap-2 sm:grid-cols-2">
            {dashboard.chart.points.map((point) => (
              <li
                key={point.day}
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground"
              >
                <span className="font-medium text-foreground">{point.day}</span>
                {" · "}
                {point.sessions} {point.sessions === 1 ? "block" : "blocks"},{" "}
                {formatSessionMinutes(point.minutes)}
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
