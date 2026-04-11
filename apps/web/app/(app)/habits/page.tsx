"use client";

import { useMutation, useQuery } from "convex/react";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

export default function HabitsPage() {
  const habits = useQuery(api.habits.list);
  const completeToday = useMutation(api.habits.completeToday);

  if (habits === undefined) {
    return (
      <div className="container mx-auto max-w-4xl px-6 py-12">
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12" dir="rtl">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#D97757] to-[#E8A87C] text-primary-foreground shadow-inner">
            <Sparkles className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">מעקב</p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground">הרגלים</h1>
          </div>
        </div>
        <Button asChild variant="outline" className="rounded-xl border-border bg-card/80">
          <Link href="/dashboard">חזרה ללוח הבית</Link>
        </Button>
      </header>

      {habits.length === 0 ? (
        <SoftCard className="grain-bg text-center text-muted-foreground">
          עדיין אין הרגלים. הוסיפו הרגלים מהאפליקציה כדי לעקוב כאן.
        </SoftCard>
      ) : (
        <ul className="space-y-4">
          {habits.map((habit) => {
            const cap = Math.max(habit.longestStreak, habit.currentStreak, 1);
            const pct = Math.min(100, Math.round((habit.currentStreak / cap) * 100));
            return (
              <li key={habit._id}>
                <SoftCard className="grain-bg">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-heading text-2xl font-semibold text-foreground">{habit.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{habit.cadence === "daily" ? "יומי" : "שבועי"}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => void completeToday({ habitId: habit._id })}
                    >
                      סמן הושלם היום
                    </Button>
                  </div>

                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">רצף נוכחי</span>
                    <span className="font-semibold tabular-nums">{habit.currentStreak}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)]">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-[#D97757] to-[#E8A87C] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">רצף שיא: {habit.longestStreak}</p>
                </SoftCard>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
