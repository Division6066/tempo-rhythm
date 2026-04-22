export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export type TaskPriority = "low" | "medium" | "high";

export type TodayTaskSummary = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: number;
  updatedAt: number;
  createdAt: number;
};

export type ProfileSummary = {
  id: string;
  email: string;
  fullName?: string;
  greetingName: string;
};
