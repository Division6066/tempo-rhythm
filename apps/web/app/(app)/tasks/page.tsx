"use client";

import { useMutation, useQuery } from "convex/react";
import { ListTodo } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "todo" | "in_progress" | "done" | "cancelled";

const statusLabel: Record<string, string> = {
  todo: "לביצוע",
  in_progress: "בתהליך",
  done: "בוצע",
  cancelled: "בוטל",
};

const priorityClass: Record<string, string> = {
  high: "text-destructive",
  medium: "text-primary",
  low: "text-muted-foreground",
};

export default function TasksPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const listArgs = useMemo(
    () => (filter === "all" ? {} : { status: filter as Exclude<StatusFilter, "all"> }),
    [filter],
  );
  const tasks = useQuery(api.tasks.list, listArgs);
  const updateTask = useMutation(api.tasks.update);

  const loading = tasks === undefined;

  const toggleDone = async (taskId: (typeof tasks extends (infer T)[] | undefined ? T : never) extends {
    _id: infer Id;
  }
    ? Id
    : never) => {
    const task = tasks?.find((t) => t._id === taskId);
    if (!task) return;
    const next = task.status === "done" ? "todo" : "done";
    await updateTask({ taskId, status: next });
  };

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12" dir="rtl">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#D97757] to-[#E8A87C] text-primary-foreground shadow-inner">
            <ListTodo className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">ניהול</p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground">משימות</h1>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          className="rounded-xl border-border bg-card/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
        >
          <Link href="/dashboard">חזרה ללוח הבית</Link>
        </Button>
      </header>

      <SoftCard className="grain-bg mb-8">
        <p className="mb-4 text-sm font-medium text-muted-foreground">סינון לפי סטטוס</p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "הכל"],
              ["todo", "לביצוע"],
              ["in_progress", "בתהליך"],
              ["done", "בוצע"],
              ["cancelled", "בוטל"],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              type="button"
              variant={filter === key ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full",
                filter === key &&
                  "bg-linear-to-r from-[#D97757] to-[#E8A87C] text-primary-foreground border-0 shadow-md",
              )}
              onClick={() => setFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </SoftCard>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <SoftCard className="grain-bg text-center text-muted-foreground">
          אין משימות במסנן זה. צרו משימות מממשק אחר או שינו את הסינון.
        </SoftCard>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task._id}>
              <SoftCard className="grain-bg flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "font-heading text-lg font-semibold text-foreground",
                      task.status === "done" && "line-through opacity-70",
                    )}
                  >
                    {task.title}
                  </p>
                  {task.description ? (
                    <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {statusLabel[task.status] ?? task.status}
                    </span>
                    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", priorityClass[task.priority])}>
                      {task.priority}
                    </span>
                    {task.dueAt !== undefined ? (
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                        יעד: {new Date(task.dueAt).toLocaleDateString("he-IL")}
                      </span>
                    ) : null}
                  </div>
                </div>
                {task.status !== "cancelled" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 rounded-xl"
                    onClick={() => void toggleDone(task._id)}
                  >
                    {task.status === "done" ? "החזר לביצוע" : "סמן כבוצע"}
                  </Button>
                ) : null}
              </SoftCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
