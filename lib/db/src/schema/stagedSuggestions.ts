import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const stagedSuggestionsTable = pgTable("staged_suggestions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  data: jsonb("data").notNull(),
  reasoning: text("reasoning"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const insertStagedSuggestionSchema = createInsertSchema(stagedSuggestionsTable).omit({ id: true, createdAt: true, resolvedAt: true });
export type InsertStagedSuggestion = z.infer<typeof insertStagedSuggestionSchema>;
export type StagedSuggestion = typeof stagedSuggestionsTable.$inferSelect;
