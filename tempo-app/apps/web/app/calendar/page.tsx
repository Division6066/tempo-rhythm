"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  X,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns";
import Link from "next/link";

type ViewMode = "day" | "week" | "month";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStart, setNewEventStart] = useState("09:00");
  const [newEventEnd, setNewEventEnd] = useState("10:00");

  const dateRange = useMemo(() => {
    if (viewMode === "day") {
      return {
        start: format(currentDate, "yyyy-MM-dd"),
        end: format(currentDate, "yyyy-MM-dd"),
      };
    } else if (viewMode === "week") {
      const s = startOfWeek(currentDate, { weekStartsOn: 1 });
      const e = endOfWeek(currentDate, { weekStartsOn: 1 });
      return { start: format(s, "yyyy-MM-dd"), end: format(e, "yyyy-MM-dd") };
    } else {
      const s = startOfMonth(currentDate);
      const e = endOfMonth(currentDate);
      return { start: format(s, "yyyy-MM-dd"), end: format(e, "yyyy-MM-dd") };
    }
  }, [currentDate, viewMode]);

  const tasks = useQuery(api.tasks.listByDateRange, {
    startDate: dateRange.start,
    endDate: dateRange.end,
  });
  const events = useQuery(api.calendarEvents.list, {
    startDate: dateRange.start,
    endDate: dateRange.end,
  });
  const createEvent = useMutation(api.calendarEvents.create);
  const updateTask = useMutation(api.tasks.update);

  const navigate = (direction: number) => {
    if (viewMode === "day")
      setCurrentDate(direction > 0 ? addDays(currentDate, 1) : subDays(currentDate, 1));
    else if (viewMode === "week")
      setCurrentDate(direction > 0 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    else
      setCurrentDate(direction > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const days = useMemo(() => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: calStart, end: calEnd });
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
    }
    return [currentDate];
  }, [currentDate, viewMode]);

  const hours = Array.from({ length: 16 }, (_, i) => i + 6);

  const getItemsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayTasks = (tasks || []).filter((t) => t.scheduledDate === dateStr);
    const dayEvents = (events || []).filter((e) => e.date === dateStr);
    return { tasks: dayTasks, events: dayEvents };
  };

  const handleCreateEvent = async () => {
    if (!newEventTitle.trim() || !selectedDate) return;
    await createEvent({
      title: newEventTitle,
      date: selectedDate,
      startTime: newEventStart,
      endTime: newEventEnd,
    });
    setNewEventTitle("");
    setShowEventForm(false);
    setSelectedDate(null);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(format(date, "yyyy-MM-dd"));
    setShowEventForm(true);
  };

  const timeToPosition = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return ((h - 6) * 60 + m) * (48 / 60);
  };

  const durationToHeight = (startTime: string, endTimeOrDuration: string | number) => {
    if (typeof endTimeOrDuration === "number") {
      return endTimeOrDuration * (48 / 60);
    }
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = (endTimeOrDuration as string).split(":").map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    return Math.max(mins * (48 / 60), 24);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="text-primary h-8 w-8" />
            <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft size={18} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate(1)}>
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {viewMode === "month"
              ? format(currentDate, "MMMM yyyy")
              : viewMode === "week"
                ? `${format(days[0], "MMM d")} - ${format(days[days.length - 1], "MMM d, yyyy")}`
                : format(currentDate, "EEEE, MMMM d, yyyy")}
          </h2>
          <div className="flex bg-card rounded-lg border border-border overflow-hidden">
            {(["day", "week", "month"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium capitalize cursor-pointer transition-colors ${viewMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {viewMode === "month" ? (
          <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="bg-card p-2 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
            {days.map((day) => {
              const items = getItemsForDate(day);
              const inMonth = isSameMonth(day, currentDate);
              return (
                <div
                  key={day.toISOString()}
                  className={`bg-card p-2 min-h-[80px] cursor-pointer hover:bg-muted/30 transition-colors ${!inMonth ? "opacity-40" : ""}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div
                    className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"}`}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {items.tasks.slice(0, 2).map((t) => (
                      <div
                        key={t._id}
                        className="text-[10px] bg-primary/20 text-primary px-1 py-0.5 rounded truncate"
                      >
                        {t.title}
                      </div>
                    ))}
                    {items.events.slice(0, 2).map((e) => (
                      <div
                        key={e._id}
                        className="text-[10px] bg-teal-500/20 text-teal-400 px-1 py-0.5 rounded truncate"
                      >
                        {e.title}
                      </div>
                    ))}
                    {items.tasks.length + items.events.length > 4 && (
                      <div className="text-[10px] text-muted-foreground">
                        +{items.tasks.length + items.events.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative">
            {viewMode === "week" && (
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border mb-1">
                <div />
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`text-center py-2 ${isToday(day) ? "text-primary font-bold" : "text-muted-foreground"}`}
                  >
                    <div className="text-xs">{format(day, "EEE")}</div>
                    <div
                      className={`text-lg font-semibold w-8 h-8 flex items-center justify-center mx-auto rounded-full ${isToday(day) ? "bg-primary text-primary-foreground" : ""}`}
                    >
                      {format(day, "d")}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div
              className={`grid ${viewMode === "week" ? "grid-cols-[60px_repeat(7,1fr)]" : "grid-cols-[60px_1fr]"} overflow-y-auto max-h-[600px]`}
            >
              <div>
                {hours.map((h) => (
                  <div key={h} className="h-12 flex items-start justify-end pr-2">
                    <span className="text-[10px] text-muted-foreground -mt-1">
                      {h.toString().padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
              </div>

              {days.map((day) => {
                const items = getItemsForDate(day);
                return (
                  <div
                    key={day.toISOString()}
                    className="relative border-l border-border"
                    onClick={() => handleDayClick(day)}
                  >
                    {hours.map((h) => (
                      <div key={h} className="h-12 border-b border-border/30" />
                    ))}

                    {items.tasks
                      .filter((t) => t.startTime)
                      .map((t) => (
                        <Link key={t._id} href={`/tasks/${t._id}`}>
                          <div
                            className="absolute left-1 right-1 bg-primary/20 border-l-2 border-primary rounded px-1 py-0.5 cursor-pointer hover:bg-primary/30 transition-colors overflow-hidden z-10"
                            style={{
                              top: `${timeToPosition(t.startTime!)}px`,
                              height: `${durationToHeight(t.startTime!, t.duration || 30)}px`,
                            }}
                          >
                            <div className="text-[10px] font-medium text-primary truncate">
                              {t.title}
                            </div>
                            <div className="text-[9px] text-muted-foreground">
                              {t.startTime} ({t.duration || 30}m)
                            </div>
                          </div>
                        </Link>
                      ))}

                    {items.events.map((e) => (
                      <div
                        key={e._id}
                        className="absolute left-1 right-1 bg-teal-500/20 border-l-2 border-teal-500 rounded px-1 py-0.5 overflow-hidden z-10"
                        style={{
                          top: `${timeToPosition(e.startTime)}px`,
                          height: `${durationToHeight(e.startTime, e.endTime)}px`,
                        }}
                      >
                        <div className="text-[10px] font-medium text-teal-400 truncate">
                          {e.title}
                        </div>
                        <div className="text-[9px] text-muted-foreground">
                          {e.startTime} - {e.endTime}
                        </div>
                      </div>
                    ))}

                    {items.tasks
                      .filter((t) => !t.startTime)
                      .map((t, i) => (
                        <Link key={t._id} href={`/tasks/${t._id}`}>
                          <div
                            className="absolute left-1 right-1 bg-amber-500/20 border-l-2 border-amber-500 rounded px-1 py-0.5 cursor-pointer hover:bg-amber-500/30 transition-colors overflow-hidden z-10"
                            style={{ top: `${i * 20 + 2}px`, height: "18px" }}
                          >
                            <div className="text-[10px] font-medium text-amber-400 truncate">
                              {t.title}
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showEventForm && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEventForm(false)}
          >
            <Card
              className="w-full max-w-md mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">
                    New Event - {selectedDate}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEventForm(false)}
                  >
                    <X size={18} />
                  </Button>
                </div>
                <Input
                  autoFocus
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Event title"
                  className="bg-background border-border"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Start</label>
                    <Input
                      type="time"
                      value={newEventStart}
                      onChange={(e) => setNewEventStart(e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">End</label>
                    <Input
                      type="time"
                      value={newEventEnd}
                      onChange={(e) => setNewEventEnd(e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setShowEventForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateEvent}
                    disabled={!newEventTitle.trim()}
                  >
                    Create Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
