import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, tasksTable } from "@workspace/db";
import {
  ListTasksQueryParams,
  ListTasksResponse,
  CreateTaskBody,
  GetTaskParams,
  GetTaskResponse,
  UpdateTaskParams,
  UpdateTaskBody,
  UpdateTaskResponse,
  DeleteTaskParams,
  CompleteTaskParams,
} from "@workspace/api-zod";

function getNextScheduledDate(currentDate: string, rule: string): string {
  const d = new Date(currentDate + "T00:00:00");
  switch (rule) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekdays": {
      d.setDate(d.getDate() + 1);
      while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
      break;
    }
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "biweekly":
      d.setDate(d.getDate() + 14);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      d.setDate(d.getDate() + 1);
  }
  return d.toISOString().split("T")[0];
}

const router: IRouter = Router();

router.get("/tasks", async (req, res): Promise<void> => {
  const query = ListTasksQueryParams.safeParse(req.query);
  let tasks = await db.select().from(tasksTable).orderBy(tasksTable.createdAt);

  if (query.success && query.data.status) {
    tasks = tasks.filter((t) => t.status === query.data.status);
  }
  if (query.success && query.data.projectId) {
    tasks = tasks.filter((t) => t.projectId === query.data.projectId);
  }
  if (query.success && query.data.folderId) {
    tasks = tasks.filter((t) => t.folderId === query.data.folderId);
  }
  if (query.success && query.data.startDate) {
    tasks = tasks.filter((t) => t.scheduledDate && t.scheduledDate >= query.data.startDate!);
  }
  if (query.success && query.data.endDate) {
    tasks = tasks.filter((t) => t.scheduledDate && t.scheduledDate <= query.data.endDate!);
  }

  res.json(ListTasksResponse.parse(tasks));
});

router.post("/tasks", async (req, res): Promise<void> => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [task] = await db.insert(tasksTable).values(parsed.data).returning();
  res.status(201).json(GetTaskResponse.parse(task));
});

router.get("/tasks/:id", async (req, res): Promise<void> => {
  const params = GetTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, params.data.id));
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.json(GetTaskResponse.parse(task));
});

router.patch("/tasks/:id", async (req, res): Promise<void> => {
  const params = UpdateTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [task] = await db.update(tasksTable).set(parsed.data).where(eq(tasksTable.id, params.data.id)).returning();
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.json(UpdateTaskResponse.parse(task));
});

router.delete("/tasks/:id", async (req, res): Promise<void> => {
  const params = DeleteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [task] = await db.delete(tasksTable).where(eq(tasksTable.id, params.data.id)).returning();
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/tasks/:id/complete", async (req, res): Promise<void> => {
  const params = CompleteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [task] = await db.update(tasksTable).set({ status: "done" }).where(eq(tasksTable.id, params.data.id)).returning();
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  let nextTask = null;
  if (task.recurrenceRule) {
    const currentDate = task.scheduledDate || new Date().toISOString().split("T")[0];
    const nextDate = getNextScheduledDate(currentDate, task.recurrenceRule);

    const [created] = await db.insert(tasksTable).values({
      title: task.title,
      status: "scheduled",
      priority: task.priority,
      projectId: task.projectId,
      folderId: task.folderId,
      tags: task.tags,
      scheduledDate: nextDate,
      estimatedMinutes: task.estimatedMinutes,
      notes: task.notes,
      startTime: task.startTime,
      duration: task.duration,
      recurrenceRule: task.recurrenceRule,
    }).returning();
    nextTask = created;
  }

  const response: Record<string, unknown> = { completedTask: task };
  if (nextTask) response.nextTask = nextTask;
  res.json(response);
});

export default router;
