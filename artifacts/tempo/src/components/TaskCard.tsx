import { CheckCircle2, Circle, Clock, Battery, BatteryLow, BatteryMedium } from "lucide-react";
import { Link } from "wouter";
import { Task, useUpdateTask, getListTasksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const PRIORITY_LABELS: Record<string, string> = {
  high: "Now",
  medium: "Soon",
  low: "Later",
};

const ENERGY_ICONS: Record<number, { icon: typeof Battery; label: string; color: string }> = {
  1: { icon: BatteryLow, label: "Low energy", color: "text-green-500" },
  2: { icon: BatteryMedium, label: "Med energy", color: "text-amber-500" },
  3: { icon: Battery, label: "High energy", color: "text-red-500" },
};

export default function TaskCard({ task }: { task: Task }) {
  const updateTask = useUpdateTask();
  const queryClient = useQueryClient();

  const toggleStatus = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newStatus = task.status === "done" ? "today" : "done";
    await updateTask.mutateAsync({
      id: task.id,
      data: { status: newStatus }
    });
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
  };

  const priorityColors = {
    high: "bg-teal-500/20 text-teal-600",
    medium: "bg-amber-500/20 text-amber-600",
    low: "bg-muted text-muted-foreground"
  };

  const energyInfo = task.energyLevel ? ENERGY_ICONS[task.energyLevel] : null;

  return (
    <Link href={`/tasks/${task.id}`}>
      <div className="glass p-4 rounded-xl flex items-start gap-3 cursor-pointer hover:bg-muted/50 transition-all border border-border/50 hover:border-primary/30">
        <button onClick={toggleStatus} className="mt-0.5 text-muted-foreground hover:text-primary transition-colors">
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
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
              {PRIORITY_LABELS[task.priority] || task.priority}
            </span>
            {task.estimatedMinutes && (
              <span className="flex items-center text-[10px] text-muted-foreground">
                <Clock size={10} className="mr-1" />
                {task.estimatedMinutes}m
              </span>
            )}
            {energyInfo && (
              <span className={`flex items-center text-[10px] ${energyInfo.color}`}>
                <energyInfo.icon size={10} className="mr-1" />
                {energyInfo.label}
              </span>
            )}
            {task.aiGenerated && (
              <span className="text-[10px] text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                AI
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
