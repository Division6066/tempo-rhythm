import { useListTasks, useListProjects, useGetPreferences } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Inbox, Sparkles, Sun, ListTodo } from "lucide-react";
import { format } from "date-fns";
import TaskCard from "@/components/TaskCard";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: tasks, isLoading: tasksLoading } = useListTasks();
  const { data: projects, isLoading: projectsLoading } = useListProjects();
  const { data: prefs } = useGetPreferences();

  const todayTasks = tasks?.filter(t => t.status === "today" || t.status === "done") || [];
  const inboxTasks = tasks?.filter(t => t.status === "inbox") || [];
  
  const totalToday = todayTasks.length;
  const doneToday = todayTasks.filter(t => t.status === "done").length;
  const progress = totalToday === 0 ? 0 : (doneToday / totalToday) * 100;
  
  const inboxCount = inboxTasks.length;
  
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

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <p className="text-primary font-medium text-xs mb-1 uppercase tracking-wider">{format(new Date(), 'EEEE, MMM do')}</p>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {getGreeting()}
          </h1>
        </div>
        {prefs?.adhdMode && (
          <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-primary/30 shadow-[0_0_10px_rgba(108,99,255,0.2)]">
            <Sparkles size={12} />
            ADHD Mode
          </div>
        )}
      </header>

      {/* Progress Section */}
      <Card className="glass border-primary/20 shadow-lg shadow-black/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="text-muted stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                <circle 
                  className="text-primary stroke-current" 
                  strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent"
                  strokeDasharray={`${progress * 2.51327} 251.327`}
                  style={{ transition: "stroke-dasharray 1s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-display font-bold text-foreground">{doneToday}</span>
                <span className="text-xs text-muted-foreground">/ {totalToday}</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">Today's Progress</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {doneToday === totalToday && totalToday > 0 
                  ? "All done for today! 🎉" 
                  : "Keep going, you're doing great!"}
              </p>
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                <Link href="/plan">Plan my day</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Sun className="text-amber-400 mb-2 h-5 w-5" />
            <span className="text-2xl font-bold">{totalToday}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Today</span>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Inbox className="text-blue-400 mb-2 h-5 w-5" />
            <span className="text-2xl font-bold">{inboxCount}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Inbox</span>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <ListTodo className="text-teal-400 mb-2 h-5 w-5" />
            <span className="text-2xl font-bold">{projects?.filter(p => p.status === 'active').length || 0}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Projects</span>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Promo */}
      <Link href="/chat" className="block">
        <Card className="bg-gradient-to-r from-card to-primary/10 border-primary/30 hover:border-primary/50 transition-colors cursor-pointer shadow-lg shadow-black/20 group">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="font-medium text-foreground text-lg">AI Assistant</h3>
                <p className="text-sm text-muted-foreground">Chat, plan, or chunk tasks</p>
              </div>
            </div>
            <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" />
          </CardContent>
        </Card>
      </Link>

      {/* Up Next */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Up Next</h3>
          <Link href="/today">
            <span className="text-xs text-primary font-medium hover:underline cursor-pointer">View all</span>
          </Link>
        </div>
        
        <div className="space-y-3">
          {todayTasks.filter(t => t.status !== "done").slice(0, 3).map(task => (
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