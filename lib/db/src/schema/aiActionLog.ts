import { pgTable, serial, text, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aiActionLogTable = pgTable("ai_action_log", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  totalTokens: integer("total_tokens"),
  costUsd: real("cost_usd"),
  latencyMs: integer("latency_ms"),
  status: text("status").notNull().default("success"),
  error: text("error"),
  metadata: jsonb("metadata"),
  councilModels: text("council_models"),
  councilResponseCount: integer("council_response_count"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAiActionLogSchema = createInsertSchema(aiActionLogTable).omit({ id: true, createdAt: true });
export type InsertAiActionLog = z.infer<typeof insertAiActionLogSchema>;
export type AiActionLog = typeof aiActionLogTable.$inferSelect;
