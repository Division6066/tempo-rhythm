import webpush from "web-push";
import { db, pushSubscriptionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const VAPID_PUBLIC_KEY = process.env["VAPID_PUBLIC_KEY"] || "";
const VAPID_PRIVATE_KEY = process.env["VAPID_PRIVATE_KEY"] || "";
const VAPID_EMAIL = process.env["VAPID_EMAIL"] || "mailto:admin@tempo.app";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface WebSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
}

export class PushNotificationService {
  static getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY;
  }

  static async subscribeWeb(userId: string, subscription: WebSubscriptionData) {
    const [created] = await db
      .insert(pushSubscriptionsTable)
      .values({
        userId,
        platform: "web",
        endpoint: subscription.endpoint,
        keyP256dh: subscription.keys.p256dh,
        keyAuth: subscription.keys.auth,
      })
      .onConflictDoNothing()
      .returning();

    if (!created) {
      const existing = await db
        .select()
        .from(pushSubscriptionsTable)
        .where(
          and(
            eq(pushSubscriptionsTable.userId, userId),
            eq(pushSubscriptionsTable.endpoint, subscription.endpoint)
          )
        );
      return existing[0];
    }

    return created;
  }

  static async subscribeExpo(userId: string, expoToken: string) {
    const [created] = await db
      .insert(pushSubscriptionsTable)
      .values({
        userId,
        platform: "expo",
        expoToken,
      })
      .onConflictDoNothing()
      .returning();

    if (!created) {
      const existing = await db
        .select()
        .from(pushSubscriptionsTable)
        .where(
          and(
            eq(pushSubscriptionsTable.userId, userId),
            eq(pushSubscriptionsTable.expoToken, expoToken)
          )
        );
      return existing[0];
    }

    return created;
  }

  static async unsubscribe(userId: string, endpoint?: string, expoToken?: string) {
    if (endpoint) {
      await db
        .delete(pushSubscriptionsTable)
        .where(
          and(
            eq(pushSubscriptionsTable.userId, userId),
            eq(pushSubscriptionsTable.endpoint, endpoint)
          )
        );
    } else if (expoToken) {
      await db
        .delete(pushSubscriptionsTable)
        .where(
          and(
            eq(pushSubscriptionsTable.userId, userId),
            eq(pushSubscriptionsTable.expoToken, expoToken)
          )
        );
    }
  }

  static async sendToUser(userId: string, payload: PushPayload) {
    const subscriptions = await db
      .select()
      .from(pushSubscriptionsTable)
      .where(eq(pushSubscriptionsTable.userId, userId));

    const results = await Promise.allSettled(
      subscriptions.map((sub) => {
        if (sub.platform === "web" && sub.endpoint && sub.keyP256dh && sub.keyAuth) {
          return this.sendWebPush(sub, payload);
        } else if (sub.platform === "expo" && sub.expoToken) {
          return this.sendExpoPush(sub.expoToken, payload);
        }
        return Promise.resolve();
      })
    );

    return results;
  }

  static async sendToAllUsers(payload: PushPayload) {
    const subscriptions = await db.select().from(pushSubscriptionsTable);

    const userIds = [...new Set(subscriptions.map((s) => s.userId))];

    for (const userId of userIds) {
      try {
        await this.sendToUser(userId, payload);
      } catch (err) {
        console.error(`[Push] Failed to send to user ${userId}:`, err);
      }
    }
  }

  private static async sendWebPush(
    sub: { id: number; endpoint: string | null; keyP256dh: string | null; keyAuth: string | null },
    payload: PushPayload
  ) {
    if (!sub.endpoint || !sub.keyP256dh || !sub.keyAuth) return;
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.warn("[Push] VAPID keys not configured, skipping web push");
      return;
    }

    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keyP256dh,
            auth: sub.keyAuth,
          },
        },
        JSON.stringify(payload)
      );
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode === 410 || statusCode === 404) {
        await db
          .delete(pushSubscriptionsTable)
          .where(eq(pushSubscriptionsTable.id, sub.id));
        console.log(`[Push] Removed expired web subscription ${sub.id}`);
      } else {
        throw err;
      }
    }
  }

  private static async sendExpoPush(expoToken: string, payload: PushPayload) {
    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: expoToken,
          title: payload.title,
          body: payload.body,
          data: { url: payload.url },
          sound: "default",
          channelId: "default",
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`[Push] Expo push failed: ${text}`);
      }
    } catch (err) {
      console.error("[Push] Expo push error:", err);
    }
  }
}
