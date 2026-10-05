"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useLocalDayBounds } from "@/lib/useLocalDayBounds";
import { cn } from "@/lib/utils";
import { checkedHabitIds, localDateKey } from "../habit-checkin-strip/checkedState";
import { habitHref, parseHabitName } from "./habitForm";

const SAVE_ERROR = "That didn't save. Try again when you want.";

type Cadence = "daily" | "weekly";

type HabitRowData = {
  _id: Id<"habits">;
  name: string;
  cadence: Cadence;
  currentStreak: number;
};

export function HabitsLibrary() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  const bounds = useLocalDayBounds();
  const localDate = localDateKey(new Date(bounds.startMs));
  const canQuery = isAuthenticated && profile != null;
  const habits = useQuery(api.habits.list, canQuery ? {} : "skip");
  const checkIns = useQuery(api.habitCheckIns.listForDate, canQuery ? { localDate } : "skip");

  if (isAuthLoading || (isAuthenticated && profile === undefined)) {
    return <LibrarySkeleton />;
  }
  if (!isAuthenticated || profile === null) {
    return null;
  }
  if (habits === undefined || checkIns === undefined) {
    return <LibrarySkeleton />;
  }

  const liveHabits = habits.filter((habit) => habit.deletedAt === undefined);
  const checked = checkedHabitIds(checkIns);

  return (
    <section className="flex flex-col gap-5" aria-labelledby="habits-library-heading">
      <h2 id="habits-library-heading" className="sr-only">
        Your habits
      </h2>
      <NewHabitForm />
      {liveHabits.length === 0 ? (
        <p className="text-sm font-medium text-foreground">
          No habits yet. Add your first one above whenever you&apos;re ready.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {liveHabits.map((habit) => (
            <HabitRow
              key={`${habit._id}:${localDate}`}
              habit={habit}
              localDate={localDate}
              checked={checked.has(habit._id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function NewHabitForm() {
  const createHabit = useMutation(api.habits.create);
  const [name, setName] = useState("");
  const [cadence, setCadence] = useState<Cadence>("daily");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="rounded-3xl border border-dashed border-border bg-muted/30 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = parseHabitName(name);
        if (!parsed.ok) {
          setError(parsed.error);
          return;
        }
        setError(null);
        setBusy(true);
        void createHabit({ name: parsed.name, cadence })
          .then(() => setName(""))
          .catch(() => setError(SAVE_ERROR))
          .finally(() => setBusy(false));
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="habits-library-name">Add a habit</Label>
          <Input
            id="habits-library-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Drink water, take meds, step outside..."
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="habits-library-cadence">Cadence</Label>
          <select
            id="habits-library-cadence"
            value={cadence}
            onChange={(event) => setCadence(event.target.value as Cadence)}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <Button type="submit" disabled={busy}>
          Add habit
        </Button>
      </div>
      {error ? <output className="mt-3 block text-sm text-muted-foreground">{error}</output> : null}
    </form>
  );
}

function HabitRow({
  habit,
  localDate,
  checked,
}: {
  habit: HabitRowData;
  localDate: string;
  checked: boolean;
}) {
  const check = useMutation(api.habitCheckIns.check);
  const undo = useMutation(api.habitCheckIns.undo);
  const update = useMutation(api.habits.update);
  const [busy, setBusy] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(habit.name);
  const [streak, setStreak] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const shownStreak = streak ?? habit.currentStreak;

  const toggle = () => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    const action = checked
      ? undo({ habitId: habit._id, localDate })
      : check({ habitId: habit._id, localDate, source: "habits" });
    void action
      .then((result) => setStreak(result.currentStreak))
      .catch(() => setNotice(SAVE_ERROR))
      .finally(() => setBusy(false));
  };

  const saveRename = () => {
    const parsed = parseHabitName(draft);
    if (!parsed.ok) {
      setNotice(parsed.error);
      return;
    }
    setBusy(true);
    setNotice(null);
    void update({ habitId: habit._id, name: parsed.name })
      .then(() => setRenaming(false))
      .catch(() => setNotice(SAVE_ERROR))
      .finally(() => setBusy(false));
  };

  return (
    <li className="rounded-3xl border border-border/80 bg-card/90 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {renaming ? (
            <form
              className="flex flex-wrap items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                saveRename();
              }}
            >
              <Label htmlFor={`rename-${habit._id}`} className="sr-only">
                Rename {habit.name}
              </Label>
              <Input
                id={`rename-${habit._id}`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                autoComplete="off"
              />
              <Button type="submit" size="sm" disabled={busy}>
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setRenaming(false);
                  setDraft(habit.name);
                  setNotice(null);
                }}
              >
                Cancel
              </Button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={habitHref(habit._id)}
                className="font-heading text-xl font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {habit.name}
              </Link>
              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {habit.cadence}
              </span>
              <button
                type="button"
                onClick={() => {
                  setDraft(habit.name);
                  setRenaming(true);
                }}
                className="text-sm text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label={`Rename ${habit.name}`}
              >
                Rename
              </button>
            </div>
          )}
          {shownStreak >= 2 ? (
            <p className="mt-1 text-xs text-muted-foreground">{shownStreak} days in a row</p>
          ) : null}
          {notice ? (
            <output className="mt-1 block text-xs text-muted-foreground">{notice}</output>
          ) : null}
        </div>
        <button
          type="button"
          aria-pressed={checked}
          aria-label={checked ? `Undo today's check for ${habit.name}` : `Check ${habit.name} for today`}
          disabled={busy}
          onClick={toggle}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-70",
            checked
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border bg-background text-foreground hover:border-primary hover:text-primary",
          )}
        >
          {checked ? "Checked today" : "Check today"}
        </button>
      </div>
    </li>
  );
}

function LibrarySkeleton() {
  return (
    <div
      className="h-40 animate-pulse rounded-3xl bg-muted"
      aria-hidden
      data-testid="habits-library-loading"
    />
  );
}
