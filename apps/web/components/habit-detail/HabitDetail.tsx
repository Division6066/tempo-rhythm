"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { HABIT_NAME_MAX, parseHabitName } from "@/components/habits-library/habitForm";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useLocalDayBounds } from "@/lib/useLocalDayBounds";
import { cn } from "@/lib/utils";
import { buildSixWeekGrid, type SixWeekCell } from "./sixWeekGrid";

const SAVE_ERROR = "That didn't save. Try again when you want.";
const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

type HabitView = {
  name: string;
  cadence: "daily" | "weekly";
  currentStreak: number;
  longestStreak: number;
};

type CheckInView = {
  localDate: string;
  deletedAt?: number;
};

function cellAriaLabel(localDate: string, checked: boolean): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDate);
  if (!match) {
    return checked ? `${localDate}, checked` : localDate;
  }
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Number(match[1]), month - 1, day);
  const spoken = `${WEEKDAYS[date.getDay()]} ${day} ${MONTHS[month - 1]}`;
  return checked ? `${spoken}, checked` : spoken;
}

function checkedDateSet(
  checkIns: readonly CheckInView[],
  pending: ReadonlyMap<string, boolean>
): Set<string> {
  const dates = new Set<string>();
  for (const row of checkIns) {
    if (row.deletedAt !== undefined) {
      continue;
    }
    dates.add(row.localDate);
  }
  for (const [localDate, on] of pending) {
    if (on) {
      dates.add(localDate);
    } else {
      dates.delete(localDate);
    }
  }
  return dates;
}

export function HabitDetail({ habitId }: { habitId: string }) {
  const id = habitId as Id<"habits">;
  const bounds = useLocalDayBounds();
  const today = useMemo(() => new Date(bounds.startMs), [bounds.startMs]);
  const range = useMemo(() => {
    const grid = buildSixWeekGrid(today, new Set());
    return {
      fromLocalDate: grid[0][0].localDate,
      toLocalDate: grid[5][6].localDate,
    };
  }, [today]);
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  const canQuery = isAuthenticated && profile != null;
  const habit = useQuery(api.habits.get, canQuery ? { habitId: id } : "skip");
  const checkIns = useQuery(
    api.habitCheckIns.listForHabit,
    canQuery ? { habitId: id, ...range } : "skip"
  );
  const isLoading =
    isAuthLoading ||
    (isAuthenticated && profile === undefined) ||
    (canQuery && (habit === undefined || checkIns === undefined));

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!isAuthenticated || profile === null) {
    return (
      <main className="mx-auto w-full max-w-4xl p-8 text-center">
        <SoftCard className="mx-auto max-w-xl">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Habit</h1>
          <p className="mt-3 text-muted-foreground">
            Sign in again to see this habit and its check-in days.
          </p>
          <Button asChild className="mt-6">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </SoftCard>
      </main>
    );
  }

  if (habit === null) {
    return (
      <main className="mx-auto w-full max-w-4xl p-8">
        <SoftCard className="mx-auto max-w-xl text-center">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            This habit isn&apos;t here any more.
          </h1>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/habits">Back to habits</Link>
          </Button>
        </SoftCard>
      </main>
    );
  }

  if (habit === undefined || checkIns === undefined) {
    return <DetailSkeleton />;
  }

  return <HabitDetailBody habitId={id} habit={habit} checkIns={checkIns} today={today} />;
}

