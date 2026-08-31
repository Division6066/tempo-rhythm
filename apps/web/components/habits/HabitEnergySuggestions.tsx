"use client";

import { useMutation } from "convex/react";
import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import {
  habitRoutineCopy,
  resolveEnergySuggestion,
  type EnergySuggestion,
} from "@tempo/utils";

type HabitEnergySource = {
  _id: Id<"habits">;
  name: string;
  completedToday: boolean;
};

function suggestionsFromHabits(
  habits: readonly HabitEnergySource[],
): EnergySuggestion[] {
  return habits
    .filter((habit) => !habit.completedToday)
    .slice(0, 3)
    .map((habit) => ({
      id: habit._id,
      habitName: habit.name,
      energy: "low",
      title: `A gentle ${habit.name} step`,
      body: "One small repeat is enough for now.",
      status: "pending",
    }));
}

export function HabitEnergySuggestions({
  habits,
}: {
  habits: readonly HabitEnergySource[];
}) {
  const completeToday = useMutation(api.habits.completeToday);
  const [suggestions, setSuggestions] = useState<EnergySuggestion[]>(() =>
    suggestionsFromHabits(habits),
  );
  const [pendingId, setPendingId] = useState<string | null>(null);

  const pending = useMemo(
    () => suggestions.filter((suggestion) => suggestion.status !== "rejected"),
    [suggestions],
  );

  if (pending.length === 0) {
    return null;
  }

  const accept = async (suggestionId: string) => {
    setPendingId(suggestionId);
    try {
      await completeToday({ habitId: suggestionId as Id<"habits"> });
      setSuggestions((current) =>
        resolveEnergySuggestion(current, suggestionId, "accepted"),
      );
    } finally {
      setPendingId(null);
    }
  };

  const reject = (suggestionId: string) => {
    setSuggestions((current) =>
      resolveEnergySuggestion(current, suggestionId, "rejected"),
    );
  };

  return (
    <section
      className="rounded-3xl border border-border/80 bg-card/90 p-5"
      aria-labelledby="habit-energy-heading"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            id="habit-energy-heading"
            className="font-heading text-xl font-semibold text-foreground"
          >
            Energy-aware suggestions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {habitRoutineCopy.habits.suggestionPrompt}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {pending.map((suggestion) => (
          <li
            key={suggestion.id}
            className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3"
          >
            <p className="font-medium text-foreground">{suggestion.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {suggestion.body}
            </p>
            {suggestion.status === "accepted" ? (
              <p className="mt-3 text-sm font-medium text-primary">
                Added as today&apos;s check for {suggestion.habitName}.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pendingId === suggestion.id}
                  onClick={() => {
                    void accept(suggestion.id);
                  }}
                  className="inline-flex min-h-11 items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-70"
                >
                  {habitRoutineCopy.habits.acceptLabel}
                </button>
                <button
                  type="button"
                  disabled={pendingId === suggestion.id}
                  onClick={() => reject(suggestion.id)}
                  className="inline-flex min-h-11 items-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {habitRoutineCopy.habits.rejectLabel}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
