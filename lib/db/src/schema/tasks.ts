import { pgTable, serial, text, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tasksTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  status: text("status").notNull().default("inbox"),
  priority: text("priority").notNull().default("medium"),
  projectId: integer("project_id"),
  folderId: integer("folder_id"),
  tags: text("tags").array().notNull().default([]),
  dueDate: text("due_date"),
  scheduledDate: text("scheduled_date"),
  estimatedMinutes: integer("estimated_minutes"),
  notes: text("notes"),
  parentTaskId: integer("parent_task_id"),
  aiGenerated: boolean("ai_generated").notNull().default(false),
  startTime: text("start_time"),
  duration: integer("duration"),
  recurrenceRule: text("recurrence_rule"),
  recurrenceMode: text("recurrence_mode"),
  aiPriorityScore: real("ai_priority_score"),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const taskSubItemsTable = pgTable("task_sub_items", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  title: text("title").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasksTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasksTable.$inferSelect;

export const insertTaskSubItemSchema = createInsertSchema(taskSubItemsTable).omit({ id: true, createdAt: true });
export type InsertTaskSubItem = z.infer<typeof insertTaskSubItemSchema>;
export type TaskSubItem = typeof taskSubItemsTable.$inferSelect;
