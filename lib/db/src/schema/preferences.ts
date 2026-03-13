import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const preferencesTable = pgTable("preferences", {
  id: serial("id").primaryKey(),
  wakeTime: text("wake_time").notNull().default("07:00"),
  sleepTime: text("sleep_time").notNull().default("23:00"),
  energyPeaks: text("energy_peaks").array().notNull().default([]),
  prepBufferMinutes: integer("prep_buffer_minutes").notNull().default(30),
  planningStyle: text("planning_style").notNull().default("morning"),
  adhdMode: boolean("adhd_mode").notNull().default(true),
  focusSessionMinutes: integer("focus_session_minutes").notNull().default(25),
  breakMinutes: integer("break_minutes").notNull().default(5),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPreferencesSchema = createInsertSchema(preferencesTable).omit({ id: true, updatedAt: true });
export type InsertPreferences = z.infer<typeof insertPreferencesSchema>;
export type Preferences = typeof preferencesTable.$inferSelect;
