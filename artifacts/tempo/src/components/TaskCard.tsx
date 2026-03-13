import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Link } from "wouter";
import { Task, useUpdateTask, getListTasksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

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
    high: "bg-teal-500/20 text-teal-400",
    medium: "bg-amber-500/20 text-amber-400",
    low: "bg-muted text-muted-foreground"
  };

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
        </div>
      </div>
    </Link>
  );
}