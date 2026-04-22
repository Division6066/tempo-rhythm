// ============================================================================
// Polar (Checkout) configuration
// ============================================================================
// All settings related to Polar Checkout: product IDs, environment, etc.

// Polar environment: sandbox for testing, production for live.
export const POLAR_SERVER: "sandbox" | "production" = "sandbox";

// Polar product IDs for paid plans.
// Prefer setting these via environment variables; leave the fallback empty.
export const POLAR_MONTHLY_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_MONTHLY_PRODUCT_ID || "";

export const POLAR_YEARLY_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_YEARLY_PRODUCT_ID || "";
