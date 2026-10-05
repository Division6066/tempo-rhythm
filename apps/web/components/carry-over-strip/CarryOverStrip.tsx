"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useLocalDayBounds } from "@/lib/useLocalDayBounds";
import { dayLabel, groupByLocalDay, todayDueAt } from "./carryOver";

const INITIAL_ROWS = 5;

export function CarryOverStrip() {
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  const bounds = useLocalDayBounds();
  const tasks = useQuery(
    api.dayPlans.listCarryOver,
    isAuthenticated && profile ? { beforeMs: bounds.startMs } : "skip",
  );
  const moveTaskToDay = useMutation(api.dayPlans.moveTaskToDay);
  const toggleCompletion = useMutation(api.tasks.toggleCompletion);
  const [showAll, setShowAll] = useState(false);
  // Rows with a completion or move in flight. Kept until the row leaves the
  // list so a second tap cannot toggle a just-completed task back to todo.
  const [pending, setPending] = useState<ReadonlySet<string>>(() => new Set());

  const runOnce = (taskId: string, action: () => Promise<unknown>) => {
    if (pending.has(taskId)) return;
    setPending((prev) => new Set(prev).add(taskId));
    action().catch(() => {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    });
  };

  if (!tasks || tasks.length === 0) return null;

  // Newest day first so the row cap keeps the most recent days.
  const rows = groupByLocalDay(tasks).flatMap((group) =>
    group.tasks.map((task) => ({ task, dayStartMs: group.dayStartMs })),
  );
  const visible = showAll ? rows : rows.slice(0, INITIAL_ROWS);
  const hiddenCount = rows.length - visible.length;

  return (
    <Card className="p-4" role="region" aria-labelledby="carry-over-heading">
      <h2 id="carry-over-heading" className="font-heading text-lg font-semibold text-foreground">
        Still open from earlier days
      </h2>
      <ul className="mt-3 space-y-2">
        {visible.map(({ task, dayStartMs }) => {
          const isPending = pending.has(task._id);
          return (
            <li key={task._id} className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 accent-primary"
                checked={isPending}
                disabled={isPending}
                onChange={() => {
                  runOnce(task._id, () => toggleCompletion({ taskId: task._id }));
                }}
                aria-label={`Mark ${task.title} complete`}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{task.title}</span>
              <span className="text-xs text-muted-foreground">{dayLabel(dayStartMs)}</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  runOnce(task._id, () =>
                    moveTaskToDay({ taskId: task._id, dueAt: todayDueAt(Date.now()) }),
                  );
                }}
              >
                Move to today
              </Button>
            </li>
          );
        })}
      </ul>
      {hiddenCount > 0 ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="mt-2 px-0"
          onClick={() => setShowAll(true)}
        >
          Show more ({hiddenCount})
        </Button>
      ) : null}
    </Card>
  );
}
