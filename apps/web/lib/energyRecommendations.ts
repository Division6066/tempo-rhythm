/**
 * T-007c — energy-aware task recommendations (pure logic, unit-tested).
 *
 * Given the user's current energy level and their open tasks, pick a small,
 * non-overwhelming set of tasks that fit how they feel right now. This module
 * only READS and RECOMMENDS — accepting a recommendation is an explicit user
 * action handled by the UI via the existing `tasks.update` mutation
 * (HARD_RULES §1: nothing is ever applied silently).
 */

export type EnergyLevel = "low" | "medium" | "high";

export type RecommendableTask = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high";
  energy?: EnergyLevel;
  dueAt?: number;
  updatedAt: number;
};

export type EnergyRecommendation = {
  task: RecommendableTask;
  /** True when the task's energy is exactly the requested level (vs. a nearby fallback). */
  exactMatch: boolean;
  /** Shame-free, one-line explanation for why this task is suggested. */
  reason: string;
};

const PRIORITY_RANK: Record<RecommendableTask["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/** Neighbouring energy levels to fall back to, in preference order. */
const ENERGY_FALLBACK: Record<EnergyLevel, EnergyLevel[]> = {
  low: ["medium"],
  medium: ["low", "high"],
  high: ["medium"],
};

const EXACT_REASON: Record<EnergyLevel, string> = {
  low: "A gentle fit for low energy — small effort, real progress.",
  medium: "A steady fit for how you're feeling right now.",
  high: "You've got momentum — this one is sized for it.",
};

const FALLBACK_REASON: Record<EnergyLevel, string> = {
  low: "Close to your current energy — only if it feels right.",
  medium: "Slightly off your current energy, but very doable.",
  high: "Not quite max-energy work, but momentum makes it easy.",
};

function taskEnergy(task: RecommendableTask): EnergyLevel {
  return task.energy ?? "medium";
}

/**
 * Ranking inside an energy bucket: higher priority first, then the task that
 * has waited longest (oldest updatedAt) — quietly resurfacing stale work
 * without ever calling it "overdue".
 */
function rankCandidates(a: RecommendableTask, b: RecommendableTask): number {
  const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (byPriority !== 0) {
    return byPriority;
  }
  return a.updatedAt - b.updatedAt;
}

export function recommendTasksForEnergy(
  tasks: RecommendableTask[],
  options: {
    energy: EnergyLevel;
    /** Local-day window — tasks already due today are excluded (they're on the plan). */
    todayStartMs: number;
    todayEndMs: number;
    /** Maximum number of recommendations (default 3). */
    limit?: number;
    /** Task ids the user dismissed this session ("Not now"); never re-suggested. */
    dismissedIds?: ReadonlySet<string>;
  },
): EnergyRecommendation[] {
  const limit = options.limit ?? 3;
  if (limit <= 0) {
    return [];
  }
  const dismissed = options.dismissedIds ?? new Set<string>();

  const candidates = tasks.filter((task) => {
    if (task.status !== "todo" && task.status !== "in_progress") {
      return false;
    }
    if (dismissed.has(task.id)) {
      return false;
    }
    // Already due today → it is on today's plan; don't recommend it again.
    if (
      task.dueAt !== undefined &&
      task.dueAt >= options.todayStartMs &&
      task.dueAt < options.todayEndMs
    ) {
      return false;
    }
    return true;
  });

  const exact = candidates
    .filter((task) => taskEnergy(task) === options.energy)
    .toSorted(rankCandidates);

  const picks: EnergyRecommendation[] = exact.slice(0, limit).map((task) => ({
    task,
    exactMatch: true,
    reason: EXACT_REASON[options.energy],
  }));

  if (picks.length < limit) {
    for (const fallbackLevel of ENERGY_FALLBACK[options.energy]) {
      if (picks.length >= limit) {
        break;
      }
      const fallback = candidates
        .filter((task) => taskEnergy(task) === fallbackLevel)
        .toSorted(rankCandidates);
      for (const task of fallback) {
        if (picks.length >= limit) {
          break;
        }
        picks.push({ task, exactMatch: false, reason: FALLBACK_REASON[options.energy] });
      }
    }
  }

  return picks;
}
