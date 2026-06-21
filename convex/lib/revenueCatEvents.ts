/**
 * Maps RevenueCat webhook event types to app subscription tier.
 * Exported for unit tests.
 */
export function userTypeFromRevenueCatEvent(
  eventType: string | undefined,
): "free" | "paid" {
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
