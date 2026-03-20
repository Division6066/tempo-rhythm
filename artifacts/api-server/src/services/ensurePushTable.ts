import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

export async function ensurePushSubscriptionsTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        endpoint TEXT,
        key_p256dh TEXT,
        key_auth TEXT,
        expo_token TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_push_sub_endpoint
      ON push_subscriptions (user_id, endpoint)
      WHERE endpoint IS NOT NULL
    `);
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_push_sub_expo_token
      ON push_subscriptions (user_id, expo_token)
      WHERE expo_token IS NOT NULL
    `);
    console.log("[DB] push_subscriptions table ensured");
  } catch (err) {
    console.error("[DB] Failed to create push_subscriptions table:", err);
  }
}
