/** Schema shape for Tempo Flow. Mirrors convex/schema.ts plus v0 memory fields. */

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";
export type TaskEnergy = "low" | "medium" | "high";
export type MemorySector = "semantic" | "episodic" | "procedural" | "emotional" | "general";
export type GoalStatus = "active" | "completed" | "archived";
export type HabitCadence = "daily" | "weekly";
export type RepeatCycle = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type Task = {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  energy?: TaskEnergy;
  timeEstimate?: number;
  timeSpentOnDay?: Record<string, number>;
  repeatCfgId?: string;
  parentTaskId?: string;
  projectId?: string;
  projectName?: string;
  dueAt?: number;
  checklist?: ChecklistItem[];
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  /** v0 — times this open task was skipped or snoozed past due. */
  avoidCount?: number;
  lastAvoidedAt?: number;
};

export type TaskRepeatCfg = {
  _id: string;
  userId: string;
  repeatCycle: RepeatCycle;
  repeatEvery: number;
  weekdays: number[];
  monthlyWeekOfMonth?: number;
  monthlyWeekday?: number;
  monthlyLastDay?: boolean;
  deletedInstanceDates: string[];
  skipOverdue: boolean;
  waitForCompletion: boolean;
  repeatFromCompletionDate: boolean;
  isPaused: boolean;
  defaultEstimate?: number;
  lastTaskCreationDay?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
};

export type MemoryKind = "commitment" | "avoidance" | "fact";

export type Memory = {
  _id: string;
  userId: string;
  content: string;
  sector: MemorySector;
  salience: number;
  decayRate: number;
  lastAccessed: number;
  accessCount: number;
  metadata?: {
    kind?: MemoryKind;
    relatedTaskId?: string;
    relatedHabitId?: string;
  };
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
};

export type Habit = {
  _id: string;
  userId: string;
  name: string;
  cadence: HabitCadence;
  currentStreak: number;
  longestStreak: number;
  lastCompletedAt?: number;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
};

export type Goal = {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  targetDate?: number;
  progressPercent: number;
  status: GoalStatus;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
};

export type CalendarEvent = {
  _id: string;
  userId: string;
  title: string;
  startsAtMs: number;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
};

export type InsightsSummary = {
  tasksOpen: number;
  tasksDueToday: number;
  tasksOverdue: number;
  tasksCompletedThisWeek: number;
  openByEnergy: { low: number; medium: number; high: number };
  openByPriority: { low: number; medium: number; high: number };
  habitsTotal: number;
  habitsWithActiveStreak: number;
  bestStreak: number;
  goalsActive: number;
  goalsAverageProgressPercent: number;
};

export type DayCompletion = {
  date: string;
  label: string;
  completed: number;
};

export type CoachNudge = {
  id: string;
  kind: "avoided" | "commitment" | "energy" | "habit";
  headline: string;
  body: string;
  relatedTaskId?: string;
  relatedHabitId?: string;
  relatedMemoryId?: string;
  cta: string;
  dismissLabel: string;
};

export type MemoryStats = {
  total: number;
  sectors: Array<{ sector: MemorySector; count: number; avgSalience: number }>;
  avgSalience: number;
  commitments: number;
  avoidances: number;
};

export type DashboardSnapshot = {
  insights: InsightsSummary;
  week: DayCompletion[];
  nudge: CoachNudge | null;
  topAvoided: Task[];
  commitments: Memory[];
  habits: Habit[];
  goals: Goal[];
};

export type ListTasksArgs = {
  status?: TaskStatus;
  search?: string;
  dueFrom?: number;
  dueTo?: number;
  projectId?: string;
  priority?: TaskPriority;
  energy?: TaskEnergy;
};

export type CreateQuickArgs = {
  title: string;
  dueAt?: number;
  projectId?: string;
  projectName?: string;
  energy?: TaskEnergy;
};

export type CreateTaskArgs = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  energy?: TaskEnergy;
  projectId?: string;
  projectName?: string;
  dueAt?: number;
  checklist?: ChecklistItem[];
};

export type UpdateTaskArgs = {
  taskId: string;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  energy?: TaskEnergy;
  projectId?: string | null;
  projectName?: string | null;
  dueAt?: number | null;
  checklist?: ChecklistItem[] | null;
};

export type DemoMode = "seeded" | "empty" | "error";

export type TempoSnapshot = {
  userId: string;
  tasks: Task[];
  memories: Memory[];
  habits: Habit[];
  goals: Goal[];
  events: CalendarEvent[];
  repeatCfgs: TaskRepeatCfg[];
  dismissedNudgeIds: string[];
  demo: DemoMode;
};
