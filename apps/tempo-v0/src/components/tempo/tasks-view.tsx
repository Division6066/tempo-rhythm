import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/tempo/empty-state";
import { ErrorState } from "@/components/tempo/error-state";
import { TaskRow } from "@/components/tempo/task-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isOpenTask } from "@/lib/tempo/filters";
import { useTempo } from "@/lib/tempo/use-tempo";
import { DAY_MS } from "@/lib/tempo/windows";
import type { TaskStatus } from "@/lib/tempo/types";

const FILTERS: Array<{ id: "open" | TaskStatus; label: string }> = [
  { id: "open", label: "Open" },
  { id: "todo", label: "To do" },
  { id: "in_progress", label: "In motion" },
  { id: "done", label: "Done" },
];

export function TasksView() {
  const { snapshot, adapter, setDemo } = useTempo();
  const [filter, setFilter] = useState<"open" | TaskStatus>("open");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    let list = snapshot.tasks.filter((t) => t.deletedAt === undefined);
    if (filter === "open") list = list.filter((t) => isOpenTask(t.status));
    else list = list.filter((t) => t.status === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q));
    }
    return list.sort((a, b) => (a.dueAt ?? Number.MAX_SAFE_INTEGER) - (b.dueAt ?? Number.MAX_SAFE_INTEGER));
  }, [snapshot.tasks, filter, query]);

  if (snapshot.demo === "error") {
    return (
      <ErrorState
        message="Tasks failed to load. The adapter is in the error fixture."
        onRetry={() => setDemo("seeded")}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="space-y-1">
        <p className="text-sm text-muted">Tasks</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">Everything on the board</h1>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={
              filter === item.id
                ? "h-10 rounded-full bg-ink px-3 text-sm text-bg"
                : "h-10 rounded-full bg-surface px-3 text-sm text-muted hover:text-ink"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by title"
        aria-label="Filter tasks"
      />

      {rows.length === 0 ? (
        <EmptyState
          title={query ? "No matches" : "No tasks"}
          body={
            query
              ? "Nothing on the board matches that filter."
              : "The board is empty. Add one thing from Today."
          }
          actionLabel="Back to today"
          onAction={() => {
            window.location.href = "/";
          }}
        />
      ) : (
        <div className="rounded-xl border border-border bg-surface p-2">
          {rows.map((task) => (
            <TaskRow
              key={task._id}
              task={task}
              onToggle={async (id) => {
                const result = await adapter.toggleCompletion({ taskId: id });
                toast(result.status === "done" ? "Done." : "Reopened.");
              }}
              onSnooze={async (id) => {
                await adapter.snooze({ taskId: id, untilMs: Date.now() + DAY_MS });
                toast("Parked one day.");
              }}
            />
          ))}
        </div>
      )}
      <Button variant="outline" onClick={() => (window.location.href = "/")}>
        Add from today
      </Button>
    </div>
  );
}
