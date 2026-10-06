"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { BarChart3, CheckCircle2, Compass, Flame } from "lucide-react";
import { Component, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { startOfLocalWeekMondayMs } from "@/lib/localDay";
import { useLocalDayBounds } from "@/lib/useLocalDayBounds";
import { deriveInsightsState } from "./insightsState";

const LOADING_TIMEOUT_MS = 10_000;

/**
 * Read-only insights surface (reads `analytics.insightsSummary`; mutates nothing).
 * Copy follows HARD_RULES §1 — numbers are framed as information, never as
 * a judgment. Overdue work is "waiting", not "late".
 */

type EnergyOrPriorityBuckets = { low: number; medium: number; high: number };

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <SoftCard className="p-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          aria-hidden
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-heading text-3xl font-semibold text-foreground">{value}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{detail}</p>
    </SoftCard>
  );
}

function BucketBars({
  title,
  buckets,
  labels,
}: {
  title: string;
  buckets: EnergyOrPriorityBuckets;
  labels: { low: string; medium: string; high: string };
}) {
  const total = buckets.low + buckets.medium + buckets.high;
  const rows: Array<{ key: keyof EnergyOrPriorityBuckets; label: string; count: number }> = [
    { key: "high", label: labels.high, count: buckets.high },
    { key: "medium", label: labels.medium, count: buckets.medium },
    { key: "low", label: labels.low, count: buckets.low },
  ];

  return (
    <SoftCard className="p-6">
      <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
      {total === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Nothing open here right now — a quiet list is a fine list.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => {
            const percent = total === 0 ? 0 : Math.round((row.count / total) * 100);
            return (
              <li key={row.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{row.label}</span>
                  <span className="font-medium text-muted-foreground">
                    {row.count} ({percent}%)
                  </span>
                </div>
                <div
                  className="mt-1 h-2 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-label={`${row.label}: ${row.count} of ${total} open tasks`}
                  aria-valuenow={row.count}
                  aria-valuemin={0}
                  aria-valuemax={total}
                >
                  <div className="h-full rounded-full bg-primary/70" style={{ width: `${percent}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SoftCard>
  );
}

function InsightsSkeleton() {
  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      <div className="space-y-6">
        <div className="h-12 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="h-36 animate-pulse rounded-2xl bg-muted" />
          <div className="h-36 animate-pulse rounded-2xl bg-muted" />
          <div className="h-36 animate-pulse rounded-2xl bg-muted" />
          <div className="h-36 animate-pulse rounded-2xl bg-muted" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-56 animate-pulse rounded-2xl bg-muted" />
          <div className="h-56 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

function InsightsRetryCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="container mx-auto max-w-5xl px-6 py-16 text-center">
      <SoftCard className="mx-auto max-w-xl">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Insights</h1>
        <p className="mt-3 text-muted-foreground" role="alert">
          We couldn&apos;t load your overview. Try again.
        </p>
        <Button className="mt-6" onClick={onRetry}>
          Retry
        </Button>
      </SoftCard>
    </div>
  );
}

/** Catches a thrown `insightsSummary` query so the screen shows a calm retry card. */
class InsightsErrorBoundary extends Component<
  { onRetry: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <InsightsRetryCard
          onRetry={() => {
            this.setState({ failed: false });
            this.props.onRetry();
          }}
        />
      );
    }
    return this.props.children;
  }
}

export function InsightsScreen() {
  const [attempt, setAttempt] = useState(0);
  const retry = () => setAttempt((n) => n + 1);
  return (
    <InsightsErrorBoundary onRetry={retry}>
      <InsightsContent key={attempt} onRetry={retry} />
    </InsightsErrorBoundary>
  );
}

function InsightsContent({ onRetry }: { onRetry: () => void }) {
  const bounds = useLocalDayBounds();
  const weekStartMs = Math.min(startOfLocalWeekMondayMs(new Date(bounds.startMs)), bounds.startMs);
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  const hasConvexUser = profile != null;
  const summary = useQuery(
    api.analytics.insightsSummary,
    isAuthenticated && hasConvexUser
      ? { todayStartMs: bounds.startMs, todayEndMs: bounds.endMs, weekStartMs }
      : "skip",
  );

  const [timedOut, setTimedOut] = useState(false);
  const input = { isAuthLoading, isAuthenticated, profile, summary };
  const stillLoading = deriveInsightsState({ ...input, failed: false }) === "loading";
  useEffect(() => {
    if (!stillLoading) return;
    const id = setTimeout(() => setTimedOut(true), LOADING_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [stillLoading]);

  const state = deriveInsightsState({ ...input, failed: timedOut && stillLoading });

  if (state === "loading") return <InsightsSkeleton />;
  if (state === "error") return <InsightsRetryCard onRetry={onRetry} />;

  if (state === "signed-out" || !summary) {
    return (
      <div className="container mx-auto max-w-5xl px-6 py-16 text-center">
        <SoftCard className="mx-auto max-w-xl">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Insights</h1>
          <p className="mt-3 text-muted-foreground">
            Sign in to see a calm overview of your tasks, habits, and goals.
          </p>
          <Button asChild className="mt-6">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </SoftCard>
      </div>
    );
  }

  const nothingTrackedYet = state === "empty";

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      <div className="space-y-8">
        <header>
          <h1 className="font-heading text-3xl font-semibold text-foreground">Insights</h1>
          <p className="mt-2 text-muted-foreground">
            A calm snapshot of where things stand. Numbers are information, not judgment.
          </p>
        </header>

        {nothingTrackedYet ? (
          <SoftCard className="text-center">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Nothing tracked yet — and that's okay
            </h2>
            <p className="mt-3 text-muted-foreground">
              As you add tasks, habits, and goals, this page fills in with a gentle overview.
            </p>
            <Button asChild className="mt-6">
              <Link href="/today">Start with Today</Link>
            </Button>
          </SoftCard>
        ) : (
          <>
            <section
              className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
              aria-label="Task overview"
            >
              <StatCard
                icon={<CheckCircle2 className="h-5 w-5" aria-hidden />}
                label="Done this week"
                value={summary.tasksCompletedThisWeek}
                detail={
                  summary.tasksCompletedThisWeek === 0
                    ? "The week is still open — anything you finish counts."
                    : "Finished since Monday. Every one of these took real effort."
                }
              />
              <StatCard
                icon={<Compass className="h-5 w-5" aria-hidden />}
                label="Due today"
                value={summary.tasksDueToday}
                detail={
                  summary.tasksDueToday === 0
                    ? "Nothing is asking for attention today."
                    : "On today's plate. Small steps are enough."
                }
              />
              <StatCard
                icon={<BarChart3 className="h-5 w-5" aria-hidden />}
                label="Open tasks"
                value={summary.tasksOpen}
                detail={
                  summary.tasksOverdue === 0
                    ? "Everything open is either scheduled or flexible."
                    : `${summary.tasksOverdue} of these are waiting for a new date — pick them up whenever you're ready.`
                }
              />
              <StatCard
                icon={<Flame className="h-5 w-5" aria-hidden />}
                label="Active streaks"
                value={summary.habitsWithActiveStreak}
                detail={
                  summary.habitsTotal === 0
                    ? "No habits tracked yet."
                    : summary.bestStreak > 0
                      ? `Across ${summary.habitsTotal} habit${summary.habitsTotal === 1 ? "" : "s"} — best run so far: ${summary.bestStreak} day${summary.bestStreak === 1 ? "" : "s"}.`
                      : `Across ${summary.habitsTotal} habit${summary.habitsTotal === 1 ? "" : "s"} — fresh starts welcome any day.`
                }
              />
            </section>

            <section className="grid gap-6 md:grid-cols-2" aria-label="Open task breakdowns">
              <BucketBars
                title="Open tasks by energy"
                buckets={summary.openByEnergy}
                labels={{ low: "Low energy", medium: "Medium energy", high: "High energy" }}
              />
              <BucketBars
                title="Open tasks by priority"
                buckets={summary.openByPriority}
                labels={{ low: "Low priority", medium: "Medium priority", high: "High priority" }}
              />
            </section>

            <section aria-label="Goals overview">
              <SoftCard className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">Goals</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {summary.goalsActive === 0
                        ? "No active goals right now — direction can wait until you want it."
                        : `${summary.goalsActive} active goal${summary.goalsActive === 1 ? "" : "s"}, ${summary.goalsAverageProgressPercent}% along on average.`}
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href="/goals">Open goals</Link>
                  </Button>
                </div>
                {summary.goalsActive > 0 ? (
                  <div
                    className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label={`Average goal progress: ${summary.goalsAverageProgressPercent}%`}
                    aria-valuenow={summary.goalsAverageProgressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${Math.min(Math.max(summary.goalsAverageProgressPercent, 0), 100)}%` }}
                    />
                  </div>
                ) : null}
              </SoftCard>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
