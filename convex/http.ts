import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { revenueCatWebhook } from "./revenuecat";

const http = httpRouter();

// Convex Auth routes (sign-in, sign-out, session management)
auth.addHttpRoutes(http);

// RevenueCat subscription webhook
// Called by RevenueCat on: INITIAL_PURCHASE, RENEWAL, EXPIRATION, CANCELLATION, etc.
// Requires: REVENUECAT_WEBHOOK_SECRET env var set in Convex dashboard
http.route({
  path: "/api/revenuecat-webhook",
  method: "POST",
  handler: revenueCatWebhook,
});

export default http;
