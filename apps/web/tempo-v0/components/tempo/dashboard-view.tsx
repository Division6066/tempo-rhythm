import { Link } from "@/lib/tempo-graft/router";
import { EmptyState } from "@tempo-v0/components/tempo/empty-state";
import { ErrorState } from "@tempo-v0/components/tempo/error-state";
import { WeekChart } from "@tempo-v0/components/tempo/week-chart";
import { Badge } from "@tempo-v0/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@tempo-v0/components/ui/card";
import { Progress } from "@tempo-v0/components/ui/progress";
import { useTempo } from "@tempo-v0/lib/tempo/use-tempo";
import { computeInsightsSummary } from "@tempo-v0/lib/tempo/insights";
import { isoDay, startOfLocalDay, startOfLocalWeek, DAY_MS } from "@tempo-v0/lib/tempo/windows";
import type { DayCompletion } from "@tempo-v0/lib/tempo/types";

function weekFromTasks(tasks: { status: string; updatedAt: number; deletedAt?: number }[]): DayCompletion[] {
  const today = startOfLocalDay();
  const days: DayCompletion[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const start = today - i * DAY_MS;
    const end = start + DAY_MS;
    const completed = tasks.filter(
      (t) => t.deletedAt === undefined && t.status === "done" && t.updatedAt >= start && t.updatedAt < end,
    ).length;
    days.push({
      date: isoDay(start),
      label: new Date(start).toLocaleDateString(undefined, { weekday: "short" }),
      completed,
    });
  }
  return days;
}

export function DashboardView() {
  const { snapshot, insights, setDemo } = useTempo();

  if (snapshot.demo === "error") {
    return (
      <ErrorState
        message="Dashboard refused to load because the adapter is in the error fixture."
        onRetry={() => setDemo("seeded")}
      />
    );
  }

  const empty = snapshot.demo === "empty";
  const week = weekFromTasks(snapshot.tasks);
  const avoided = snapshot.tasks
    .filter((t) => t.deletedAt === undefined && (t.status === "todo" || t.status === "in_progress") && (t.avoidCount ?? 0) > 0)
    .sort((a, b) => (b.avoidCount ?? 0) - (a.avoidCount ?? 0));
  const commitments = snapshot.memories.filter((m) => m.deletedAt === undefined && m.metadata?.kind === "commitment");
  const liveInsights = computeInsightsSummary({
    tasks: snapshot.tasks,
    habits: snapshot.habits,
    goals: snapshot.goals,
    todayStartMs: startOfLocalDay(),
    todayEndMs: startOfLocalDay() + DAY_MS,
    weekStartMs: startOfLocalWeek(),
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="space-y-1">
        <p className="text-sm text-muted">Pulse</p>
        <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">What the week actually did</h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          Counts come from the same rules as the live insights query. Soft-deleted rows are out. Energy defaults to medium.
        </p>
      </header>

      {empty ? (
        <EmptyState
          title="No pulse yet"
          body="Finish one small thing and this page will fill with real numbers — not a placeholder chart."
          actionLabel="Go to today"
          onAction={() => {
            window.location.href = "/today";
          }}
        />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Open" value={liveInsights.tasksOpen} />
            <Stat label="Due today" value={liveInsights.tasksDueToday} />
            <Stat label="Overdue" value={liveInsights.tasksOverdue} tone="overdue" />
            <Stat label="Finished this week" value={liveInsights.tasksCompletedThisWeek} tone="ok" />
          </section>

          <div className="grid gap-4 lg:grid-cols-5">
            <Card className="p-5 lg:col-span-3">
              <CardHeader>
                <CardTitle>Finished per day</CardTitle>
                <CardDescription>Live from completed tasks in the mock store.</CardDescription>
              </CardHeader>
              <WeekChart data={week} />
            </Card>
            <Card className="p-5 lg:col-span-2">
              <CardHeader>
                <CardTitle>Energy mix</CardTitle>
                <CardDescription>Open tasks, missing energy counted as medium.</CardDescription>
              </CardHeader>
              <EnergyMix insights={insights} />
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <CardHeader>
                <CardTitle>What you keep avoiding</CardTitle>
                <CardDescription>Skip count is stored on the task. Tempo does not wait to be asked.</CardDescription>
              </CardHeader>
              {avoided.length === 0 ? (
                <p className="text-sm text-muted">Nothing is being ducked right now.</p>
              ) : (
                <ul className="space-y-3">
                  {avoided.map((task) => (
                    <li key={task._id} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-ink">{task.title}</p>
                        <p className="text-xs text-muted">skipped {task.avoidCount} times</p>
                      </div>
                      <Badge variant="overdue">{task.priority}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-5">
              <CardHeader>
                <CardTitle>Commitments on file</CardTitle>
                <CardDescription>Memories tagged as promises you made to yourself.</CardDescription>
              </CardHeader>
              {commitments.length === 0 ? (
                <p className="text-sm text-muted">No commitments stored.</p>
              ) : (
                <ul className="space-y-3">
                  {commitments.map((memory) => (
                    <li key={memory._id} className="text-sm leading-relaxed text-ink">
                      {memory.content}
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/memory" className="mt-4 inline-block text-sm text-accent hover:underline">
                Open memory
              </Link>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <CardHeader>
                <CardTitle>Habits</CardTitle>
                <CardDescription>
                  {insights.habitsWithActiveStreak} active · best ever {insights.bestStreak}
                </CardDescription>
              </CardHeader>
              <ul className="space-y-3">
                {snapshot.habits
                  .filter((h) => h.deletedAt === undefined)
                  .map((habit) => (
                    <li key={habit._id} className="flex items-center justify-between gap-3">
                      <span className="text-sm">{habit.name}</span>
                      <span className="font-mono text-sm tabular-nums text-muted">{habit.currentStreak}d</span>
                    </li>
                  ))}
              </ul>
            </Card>
            <Card className="p-5">
              <CardHeader>
                <CardTitle>Goals</CardTitle>
                <CardDescription>Average progress {insights.goalsAverageProgressPercent}%</CardDescription>
              </CardHeader>
              <ul className="space-y-4">
                {snapshot.goals
                  .filter((g) => g.deletedAt === undefined && g.status === "active")
                  .map((goal) => (
                    <li key={goal._id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{goal.title}</span>
                        <span className="font-mono tabular-nums text-muted">{goal.progressPercent}%</span>
                      </div>
                      <Progress value={goal.progressPercent} />
                    </li>
                  ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "overdue" | "ok";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
      <p
        className={
          tone === "overdue"
            ? "mt-2 font-display text-3xl tabular-nums text-overdue"
            : tone === "ok"
              ? "mt-2 font-display text-3xl tabular-nums text-ok"
              : "mt-2 font-display text-3xl tabular-nums text-ink"
        }
      >
        {value}
      </p>
    </div>
  );
}

function EnergyMix({
  insights,
}: {
  insights: { openByEnergy: { low: number; medium: number; high: number } };
}) {
  const total = insights.openByEnergy.low + insights.openByEnergy.medium + insights.openByEnergy.high || 1;
  const rows = [
    { key: "low", label: "Low", value: insights.openByEnergy.low },
    { key: "medium", label: "Medium", value: insights.openByEnergy.medium },
    { key: "high", label: "High", value: insights.openByEnergy.high },
  ];
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.key} className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span>{row.label}</span>
            <span className="font-mono tabular-nums text-muted">{row.value}</span>
          </div>
          <Progress value={(row.value / total) * 100} />
        </li>
      ))}
    </ul>
  );
}
