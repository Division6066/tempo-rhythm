// ============================================================================
// Checkout route (Polar)
// ============================================================================
// Creates a Polar Checkout session and returns a redirect to their checkout flow.
//
// How it works in short:
// - The client hits `/checkout?products=<PRODUCT_ID>`.
// - Polar creates the checkout based on the product ID we send.
// - After payment, Polar redirects to `POLAR_SUCCESS_URL` with `{CHECKOUT_ID}`.
//
// ⚠️ Important:
// - NEVER expose POLAR_ACCESS_TOKEN to the client.
// - We currently run in sandbox to keep testing safe.

import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  // Organisation access token (OAT) for Polar — kept server-side via env var only.
  accessToken: process.env.POLAR_ACCESS_TOKEN!,

  // Polar redirects here after checkout completes.
  // Include `{CHECKOUT_ID}` in the URL so we can verify / sync the user status later.
  successUrl: process.env.POLAR_SUCCESS_URL!,

  // Environment: sandbox for testing (switch to production or remove when going live).
  server: "sandbox",

  // Dark theme to match the app.
  theme: "dark",
});
