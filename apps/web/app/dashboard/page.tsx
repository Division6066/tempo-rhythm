"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { AppPageShell, PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { endOfLocalDayMs, startOfLocalDayMs } from "@/lib/localDay";

export default function DashboardPage() {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);
  const stats = useQuery(api.analytics.overview);
  const tasks = useQuery(api.tasks.list, {});
  const ensureUser = useMutation(api.users.createOrUpdateUser);

  useEffect(() => {
    if (isAuthenticated) {
      void ensureUser();
    }
  }, [isAuthenticated, ensureUser]);

  const todayTasks = useMemo(() => {
    if (!tasks) return [];
    const start = startOfLocalDayMs();
    const end = endOfLocalDayMs();
    return tasks.filter(
      (t) =>
        t.dueAt !== undefined &&
        t.dueAt >= start &&
        t.dueAt < end &&
        t.status !== "done" &&
        t.status !== "cancelled",
    );
  }, [tasks]);

  const displayName = user?.fullName || user?.email?.split("@")[0] || "משתמש";

  return (
    <AppPageShell>
      <PageHeader
        title={`שלום, ${displayName}`}
        description="סקירה מהירה של היום — משימות, פתקים ומטרות במקום אחד."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" dir="rtl">
        <StatCard label="משימות פתוחות" value={stats?.taskTodo ?? "—"} />
        <StatCard label="משימות להיום" value={stats?.tasksDueToday ?? "—"} />
        <StatCard label="פתקים" value={stats?.notesTotal ?? "—"} />
        <StatCard label="מטרות פעילות" value={stats?.goalsActive ?? "—"} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2" dir="rtl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-base">משימות להיום</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/tasks">כל המשימות</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">אין משימות עם תאריך יעד להיום.</p>
            ) : (
              <ul className="space-y-2">
                {todayTasks.slice(0, 8).map((t) => (
                  <li
                    key={t._id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <span className="truncate">{t.title}</span>
                    <span className="shrink-0 text-muted-foreground text-xs">{t.priority}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-base">קיצורי דרך</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href="/tasks">משימות חדשה</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/notes">פתק חדש</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/calendar">יומן</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/coach">מאמן</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppPageShell>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-bold text-3xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
