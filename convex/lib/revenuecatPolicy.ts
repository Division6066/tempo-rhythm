export type RevenueCatUserType = "free" | "paid";

/** Map a RevenueCat webhook event type to the app user tier. */
export function userTypeFromRevenueCatEvent(
  eventType: string | undefined,
): RevenueCatUserType {
  if (
    eventType === "INITIAL_PURCHASE" ||
    eventType === "RENEWAL" ||
    eventType === "PRODUCT_CHANGE" ||
    eventType === "UNCANCELLATION"
  ) {
    return "paid";
  }
  if (
    eventType === "EXPIRATION" ||
    eventType === "CANCELLATION" ||
    eventType === "SUBSCRIBER_ALIAS"
  ) {
    return "free";
  }
  return "free";
}

/**
 * Whether an incoming webhook request passes auth.
 * When no secret is configured, requests are allowed (deployment must set the secret).
 */
export function isRevenueCatWebhookAuthorized(
  webhookSecret: string | undefined,
  authHeader: string | null,
): boolean {
  if (!webhookSecret) {
    return true;
  }
  return authHeader === webhookSecret;
}
