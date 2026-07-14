"use client";

import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useLocalDayBounds } from "@/lib/useLocalDayBounds";

type RoutineDetailClientProps = {
  routineId: string;
};

function isWithinToday(timestamp: number | undefined, startMs: number, endMs: number) {
  return timestamp !== undefined && timestamp >= startMs && timestamp < endMs;
}

export function RoutineDetailClient({ routineId }: RoutineDetailClientProps) {
  const bounds = useLocalDayBounds();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const routine = useQuery(
    api.routines.getWithItems,
    isAuthenticated ? { routineId: routineId as Id<"routines"> } : "skip"
  );
  const completeItem = useMutation(api.routines.completeItem);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading = isAuthLoading || (isAuthenticated && routine === undefined);

  async function handleComplete(routineItemId: Id<"routineItems">) {
    setPendingItemId(routineItemId);
    setError(null);
    try {
      await completeItem({ routineItemId });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't complete that item yet.");
    } finally {
      setPendingItemId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-8">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-8">
        <SoftCard padding="lg" className="text-center">
          <h1 className="text-h2 font-serif">Sign in to run this routine</h1>
          <p className="mt-3 text-body text-muted-foreground">
            Your routine items are private, so sign in to continue.
          </p>
          <Link
            href={`/sign-in?next=/routines/${routineId}`}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 font-medium text-primary-foreground"
          >
            Sign in
          </Link>
        </SoftCard>
      </main>
    );
  }

  if (routine === null) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-8">
        <SoftCard padding="lg" className="text-center">
          <h1 className="text-h2 font-serif">Routine not found</h1>
          <p className="mt-3 text-body text-muted-foreground">
            It may have been moved or removed. Your routine library is still available.
          </p>
          <Link
            href="/routines"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 font-medium text-primary-foreground"
          >
            Back to routines
          </Link>
        </SoftCard>
      </main>
    );
  }

  if (routine === undefined) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-8">
      <header className="space-y-4">
        <Link href="/routines" className="text-small font-medium text-primary hover:underline">
          Back to routines
        </Link>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <Pill tone="orange">Routine run</Pill>
            <Pill tone="moss">Completable items</Pill>
          </div>
          <h1 className="text-h1 font-serif">{routine.name}</h1>
          <p className="max-w-2xl text-body leading-relaxed text-muted-foreground">
            Move through the habit and task together. Completing either one here updates its source
            record too.
          </p>
        </div>
      </header>

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-small text-destructive">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4" aria-label="Routine items">
        {routine.items.map((item) => {
          if (item.itemType === "habit") {
            const doneToday = isWithinToday(
              item.habit.lastCompletedAt,
              bounds.startMs,
              bounds.endMs
            );
            return (
              <SoftCard key={item._id} as="article" padding="lg" className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Pill tone="moss">Habit</Pill>
                    <div>
                      <h2 className="text-h2 font-serif">{item.habit.name}</h2>
                      <p className="text-small text-muted-foreground">
                        Daily cadence · current streak {item.habit.currentStreak}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={doneToday ? "subtle" : "primary"}
                    disabled={doneToday || pendingItemId === item._id}
                    onClick={() => {
                      void handleComplete(item._id);
                    }}
                  >
                    {doneToday
                      ? "Habit complete today"
                      : pendingItemId === item._id
                        ? "Completing..."
                        : "Complete habit"}
                  </Button>
                </div>
                <Link
                  href={`/habits/${item.habit._id}`}
                  className="inline-flex text-small font-medium text-primary hover:underline"
                >
                  Open habit detail
                </Link>
              </SoftCard>
            );
          }

          const taskDone = item.task.status === "done";
          return (
            <SoftCard key={item._id} as="article" padding="lg" className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <Pill tone="slate">Task</Pill>
                  <div>
                    <h2 className="text-h2 font-serif">{item.task.title}</h2>
                    <p className="text-small text-muted-foreground">
                      Priority {item.task.priority} · status {item.task.status.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={taskDone ? "subtle" : "primary"}
                  disabled={taskDone || pendingItemId === item._id}
                  onClick={() => {
                    void handleComplete(item._id);
                  }}
                >
                  {taskDone
                    ? "Task complete"
                    : pendingItemId === item._id
                      ? "Completing..."
                      : "Complete task"}
                </Button>
              </div>
              <Link
                href="/tasks"
                className="inline-flex text-small font-medium text-primary hover:underline"
              >
                Open tasks
              </Link>
            </SoftCard>
          );
        })}
      </section>
    </main>
  );
}
