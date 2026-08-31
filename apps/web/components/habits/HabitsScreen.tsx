"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { isHabitCompletedOnUtcDay } from "@/convex/lib/habitStreak";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { CheckCircle2, Circle, Flame, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type HabitRowData = {
  _id: Id<"habits">;
  name: string;
  cadence: "daily" | "weekly";
  currentStreak: number;
  longestStreak: number;
  lastCompletedAt?: number;
};

function HabitRow({ habit, now }: { habit: HabitRowData; now: number }) {
  const completeToday = useMutation(api.habits.completeToday);
  const completedToday = isHabitCompletedOnUtcDay(habit.lastCompletedAt, now);

  return (
    <li className="rounded-3xl border border-border/80 bg-card/90 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {habit.name}
            </h2>
            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {habit.cadence}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Current streak: {habit.currentStreak}{" "}
            {habit.currentStreak === 1 ? "day" : "days"} · Longest:{" "}
            {habit.longestStreak}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!completedToday) {
              void completeToday({ habitId: habit._id });
            }
          }}
          disabled={completedToday}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-default",
            completedToday
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border bg-background text-foreground hover:border-primary hover:text-primary",
          )}
          aria-label={
            completedToday
              ? `${habit.name} is checked today`
              : `Check ${habit.name} today`
          }
        >
          {completedToday ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden />
          ) : (
            <Circle className="h-4 w-4" aria-hidden />
          )}
          {completedToday ? "Checked today" : "Check today"}
        </button>
      </div>
    </li>
  );
}

function NewHabitForm() {
  const createHabit = useMutation(api.habits.create);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="rounded-3xl border border-dashed border-border bg-muted/30 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
          return;
        }
        setIsSubmitting(true);
        void createHabit({ name: trimmed, cadence: "daily" })
          .then(() => setName(""))
          .finally(() => setIsSubmitting(false));
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="habit-name">Add a tiny habit</Label>
          <Input
            id="habit-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Drink water, take meds, step outside..."
            autoComplete="off"
          />
        </div>
        <Button type="submit" disabled={isSubmitting || name.trim().length === 0}>
          <Plus className="h-4 w-4" aria-hidden />
          Add habit
        </Button>
      </div>
    </form>
  );
}

export function HabitsScreen() {
  const now = Date.now();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  const hasConvexUser = profile != null;
  const habits = useQuery(
    api.habits.list,
    isAuthenticated && hasConvexUser ? {} : "skip",
  );
  const isLoading =
    isAuthLoading ||
    (isAuthenticated &&
      (profile === undefined || (hasConvexUser && habits === undefined)));

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-4xl p-8">
        <div className="space-y-4">
          <div className="h-12 w-48 animate-pulse rounded-xl bg-muted" />
          <div className="h-28 animate-pulse rounded-3xl bg-muted" />
          <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !profile || !habits) {
    return (
      <main className="mx-auto w-full max-w-4xl p-8 text-center">
        <SoftCard className="mx-auto max-w-xl">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Habits
          </h1>
          <p className="mt-3 text-muted-foreground">
            Sign in again to check off habits and keep today in sync.
          </p>
          <Button asChild className="mt-6">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </SoftCard>
      </main>
    );
  }

  const checkedCount = habits.filter((habit) =>
    isHabitCompletedOnUtcDay(habit.lastCompletedAt, now),
  ).length;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Flame className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Library
            </p>
            <h1 className="font-heading text-4xl font-semibold text-foreground">
              Habits
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-muted-foreground">
          Check off the tiny repeats that help today feel workable. Streaks
          count consecutive calendar days, and coming back still counts as
          progress.
        </p>
        <p className="text-sm text-muted-foreground">
          {habits.length === 0
            ? "No habits yet."
            : `${checkedCount} of ${habits.length} checked today.`}
        </p>
      </header>

      <NewHabitForm />

      {habits.length === 0 ? (
        <div className="rounded-3xl border border-border/80 bg-card/90 px-6 py-10 text-center">
          <p className="text-base font-medium text-foreground">
            Start with one small repeat.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            A tiny habit is enough; you can rename or reshape it later.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {habits.map((habit) => (
            <HabitRow key={habit._id} habit={habit} now={now} />
          ))}
        </ul>
      )}
    </main>
  );
}
