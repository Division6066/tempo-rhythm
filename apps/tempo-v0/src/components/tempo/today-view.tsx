import { useRef, useState } from "react";
import { toast } from "sonner";
import { CoachNudgeCard } from "@/components/tempo/coach-nudge";
import { EmptyState } from "@/components/tempo/empty-state";
import { ErrorState } from "@/components/tempo/error-state";
import { TaskRow } from "@/components/tempo/task-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTempo } from "@/lib/tempo/use-tempo";
import { formatDayHeading } from "@/lib/tempo/windows";
import { isOpenTask } from "@/lib/tempo/filters";

export function TodayView() {
  const { snapshot, adapter, today, overdue, overdueHidden, nudge, setDemo, todayEnd } = useTempo();
  const [draft, setDraft] = useState("");
  const [focusId, setFocusId] = useState<string | null>(null);
  const composer = useRef<HTMLInputElement>(null);
  const heading = formatDayHeading();

  if (snapshot.demo === "error") {
    return (
      <ErrorState
        message="The mock adapter is in the error fixture. Nothing on this day can load until the store is restored."
        onRetry={() => setDemo("seeded")}
      />
    );
  }

  const openToday = today.filter((t) => isOpenTask(t.status));
  const doneToday = today.filter((t) => t.status === "done");
  const isEmpty = snapshot.demo === "empty" || (openToday.length === 0 && overdue.length === 0 && doneToday.length === 0);

  async function toggle(id: string) {
    const result = await adapter.toggleCompletion({ taskId: id });
    toast(result.status === "done" ? "Marked done. Tempo will remember." : "Brought back.");
  }

  async function snooze(id: string) {
    await adapter.snooze({ taskId: id, untilMs: todayEnd + 10 * 60 * 60 * 1000 });
    toast("Parked until tomorrow. Counted as a skip.");
  }

  async function addTask() {
    const title = draft.trim();
    if (!title) return;
    await adapter.createQuick({ title, dueAt: Date.now() });
    setDraft("");
    toast("Added to today.");
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="space-y-1">
        <p className="text-sm text-muted">{heading.rest}</p>
        <h1 className="font-display text-4xl font-medium tracking-tight text-ink md:text-5xl">{heading.weekday}</h1>
      </header>

      {nudge ? (
        <CoachNudgeCard
          nudge={nudge}
          onAct={async () => {
            if (nudge.relatedTaskId) {
              if (nudge.kind === "energy") {
                await snooze(nudge.relatedTaskId);
              } else {
                setFocusId(nudge.relatedTaskId);
                document.getElementById(`task-${nudge.relatedTaskId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }
            if (nudge.relatedHabitId) {
              await adapter.completeHabitToday({ habitId: nudge.relatedHabitId });
              toast("Habit checked in.");
            }
            await adapter.acknowledgeNudge({ id: nudge.id });
          }}
          onDismiss={async () => {
            if (nudge.relatedTaskId && nudge.kind === "avoided") {
              await snooze(nudge.relatedTaskId);
            }
            await adapter.acknowledgeNudge({ id: nudge.id });
          }}
        />
      ) : null}

      {isEmpty ? (
        <EmptyState
          title="Nothing on today yet"
          body="Tempo will hold the day as soon as you give it one small thing. Start smaller than you think."
          actionLabel="Add a task"
          onAction={() => composer.current?.focus()}
        />
      ) : (
        <>
          {overdue.length > 0 ? (
            <section className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-overdue">Still open</h2>
                {overdueHidden > 0 ? (
                  <p className="text-xs text-muted">{overdueHidden} more can wait</p>
                ) : null}
              </div>
              <div className="rounded-xl border border-overdue/20 bg-surface p-2">
                {overdue.map((task) => (
                  <div id={`task-${task._id}`} key={task._id}>
                    <TaskRow
                      task={task}
                      onToggle={toggle}
                      onSnooze={snooze}
                      emphasize={focusId === task._id || (task.avoidCount ?? 0) >= 3}
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Today</h2>
            <div className="rounded-xl border border-border bg-surface p-2">
              {openToday.length === 0 ? (
                <p className="px-3 py-6 text-sm text-muted">The rest of today is clear. That is allowed.</p>
              ) : (
                openToday.map((task) => (
                  <div id={`task-${task._id}`} key={task._id}>
                    <TaskRow task={task} onToggle={toggle} onSnooze={snooze} emphasize={focusId === task._id} />
                  </div>
                ))
              )}
            </div>
          </section>

          {doneToday.length > 0 ? (
            <section className="space-y-2">
              <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-ok">Done today</h2>
              <div className="rounded-xl border border-border bg-surface p-2">
                {doneToday.map((task) => (
                  <TaskRow key={task._id} task={task} onToggle={toggle} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void addTask();
        }}
      >
        <Input
          ref={composer}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add something small for today"
          aria-label="Quick add a task for today"
        />
        <Button type="submit" disabled={!draft.trim()}>
          Add
        </Button>
      </form>
    </div>
  );
}
