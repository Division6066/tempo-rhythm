const PAID_EVENT_TYPES = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "UNCANCELLATION",
]);

const FREE_EVENT_TYPES = new Set([
  "EXPIRATION",
  "CANCELLATION",
  "SUBSCRIBER_ALIAS",
]);

/**
 * Map a RevenueCat webhook event type to the Convex userType tier.
 * Unknown event types keep the default "free" tier (safe downgrade).
 */
export function resolveUserTypeFromRevenueCatEvent(
  eventType: string | undefined,
): "free" | "paid" {
  if (!eventType) {
    return "free";
  }
  if (PAID_EVENT_TYPES.has(eventType)) {
    return "paid";
  }
  if (FREE_EVENT_TYPES.has(eventType)) {
    return "free";
  }
  return "free";
}
