import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

const revenueCatWebhook = httpAction(async (ctx, request) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await ctx.runMutation(internal.subscriptions.applyRevenueCatEvent, {
    payload,
  });

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

http.route({
  path: "/api/revenuecat-webhook",
  method: "POST",
  handler: revenueCatWebhook,
});

export default http;
