import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getAdapter } from "./index";
import { mockStore } from "./mock";
import { computeCoachNudge } from "./coach";
import { filterTasksDueInRange, isOpenTask, OVERDUE_SURFACE_CAP } from "./filters";
import { computeInsightsSummary } from "./insights";
import { DAY_MS, startOfLocalDay, startOfLocalWeek } from "./windows";
import type { DemoMode, Task } from "./types";

export function useTempoSnapshot() {
  return useSyncExternalStore(mockStore.subscribe, mockStore.getSnapshot, mockStore.getSnapshot);
}

export function useTempo() {
  const snapshot = useTempoSnapshot();
  const adapter = getAdapter();
  const now = Date.now();
  const todayStart = startOfLocalDay(now);
  const todayEnd = todayStart + DAY_MS;

  const derived = useMemo(() => {
    if (snapshot.demo === "error") {
      return {
        today: [] as Task[],
        overdue: [] as Task[],
        overdueHidden: 0,
        insights: computeInsightsSummary({
          tasks: [],
          habits: [],
          goals: [],
          todayStartMs: todayStart,
          todayEndMs: todayEnd,
          weekStartMs: startOfLocalWeek(now),
        }),
        nudge: null,
      };
    }
    const live = snapshot.tasks.filter((t) => t.deletedAt === undefined);
    const today = filterTasksDueInRange(live, todayStart, todayEnd).sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0));
    const overdueAll = live
      .filter((t) => isOpenTask(t.status) && t.dueAt !== undefined && t.dueAt < todayStart)
      .sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0));
    const skip = snapshot.repeatCfgs.some((cfg) => cfg.skipOverdue) || true;
    const overdue = skip ? overdueAll.slice(0, OVERDUE_SURFACE_CAP) : overdueAll;
    return {
      today,
      overdue,
      overdueHidden: Math.max(0, overdueAll.length - overdue.length),
      insights: computeInsightsSummary({
        tasks: snapshot.tasks,
        habits: snapshot.habits,
        goals: snapshot.goals,
        todayStartMs: todayStart,
        todayEndMs: todayEnd,
        weekStartMs: startOfLocalWeek(now),
      }),
      nudge: computeCoachNudge({
        tasks: snapshot.tasks,
        memories: snapshot.memories,
        habits: snapshot.habits,
        dismissedNudgeIds: snapshot.dismissedNudgeIds,
        now,
      }),
    };
  }, [snapshot, now, todayEnd, todayStart]);

  const setDemo = useCallback(
    async (mode: DemoMode) => {
      await adapter.setDemo(mode);
    },
    [adapter],
  );

  return { snapshot, adapter, ...derived, setDemo, todayStart, todayEnd };
}
