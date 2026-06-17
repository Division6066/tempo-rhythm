export type RevenueCatUserType = "free" | "paid";

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
 * Map a RevenueCat webhook event type to the Convex user tier.
 * Unknown event types default to "free" (conservative — no accidental paid upgrade).
 */
export function mapRevenueCatEventToUserType(
  eventType: string | undefined,
): RevenueCatUserType {
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
