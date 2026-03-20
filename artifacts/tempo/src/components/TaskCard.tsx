import { useState } from "react";
import { CheckCircle2, Circle, Clock, Battery, BatteryLow, BatteryMedium, GripVertical, AlertCircle, MoreHorizontal, ArrowRight, Inbox, Trash2, Pencil } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Task, useUpdateTask, useDeleteTask, getListTasksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PRIORITY_LABELS: Record<string, string> = {
  high: "Now",
  medium: "Soon",
  low: "Later",
};

const ENERGY_ICONS: Record<number, { icon: typeof Battery; label: string; color: string }> = {
  1: { icon: BatteryLow, label: "Low energy", color: "text-success" },
  2: { icon: BatteryMedium, label: "Med energy", color: "text-warning" },
  3: { icon: Battery, label: "High energy", color: "text-destructive" },
};

function getScoreBadgeClasses(score: number): string {
  if (score >= 80) return "bg-destructive/20 text-destructive border-destructive/30";
  if (score >= 60) return "bg-warning/20 text-warning border-warning/30";
  return "bg-muted text-muted-foreground border-border";
}

interface TaskCardProps {
  task: Task;
  sortable?: boolean;
  aiScore?: { score: number; reason: string } | null;
}

export default function TaskCard({ task, sortable = false, aiScore }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !sortable,
  });

  const style = sortable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
      }
    : undefined;

  const toggleStatus = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = task.status === "done" ? "today" : "done";
    await updateTask.mutateAsync({
      id: task.id,
      data: { status: newStatus },
    });
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
  };

  const handleContextAction = async (action: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    switch (action) {
      case "edit":
        navigate(`/tasks/${task.id}`);
        break;
      case "move-later":
        await updateTask.mutateAsync({ id: task.id, data: { priority: "low" } });
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        break;
      case "move-inbox":
        await updateTask.mutateAsync({ id: task.id, data: { status: "inbox" } });
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        break;
      case "delete":
        await deleteTask.mutateAsync({ id: task.id });
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        break;
    }
  };

  const priorityColors: Record<string, string> = {
    high: "bg-success/20 text-success",
    medium: "bg-warning/20 text-warning",
    low: "bg-muted text-muted-foreground",
  };

  const energyInfo = (task as Task & { energyLevel?: number }).energyLevel ? ENERGY_ICONS[(task as Task & { energyLevel?: number }).energyLevel!] : null;

  const isOverdue =
    task.dueDate &&
    task.status !== "done" &&
    new Date(task.dueDate) < new Date(new Date().toDateString());

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging ? "opacity-50 z-50" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/tasks/${task.id}`}>
        <div className={`glass p-4 rounded-xl flex items-start gap-3 cursor-pointer hover:bg-muted/50 transition-all border relative ${isOverdue ? "border-destructive/50 bg-destructive/5" : "border-border/50 hover:border-primary/30"}`}>
          {sortable && (
            <button
              className={`mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}
              {...attributes}
              {...listeners}
              onClick={(e) => e.preventDefault()}
            >
              <GripVertical className="h-5 w-5" />
            </button>
          )}
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
              {isOverdue && (
                <span className="flex items-center text-[10px] text-destructive bg-destructive/10 px-2 py-0.5 rounded-full font-medium">
                  <AlertCircle size={10} className="mr-1" />
                  Overdue
                </span>
              )}
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
              {task.tags && task.tags.length > 0 && task.tags.map((tag: string) => (
                <span key={tag} className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`mt-0.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all ${isHovered ? "opacity-100" : "opacity-0"}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={(e) => handleContextAction("edit", e)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleContextAction("move-later", e)}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Move to Later
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleContextAction("move-inbox", e)}>
                <Inbox className="h-4 w-4 mr-2" />
                Move to Inbox
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => handleContextAction("delete", e)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {aiScore && (
          <div
            className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border ${getScoreBadgeClasses(aiScore.score)}`}
            title={aiScore.reason}
          >
            {aiScore.score}
          </div>
        )}
      </Link>
    </div>
  );
}
