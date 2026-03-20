import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const pushSubscriptionsTable = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  platform: text("platform").notNull(),
  endpoint: text("endpoint"),
  keyP256dh: text("key_p256dh"),
  keyAuth: text("key_auth"),
  expoToken: text("expo_token"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
