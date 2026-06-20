export type RevenueCatUserType = "free" | "paid";

const PAID_EVENT_TYPES = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "UNCANCELLATION",
]);

const FREE_EVENT_TYPES = new Set(["EXPIRATION", "CANCELLATION", "SUBSCRIBER_ALIAS"]);

/**
 * Map a RevenueCat webhook `event.type` to the app user tier.
 * Unknown event types keep the default `"free"` tier (matches webhook handler).
 */
export function revenueCatEventToUserType(eventType: string | undefined): RevenueCatUserType {
  if (eventType && PAID_EVENT_TYPES.has(eventType)) {
    return "paid";
  }
  if (eventType && FREE_EVENT_TYPES.has(eventType)) {
    return "free";
  }
  return "free";
}
