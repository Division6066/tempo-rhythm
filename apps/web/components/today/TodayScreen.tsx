"use client";

import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { SoftCard } from "@/components/soft-editorial/SoftCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { getLocalDayBoundsMs } from "@/lib/todayBounds";
import { TodayGreeting } from "./TodayGreeting";
import { TodayQuickAdd } from "./TodayQuickAdd";
import { TodayTaskList } from "./TodayTaskList";

export function TodayScreen() {
  const bounds = getLocalDayBoundsMs();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const profile = useQuery(
    api.users.getProfile,
    isAuthenticated ? {} : "skip",
  );
  const todayTasks = useQuery(
    api.tasks.listToday,
    isAuthenticated ? bounds : "skip",
  );

  const isLoading =
    isAuthLoading ||
    (isAuthenticated && (profile === undefined || todayTasks === undefined));

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-6 py-12" dir="rtl">
        <div className="space-y-6">
          <div className="h-12 w-64 animate-pulse rounded-xl bg-muted" />
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile || !todayTasks) {
    return (
      <div className="container mx-auto max-w-5xl px-6 py-16 text-center" dir="rtl">
        <SoftCard className="mx-auto max-w-xl">
          <h1 className="font-heading text-2xl font-semibold text-foreground">צריך להתחבר מחדש</h1>
          <p className="mt-3 text-muted-foreground">
            לא הצלחנו לטעון את הפרופיל כרגע. אפשר להתחבר שוב ולהמשיך מאותה נקודה.
          </p>
          <Button asChild className="mt-6">
            <Link href="/sign-in">להתחברות</Link>
          </Button>
        </SoftCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12" dir="rtl">
      <div className="space-y-8">
        <TodayGreeting greetingName={profile.greetingName} />
        <TodayQuickAdd dueAt={bounds.endMs - 1} />
        <TodayTaskList tasks={todayTasks} />
      </div>
    </div>
  );
}
