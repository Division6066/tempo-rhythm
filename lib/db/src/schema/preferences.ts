import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
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

  calendarLayout: text("calendar_layout").notNull().default("separate"),
  defaultCalendarView: text("default_calendar_view").notNull().default("week"),
  timeSlotSnapMinutes: integer("time_slot_snap_minutes").notNull().default(30),
  workingHoursStart: text("working_hours_start").notNull().default("09:00"),
  workingHoursEnd: text("working_hours_end").notNull().default("17:00"),
  showWeekends: boolean("show_weekends").notNull().default(true),
  firstDayOfWeek: text("first_day_of_week").notNull().default("monday"),
  dateFormat: text("date_format").notNull().default("MM/DD/YYYY"),
  timeFormat: text("time_format").notNull().default("12h"),

  notificationsEnabled: boolean("notifications_enabled").notNull().default(false),
  notificationLeadMinutes: integer("notification_lead_minutes").notNull().default(10),
  dailyPlanReminderTime: text("daily_plan_reminder_time").notNull().default("08:00"),

  aiAutoCategorize: boolean("ai_auto_categorize").notNull().default(true),
  aiModel: text("ai_model").notNull().default("auto"),
  deepThinkDefault: boolean("deep_think_default").notNull().default(false),
  memoryAutoUpdate: boolean("memory_auto_update").notNull().default(true),
  voiceTranscriptionPrompt: text("voice_transcription_prompt").notNull().default(""),

  defaultTemplates: jsonb("default_templates").notNull().default({}),

  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPreferencesSchema = createInsertSchema(preferencesTable).omit({ id: true, updatedAt: true });
export type InsertPreferences = z.infer<typeof insertPreferencesSchema>;
export type Preferences = typeof preferencesTable.$inferSelect;
