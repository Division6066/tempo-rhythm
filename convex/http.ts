import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { revenueCatWebhook } from "./revenuecat";
import { deepgramCallback } from "./voice";

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

// Deepgram async transcription callback (batch voice notes).
// Deepgram POSTs the finished transcript here; the shared secret in the
// query string is validated against DEEPGRAM_CALLBACK_SECRET (fail closed).
http.route({
  path: "/api/deepgram-callback",
  method: "POST",
  handler: deepgramCallback,
});

export default http;
