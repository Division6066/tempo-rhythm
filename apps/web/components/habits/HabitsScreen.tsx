"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { Flame } from "lucide-react";
import Link from "next/link";
import { HabitsLibrary } from "@/components/habits-library/HabitsLibrary";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useLocalDayBounds } from "@/lib/useLocalDayBounds";
import { checkedHabitIds, localDateKey } from "../habit-checkin-strip/checkedState";
import { HabitEnergySuggestions } from "./HabitEnergySuggestions";

export function HabitsScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  const hasConvexUser = profile != null;
  const habits = useQuery(
    api.habits.list,
    isAuthenticated && hasConvexUser ? {} : "skip",
  );
  const bounds = useLocalDayBounds();
  const localDate = localDateKey(new Date(bounds.startMs));
  const checkIns = useQuery(
    api.habitCheckIns.listForDate,
    isAuthenticated && hasConvexUser ? { localDate } : "skip",
  );
  const isLoading =
    isAuthLoading ||
    (isAuthenticated &&
      (profile === undefined ||
        (hasConvexUser && (habits === undefined || checkIns === undefined))));

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

  if (!isAuthenticated || !profile || !habits || !checkIns) {
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

  const checkedIds = checkedHabitIds(checkIns);

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
      </header>

      <HabitEnergySuggestions
        habits={habits.map((habit) => ({
          _id: habit._id,
          name: habit.name,
          completedToday: checkedIds.has(habit._id),
        }))}
      />

      <HabitsLibrary />
    </main>
  );
}
