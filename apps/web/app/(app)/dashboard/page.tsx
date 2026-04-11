"use client";

import { useQuery } from "convex/react";
import { CheckCircle2, Flame, Sparkles, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";

const priorityLabel: Record<"low" | "medium" | "high", string> = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה",
};

const statusLabel: Record<"todo" | "in_progress" | "done" | "cancelled", string> = {
  todo: "לביצוע",
  in_progress: "בתהליך",
  done: "הושלם",
  cancelled: "בוטל",
};

export default function DashboardPage() {
  const profile = useQuery(api.users.getProfile, {});
  const tasks = useQuery(api.tasks.list, {});
  const streak = useQuery(api.streaks.getCurrent, {});
  const habits = useQuery(api.habits.list, {});

  const isLoading =
    profile === undefined ||
    tasks === undefined ||
    streak === undefined ||
    habits === undefined;

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-2xl bg-muted" />
            <div className="h-72 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </main>
    );
  }

  const todayTasks = (tasks ?? []).filter((task) => task.status !== "cancelled").slice(0, 6);
  const activeHabits = (habits ?? []).slice(0, 6);
  const completedTodayCount = (tasks ?? []).filter((task) => task.status === "done").length;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-8 rounded-3xl border border-border/70 bg-card/85 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_24px_40px_-32px_rgba(19,19,18,0.45)] backdrop-blur-sm sm:p-8">
        <p className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          קצב אישי ליום שלך
        </p>
        <h1 className="font-heading text-3xl leading-tight text-foreground sm:text-4xl">
          שלום {profile?.greetingName ?? "לך"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          הנה תמונת מצב עדכנית של ההרגלים, המשימות והרצף שלך כדי לשמור על התקדמות עקבית.
        </p>
        <div className="mt-5 h-1.5 w-44 rounded-full bg-linear-to-r from-[#D97757] to-[#E8A87C]" />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
          label="משימות שהושלמו"
          value={completedTodayCount}
          caption="סך כל המשימות במצב הושלם"
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-primary" />}
          label="רצף נוכחי"
          value={streak?.streakCount ?? 0}
          caption="ימים ברצף מתוך ההרגלים שלך"
        />
        <StatCard
          icon={<Target className="h-5 w-5 text-primary" />}
          label="הרגלים פעילים"
          value={streak?.habitCount ?? 0}
          caption="מספר ההרגלים הפעילים כרגע"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/70 bg-card/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_16px_34px_-28px_rgba(19,19,18,0.5)]">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-2xl">משימות להיום</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                אין כרגע משימות פתוחות. זה זמן טוב להוסיף משימה חדשה.
              </p>
            ) : (
              todayTasks.map((task) => (
                <article
                  key={task._id}
                  className="rounded-xl border border-border/70 bg-background/70 p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h3 className="font-medium text-foreground">{task.title}</h3>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      {priorityLabel[task.priority]}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border px-2 py-0.5">
                      {statusLabel[task.status]}
                    </span>
                    {task.dueAt ? (
                      <span>
                        יעד:{" "}
                        {new Date(task.dueAt).toLocaleDateString("he-IL", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    ) : (
                      <span>ללא תאריך יעד</span>
                    )}
                  </div>
                </article>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_16px_34px_-28px_rgba(19,19,18,0.5)]">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-2xl">התקדמות הרגלים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeHabits.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                עדיין לא נוספו הרגלים. הוסף הרגל ראשון כדי להתחיל לבנות רצף.
              </p>
            ) : (
              activeHabits.map((habit) => (
                <article
                  key={habit._id}
                  className="rounded-xl border border-border/70 bg-background/70 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <h3 className="font-medium text-foreground">{habit.name}</h3>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      {habit.cadence === "daily" ? "יומי" : "שבועי"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <p>רצף נוכחי: {habit.currentStreak}</p>
                    <p>שיא אישי: {habit.longestStreak}</p>
                  </div>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  caption,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  caption: string;
}) {
  return (
    <Card className="rounded-2xl border-border/70 bg-card/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_12px_28px_-24px_rgba(19,19,18,0.55)]">
      <CardContent className="p-5">
        <div className="mb-3 inline-flex rounded-full bg-secondary p-2">{icon}</div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-heading text-3xl text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
      </CardContent>
    </Card>
  );
}
"use client";

import { useQuery } from "convex/react";
import { CheckCircle2, Flame, ListTodo, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

function useTodayDueBounds() {
  return useMemo(() => {
    const n = new Date();
    const start = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
    return { dueFrom: start, dueTo: start + 24 * 60 * 60 * 1000 };
  }, []);
}

const statusLabel: Record<string, string> = {
  todo: "לביצוע",
  in_progress: "בתהליך",
  done: "בוצע",
  cancelled: "בוטל",
};

const priorityClass: Record<string, string> = {
  high: "text-destructive",
  medium: "text-primary",
  low: "text-muted-foreground",
};

export default function DashboardPage() {
  const profile = useQuery(api.users.getProfile);
  const bounds = useTodayDueBounds();
  const todayTasks = useQuery(api.tasks.list, bounds);
  const streaks = useQuery(api.streaks.getCurrent);
  const habits = useQuery(api.habits.list);

  const loading =
    profile === undefined ||
    todayTasks === undefined ||
    streaks === undefined ||
    habits === undefined;

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="space-y-6">
          <div className="h-12 w-2/3 max-w-md animate-pulse rounded-xl bg-muted" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-48 animate-pulse rounded-2xl bg-muted" />
            <div className="h-48 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="text-muted-foreground">לא נמצא פרופיל משתמש. נסו להתחבר מחדש.</p>
        <Button asChild className="mt-6">
          <Link href="/sign-in">התחברות</Link>
        </Button>
      </div>
    );
  }

  const openToday = todayTasks.filter((t) => t.status !== "done" && t.status !== "cancelled");

  return (
    <div className="container mx-auto max-w-6xl px-6 py-12" dir="rtl">
      <header className="mb-12">
        <p className="text-sm font-medium text-muted-foreground">לוח בקרה</p>
        <h1 className="font-heading mt-2 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          שלום, <span className="text-gradient-primary">{profile.greetingName}</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          סיכום היום, משימות ומעקב הרגלים במקום אחד.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <SoftCard className="grain-bg lg:col-span-2">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-[#D97757] to-[#E8A87C] text-primary-foreground shadow-inner">
                <ListTodo className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-semibold text-foreground">משימות להיום</h2>
                <p className="text-sm text-muted-foreground">לפי תאריך יעד היום</p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-border bg-card/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
            >
              <Link href="/tasks">כל המשימות</Link>
            </Button>
          </div>

          {todayTasks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center text-muted-foreground">
              אין משימות עם יעד להיום.{" "}
              <Link href="/tasks" className="font-semibold text-primary underline-offset-4 hover:underline">
                הוסיפו משימה
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {openToday.length === 0 ? (
                <li className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-primary">
                  <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
                  <span>כל משימות היום הושלמו — כל הכבוד!</span>
                </li>
              ) : null}
              {todayTasks.map((task) => (
                <li
                  key={task._id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/50 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]",
                    task.status === "done" && "opacity-70",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "font-medium text-foreground",
                        task.status === "done" && "line-through",
                      )}
                    >
                      {task.title}
                    </p>
                    {task.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {statusLabel[task.status] ?? task.status}
                    </span>
                    <span className={cn("text-xs font-semibold uppercase", priorityClass[task.priority])}>
                      {task.priority}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SoftCard>

        <div className="space-y-8">
          <SoftCard className="grain-bg">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-[#D97757] to-[#E8A87C] text-primary-foreground shadow-inner">
                <Flame className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold">רצף נוכחי</h2>
                <p className="text-sm text-muted-foreground">מקסימום בין ההרגלים</p>
              </div>
            </div>
            <p className="mt-6 font-heading text-5xl font-bold text-gradient-primary tabular-nums">
              {streaks.streakCount}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              רצף ארוך ביותר: {streaks.longestAmongHabits} · {streaks.habitCount} הרגלים
            </p>
          </SoftCard>

          <SoftCard className="grain-bg">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-[#D97757] to-[#E8A87C] text-primary-foreground shadow-inner">
                  <Sparkles className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-semibold">הרגלים</h2>
                  <p className="text-sm text-muted-foreground">התקדמות רצף</p>
                </div>
              </div>
              <Button
                asChild
                variant="ghost"
                className="text-primary hover:bg-primary/10 hover:text-primary"
              >
                <Link href="/habits">ניהול</Link>
              </Button>
            </div>

            {habits.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                עדיין אין הרגלים.{" "}
                <Link href="/habits" className="font-semibold text-primary underline-offset-4 hover:underline">
                  צרו הרגל ראשון
                </Link>
              </p>
            ) : (
              <ul className="space-y-5">
                {habits.slice(0, 5).map((h) => {
                  const cap = Math.max(h.longestStreak, h.currentStreak, 1);
                  const pct = Math.min(100, Math.round((h.currentStreak / cap) * 100));
                  return (
                    <li key={h._id}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-foreground">{h.name}</span>
                        <span className="tabular-nums text-muted-foreground">{h.currentStreak} ימים</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)]">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-[#D97757] to-[#E8A87C] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </SoftCard>
        </div>
      </div>
    </div>
  );
}
