import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { internal } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

const TIER_MAP: Record<string, string> = {
  tempo_basic_monthly: "basic",
  tempo_basic_annual: "basic",
  tempo_pro_monthly: "pro",
  tempo_pro_annual: "pro",
  tempo_max_monthly: "max",
  tempo_max_annual: "max",
};

const ACTIVE_EVENT_TYPES = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "NON_RENEWING_PURCHASE",
  "PRODUCT_CHANGE",
]);

const INACTIVE_EVENT_TYPES = new Set([
  "CANCELLATION",
  "EXPIRATION",
  "BILLING_ISSUE",
  "SUBSCRIPTION_PAUSED",
]);

http.route({
  path: "/api/revenuecat-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const event = body?.event;

      if (!event || !event.type) {
        return new Response(JSON.stringify({ error: "Invalid event payload" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const eventType: string = event.type;
      const appUserId: string | undefined = event.app_user_id;
      const productId: string | undefined =
        event.product_id ?? event.presented_offering_id;
      const entitlementIds: string[] =
        event.entitlement_ids ?? event.entitlement_id
          ? [event.entitlement_id]
          : [];
      const expirationAtMs: number | undefined = event.expiration_at_ms;
      const purchaseDateMs: number | undefined = event.purchased_at_ms;
      const environment: string | undefined = event.environment;
      const store: string | undefined = event.store;

      if (!appUserId) {
        return new Response(
          JSON.stringify({ error: "Missing app_user_id" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const tier = productId ? (TIER_MAP[productId] ?? "basic") : "basic";
      let status: string;

      if (ACTIVE_EVENT_TYPES.has(eventType)) {
        status = "active";
      } else if (INACTIVE_EVENT_TYPES.has(eventType)) {
        status = "expired";
      } else {
        status = "unknown";
      }

      await ctx.runMutation(internal.subscriptions.upsertFromWebhook, {
        revenuecatAppUserId: appUserId,
        tier,
        status,
        productId: productId ?? undefined,
        entitlementId: entitlementIds[0] ?? undefined,
        expiresAt: expirationAtMs ?? undefined,
        purchasedAt: purchaseDateMs ?? undefined,
        environment: environment ?? undefined,
        store: store ?? undefined,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("RevenueCat webhook error:", err);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;
