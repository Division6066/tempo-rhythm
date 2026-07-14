"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  buildEnergySuggestion,
  calculateHabitCompletion,
  getLocalDateKey,
} from "../../../../convex/lib/habit_logic";

type HabitEnergy = "low" | "medium" | "high";

type DemoHabit = {
  id: string;
  name: string;
  energy: HabitEnergy;
  currentStreak: number;
  longestStreak: number;
  historyKeys: string[];
  lastCompletedAt?: number;
};

type DemoTask = {
  id: string;
  title: string;
};

type DemoRoutine = {
  id: string;
  name: string;
  itemIds: string[];
};

type DemoStore = {
  habits: DemoHabit[];
  tasks: DemoTask[];
  routines: DemoRoutine[];
  suggestionStatus: "pending" | "accepted" | "rejected";
};

type ScreenMode = "habits" | "routines";

const storageKey = "tempo:habits-routines:v1";

const starterStore: DemoStore = {
  habits: [
    {
      id: "habit-drink-water",
      name: "Drink water",
      energy: "low",
      currentStreak: 0,
      longestStreak: 0,
      historyKeys: [],
    },
    {
      id: "habit-stretch",
      name: "Gentle stretch",
      energy: "low",
      currentStreak: 2,
      longestStreak: 3,
      historyKeys: ["2026-07-12", "2026-07-13"],
    },
  ],
  tasks: [{ id: "task-clear-desk", title: "Clear desk" }],
  routines: [],
  suggestionStatus: "pending",
};

function loadStore(): DemoStore {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return starterStore;
    }
    return { ...starterStore, ...JSON.parse(raw) } as DemoStore;
  } catch {
    return starterStore;
  }
}

function saveStore(store: DemoStore): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(store));
  } catch {
    // The in-memory state still works if storage is unavailable.
  }
}

function StateCard({ title, body }: { title: string; body: string }) {
  return (
    <Card className="bg-background/70">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{body}</p>
      </CardContent>
    </Card>
  );
}

