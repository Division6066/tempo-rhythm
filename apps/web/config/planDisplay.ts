// ============================================================================
// Plan display strings (Paywall)
// ============================================================================
// Display-only copy and pricing for the paid plans.
// Note: the real price is set in the Polar dashboard; this is purely cosmetic.

export const PLAN_DISPLAY = {
  free: {
    title: "Free",
    subtitle: "Everything you need to start.",
  },
  monthly: {
    title: "Monthly",
    priceLine: "$9",
    subtitle: "per user / month",
  },
  yearly: {
    title: "Yearly",
    priceLine: "$90",
    subtitle: "per user / year",
  },
} as const;
