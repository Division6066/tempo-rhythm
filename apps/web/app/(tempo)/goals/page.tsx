/**
 * @screen: goals
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 * @queries: goals.listByUser withIndex("by_userId_status")
 * @mutations: goals.create, goals.softDelete @index by_userId_deletedAt
 * @routes-to: /goals/[id], /goals/progress
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { mockGoalCategories, mockGoalDueLabels, mockGoals } from "@tempo/mock-data";
import { Button, Pill, Ring, SoftCard } from "@tempo/ui/primitives";
import { Plus } from "@tempo/ui/icons";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("ready");

  const categoryByGoal = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of mockGoalCategories) {
      m.set(c.goalId, c.category);
    }
    return m;
  }, []);

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-4xl space-y-8 p-6 pb-24 md:p-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-eyebrow text-muted-foreground">Goals</p>
            <h1 className="text-h1 font-serif text-foreground">Direction without pressure.</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {/*
              @action openGoalsProgress
              @navigate: /goals/progress
              @query: goals.aggregateProgress (Long Run 2)
              @auth: required
              @env: NEXT_PUBLIC_CONVEX_URL
            */}
            <Button type="button" variant="soft" onClick={() => router.push("/goals/progress")}>
              Progress
            </Button>
            {/*
              @action createGoal
              @mutation: goals.create @index by_userId_deletedAt
              @auth: required
              @errors: toast
              @env: NEXT_PUBLIC_CONVEX_URL
            */}
            <Button type="button" variant="primary" leadingIcon={<Plus size={14} />}>
              New goal
            </Button>
          </div>
        </header>

        <ul className="space-y-3">
          {mockGoals.map((g) => (
            <li key={g.id}>
              <SoftCard padding="md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link href={`/goals/${g.id}`} className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-xl text-foreground hover:underline">{g.title}</h2>
                      {categoryByGoal.get(g.id) ? (
                        <Pill tone="slate">{categoryByGoal.get(g.id)}</Pill>
                      ) : null}
                    </div>
                    <p className="text-small text-muted-foreground">{g.description}</p>
                    <p className="text-caption text-muted-foreground">
                      Due {mockGoalDueLabels[g.id] ?? "—"}
                    </p>
                  </Link>
                  <Ring size={48} stroke={3} value={Math.round(g.progress * 100)} max={100}>
                    <span className="text-caption font-tabular">{Math.round(g.progress * 100)}</span>
                  </Ring>
                </div>
              </SoftCard>
            </li>
          ))}
        </ul>
      </div>
    </ScreenSurface>
  );
}
