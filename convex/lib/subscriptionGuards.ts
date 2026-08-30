/** Server-side guard for client-initiated paid upgrades (MOCK_PAYMENTS in Convex env). */
export function isMockPaymentsEnabled(): boolean {
  return process.env.MOCK_PAYMENTS === "true";
}

export function assertClientMaySetUserType(userType: "free" | "paid"): void {
  if (userType === "paid" && !isMockPaymentsEnabled()) {
    throw new Error("Paid upgrades must go through RevenueCat checkout.");
  }
}
