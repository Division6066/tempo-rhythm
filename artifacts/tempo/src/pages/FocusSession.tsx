import { useState, useEffect, useRef, useCallback } from "react";
import { useListTasks, useGetPreferences } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward, Timer, Zap, Coffee, CheckCircle2, Target } from "lucide-react";

type SessionState = "idle" | "focus" | "break" | "done";

export default function FocusSession() {
  const { data: prefs } = useGetPreferences();
  const { data: tasks } = useListTasks({ status: "today" });

  const focusDuration = (prefs?.focusSessionMinutes || 25) * 60;
  const breakDuration = (prefs?.breakMinutes || 5) * 60;

  const [state, setState] = useState<SessionState>("idle");
  const [timeLeft, setTimeLeft] = useState(focusDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeTasks = tasks?.filter(t => t.status !== "done").slice(0, 5) || [];

  useEffect(() => {
    setTimeLeft(focusDuration);
  }, [focusDuration]);

  const tick = useCallback(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        if (state === "focus") {
          setSessions(s => s + 1);
          setState("break");
          return breakDuration;
        } else {
          setState("done");
          setIsRunning(false);
          return 0;
        }
      }
      return prev - 1;
    });
  }, [state, breakDuration]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, tick]);

  const startFocus = () => {
    setState("focus");
    setTimeLeft(focusDuration);
    setIsRunning(true);
  };

  const togglePause = () => setIsRunning(r => !r);

  const reset = () => {
    setIsRunning(false);
    setState("idle");
    setTimeLeft(focusDuration);
  };

  const skipToNext = () => {
    if (state === "focus") {
      setSessions(s => s + 1);
      setState("break");
      setTimeLeft(breakDuration);
    } else if (state === "break") {
      setState("focus");
      setTimeLeft(focusDuration);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalDuration = state === "focus" ? focusDuration : breakDuration;
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const stateColors = {
    idle: "text-muted-foreground",
    focus: "text-primary",
    break: "text-success",
    done: "text-warning",
  };

  const stateLabels = {
    idle: "Ready to focus",
    focus: "Deep Focus",
    break: "Take a break",
    done: "Session complete!",
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Timer className="text-primary h-8 w-8" />
        <h1 className="text-3xl font-display font-bold">Focus</h1>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 260 260">
            <circle
              cx="130" cy="130" r="120"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/30"
            />
            <motion.circle
              cx="130" cy="130" r="120"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className={stateColors[state]}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-display font-bold tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className={`text-sm font-medium mt-2 ${stateColors[state]}`}>
              {state === "focus" && <Zap size={14} className="inline mr-1" />}
              {state === "break" && <Coffee size={14} className="inline mr-1" />}
              {stateLabels[state]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${i < sessions ? "bg-primary" : "bg-muted/30"}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">{sessions} / 4 sessions</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        {state === "idle" ? (
          <Button onClick={startFocus} size="lg" className="h-14 px-8 rounded-2xl text-lg gap-2">
            <Play size={20} /> Start Focus
          </Button>
        ) : (
          <>
            <Button variant="outline" size="icon" onClick={reset} className="h-12 w-12 rounded-xl">
              <RotateCcw size={18} />
            </Button>
            <Button
              onClick={togglePause}
              size="lg"
              className="h-14 px-8 rounded-2xl text-lg gap-2"
              variant={isRunning ? "outline" : "default"}
            >
              {isRunning ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Resume</>}
            </Button>
            <Button variant="outline" size="icon" onClick={skipToNext} className="h-12 w-12 rounded-xl">
              <SkipForward size={18} />
            </Button>
          </>
        )}
      </div>

      {state === "done" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6"
        >
          <CheckCircle2 className="text-success w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Great work!</h2>
          <p className="text-muted-foreground">You completed {sessions} focus sessions.</p>
          <Button onClick={reset} variant="outline" className="mt-4 rounded-xl">
            Start another round
          </Button>
        </motion.div>
      )}

      {activeTasks.length > 0 && (
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-primary" />
              <h3 className="text-sm font-semibold">Focus on a task</h3>
            </div>
            <div className="space-y-2">
              {activeTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task.id.toString())}
                  className={`w-full text-left p-3 rounded-lg transition-colors text-sm ${selectedTask === task.id.toString() ? "bg-primary/10 border border-primary/30" : "bg-muted/30 hover:bg-muted/50"}`}
                >
                  <span className="font-medium">{task.title}</span>
                  {task.estimatedMinutes && (
                    <span className="text-xs text-muted-foreground ml-2">~{task.estimatedMinutes}m</span>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
