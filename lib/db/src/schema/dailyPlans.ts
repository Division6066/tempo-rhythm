import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dailyPlansTable = pgTable("daily_plans", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  blocks: jsonb("blocks").notNull().default([]),
  mood: text("mood"),
  energyLevel: integer("energy_level"),
  aiGenerated: boolean("ai_generated").notNull().default(false),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDailyPlanSchema = createInsertSchema(dailyPlansTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDailyPlan = z.infer<typeof insertDailyPlanSchema>;
export type DailyPlan = typeof dailyPlansTable.$inferSelect;
