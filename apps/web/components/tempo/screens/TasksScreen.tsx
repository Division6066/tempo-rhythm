"use client";

import { useMemo, useState } from "react";
import { Button, Pill, SoftCard, TaskRow } from "@tempo/ui/primitives";
import { mockTasks } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

type Filter = "all" | "today" | "tomorrow" | "done";

/**
 * TasksScreen — filterable task library.
 * @source docs/design/claude-export/design-system/screens-2.jsx (ScreenTasks)
 */
export function TasksScreen() {
  const toast = useDemoToast();
  const initialDone = useMemo(
    () => Object.fromEntries(mockTasks.map((t) => [t.id, t.status === "done"])),
    [],
  );
  const [done, setDone] = useState<Record<string, boolean>>(initialDone);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockTasks.filter((task) => {
      if (q && !task.title.toLowerCase().includes(q)) return false;
      if (filter === "today") return task.dueDateLabel.toLowerCase().startsWith("today");
      if (filter === "tomorrow") return task.dueDateLabel.toLowerCase().startsWith("tomorrow");
      if (filter === "done") return done[task.id];
      return true;
    });
  }, [filter, query, done]);

  const filters: { id: Filter; label: string; count?: number }[] = [
    { id: "all", label: "All", count: mockTasks.length },
    {
      id: "today",
      label: "Today",
      count: mockTasks.filter((t) => t.dueDateLabel.toLowerCase().startsWith("today")).length,
    },
    {
      id: "tomorrow",
      label: "Tomorrow",
      count: mockTasks.filter((t) => t.dueDateLabel.toLowerCase().startsWith("tomorrow")).length,
    },
    {
      id: "done",
      label: "Done",
      count: Object.values(done).filter(Boolean).length,
    },
  ];

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Library"
        title="Tasks"
        lede="Everything open and staged. Click anything to edit."
        right={
          <>
            {/*
             * @behavior: Capture a new task from the tasks header CTA.
             * @convex-mutation-needed: tasks.captureQuickAdd
             * @navigate: /brain-dump
             */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => toast("Captured. (demo) tasks.captureQuickAdd.")}
            >
              + New task
            </Button>
            {/*
             * @behavior: Export tasks list as CSV/Markdown.
             * @convex-action-needed: tasks.exportLibrary
             */}
            <Button variant="soft" size="sm" onClick={() => toast("Exported. (demo) tasks.exportLibrary.")}>
              Export
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-4 px-6 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              /*
               * @behavior: Filter tasks by bucket (all/today/tomorrow/done).
               * @convex-query-needed: tasks.listByFilter
               */
              <Button
                key={f.id}
                variant={filter === f.id ? "primary" : "subtle"}
                size="sm"
                onClick={() => setFilter(f.id)}
              >
                {f.label} {typeof f.count === "number" ? `· ${f.count}` : ""}
              </Button>
            ))}
          </div>
          <div className="ml-auto flex min-w-[220px] items-center gap-2 rounded-lg border border-border-soft bg-surface-sunken px-3 py-2">
            <span aria-hidden>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="flex-1 bg-transparent text-small placeholder:text-muted-foreground focus:outline-none"
              /*
               * @behavior: Full-text search across tasks library.
               * @convex-query-needed: tasks.search
               */
            />
          </div>
        </div>

        <SoftCard tone="default" padding="md">
          <div className="flex flex-col gap-1">
            {filtered.map((task) => (
              <TaskRow
                key={task.id}
                taskId={task.id}
                title={task.title}
                meta={`${task.project} · ${task.dueDateLabel} · ${task.estimateMinutes}m`}
                done={done[task.id]}
                onToggle={(id, next) => {
                  /*
                   * @behavior: Toggle task done state.
                   * @convex-mutation-needed: tasks.complete
                   * @optimistic: flip locally first
                   * @confirm: undoable 5s
                   */
                  setDone((prev) => ({ ...prev, [id]: next }));
                  toast(next ? "Completed. (demo)" : "Reopened. (demo)");
                }}
                trailing={
                  <div className="flex items-center gap-2">
                    {task.tags.map((tag) => (
                      <Pill key={tag} tone="neutral">
                        {tag}
                      </Pill>
                    ))}
                  </div>
                }
              />
            ))}
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-small text-muted-foreground">
                No tasks matching that filter.
              </div>
            ) : null}
          </div>
        </SoftCard>
      </div>
    </div>
  );
}
