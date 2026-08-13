/**
 * Web app env validation.
 *
 * NEXT_PUBLIC_* values are INLINED AT BUILD TIME by Next.js, so a missing
 * value cannot be caught at request time — by then it is already an
 * `undefined` baked into the bundle. This module therefore runs its checks
 * at module load and is imported for its side effect from `app/layout.tsx`
 * (server scope), which makes `next build` fail loudly instead of shipping
 * a bundle that silently does nothing.
 *
 * IMPORTANT: Next.js only inlines STATIC references (`process.env.NEXT_PUBLIC_X`
 * written out literally). Never read NEXT_PUBLIC_* through a dynamic
 * `process.env[name]` lookup here.
 *
 * SECURITY INVARIANT: error messages name variables, never values.
 */

/** The literal placeholder every scaffolded env cell was created with. */
const ENV_SENTINEL = "__DUMMY_PASTE_ME__";

function isAbsent(raw: string | undefined): boolean {
  if (raw === undefined) return true;
  const trimmed = raw.trim();
  return trimmed === "" || trimmed === ENV_SENTINEL;
}

function missingError(name: string, where: string): Error {
  return new Error(
    `[env] ${name} is missing, empty, or still set to the scaffolding placeholder. ` +
      `Set a real value in ${where}. NEXT_PUBLIC_* values are inlined at build ` +
      `time, so this must be fixed before building.`,
  );
}

/**
 * Required build-time (inlined) variables. Runs at module load; imported for
 * its side effect from app/layout.tsx. Optional flags (NEXT_PUBLIC_ENABLE_PASSKEYS,
 * E2E toggles, Polar product IDs while payments are behind a flag) are
 * intentionally NOT asserted here.
 */
function assertBuildTimeEnv(): void {
  // Static reference on purpose — see module docstring.
  if (isAbsent(process.env.NEXT_PUBLIC_CONVEX_URL)) {
    throw missingError(
      "NEXT_PUBLIC_CONVEX_URL",
      "apps/web/.env.local (local) or the Vercel project env vars (deployed)",
    );
  }
}

/**
 * Server-only runtime variables (NOT inlined; safe to read dynamically).
 * Use inside route handlers / server actions, e.g. POLAR_ACCESS_TOKEN in
 * app/checkout/route.ts. Throws with the variable name, never the value.
 */
export function requireServerEnv(name: string): string {
  const raw = process.env[name];
  if (isAbsent(raw)) {
    throw new Error(
      `[env] ${name} is missing, empty, or still set to the scaffolding placeholder. ` +
        `Set it in the Vercel project env vars (server-side).`,
    );
  }
  return (raw as string).trim();
}

assertBuildTimeEnv();

/** Import target so the side effect is explicit at the call site. */
export const webEnvValidated = true;
