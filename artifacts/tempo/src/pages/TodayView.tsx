import { useListTasks } from "@workspace/api-client-react";
import { Progress } from "@/components/ui/progress";
import TaskCard from "@/components/TaskCard";

export default function TodayView() {
  const { data: todayActive, isLoading: loadingActive } = useListTasks({ status: "today" });
  const { data: todayDone, isLoading: loadingDone } = useListTasks({ status: "done" });

  const isLoading = loadingActive || loadingDone;
  const activeTasks = todayActive || [];
  const doneTasks = todayDone || [];
  const todayTasks = [...activeTasks, ...doneTasks];
  const completedCount = doneTasks.length;
  const progress = todayTasks.length > 0 ? (completedCount / todayTasks.length) * 100 : 0;

  const highPriority = activeTasks.filter(t => t.priority === "high");
  const mediumPriority = activeTasks.filter(t => t.priority === "medium");
  const lowPriority = activeTasks.filter(t => t.priority === "low");
  const completed = doneTasks;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Today</h1>
        <div className="flex items-center gap-4 mb-2">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
            {completedCount} / {todayTasks.length} done
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {highPriority.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-teal-400 uppercase tracking-wider">High Priority</h2>
            {highPriority.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        )}

        {mediumPriority.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Medium Priority</h2>
            {mediumPriority.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        )}

        {lowPriority.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Low Priority</h2>
            {lowPriority.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        )}

        {completed.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border/50">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</h2>
            <div className="opacity-60">
              {completed.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          </div>
        )}

        {todayTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nothing planned for today yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}