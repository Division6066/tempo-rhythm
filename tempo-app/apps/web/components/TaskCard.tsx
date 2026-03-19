"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

type TaskType = {
  _id: Id<"tasks">;
  title: string;
  status: string;
  priority: string;
  estimatedMinutes?: number;
  aiGenerated: boolean;
};

export default function TaskCard({ task }: { task: TaskType }) {
  const updateTask = useMutation(api.tasks.update);

  const toggleStatus = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (task.status === "done") {
      await updateTask({ id: task._id, status: "scheduled" });
    } else {
      await updateTask({ id: task._id, status: "done" });
    }
  };

  const priorityColors: Record<string, string> = {
    high: "bg-teal-500/20 text-teal-400",
    medium: "bg-amber-500/20 text-amber-400",
    low: "bg-muted text-muted-foreground",
  };

  return (
    <Link href={`/tasks/${task._id}`}>
      <div className="glass p-4 rounded-xl flex items-start gap-3 cursor-pointer hover:bg-white/5 transition-all border border-border/50 hover:border-primary/30">
        <button onClick={toggleStatus} className="mt-0.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
          {task.status === "done" ? (
            <CheckCircle2 className="text-primary h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
              {task.priority}
            </span>
            {task.estimatedMinutes && (
              <span className="flex items-center text-[10px] text-muted-foreground">
                <Clock size={10} className="mr-1" />
                {task.estimatedMinutes}m
              </span>
            )}
            {task.aiGenerated && (
              <span className="text-[10px] text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">AI</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
