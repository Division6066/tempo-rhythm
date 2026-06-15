const PAID_EVENT_TYPES = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "UNCANCELLATION",
]);

const FREE_EVENT_TYPES = new Set(["EXPIRATION", "CANCELLATION", "SUBSCRIBER_ALIAS"]);

/**
 * Map a RevenueCat webhook `event.type` to the Convex `users.userType` tier.
 * Unknown event types default to `"free"` (matches webhook handler behavior).
 */
export function resolveUserTypeFromRevenueCatEvent(
  eventType: string | undefined,
): "free" | "paid" {
  if (eventType && PAID_EVENT_TYPES.has(eventType)) {
    return "paid";
  }
  if (eventType && FREE_EVENT_TYPES.has(eventType)) {
    return "free";
  }
  return "free";
}
