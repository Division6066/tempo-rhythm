"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { CheckCircle2, Flame, ListTodo, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

function useTodayDueBounds() {
  return useMemo(() => {
    const n = new Date();
    const start = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
    return { dueFrom: start, dueTo: start + 24 * 60 * 60 * 1000 };
  }, []);
}

const statusLabel: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  cancelled: "Cancelled",
};

const priorityClass: Record<string, string> = {
  high: "text-destructive",
  medium: "text-primary",
  low: "text-muted-foreground",
};

export default function DashboardPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const bounds = useTodayDueBounds();

  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  const todayTasks = useQuery(api.tasks.list, isAuthenticated ? bounds : "skip");
  const streaks = useQuery(api.streaks.getCurrent, isAuthenticated ? {} : "skip");
  const habits = useQuery(api.habits.list, isAuthenticated ? {} : "skip");

  const loading =
    isAuthLoading ||
    (isAuthenticated &&
      (profile === undefined ||
        todayTasks === undefined ||
        streaks === undefined ||
        habits === undefined));

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="space-y-6">
          <div className="h-12 w-2/3 max-w-md animate-pulse rounded-xl bg-muted" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-48 animate-pulse rounded-2xl bg-muted" />
            <div className="h-48 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="container mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="text-muted-foreground">No profile found. Please sign in again.</p>
        <Button asChild className="mt-6">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    );
  }

  const openToday = (todayTasks ?? []).filter(
    (t) => t.status !== "done" && t.status !== "cancelled",
  );

  return (
    <div className="container mx-auto max-w-6xl px-6 py-12">
      <header className="mb-12">
        <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
        <h1 className="font-heading mt-2 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Hello,{" "}
          <span className="text-gradient-primary">{profile.greetingName ?? profile.fullName}</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Your day at a glance — tasks, habits, and streaks in one place.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <SoftCard className="grain-bg lg:col-span-2">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-[#D97757] to-[#E8A87C] text-primary-foreground shadow-inner">
                <ListTodo className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-semibold text-foreground">
                  Today&apos;s tasks
                </h2>
                <p className="text-sm text-muted-foreground">Due today</p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-border bg-card/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
            >
              <Link href="/tasks">All tasks</Link>
            </Button>
          </div>

          {(todayTasks ?? []).length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center text-muted-foreground">
              Nothing due today.{" "}
              <Link
                href="/tasks"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Add a task
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {openToday.length === 0 ? (
                <li className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-primary">
                  <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
                  <span>All tasks done for today — great work!</span>
                </li>
              ) : null}
              {(todayTasks ?? []).map((task) => (
                <li
                  key={task._id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/50 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]",
                    task.status === "done" && "opacity-70",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "font-medium text-foreground",
                        task.status === "done" && "line-through",
                      )}
                    >
                      {task.title}
                    </p>
                    {task.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {statusLabel[task.status] ?? task.status}
                    </span>
                    <span
                      className={cn("text-xs font-semibold uppercase", priorityClass[task.priority])}
                    >
                      {task.priority}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SoftCard>

        <div className="space-y-8">
          <SoftCard className="grain-bg">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-[#D97757] to-[#E8A87C] text-primary-foreground shadow-inner">
                <Flame className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold">Current streak</h2>
                <p className="text-sm text-muted-foreground">Best across all habits</p>
              </div>
            </div>
            <p className="mt-6 font-heading text-5xl font-bold text-gradient-primary tabular-nums">
              {streaks?.streakCount ?? 0}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Longest: {streaks?.longestAmongHabits ?? 0} · {streaks?.habitCount ?? 0} habits
            </p>
          </SoftCard>

          <SoftCard className="grain-bg">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-[#D97757] to-[#E8A87C] text-primary-foreground shadow-inner">
                  <Sparkles className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-semibold">Habits</h2>
                  <p className="text-sm text-muted-foreground">Streak progress</p>
                </div>
              </div>
              <Button
                asChild
                variant="ghost"
                className="text-primary hover:bg-primary/10 hover:text-primary"
              >
                <Link href="/habits">Manage</Link>
              </Button>
            </div>

            {(habits ?? []).length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No habits yet.{" "}
                <Link
                  href="/habits"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Create your first habit
                </Link>
              </p>
            ) : (
              <ul className="space-y-5">
                {(habits ?? []).slice(0, 5).map((h) => {
                  const cap = Math.max(h.longestStreak, h.currentStreak, 1);
                  const pct = Math.min(100, Math.round((h.currentStreak / cap) * 100));
                  return (
                    <li key={h._id}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-foreground">{h.name}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {h.currentStreak} days
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)]">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-[#D97757] to-[#E8A87C] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </SoftCard>
        </div>
      </div>
    </div>
  );
}
