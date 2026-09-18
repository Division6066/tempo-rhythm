import type {
  CoachNudge,
  CreateQuickArgs,
  CreateTaskArgs,
  DashboardSnapshot,
  DemoMode,
  Habit,
  ListTasksArgs,
  Memory,
  MemorySector,
  MemoryStats,
  Task,
  TaskStatus,
  UpdateTaskArgs,
} from "./types";

export class AdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdapterError";
  }
}

export class AdapterNotWiredError extends AdapterError {
  constructor(message = "Live adapter is not wired. The mock adapter is the only one in this build.") {
    super(message);
    this.name = "AdapterNotWiredError";
  }
}

/**
 * Function signatures the live Convex adapter must match.
 * Names follow convex/tasks.ts, convex/memories.ts, convex/habits.ts.
 */
export interface TempoAdapter {
  listToday(args: { dueFrom: number; dueTo: number }): Promise<Task[]>;
  listOverdue(args: { beforeMs: number }): Promise<Task[]>;
  listTasks(args?: ListTasksArgs): Promise<Task[]>;
  create(args: CreateTaskArgs): Promise<string>;
  createQuick(args: CreateQuickArgs): Promise<string>;
  update(args: UpdateTaskArgs): Promise<string>;
  toggleCompletion(args: { taskId: string }): Promise<{ taskId: string; status: TaskStatus }>;
  snooze(args: { taskId: string; untilMs: number }): Promise<string>;
  remove(args: { taskId: string }): Promise<{ success: boolean }>;

  queryMemories(args?: { sector?: MemorySector; limit?: number }): Promise<Memory[]>;
  addMemory(args: { content: string; sector?: MemorySector; salience?: number }): Promise<string>;
  getMemoryStats(): Promise<MemoryStats>;

  listHabits(): Promise<Habit[]>;
  completeHabitToday(args: { habitId: string }): Promise<Habit>;

  getDashboard(): Promise<DashboardSnapshot>;
  getCoachNudge(): Promise<CoachNudge | null>;
  acknowledgeNudge(args: { id: string }): Promise<void>;

  setDemo(mode: DemoMode): Promise<void>;
  getDemo(): DemoMode;
}

export const liveAdapter: TempoAdapter = new Proxy({} as TempoAdapter, {
  get(_target, prop) {
    if (prop === "getDemo") return () => "error" as DemoMode;
    return async () => {
      throw new AdapterNotWiredError(
        `Live adapter has no ${String(prop)}. Swap mock.ts for the Convex client at graft time.`,
      );
    };
  },
});