export function HabitsRoutinesScreen({ mode }: { mode: ScreenMode }) {
  const [store, setStore] = useState<DemoStore | null>(null);
  const [routineName, setRoutineName] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("Loading habits and routines.");

  useEffect(() => {
    setStore(loadStore());
    setAnnouncement("Habits and routines loaded.");
  }, []);

  useEffect(() => {
    if (store) {
      saveStore(store);
    }
  }, [store]);

  const suggestion = useMemo(() => {
    if (!store || store.suggestionStatus === "rejected") {
      return null;
    }
    return buildEnergySuggestion(
      store.habits.map((habit) => ({
        id: habit.id,
        name: habit.name,
        energy: habit.energy,
        currentStreak: habit.currentStreak,
        lastCompletedAt: habit.lastCompletedAt,
      }))
    );
  }, [store]);

  if (!store) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-8">
        <div className="h-12 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="h-80 animate-pulse rounded-[2rem] bg-muted" />
      </main>
    );
  }

  const allRoutineOptions = [
    ...store.habits.map((habit) => ({ id: habit.id, label: habit.name, type: "habit" as const })),
    ...store.tasks.map((task) => ({ id: task.id, label: task.title, type: "task" as const })),
  ];

  function updateStore(updater: (current: DemoStore) => DemoStore): void {
    setStore((current) => (current ? updater(current) : current));
  }

  function checkIn(habitId: string): void {
    updateStore((current) => {
      const now = Date.now();
      return {
        ...current,
        habits: current.habits.map((habit) => {
          if (habit.id !== habitId) {
            return habit;
          }
          const result = calculateHabitCompletion({
            currentStreak: habit.currentStreak,
            longestStreak: habit.longestStreak,
            historyKeys: habit.historyKeys,
            now,
          });
          setAnnouncement(
            result.alreadyDone
              ? `${habit.name} was already checked in today.`
              : `${habit.name} checked in today.`
          );
          return {
            ...habit,
            currentStreak: result.currentStreak,
            longestStreak: result.longestStreak,
            historyKeys: result.historyKeys,
            lastCompletedAt: now,
          };
        }),
      };
    });
  }

  function toggleSelected(itemId: string, checked: boolean): void {
    setSelectedItemIds((current) =>
      checked ? Array.from(new Set([...current, itemId])) : current.filter((id) => id !== itemId)
    );
  }

  function createRoutine(): void {
    const name = routineName.trim();
    if (!name || selectedItemIds.length === 0) {
      setAnnouncement("Add a routine name and at least one item when you are ready.");
      return;
    }
    updateStore((current) => ({
      ...current,
      routines: [
        ...current.routines,
        {
          id: `routine-${Date.now()}`,
          name,
          itemIds: selectedItemIds,
        },
      ],
    }));
    setRoutineName("");
    setSelectedItemIds([]);
    setAnnouncement(`${name} routine created.`);
  }

  function itemLabel(itemId: string): string {
    return allRoutineOptions.find((item) => item.id === itemId)?.label ?? "Routine item";
  }

  const heading = mode === "habits" ? "Habits" : "Routines";
  const summary =
    mode === "habits"
      ? "Small repeated actions, with history that follows you across reloads."
      : "A routine can hold habits and tasks together, in the order that helps today.";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-8">
      <header className="space-y-3">
        <p className="font-semibold text-primary text-sm uppercase tracking-[0.2em]">
          Month-One Alpha
        </p>
        <h1 className="font-heading text-4xl text-foreground">{heading}</h1>
        <p className="max-w-2xl text-muted-foreground">{summary}</p>
      </header>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <section className="space-y-3" aria-labelledby="state-coverage-heading">
        <h2 id="state-coverage-heading" className="font-heading text-2xl">
          Gentle state coverage
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <StateCard
            title="Loading state"
            body="The page shows calm skeleton cards while records load."
          />
          <StateCard
            title="Empty state"
            body="If nothing is here yet, Tempo offers a small starter instead of pressure."
          />
          <StateCard
            title="Error state"
            body="If something cannot load, retrying is safe and no progress is lost."
          />
        </div>
      </section>

      {mode === "habits" ? (
        <>
          <section className="grid gap-4 md:grid-cols-2" aria-label="Habit rows">
            {store.habits.length === 0 ? (
              <Card className="md:col-span-2 border-dashed bg-muted/30">
                <CardContent className="p-8 text-center">
                  <p className="font-medium">No habits yet.</p>
                  <p className="mt-2 text-muted-foreground text-sm">
                    Start with one small action that feels possible today.
                  </p>
                </CardContent>
              </Card>
            ) : (
              store.habits.map((habit) => {
                const checkedToday = habit.historyKeys.includes(getLocalDateKey(Date.now()));
                return (
                  <Card key={habit.id} className="rounded-3xl">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="font-heading text-2xl">{habit.name}</CardTitle>
                          <p className="mt-1 text-muted-foreground text-sm">
                            {habit.energy} energy · {habit.historyKeys.length} check-ins saved
                          </p>
                        </div>
                        <div className="rounded-2xl bg-primary/10 px-3 py-2 text-center text-primary">
                          <div className="font-heading text-2xl">{habit.currentStreak}</div>
                          <div className="text-xs">day streak</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="font-medium">{habit.currentStreak} day</p>
                      <p className="text-muted-foreground text-sm">
                        Longest run: {habit.longestStreak} day
                        {habit.longestStreak === 1 ? "" : "s"}.
                      </p>
                      {checkedToday ? (
                        <p className="rounded-2xl bg-primary/10 px-4 py-3 text-primary text-sm">
                          Checked in today.
                        </p>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => checkIn(habit.id)}
                          aria-label={`Check in for ${habit.name}`}
                        >
                          Check in today
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </section>

          <section aria-labelledby="energy-suggestion-heading">
            <Card className="rounded-3xl border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle id="energy-suggestion-heading" className="font-heading text-2xl">
                  Energy suggestion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {store.suggestionStatus === "rejected" ? (
                  <>
                    <p className="text-muted-foreground">
                      Suggestion set aside. You can bring it back.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        updateStore((current) => ({ ...current, suggestionStatus: "pending" }))
                      }
                    >
                      Show suggestion
                    </Button>
                  </>
                ) : suggestion ? (
                  <>
                    <p className="text-foreground">{suggestion.reason}</p>
                    <p className="font-medium">{suggestion.title}</p>
                    {store.suggestionStatus === "accepted" ? (
                      <p className="text-primary">Accepted. It is ready when you want it.</p>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          onClick={() =>
                            updateStore((current) => ({ ...current, suggestionStatus: "accepted" }))
                          }
                        >
                          Accept suggestion
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            updateStore((current) => ({ ...current, suggestionStatus: "rejected" }))
                          }
                        >
                          Reject suggestion
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">No suggestion right now. Rest counts too.</p>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      ) : (
        <>
          <section aria-labelledby="routine-builder-heading">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle id="routine-builder-heading" className="font-heading text-2xl">
                  Create a routine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="routine-name" className="font-medium text-sm">
                    Routine name
                  </label>
                  <Input
                    id="routine-name"
                    value={routineName}
                    onChange={(event) => setRoutineName(event.target.value)}
                    placeholder="Name the routine"
                  />
                </div>
                <fieldset className="space-y-3">
                  <legend className="font-medium text-sm">Include habits and tasks</legend>
                  {allRoutineOptions.map((item) => (
                    <label key={item.id} className="flex items-center gap-3 rounded-2xl border p-3">
                      <input
                        type="checkbox"
                        checked={selectedItemIds.includes(item.id)}
                        onChange={(event) => toggleSelected(item.id, event.target.checked)}
                        aria-label={`Include ${item.label}`}
                      />
                      <span>
                        {item.label}
                        <span className="ml-2 text-muted-foreground text-xs">({item.type})</span>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <Button type="button" onClick={createRoutine}>
                  Create routine
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4" aria-label="Routine list">
            {store.routines.length === 0 ? (
              <Card className="border-dashed bg-muted/30">
                <CardContent className="p-8 text-center">
                  <p className="font-medium">No routines yet.</p>
                  <p className="mt-2 text-muted-foreground text-sm">
                    Combine one habit and one task when you want a tiny sequence.
                  </p>
                </CardContent>
              </Card>
            ) : (
              store.routines.map((routine) => (
                <Card key={routine.id} className="rounded-3xl">
                  <CardHeader>
                    <h2 className="font-heading text-2xl">{routine.name}</h2>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {routine.itemIds.map((itemId, index) => (
                        <li key={itemId} className="rounded-2xl bg-muted/40 px-4 py-3">
                          {index + 1}. {itemLabel(itemId)}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))
            )}
          </section>
        </>
      )}
    </main>
  );
}
