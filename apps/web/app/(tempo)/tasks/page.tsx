/**
 * @screen: tasks
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-1.jsx:L385-L434
 * @queries: tasks.listByUser withIndex("by_userId_deletedAt")
 * @mutations: tasks.create, tasks.complete, tasks.softDelete @index by_userId_status
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useState } from "react";
import { mockLibraryTasks } from "@tempo/mock-data";
import { Button, Pill, SoftCard, TaskRow } from "@tempo/ui/primitives";
import { Filter, Plus, Tag } from "@tempo/ui/icons";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

function meta(t: (typeof mockLibraryTasks)[0]): string {
  const parts: string[] = [];
  if (t.dueLabel) {
    parts.push(t.dueLabel);
  }
  if (t.estimatedMinutes != null) {
    parts.push(`${t.estimatedMinutes} min`);
  }
  if (t.energy) {
    parts.push(`${t.energy} energy`);
  }
  return parts.join(" · ");
}

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");
  const [tasks, setTasks] = useState(() =>
    mockLibraryTasks.map((t) => ({ ...t, done: t.status === "done" })),
  );

  const toggle = (id: string, next: boolean) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, done: next, status: next ? ("done" as const) : ("todo" as const) } : t,
      ),
    );
  };

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-4xl space-y-8 p-6 pb-24 md:p-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="font-eyebrow text-muted-foreground">Library · Tasks</p>
            <h1 className="text-h1 font-serif text-foreground">Small things, in order.</h1>
            <p className="max-w-xl text-body text-muted-foreground">
              Twelve in flight. Three flagged by Coach as &quot;high energy&quot; — tackle before noon if you can.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-lg border border-border bg-surface-sunken p-0.5">
              {/*
                @action setTaskViewList
                @query: tasks.listByUser
                @auth: required
                @env: NEXT_PUBLIC_CONVEX_URL
                @source: screens-1.jsx:L407-L409
              */}
              <Button type="button" variant="primary" size="sm">
                List
              </Button>
              <Button type="button" variant="ghost" size="sm">
                Board
              </Button>
              <Button type="button" variant="ghost" size="sm">
                Timeline
              </Button>
            </div>
            {/*
              @action createTask
              @mutation: tasks.create @index by_userId_deletedAt
              @navigate: modal or inline form
              @auth: required
              @errors: toast
              @env: NEXT_PUBLIC_CONVEX_URL
              @source: screens-1.jsx:L412
            */}
            <Button type="button" variant="primary" leadingIcon={<Plus size={14} />}>
              New task
            </Button>
          </div>
        </header>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
            {(["All", "Today", "Upcoming", "Someday", "Done"] as const).map((tab) => (
              <Button key={tab} type="button" size="sm" variant={tab === "All" ? "primary" : "ghost"}>
                {tab}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            {/*
              @action openEnergyFilter
              @query: tasks.listByUser (filtered server-side)
              @auth: required
              @env: NEXT_PUBLIC_CONVEX_URL
              @source: screens-1.jsx:L421
            */}
            <Button type="button" variant="soft" size="sm" leadingIcon={<Filter size={14} />}>
              Energy
            </Button>
            {/*
              @action openTagFilter
              @query: tasks.listByUser
              @auth: required
              @env: NEXT_PUBLIC_CONVEX_URL
              @source: screens-1.jsx:L422
            */}
            <Button type="button" variant="soft" size="sm" leadingIcon={<Tag size={14} />}>
              Tag
            </Button>
          </div>
        </div>

        <SoftCard padding="md">
          <div className="divide-y divide-border-soft">
            {tasks.map((t) => (
              <TaskRow
                key={t.id}
                taskId={t.id}
                title={t.title}
                done={t.done}
                meta={meta(t)}
                onToggle={(id, next) => toggle(id, next)}
                trailing={
                  <div className="flex shrink-0 gap-1">
                    {t.coachSuggested ? <Pill tone="orange">Coach</Pill> : null}
                    {t.tag ? <Pill tone="slate">{t.tag}</Pill> : null}
                  </div>
                }
              />
            ))}
          </div>
        </SoftCard>
      </div>
    </ScreenSurface>
  );
}
