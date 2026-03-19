"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Clock, Star, GripVertical, Plus } from "lucide-react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Task = {
  _id: Id<"tasks">;
  title: string;
  status: string;
  priority: string;
  estimatedMinutes?: number;
  aiGenerated: boolean;
  scheduledDate?: string;
  sortOrder?: number;
};

type DailyPlan = {
  _id: Id<"dailyPlans">;
  topThree?: string[];
};

function getTodayDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const priorityColors: Record<string, string> = {
  high: "bg-teal-500/20 text-teal-400",
  medium: "bg-amber-500/20 text-amber-400",
  low: "bg-muted text-muted-foreground",
};

function TaskItemContent({
  task,
  onComplete,
  isTopThree,
  dragHandle,
}: {
  task: Task;
  onComplete: (id: Id<"tasks">) => void;
  isTopThree: boolean;
  dragHandle?: React.ReactNode;
}) {
  return (
    <>
      {dragHandle}
      <button
        onClick={() => onComplete(task._id)}
        className="mt-0.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
      >
        {task.status === "done" ? (
          <CheckCircle2 className="text-primary h-5 w-5" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>
      <Link href={`/tasks/${task._id}`} className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"
          }`}
        >
          {isTopThree && <Star className="inline h-3 w-3 mr-1 text-primary" />}
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              priorityColors[task.priority] || priorityColors.medium
            }`}
          >
            {task.priority}
          </span>
          {task.estimatedMinutes && (
            <span className="flex items-center text-[10px] text-muted-foreground">
              <Clock size={10} className="mr-1" />
              {task.estimatedMinutes}m
            </span>
          )}
          {task.aiGenerated && (
            <span className="text-[10px] text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
              AI
            </span>
          )}
        </div>
      </Link>
    </>
  );
}

function StaticTaskItem({
  task,
  onComplete,
  isTopThree,
}: {
  task: Task;
  onComplete: (id: Id<"tasks">) => void;
  isTopThree: boolean;
}) {
  return (
    <div
      className={`glass p-4 rounded-xl flex items-start gap-3 border transition-all ${
        isTopThree
          ? "border-primary/40 bg-primary/5"
          : "border-border/50 hover:border-primary/30 hover:bg-white/5"
      }`}
    >
      <TaskItemContent task={task} onComplete={onComplete} isTopThree={isTopThree} />
    </div>
  );
}

function SortableTaskItem({
  task,
  onComplete,
}: {
  task: Task;
  onComplete: (id: Id<"tasks">) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragHandle = (
    <button
      {...attributes}
      {...listeners}
      className="mt-0.5 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
      aria-label="Drag to reorder"
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass p-4 rounded-xl flex items-start gap-3 border border-border/50 hover:border-primary/30 hover:bg-white/5 transition-all"
    >
      <TaskItemContent task={task} onComplete={onComplete} isTopThree={false} dragHandle={dragHandle} />
    </div>
  );
}

export default function TodayView() {
  const today = getTodayDate();

  const rawTasks = useQuery(api.tasks.getTasksByDate, { date: today });
  const dailyPlan = useQuery(api.dailyPlans.getDailyPlan, { date: today });

  const createTask = useMutation(api.tasks.create);
  const completeTask = useMutation(api.tasks.complete);
  const updateTask = useMutation(api.tasks.update);
  const reorderTasks = useMutation(api.tasks.reorderTasks);
  const getOrCreateDailyPlan = useMutation(api.dailyPlans.getOrCreateDailyPlan);

  const [quickCapture, setQuickCapture] = useState("");
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [planInitialized, setPlanInitialized] = useState(false);

  useEffect(() => {
    if (rawTasks) {
      setLocalTasks(rawTasks as Task[]);
    }
  }, [rawTasks]);

  useEffect(() => {
    if (!planInitialized) {
      getOrCreateDailyPlan({ date: today }).then(() => setPlanInitialized(true));
    }
  }, [planInitialized, getOrCreateDailyPlan, today]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setLocalTasks((prev) => {
        const oldIndex = prev.findIndex((t) => t._id === active.id);
        const newIndex = prev.findIndex((t) => t._id === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex);
        reorderTasks({ taskIds: reordered.map((t) => t._id) });
        return reordered;
      });
    },
    [reorderTasks]
  );

  const handleQuickCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCapture.trim()) return;
    await createTask({
      title: quickCapture.trim(),
      status: "inbox",
      scheduledDate: today,
    });
    setQuickCapture("");
  };

  const handleComplete = async (id: Id<"tasks">) => {
    const task = localTasks.find((t) => t._id === id);
    if (!task) return;
    if (task.status === "done") {
      await updateTask({ id, status: "scheduled" });
    } else {
      await completeTask({ id });
    }
  };

  const topThreeIds: string[] = (dailyPlan as DailyPlan | null | undefined)?.topThree ?? [];

  const activeTasks = localTasks.filter((t) => t.status !== "done");
  const completedTasks = localTasks.filter((t) => t.status === "done");
  const completedCount = completedTasks.length;
  const total = localTasks.length;
  const progress = total > 0 ? (completedCount / total) * 100 : 0;

  const topThreeTasks = activeTasks.filter((t) => topThreeIds.includes(t._id));
  const remainingTasks = activeTasks.filter((t) => !topThreeIds.includes(t._id));

  const isLoading = rawTasks === undefined;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Today</h1>
          <p className="text-sm text-muted-foreground mb-3">{today}</p>
          <div className="flex items-center gap-4 mb-2">
            <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
              {completedCount} / {total} done
            </span>
          </div>
        </div>

        <form onSubmit={handleQuickCapture} className="flex gap-2">
          <Input
            value={quickCapture}
            onChange={(e) => setQuickCapture(e.target.value)}
            placeholder="Quick capture..."
            className="bg-card border-border"
          />
          <Button type="submit" disabled={!quickCapture.trim()} className="gap-1">
            <Plus size={16} />
            Add
          </Button>
        </form>

        {topThreeTasks.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
              <Star className="h-3 w-3" /> Top 3 Priorities
            </h2>
            <div className="space-y-2">
              {topThreeTasks.map((task) => (
                <StaticTaskItem
                  key={task._id}
                  task={task}
                  onComplete={handleComplete}
                  isTopThree={true}
                />
              ))}
            </div>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localTasks.map((t) => t._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {remainingTasks.length > 0 && (
                <>
                  {topThreeTasks.length > 0 && (
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">
                      Other Tasks
                    </h2>
                  )}
                  {remainingTasks.map((task) => (
                    <SortableTaskItem
                      key={task._id}
                      task={task}
                      onComplete={handleComplete}
                    />
                  ))}
                </>
              )}
            </div>
          </SortableContext>
        </DndContext>

        {completedTasks.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border/50">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Completed
            </h2>
            <div className="opacity-60 space-y-2">
              {completedTasks.map((task) => (
                <StaticTaskItem
                  key={task._id}
                  task={task}
                  onComplete={handleComplete}
                  isTopThree={false}
                />
              ))}
            </div>
          </div>
        )}

        {localTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nothing planned for today yet.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Use quick capture above to add tasks.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
