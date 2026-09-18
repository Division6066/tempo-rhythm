import { AdapterError, type TempoAdapter } from "./adapter";
import { computeCoachNudge } from "./coach";
import { MOCK_USER_ID, STORAGE_KEY } from "./config";
import { filterTasksDueInRange, isOpenTask, OVERDUE_SURFACE_CAP } from "./filters";
import { computeHabitStreakUpdate } from "./habit-streak";
import { computeInsightsSummary } from "./insights";
import { buildSeed, emptySnapshot } from "./seed";
import type {
  CoachNudge,
  CreateQuickArgs,
  CreateTaskArgs,
  DashboardSnapshot,
  DayCompletion,
  DemoMode,
  Habit,
  ListTasksArgs,
  Memory,
  MemorySector,
  MemoryStats,
  Task,
  TempoSnapshot,
  UpdateTaskArgs,
} from "./types";
import { DAY_MS, isoDay, startOfLocalDay, startOfLocalWeek } from "./windows";

const QUICK_TITLE_MAX = 280;
const SECTORS: MemorySector[] = ["semantic", "episodic", "procedural", "emotional", "general"];

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class MockStore {
  private state: TempoSnapshot;
  private listeners = new Set<() => void>();

  constructor() {
    this.state = buildSeed();
  }

  hydrateFromStorage() {
    const persisted = this.readPersisted();
    if (persisted) this.setState(persisted);
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): TempoSnapshot => this.state;

  private emit() {
    this.persist();
    for (const listener of this.listeners) listener();
  }

  private persist() {
    if (!canUseStorage()) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      /* ignore quota */
    }
  }

  private readPersisted(): TempoSnapshot | null {
    if (!canUseStorage()) return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as TempoSnapshot;
      if (!parsed || !Array.isArray(parsed.tasks)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  setState(next: TempoSnapshot) {
    this.state = next;
    this.emit();
  }

  update(mutator: (draft: TempoSnapshot) => void) {
    const draft = clone(this.state);
    mutator(draft);
    this.setState(draft);
  }

  reset(mode: DemoMode) {
    if (mode === "empty") this.setState(emptySnapshot());
    else if (mode === "error") this.setState({ ...emptySnapshot(), demo: "error" });
    else this.setState(buildSeed());
  }
}

export const mockStore = new MockStore();

function assertNotError(store: MockStore) {
  if (store.getSnapshot().demo === "error") {
    throw new AdapterError("The mock adapter is in the error fixture. Restore seeded data to continue.");
  }
}

function liveTasks(state: TempoSnapshot): Task[] {
  return state.tasks.filter((t) => t.deletedAt === undefined);
}

function nextId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function weekSeries(tasks: Task[], now: number): DayCompletion[] {
  const today = startOfLocalDay(now);
  const days: DayCompletion[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const start = today - i * DAY_MS;
    const end = start + DAY_MS;
    const completed = tasks.filter(
      (t) => t.deletedAt === undefined && t.status === "done" && t.updatedAt >= start && t.updatedAt < end,
    ).length;
    const label = new Date(start).toLocaleDateString(undefined, { weekday: "short" });
    days.push({ date: isoDay(start), label, completed });
  }
  return days;
}

export function createMockAdapter(store: MockStore = mockStore): TempoAdapter {
  const adapter: TempoAdapter = {
    async listToday({ dueFrom, dueTo }) {
      assertNotError(store);
      const rows = liveTasks(store.getSnapshot());
      return filterTasksDueInRange(rows, dueFrom, dueTo).sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0));
    },

    async listOverdue({ beforeMs }) {
      assertNotError(store);
      const skip = store.getSnapshot().repeatCfgs.some((cfg) => cfg.skipOverdue);
      const rows = liveTasks(store.getSnapshot())
        .filter((t) => isOpenTask(t.status) && t.dueAt !== undefined && t.dueAt < beforeMs)
        .sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0));
      if (skip) return rows.slice(0, OVERDUE_SURFACE_CAP);
      return rows;
    },

    async listTasks(args = {}) {
      assertNotError(store);
      let rows = liveTasks(store.getSnapshot());
      if (args.status) rows = rows.filter((t) => t.status === args.status);
      if (args.projectId?.trim()) rows = rows.filter((t) => t.projectId === args.projectId?.trim());
      if (args.priority) rows = rows.filter((t) => t.priority === args.priority);
      if (args.energy) rows = rows.filter((t) => (t.energy ?? "medium") === args.energy);
      if (args.search?.trim()) {
        const q = args.search.trim().toLowerCase();
        rows = rows.filter(
          (t) => t.title.toLowerCase().includes(q) || (t.description?.toLowerCase().includes(q) ?? false),
        );
      }
      if (args.dueFrom !== undefined && args.dueTo !== undefined) {
        rows = filterTasksDueInRange(rows, args.dueFrom, args.dueTo, { excludeCancelled: false });
      }
      return rows.sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt));
    },

    async create(args: CreateTaskArgs) {
      assertNotError(store);
      const now = Date.now();
      const taskId = nextId("task");
      store.update((draft) => {
        draft.tasks.unshift({
          _id: taskId,
          userId: MOCK_USER_ID,
          title: args.title.trim(),
          description: args.description?.trim(),
          status: args.status ?? "todo",
          priority: args.priority ?? "medium",
          energy: args.energy ?? "medium",
          projectId: args.projectId?.trim(),
          projectName: args.projectName?.trim(),
          dueAt: args.dueAt,
          checklist: args.checklist,
          createdAt: now,
          updatedAt: now,
          avoidCount: 0,
        });
      });
      return taskId;
    },

    async createQuick(args: CreateQuickArgs) {
      assertNotError(store);
      const trimmed = args.title.trim();
      if (!trimmed) throw new AdapterError("Title cannot be empty.");
      const title = trimmed.length > QUICK_TITLE_MAX ? `${trimmed.slice(0, QUICK_TITLE_MAX - 3)}...` : trimmed;
      return adapter.create({
        title,
        dueAt: args.dueAt,
        projectId: args.projectId,
        projectName: args.projectName,
        energy: args.energy,
        status: "todo",
        priority: "medium",
      });
    },

    async update(args: UpdateTaskArgs) {
      assertNotError(store);
      const now = Date.now();
      store.update((draft) => {
        const task = draft.tasks.find((t) => t._id === args.taskId && t.deletedAt === undefined);
        if (!task) throw new AdapterError("Task not found");
        if (args.title !== undefined) task.title = args.title.trim();
        if (args.description !== undefined) task.description = args.description === null ? undefined : args.description;
        if (args.status !== undefined) task.status = args.status;
        if (args.priority !== undefined) task.priority = args.priority;
        if (args.energy !== undefined) task.energy = args.energy;
        if (args.projectId !== undefined) {
          task.projectId = args.projectId === null ? undefined : args.projectId.trim();
        }
        if (args.projectName !== undefined) {
          task.projectName = args.projectName === null ? undefined : args.projectName.trim();
        }
        if (args.dueAt !== undefined) task.dueAt = args.dueAt === null ? undefined : args.dueAt;
        if (args.checklist !== undefined) task.checklist = args.checklist === null ? undefined : args.checklist;
        task.updatedAt = now;
      });
      return args.taskId;
    },

    async toggleCompletion({ taskId }) {
      assertNotError(store);
      let next: Task["status"] = "todo";
      store.update((draft) => {
        const task = draft.tasks.find((t) => t._id === taskId && t.deletedAt === undefined);
        if (!task) throw new AdapterError("Task not found");
        next = task.status === "done" ? "todo" : "done";
        task.status = next;
        task.updatedAt = Date.now();
        if (next === "done") task.avoidCount = 0;
      });
      return { taskId, status: next };
    },

    async snooze({ taskId, untilMs }) {
      assertNotError(store);
      store.update((draft) => {
        const task = draft.tasks.find((t) => t._id === taskId && t.deletedAt === undefined);
        if (!task) throw new AdapterError("Task not found");
        task.dueAt = untilMs;
        task.avoidCount = (task.avoidCount ?? 0) + 1;
        task.lastAvoidedAt = Date.now();
        task.updatedAt = Date.now();
      });
      return taskId;
    },

    async remove({ taskId }) {
      assertNotError(store);
      store.update((draft) => {
        const task = draft.tasks.find((t) => t._id === taskId);
        if (!task) throw new AdapterError("Task not found");
        task.deletedAt = Date.now();
        task.updatedAt = Date.now();
      });
      return { success: true };
    },

    async queryMemories(args = {}) {
      assertNotError(store);
      let rows = store.getSnapshot().memories.filter((m) => m.deletedAt === undefined);
      if (args.sector) rows = rows.filter((m) => m.sector === args.sector);
      rows.sort((a, b) => {
        if (b.salience !== a.salience) return b.salience - a.salience;
        return b.lastAccessed - a.lastAccessed;
      });
      if (args.limit) rows = rows.slice(0, args.limit);
      return rows;
    },

    async addMemory(args) {
      assertNotError(store);
      const now = Date.now();
      const memoryId = nextId("mem");
      store.update((draft) => {
        draft.memories.unshift({
          _id: memoryId,
          userId: MOCK_USER_ID,
          content: args.content,
          sector: args.sector ?? "general",
          salience: args.salience ?? 0.5,
          decayRate: 0.1,
          lastAccessed: now,
          accessCount: 0,
          metadata: { kind: "fact" },
          createdAt: now,
          updatedAt: now,
        });
      });
      return memoryId;
    },

    async getMemoryStats(): Promise<MemoryStats> {
      assertNotError(store);
      const memories = store.getSnapshot().memories.filter((m) => m.deletedAt === undefined);
      const sectors = SECTORS.map((sector) => {
        const sectorMemories = memories.filter((m) => m.sector === sector);
        return {
          sector,
          count: sectorMemories.length,
          avgSalience:
            sectorMemories.length > 0
              ? sectorMemories.reduce((sum, m) => sum + m.salience, 0) / sectorMemories.length
              : 0,
        };
      });
      return {
        total: memories.length,
        sectors,
        avgSalience: memories.length > 0 ? memories.reduce((sum, m) => sum + m.salience, 0) / memories.length : 0,
        commitments: memories.filter((m) => m.metadata?.kind === "commitment").length,
        avoidances: memories.filter((m) => m.metadata?.kind === "avoidance").length,
      };
    },

    async listHabits() {
      assertNotError(store);
      return store.getSnapshot().habits.filter((h) => h.deletedAt === undefined);
    },

    async completeHabitToday({ habitId }) {
      assertNotError(store);
      const now = Date.now();
      let updated: Habit | undefined;
      store.update((draft) => {
        const habit = draft.habits.find((h) => h._id === habitId && h.deletedAt === undefined);
        if (!habit) throw new AdapterError("Habit not found");
        const result = computeHabitStreakUpdate(now, habit.lastCompletedAt, habit.currentStreak, habit.longestStreak);
        if (!result.alreadyDone) {
          habit.currentStreak = result.currentStreak;
          habit.longestStreak = result.longestStreak;
          habit.lastCompletedAt = now;
          habit.updatedAt = now;
        }
        updated = { ...habit };
      });
      if (!updated) throw new AdapterError("Habit not found");
      return updated;
    },

    async getDashboard(): Promise<DashboardSnapshot> {
      assertNotError(store);
      const state = store.getSnapshot();
      const now = Date.now();
      const insights = computeInsightsSummary({
        tasks: state.tasks,
        habits: state.habits,
        goals: state.goals,
        todayStartMs: startOfLocalDay(now),
        todayEndMs: startOfLocalDay(now) + DAY_MS,
        weekStartMs: startOfLocalWeek(now),
      });
      const nudge = computeCoachNudge({
        tasks: state.tasks,
        memories: state.memories,
        habits: state.habits,
        dismissedNudgeIds: state.dismissedNudgeIds,
        now,
      });
      const topAvoided = liveTasks(state)
        .filter((t) => isOpenTask(t.status) && (t.avoidCount ?? 0) > 0)
        .sort((a, b) => (b.avoidCount ?? 0) - (a.avoidCount ?? 0))
        .slice(0, 4);
      const commitments = state.memories
        .filter((m) => m.deletedAt === undefined && m.metadata?.kind === "commitment")
        .sort((a, b) => b.salience - a.salience);
      return {
        insights,
        week: weekSeries(state.tasks, now),
        nudge,
        topAvoided,
        commitments,
        habits: state.habits.filter((h) => h.deletedAt === undefined),
        goals: state.goals.filter((g) => g.deletedAt === undefined),
      };
    },

    async getCoachNudge(): Promise<CoachNudge | null> {
      assertNotError(store);
      const state = store.getSnapshot();
      return computeCoachNudge({
        tasks: state.tasks,
        memories: state.memories,
        habits: state.habits,
        dismissedNudgeIds: state.dismissedNudgeIds,
      });
    },

    async acknowledgeNudge({ id }) {
      assertNotError(store);
      store.update((draft) => {
        if (!draft.dismissedNudgeIds.includes(id)) draft.dismissedNudgeIds.push(id);
      });
    },

    async setDemo(mode) {
      store.reset(mode);
    },

    getDemo() {
      return store.getSnapshot().demo;
    },
  };

  return adapter;
}

export const mockAdapter = createMockAdapter();
