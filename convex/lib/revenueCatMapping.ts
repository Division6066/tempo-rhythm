export type SubscriptionUserType = "free" | "paid";

const PAID_EVENT_TYPES = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "UNCANCELLATION",
]);

const FREE_EVENT_TYPES = new Set(["EXPIRATION", "CANCELLATION", "SUBSCRIBER_ALIAS"]);

/**
 * Maps a RevenueCat webhook event type to the Convex `users.userType` value.
 * Unknown event types default to `free` so entitlements are not granted by mistake.
 */
export function mapRevenueCatEventToUserType(
  eventType: string | undefined,
): SubscriptionUserType {
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
