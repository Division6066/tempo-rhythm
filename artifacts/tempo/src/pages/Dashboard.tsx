import { useState, useEffect, useMemo } from "react";
import { useListTasks, useListProjects, useGetPreferences, useListDailyPlans, useListCalendarEvents, useCreateTask, getListTasksQueryKey, DailyPlan } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Inbox, Sparkles, Sun, ListTodo, Timer, Zap, Flame, AlertTriangle, CalendarDays, Plus } from "lucide-react";
import { format, isToday, isBefore, startOfDay, parseISO } from "date-fns";
import TaskCard from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function ProgressRing({ progress, doneToday, totalToday }: { progress: number; doneToday: number; totalToday: number }) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const circumference = 2 * Math.PI * 40;
  const allDone = doneToday === totalToday && totalToday > 0;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const getColor = (pct: number) => {
    if (pct >= 100) return "text-success";
    if (pct >= 66) return "text-success";
    if (pct >= 33) return "text-warning";
    return "text-primary";
  };

  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle className="text-muted stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
        <circle
          className={`${getColor(animatedProgress)} stroke-current`}
          strokeWidth="8"
          strokeLinecap="round"
          cx="50" cy="50" r="40"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s ease-out, color 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        {allDone ? (
          <span className="text-xs font-bold text-success">All done!</span>
        ) : (
          <>
            <span className="text-2xl font-display font-bold text-foreground">{doneToday}</span>
            <span className="text-xs text-muted-foreground">/ {totalToday}</span>
          </>
        )}
      </div>
    </div>
  );
}

function StreakCounter({ plans }: { plans: DailyPlan[] | undefined }) {
  const { current, best } = useMemo(() => {
    if (!plans || plans.length === 0) return { current: 0, best: 0 };

    const acceptedDates = plans
      .filter((p) => p.acceptedAt)
      .map((p) => format(new Date(p.acceptedAt!), "yyyy-MM-dd"))
      .sort()
      .reverse();

    const uniqueDates = [...new Set(acceptedDates)];

    let currentStreak = 0;
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");

    if (uniqueDates.length > 0 && (uniqueDates[0] === today || uniqueDates[0] === yesterday)) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diff = (prevDate.getTime() - currDate.getTime()) / 86400000;
        if (Math.abs(diff - 1) < 0.01) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    let bestStreak = 0;
    let tempStreak = 1;
    const sorted = [...uniqueDates].sort();
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diff = (curr.getTime() - prev.getTime()) / 86400000;
      if (Math.abs(diff - 1) < 0.01) {
        tempStreak++;
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);
    if (uniqueDates.length === 0) bestStreak = 0;

    return { current: currentStreak, best: bestStreak };
  }, [plans]);

  if (current === 0 && best === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
      <Flame size={14} />
      <span>{current} day{current !== 1 ? "s" : ""}</span>
      <span className="text-muted-foreground font-normal">Best: {best} day{best !== 1 ? "s" : ""}</span>
    </div>
  );
}

