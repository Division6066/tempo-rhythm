"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { CalendarDays, CheckCircle2, Clock3, FileText, Flag, Flame } from "lucide-react";
import Link from "next/link";
import { api } from "../../../../../convex/_generated/api";

const iconByKind = {
  task: CheckCircle2,
  note: FileText,
  habit: Flame,
  focus: Clock3,
  calendar: CalendarDays,
  goal: Flag,
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function Page() {
  const { isAuthenticated } = useConvexAuth();
  // activity.list calls requireUser, which throws until the Convex user row exists.
  // getProfile is non-throwing, so wait for it to resolve before subscribing.
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  const activity = useQuery(api.activity.list, isAuthenticated && profile ? {} : "skip");

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="mb-8 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          You · Activity
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          What did you actually do?
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          A calm chronology of the things you have moved forward.
        </p>
      </header>

      {activity === undefined ? (
        <output className="block rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">Gathering your recent activity…</p>
        </output>
      ) : activity.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Clock3 aria-hidden="true" className="size-5" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">Your activity will collect here</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Complete a task, write a note, or check in on a habit. This page will keep the trail for you.
          </p>
        </section>
      ) : (
        <section aria-label="Recent activity" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <ol className="divide-y divide-border">
            {activity.map((item) => {
              const Icon = iconByKind[item.kind];
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:text-foreground">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">{item.action}</span>
                      <span className="mt-0.5 block truncate text-sm text-muted-foreground">{item.title}</span>
                    </span>
                    <time
                      dateTime={new Date(item.occurredAt).toISOString()}
                      className="shrink-0 text-right text-xs tabular-nums text-muted-foreground"
                    >
                      {dateFormatter.format(item.occurredAt)}
                    </time>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </main>
  );
}
