import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const notesTable = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  projectId: integer("project_id"),
  folderId: integer("folder_id"),
  tags: text("tags").array().notNull().default([]),
  templateType: text("template_type"),
  isPinned: boolean("is_pinned").notNull().default(false),
  periodType: text("period_type"),
  periodDate: text("period_date"),
  isPublished: boolean("is_published").notNull().default(false),
  publishSlug: text("publish_slug"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertNoteSchema = createInsertSchema(notesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notesTable.$inferSelect;
