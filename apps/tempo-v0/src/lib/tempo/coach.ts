import { daysOverdue, startOfLocalDay } from "./windows";
import { isOpenTask } from "./filters";
import type { CoachNudge, Habit, Memory, Task } from "./types";

/**
 * Unprompted surface. Tempo's job is to remember what was committed
 * and what keeps being avoided, and to say it without being asked.
 *
 * Priority:
 *  1. Open task with avoidCount >= 3
 *  2. Commitment memory whose related task is overdue
 *  3. High-energy task stacked on a low-energy day
 *  4. Habit whose streak dropped to zero
 */
export function computeCoachNudge(input: {
  tasks: Task[];
  memories: Memory[];
  habits: Habit[];
  dismissedNudgeIds: string[];
  now?: number;
}): CoachNudge | null {
  const now = input.now ?? Date.now();
  const todayStart = startOfLocalDay(now);
  const liveTasks = input.tasks.filter((t) => t.deletedAt === undefined && isOpenTask(t.status));
  const liveMemories = input.memories.filter((m) => m.deletedAt === undefined);
  const liveHabits = input.habits.filter((h) => h.deletedAt === undefined);
  const dismissed = new Set(input.dismissedNudgeIds);

  const avoided = liveTasks
    .filter((t) => (t.avoidCount ?? 0) >= 3)
    .sort((a, b) => (b.avoidCount ?? 0) - (a.avoidCount ?? 0));

  if (avoided[0]) {
    const task = avoided[0];
    const id = `avoided:${task._id}`;
    if (!dismissed.has(id)) {
      const times = task.avoidCount ?? 0;
      const overdue = task.dueAt ? daysOverdue(task.dueAt, now) : 0;
      return {
        id,
        kind: "avoided",
        headline: "You keep putting this off",
        body:
          overdue > 0
            ? `${task.title} — skipped ${times} times, overdue ${overdue} day${overdue === 1 ? "" : "s"}.`
            : `${task.title} — skipped ${times} times.`,
        relatedTaskId: task._id,
        cta: "Do it now",
        dismissLabel: "Not today",
      };
    }
  }

  const commitments = liveMemories
    .filter((m) => m.metadata?.kind === "commitment" && m.metadata.relatedTaskId)
    .sort((a, b) => b.salience - a.salience);

  for (const memory of commitments) {
    const task = liveTasks.find((t) => t._id === memory.metadata?.relatedTaskId);
    if (!task || task.dueAt === undefined || task.dueAt >= todayStart) continue;
    const id = `commitment:${memory._id}`;
    if (dismissed.has(id)) continue;
    return {
      id,
      kind: "commitment",
      headline: "You committed to this",
      body: memory.content,
      relatedTaskId: task._id,
      relatedMemoryId: memory._id,
      cta: "Open it",
      dismissLabel: "I remember",
    };
  }

  const lowEnergyOpen = liveTasks.filter((t) => (t.energy ?? "medium") === "low").length;
  const highToday = liveTasks.filter((t) => t.energy === "high" && t.dueAt !== undefined && t.dueAt >= todayStart);
  if (lowEnergyOpen >= 2 && highToday[0]) {
    const task = highToday[0];
    const id = `energy:${task._id}`;
    if (!dismissed.has(id)) {
      return {
        id,
        kind: "energy",
        headline: "This is a high-energy task on a low-energy day",
        body: `${task.title} can wait. Start with something smaller.`,
        relatedTaskId: task._id,
        cta: "Park it",
        dismissLabel: "I have the energy",
      };
    }
  }

  const broken = liveHabits
    .filter((h) => h.currentStreak === 0 && h.longestStreak >= 3)
    .sort((a, b) => b.longestStreak - a.longestStreak);
  if (broken[0]) {
    const habit = broken[0];
    const id = `habit:${habit._id}`;
    if (!dismissed.has(id)) {
      return {
        id,
        kind: "habit",
        headline: "This streak went quiet",
        body: `${habit.name} used to run ${habit.longestStreak} days. One check-in restarts it — nothing else is owed.`,
        relatedHabitId: habit._id,
        cta: "Check in",
        dismissLabel: "Leave it",
      };
    }
  }

  return null;
}

export function clampSalience(value: number): number {
  return Math.max(0.1, Math.min(1, value));
}

export function decaySalience(salience: number, decayRate: number, daysSinceAccess: number): number {
  if (daysSinceAccess <= 1) return salience;
  return clampSalience(salience * (1 - decayRate * daysSinceAccess));
}
