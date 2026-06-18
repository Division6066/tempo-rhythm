export type RevenueCatUserType = "free" | "paid";

const PAID_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "UNCANCELLATION",
]);

const FREE_EVENTS = new Set(["EXPIRATION", "CANCELLATION", "SUBSCRIBER_ALIAS"]);

/** Map a RevenueCat webhook event type to the app user tier. Unknown events default to free. */
export function mapRevenueCatEventToUserType(eventType: string | undefined): RevenueCatUserType {
  if (eventType && PAID_EVENTS.has(eventType)) {
    return "paid";
  }
  if (eventType && FREE_EVENTS.has(eventType)) {
    return "free";
  }
  return "free";
}
