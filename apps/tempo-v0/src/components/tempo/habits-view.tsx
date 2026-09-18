import { toast } from "sonner";
import { EmptyState } from "@/components/tempo/empty-state";
import { ErrorState } from "@/components/tempo/error-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isHabitCompletedOnUtcDay } from "@/lib/tempo/habit-streak";
import { useTempo } from "@/lib/tempo/use-tempo";

export function HabitsView() {
  const { snapshot, adapter, setDemo } = useTempo();
  const now = Date.now();

  if (snapshot.demo === "error") {
    return (
      <ErrorState
        message="Habits failed to load. The adapter is in the error fixture."
        onRetry={() => setDemo("seeded")}
      />
    );
  }

  const habits = snapshot.habits.filter((h) => h.deletedAt === undefined);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="space-y-1">
        <p className="text-sm text-muted">Habits</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">The quiet repeats</h1>
      </header>

      {habits.length === 0 ? (
        <EmptyState
          title="No habits yet"
          body="Tempo will keep a streak once there is something worth repeating. Nothing here is a failure."
        />
      ) : (
        <ul className="space-y-3">
          {habits.map((habit) => {
            const done = isHabitCompletedOnUtcDay(habit.lastCompletedAt, now);
            return (
              <li key={habit._id}>
                <Card className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-[15px] text-ink">{habit.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {habit.currentStreak} in a row · best {habit.longestStreak} · {habit.cadence}
                    </p>
                  </div>
                  <Button
                    variant={done ? "secondary" : "default"}
                    onClick={async () => {
                      const next = await adapter.completeHabitToday({ habitId: habit._id });
                      toast(next.currentStreak === habit.currentStreak ? "Already counted today." : "Checked in.");
                    }}
                  >
                    {done ? "Done" : "Check in"}
                  </Button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
