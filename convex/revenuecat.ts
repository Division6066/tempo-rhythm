import { optionalEnv } from "@tempo/ai";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * RevenueCat webhook handler.
 * Endpoint: POST /api/revenuecat-webhook
 *
 * Receives subscription lifecycle events from RevenueCat and updates
 * user subscription status in Convex.
 *
 * Security: Validates the Authorization header against REVENUECAT_WEBHOOK_SECRET.
 * Set this env var in each Convex deployment's environment variables.
 */
export const revenueCatWebhook = httpAction(async (ctx, request) => {
  // Validate authorization header. Fail CLOSED: an unset (or placeholder)
  // secret rejects every webhook instead of silently skipping the check.
  // Sentinel-aware: '', whitespace, and __DUMMY_PASTE_ME__ count as unset.
  const authHeader = request.headers.get("Authorization");
  const webhookSecret = optionalEnv("REVENUECAT_WEBHOOK_SECRET");

  if (!webhookSecret) {
    console.error(
      "[RevenueCat Webhook] REVENUECAT_WEBHOOK_SECRET is not configured; rejecting webhook (fail closed). Set it in the Convex dashboard to the Authorization header value configured in RevenueCat → Webhooks.",
    );
    return new Response("Unauthorized", { status: 401 });
  }

  if (authHeader !== webhookSecret) {
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
  const entitlements = event.subscriber_attributes as Record<string, unknown> | undefined;

  // Determine new user tier from entitlements
  // RevenueCat sends entitlement identifiers in the event
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
      await ctx.runMutation(api.users.updateSubscriptionStatus, {
        userId: appUserId,
        userType,
        activeEntitlements,
        revenueCatEvent: eventType ?? "UNKNOWN",
      });
    } catch (err) {
      console.error("[RevenueCat Webhook] Failed to update user:", err);
      // Return 200 so RevenueCat doesn't retry on our internal errors
    }
  }

  return new Response(JSON.stringify({ received: true, eventType }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
