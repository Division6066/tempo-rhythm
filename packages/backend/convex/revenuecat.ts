import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * RevenueCat webhook handler.
 * Endpoint: POST /api/revenuecat-webhook
 *
 * Receives subscription lifecycle events from RevenueCat and updates
 * user subscription status in Convex via an **internal** mutation.
 *
 * Security: Validates the Authorization header against REVENUECAT_WEBHOOK_SECRET.
 * Set this env var with `bunx convex env set` — never commit the value.
 */
export const revenueCatWebhook = httpAction(async (ctx, request) => {
  const authHeader = request.headers.get("Authorization");
  const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;

  if (webhookSecret && authHeader !== webhookSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const event = body.event as Record<string, unknown> | undefined;
  if (!event) {
    return new Response("Missing event field", { status: 400 });
  }

  const eventType = event.type as string | undefined;
  const appUserId = event.app_user_id as string | undefined;

  const activeEntitlements = (event.entitlement_ids as string[] | undefined) ?? [];

  let userType: "free" | "paid" = "free";
  if (
    eventType === "INITIAL_PURCHASE" ||
    eventType === "RENEWAL" ||
    eventType === "PRODUCT_CHANGE" ||
    eventType === "UNCANCELLATION"
  ) {
    userType = "paid";
  } else if (
    eventType === "EXPIRATION" ||
    eventType === "CANCELLATION" ||
    eventType === "SUBSCRIBER_ALIAS"
  ) {
    userType = "free";
  }

  if (appUserId) {
    try {
      await ctx.runMutation(internal.users.updateSubscriptionStatus, {
        userId: appUserId,
        userType,
        activeEntitlements,
        revenueCatEvent: eventType ?? "UNKNOWN",
      });
    } catch (err) {
      console.error("[RevenueCat Webhook] Failed to update user:", err);
    }
  }

  return new Response(JSON.stringify({ received: true, eventType }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
