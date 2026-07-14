import type { Id } from "@/convex/_generated/dataModel";
import { Flame } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type TodayHabit = {
  _id: Id<"habits">;
  name: string;
  cadence: "daily" | "weekly";
  currentStreak: number;
};

type TodayHabitStripProps = {
  habits: TodayHabit[];
};

export function TodayHabitStrip({ habits }: TodayHabitStripProps) {
  const visibleHabits = habits.slice(0, 5);
  const hiddenHabitCount = Math.max(habits.length - visibleHabits.length, 0);

  return (
    <section
      className="rounded-3xl border border-border/80 bg-card/90 p-5 shadow-[0_10px_30px_rgba(26,25,23,0.08)]"
      aria-labelledby="today-habit-strip-heading"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Flame className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="today-habit-strip-heading" className="font-heading text-xl font-semibold text-foreground">
            Habit strip
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A small glance at routines you may want to keep in view today.
          </p>
        </div>
      </div>

      {visibleHabits.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-3">
          {visibleHabits.map((habit) => (
            <Link
              key={habit._id}
              href={`/habits/${habit._id}`}
              className="min-h-11 rounded-full border border-border bg-background/75 px-4 py-2 text-sm transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span className="font-medium text-foreground">{habit.name}</span>
              <span className="ml-2 text-muted-foreground">
                {habit.currentStreak > 0 ? `${habit.currentStreak} in a row` : habit.cadence}
              </span>
            </Link>
          ))}
          {hiddenHabitCount > 0 ? (
            <span className="inline-flex min-h-11 items-center rounded-full border border-dashed border-border px-4 py-2 text-sm text-muted-foreground">
              +{hiddenHabitCount} more
            </span>
          ) : null}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-5">
          <p className="text-sm font-medium text-foreground">No habits pinned here yet.</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Habits can stay gentle. Add one tiny repeatable thing when you want this strip to
            hold it for you.
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <Link href="/habits">Open Habits</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
