import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/tempo/types";
import { daysOverdue, formatShortDate, formatTime } from "@/lib/tempo/windows";

export function TaskRow({
  task,
  onToggle,
  onSnooze,
  emphasize,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onSnooze?: (id: string) => void;
  emphasize?: boolean;
}) {
  const done = task.status === "done";
  const overdueDays = task.dueAt && task.status !== "done" ? daysOverdue(task.dueAt) : 0;
  const avoided = (task.avoidCount ?? 0) >= 2;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border border-transparent px-2 py-2.5 transition-colors duration-150",
        emphasize && "border-overdue/30 bg-overdue-soft/50",
        !emphasize && "hover:bg-surface-2/70",
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(task._id)}
        aria-label={done ? `Undo ${task.title}` : `Complete ${task.title}`}
        className={cn(
          "mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,transform] duration-150",
          done ? "border-ok bg-ok text-ok-soft" : "border-border bg-surface text-transparent hover:border-accent",
        )}
      >
        <Check className="size-5" strokeWidth={2.25} />
      </button>
      <div className="min-w-0 flex-1 pt-2">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className={cn("text-[15px] leading-snug text-ink", done && "text-faint line-through")}>{task.title}</p>
          {task.energy ? (
            <span className="text-xs uppercase tracking-wide text-faint">{task.energy} energy</span>
          ) : null}
        </div>
        {task.description && !done ? <p className="mt-1 text-sm text-muted">{task.description}</p> : null}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {overdueDays > 0 ? (
            <Badge variant="overdue">
              {overdueDays === 1 ? "1 day overdue" : `${overdueDays} days overdue`}
            </Badge>
          ) : task.dueAt ? (
            <Badge>
              {formatShortDate(task.dueAt)} · {formatTime(task.dueAt)}
            </Badge>
          ) : null}
          {avoided ? <Badge variant="overdue">skipped {task.avoidCount} times</Badge> : null}
          {task.projectName ? <Badge variant="accent">{task.projectName}</Badge> : null}
          {task.status === "in_progress" ? <Badge variant="ok">in motion</Badge> : null}
        </div>
      </div>
      {onSnooze && !done ? (
        <button
          type="button"
          onClick={() => onSnooze(task._id)}
          className="mt-2 inline-flex h-11 shrink-0 items-center rounded-sm px-3 text-sm text-muted hover:bg-surface-2 hover:text-ink"
        >
          Park
        </button>
      ) : null}
    </div>
  );
}
