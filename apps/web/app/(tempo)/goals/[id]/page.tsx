/**
 * @screen: goal-detail
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 * @queries: goals.getById withIndex("by_userId_deletedAt")
 * @mutations: goals.updateProgress, goals.toggleMilestone @index by_userId_status
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { mockGoals } from "@tempo/mock-data";
import { Button, Ring, SoftCard } from "@tempo/ui/primitives";
import { Check } from "@tempo/ui/icons";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [mode, setMode] = useState<ViewMode>("ready");
  const [milestoneDone, setMilestoneDone] = useState<Record<string, boolean>>({});

  const goal = useMemo(() => mockGoals.find((g) => g.id === id) ?? null, [id]);

  const toggleMilestone = (mid: string, defaultDone: boolean) => {
    setMilestoneDone((prev) => ({
      ...prev,
      [mid]: !(prev[mid] ?? defaultDone),
    }));
  };

  if (!goal) {
    return (
      <ScreenSurface mode={mode} onModeChange={setMode}>
        <div className="p-8">
          <SoftCard padding="md">
            <p className="text-muted-foreground">Goal not found.</p>
            <Link href="/goals" className="mt-4 inline-block text-primary underline">
              Back to goals
            </Link>
          </SoftCard>
        </div>
      </ScreenSurface>
    );
  }

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-3xl space-y-8 p-6 pb-24 md:p-8">
        <Link href="/goals" className="text-small text-muted-foreground hover:text-foreground">
          ← Goals
        </Link>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-h1 font-serif text-foreground">{goal.title}</h1>
            <p className="mt-2 text-body text-muted-foreground">{goal.description}</p>
          </div>
          <Ring size={56} stroke={3} value={Math.round(goal.progress * 100)} max={100}>
            <span className="text-small font-tabular">{Math.round(goal.progress * 100)}%</span>
          </Ring>
        </header>

        <SoftCard padding="md">
          <h2 className="font-eyebrow text-muted-foreground">Milestones</h2>
          <ul className="mt-4 space-y-2">
            {goal.milestones.map((m) => {
              const done = milestoneDone[m.id] ?? m.done;
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border-soft px-3 py-2"
                >
                  <span className={done ? "text-muted-foreground line-through" : "text-foreground"}>
                    {m.title}
                  </span>
                  {/*
                    @action toggleGoalMilestone
                    @mutation: goals.toggleMilestone @index by_userId_status
                    @soft-delete: no
                    @optimistic: strike toggle
                    @auth: required
                    @errors: toast
                    @env: NEXT_PUBLIC_CONVEX_URL
                  */}
                  <button
                    type="button"
                    aria-pressed={done}
                    aria-label={done ? `Mark ${m.title} not done` : `Mark ${m.title} done`}
                    onClick={() => toggleMilestone(m.id, m.done)}
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
                      done ? "border-primary bg-primary text-primary-foreground" : "border-border",
                    ].join(" ")}
                  >
                    {done ? <Check size={14} strokeWidth={2.5} /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </SoftCard>

        {/*
          @action saveGoalEdits
          @mutation: goals.patch @index by_userId_deletedAt
          @auth: required
          @errors: toast
          @env: NEXT_PUBLIC_CONVEX_URL
        */}
        <Button type="button" variant="primary">
          Save changes
        </Button>
      </div>
    </ScreenSurface>
  );
}