function QuickAddTask() {
  const [value, setValue] = useState("");
  const createTask = useCreateTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async () => {
    const title = value.trim();
    if (!title) return;

    try {
      await createTask.mutateAsync({
        data: {
          title,
          status: "today",
          priority: "high",
        }
      });
      setValue("");
      queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
      toast({ title: "Task added", description: "Added to today with Now priority." });
    } catch {
      toast({ variant: "destructive", title: "Failed to add task" });
    }
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      className="flex items-center gap-2"
    >
      <Plus size={14} className="text-muted-foreground flex-shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Quick add task — Enter to add"
        className="flex-1 bg-transparent border-b border-border/60 px-1 py-1.5 text-sm focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
        disabled={createTask.isPending}
      />
      {value.trim() && (
        <Button
          type="submit"
          size="sm"
          disabled={createTask.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {createTask.isPending ? "..." : "Add"}
        </Button>
      )}
    </form>
  );
}

export default function Dashboard() {
  const { data: tasks, isLoading: tasksLoading } = useListTasks();
  const { data: projects, isLoading: projectsLoading } = useListProjects();
  const { data: prefs } = useGetPreferences();
  const { data: plans } = useListDailyPlans();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const { data: calendarEvents } = useListCalendarEvents({ startDate: todayStr, endDate: todayStr });

  const todayTasks = tasks?.filter(t => t.status === "today" || t.status === "done") || [];
  const inboxTasks = tasks?.filter(t => t.status === "inbox") || [];

  const totalToday = todayTasks.length;
  const doneToday = todayTasks.filter(t => t.status === "done").length;
  const progress = totalToday === 0 ? 0 : (doneToday / totalToday) * 100;
  const inboxCount = inboxTasks.length;

  const tasksDueCount = useMemo(() => {
    if (!tasks) return 0;
    return tasks.filter(t => {
      if (t.status === "done" || t.status === "cancelled") return false;
      if (t.status === "today") return true;
      if (t.dueDate) return isToday(parseISO(t.dueDate));
      return false;
    }).length;
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    if (!tasks) return [];
    const todayStart = startOfDay(new Date());
    return tasks.filter(t => {
      if (t.status === "done" || t.status === "cancelled") return false;
      if (!t.dueDate) return false;
      return isBefore(parseISO(t.dueDate), todayStart);
    });
  }, [tasks]);

  const eventsToday = calendarEvents?.length || 0;

  const top3 = useMemo(() => {
    const activeTasks = todayTasks.filter(t => t.status !== "done");
    return activeTasks
      .sort((a, b) => {
        const aDueToday = a.dueDate ? isToday(parseISO(a.dueDate)) : false;
        const bDueToday = b.dueDate ? isToday(parseISO(b.dueDate)) : false;
        if (aDueToday !== bDueToday) return aDueToday ? -1 : 1;

        const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
        const pDiff = (priorityRank[a.priority] ?? 2) - (priorityRank[b.priority] ?? 2);
        if (pDiff !== 0) return pDiff;

        const aEnergy = "energyLevel" in a ? (a as Record<string, unknown>).energyLevel as number ?? 0 : 0;
        const bEnergy = "energyLevel" in b ? (b as Record<string, unknown>).energyLevel as number ?? 0 : 0;
        if (bEnergy !== aEnergy) return bEnergy - aEnergy;

        return (b.estimatedMinutes ?? 0) - (a.estimatedMinutes ?? 0);
      })
      .slice(0, 3);
  }, [todayTasks]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (tasksLoading || projectsLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" />
      </div>
    );
  }

  const placeholderSlots = Math.max(0, 3 - top3.length);

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-primary font-medium text-xs mb-1 uppercase tracking-wider">{format(new Date(), 'EEEE, MMM do')}</p>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {getGreeting()}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <StreakCounter plans={plans} />
            {prefs?.adhdMode && (
              <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-primary/30 shadow-[0_0_10px_rgba(201,100,66,0.2)]">
                <Sparkles size={12} />
                ADHD Mode
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Link href="/today">
          <Card className="glass border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Sun className="text-warning mb-2 h-5 w-5" />
              <span className="text-2xl font-bold">{tasksDueCount}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Due Today</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/today">
          <Card className={`glass border-border/50 hover:border-primary/30 transition-colors cursor-pointer ${overdueTasks.length > 0 ? "border-destructive/30" : ""}`}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <AlertTriangle className={`mb-2 h-5 w-5 ${overdueTasks.length > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              <span className={`text-2xl font-bold ${overdueTasks.length > 0 ? "text-destructive" : ""}`}>{overdueTasks.length}</span>
              <span className={`text-[10px] uppercase tracking-wider font-medium ${overdueTasks.length > 0 ? "text-destructive/80" : "text-muted-foreground"}`}>Overdue</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/today">
          <Card className="glass border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <CalendarDays className="text-info mb-2 h-5 w-5" />
              <span className="text-2xl font-bold">{eventsToday}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Events</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="glass border-primary/20 shadow-lg shadow-black/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <ProgressRing progress={progress} doneToday={doneToday} totalToday={totalToday} />
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">Today's Progress</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {doneToday === totalToday && totalToday > 0
                  ? "Amazing — you crushed it today!"
                  : totalToday === 0
                    ? "Plan your day to get started."
                    : `${totalToday - doneToday} task${totalToday - doneToday !== 1 ? "s" : ""} left. Keep going!`}
              </p>
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                <Link href="/plan">Plan my day</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-warning" />
          <h3 className="font-semibold text-foreground">Top 3 — Focus on these</h3>
        </div>
        <QuickAddTask />
        {top3.map((task, i) => (
          <div key={task.id} className="flex items-center gap-3">
            <span className="text-lg font-display font-bold text-primary w-6 text-center">{i + 1}</span>
            <div className="flex-1">
              <TaskCard task={task} />
            </div>
          </div>
        ))}
        {Array.from({ length: placeholderSlots }).map((_, i) => (
          <div key={`placeholder-${i}`} className="flex items-center gap-3">
            <span className="text-lg font-display font-bold text-muted-foreground/30 w-6 text-center">{top3.length + i + 1}</span>
            <div className="flex-1 glass p-4 rounded-xl border border-dashed border-border/40">
              <p className="text-sm text-muted-foreground/50 italic">Empty slot — add a task above</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Link href="/inbox">
          <Card className="glass border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Inbox className="text-info mb-2 h-5 w-5" />
              <span className="text-2xl font-bold">{inboxCount}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Inbox</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/projects">
          <Card className="glass border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <ListTodo className="text-success mb-2 h-5 w-5" />
              <span className="text-2xl font-bold">{projects?.filter(p => p.status === 'active').length || 0}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Projects</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/focus">
          <Card className="glass border-border/50 hover:border-primary/30 transition-colors cursor-pointer group">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Timer className="text-success mb-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold text-muted-foreground">-</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Focus</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/focus">
          <Card className="glass border-border/50 hover:border-primary/30 transition-colors cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                <Timer size={20} />
              </div>
              <div>
                <h3 className="font-medium text-sm">Focus Timer</h3>
                <p className="text-xs text-muted-foreground">Start a session</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/chat">
          <Card className="glass border-border/50 hover:border-primary/30 transition-colors cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-medium text-sm">AI Assistant</h3>
                <p className="text-xs text-muted-foreground">Chat or plan</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Up Next</h3>
          <Link href="/today">
            <span className="text-xs text-primary font-medium hover:underline cursor-pointer">View all</span>
          </Link>
        </div>
        <div className="space-y-3">
          {todayTasks.filter(t => t.status !== "done").slice(0, 5).map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          {todayTasks.filter(t => t.status !== "done").length === 0 && (
            <div className="text-center py-8 bg-card/30 rounded-xl border border-dashed border-border/50">
              <Sun className="mx-auto h-8 w-8 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No upcoming tasks today.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