function HabitDetailBody({
  habitId,
  habit,
  checkIns,
  today,
}: {
  habitId: Id<"habits">;
  habit: HabitView;
  checkIns: CheckInView[];
  today: Date;
}) {
  const check = useMutation(api.habitCheckIns.check);
  const undo = useMutation(api.habitCheckIns.undo);
  const update = useMutation(api.habits.update);
  const [pending, setPending] = useState<ReadonlyMap<string, boolean>>(() => new Map());
  const [busy, setBusy] = useState<ReadonlySet<string>>(() => new Set());
  const [streak, setStreak] = useState<
    { currentStreak: number; longestStreak: number } | undefined
  >(undefined);
  const [draftName, setDraftName] = useState<string | undefined>(undefined);
  const [savingName, setSavingName] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const toggleGeneration = useRef(0);
  const liveStreak = useRef({
    currentStreak: habit.currentStreak,
    longestStreak: habit.longestStreak,
  });

  useEffect(() => {
    setPending((prev) => {
      if (prev.size === 0) {
        return prev;
      }
      const server = new Set(
        checkIns.flatMap((row) => (row.deletedAt === undefined ? [row.localDate] : []))
      );
      const next = new Map(prev);
      let changed = false;
      for (const [localDate, want] of prev) {
        if (server.has(localDate) === want) {
          next.delete(localDate);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [checkIns]);

  useEffect(() => {
    // The live habit query wins as soon as it moves, even when its streaks
    // differ from a toggle response that has not landed yet.
    liveStreak.current = {
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
    };
    setStreak((prev) => {
      if (prev === undefined) {
        return prev;
      }
      return undefined;
    });
  }, [habit.currentStreak, habit.longestStreak]);

  const grid = useMemo(
    () => buildSixWeekGrid(today, checkedDateSet(checkIns, pending)),
    [today, checkIns, pending]
  );
  const name = draftName ?? habit.name;
  const currentStreak = streak?.currentStreak ?? habit.currentStreak;
  const longestStreak = streak?.longestStreak ?? habit.longestStreak;

  const toggle = (cell: SixWeekCell) => {
    if (cell.isFuture || busy.has(cell.localDate)) {
      return;
    }
    const nextChecked = !cell.checked;
    setNotice(null);
    setBusy((prev) => {
      const next = new Set(prev);
      next.add(cell.localDate);
      return next;
    });
    setPending((prev) => {
      const next = new Map(prev);
      next.set(cell.localDate, nextChecked);
      return next;
    });

    const generation = toggleGeneration.current + 1;
    toggleGeneration.current = generation;
    const streaksAtStart = {
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
    };
    const action = cell.checked
      ? undo({ habitId, localDate: cell.localDate })
      : check({ habitId, localDate: cell.localDate, source: "habits" });

    void action
      .then((result) => {
        if (generation !== toggleGeneration.current) {
          return;
        }
        const live = liveStreak.current;
        if (
          live.currentStreak !== streaksAtStart.currentStreak ||
          live.longestStreak !== streaksAtStart.longestStreak
        ) {
          setStreak(undefined);
          return;
        }
        setStreak({
          currentStreak: result.currentStreak,
          longestStreak: result.longestStreak,
        });
      })
      .catch(() => {
        setPending((prev) => {
          const next = new Map(prev);
          next.delete(cell.localDate);
          return next;
        });
        if (generation === toggleGeneration.current) {
          setNotice(SAVE_ERROR);
        }
      })
      .finally(() => {
        setBusy((prev) => {
          const next = new Set(prev);
          next.delete(cell.localDate);
          return next;
        });
      });
  };

  const saveName = () => {
    if (savingName) {
      return;
    }
    const parsed = parseHabitName(name);
    if (!parsed.ok) {
      if (name.trim().length === 0) {
        setDraftName(undefined);
        setNotice(null);
        return;
      }
      setNotice(parsed.error);
      return;
    }
    if (parsed.name === habit.name) {
      setDraftName(undefined);
      setNotice(null);
      return;
    }
    setSavingName(true);
    setNotice(null);
    void update({ habitId, name: parsed.name })
      .then(() => setDraftName(undefined))
      .catch(() => setNotice(SAVE_ERROR))
      .finally(() => setSavingName(false));
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
      <p>
        <Link
          href="/habits"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Back to habits
        </Link>
      </p>

      <header className="space-y-4">
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            saveName();
          }}
        >
          <Label htmlFor="habit-detail-name">Habit name</Label>
          <Input
            id="habit-detail-name"
            value={name}
            maxLength={HABIT_NAME_MAX}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={saveName}
            disabled={savingName}
            autoComplete="off"
          />
        </form>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Cadence</span> {habit.cadence}
        </p>
        <dl className="flex flex-wrap gap-6">
          <div>
            <dt className="text-sm text-muted-foreground">Current streak</dt>
            <dd className="font-heading text-3xl font-semibold text-foreground">{currentStreak}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Longest streak</dt>
            <dd className="font-heading text-3xl font-semibold text-foreground">{longestStreak}</dd>
          </div>
        </dl>
      </header>

      <section aria-labelledby="habit-six-week-heading" className="space-y-3">
        <h2
          id="habit-six-week-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          Six weeks
        </h2>
        <p className="text-sm text-muted-foreground">
          Tap a day to check it, or tap again to undo. Days that have not happened yet stay quiet.
        </p>
        {notice ? <output className="block text-sm text-muted-foreground">{notice}</output> : null}
        <div className="grid grid-cols-7 gap-2" data-testid="habit-six-week-grid">
          {WEEKDAY_HEADERS.map((label) => (
            <div
              key={label}
              aria-hidden
              className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {label}
            </div>
          ))}
          {grid.flat().map((cell) => (
            <button
              key={cell.localDate}
              type="button"
              aria-pressed={cell.checked}
              aria-current={cell.isToday ? "date" : undefined}
              aria-label={cellAriaLabel(cell.localDate, cell.checked)}
              disabled={cell.isFuture || busy.has(cell.localDate)}
              onClick={() => toggle(cell)}
              className={cn(
                "flex min-h-11 items-center justify-center rounded-xl border text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed",
                cell.checked
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground",
                cell.isFuture ? "opacity-40" : "hover:border-primary",
                cell.isToday ? "ring-2 ring-primary/40" : ""
              )}
            >
              {Number(cell.localDate.slice(8))}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function DetailSkeleton() {
  return (
    <main className="mx-auto w-full max-w-4xl p-8" aria-hidden>
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
        <div className="h-16 animate-pulse rounded-3xl bg-muted motion-reduce:animate-none" />
        <div className="h-64 animate-pulse rounded-3xl bg-muted motion-reduce:animate-none" />
      </div>
    </main>
  );
}
