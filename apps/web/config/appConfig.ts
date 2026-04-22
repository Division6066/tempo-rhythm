// ============================================================================
// App configuration (Web)
// ============================================================================
// Central config file that governs app behaviour through feature flags.
// Goal: safely turn features (e.g. Paywall, payments) on or off.
//
// Important:
// - Do not let automation change "critical" values without an intentional action.
// - Keep names explicit so developers can find what they need quickly.

// ============================================================================
// Environment mode
// ============================================================================

// 🚨 CRITICAL: forces production mode when true.
// ⚠️ Do not let automation change this.
// 👤 User action required: set manually to true/false as needed.
export const FORCE_PROD_MODE = false;

// Derived dev-mode flag — respects the FORCE_PROD_MODE override above.
export const IS_DEV_MODE = FORCE_PROD_MODE ? false : process.env.NODE_ENV !== "production";

// App environment type.
export type AppEnv = "dev" | "prod";

// Current app environment.
export const APP_ENV: AppEnv = IS_DEV_MODE ? "dev" : "prod";

// ============================================================================
// Paywall + payments
// ============================================================================

// 🚨 CRITICAL: controls whether the paywall is active (locked pages + checkout modal).
// false → locked pages render normally (no paywall).
// true  → free users see the paywall; checkout behaviour follows the flags below.
export const PAYWALL_ENABLED = true;

// Mock-payments flag (development only).
// true  → clicking "Continue" on a paid plan simulates an upgrade without Polar Checkout.
// false → clicking "Continue" redirects to Polar Checkout (if PAYMENT_SYSTEM_ENABLED is on).
export const MOCK_PAYMENTS = true;

// 🚨 CRITICAL: controls whether the real payment system is active.
// false → clicking "Continue" shows a Preview message (or mocks an upgrade if MOCK_PAYMENTS is on).
// true  → clicking "Continue" redirects to Polar Checkout (requires Product IDs).
// Note: the paywall still renders whenever PAYWALL_ENABLED is on — this flag only controls click behaviour.
export const PAYMENT_SYSTEM_ENABLED = false;

// ============================================================================
// Terms & Privacy links
// ============================================================================

// 👤 User action required: point these at your real Terms / Privacy pages.
// They can resolve to landing-page URLs or internal app routes.
export const TERMS_URL = process.env.NEXT_PUBLIC_TERMS_URL || "/terms";
export const PRIVACY_URL = process.env.NEXT_PUBLIC_PRIVACY_URL || "/privacy";
export const APP_NAME = "Tempo Rhythm";
