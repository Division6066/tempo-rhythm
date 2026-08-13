/**
 * Environment variable access with sentinel awareness.
 *
 * Every Convex env cell in this project was scaffolded with the literal
 * placeholder `__DUMMY_PASTE_ME__`. A variable holding that sentinel, an
 * empty string, or whitespace-only content is treated as ABSENT, so a
 * half-configured deployment fails loudly instead of silently doing nothing.
 *
 * SECURITY INVARIANT: no function in this module may ever include the VALUE
 * of an environment variable in an error message, a log line, or a thrown
 * error. Names and presence only.
 */

import { AiEnvError } from "./errors";

/** The literal placeholder every scaffolded env cell was created with. */
export const ENV_SENTINEL = "__DUMMY_PASTE_ME__";

/** Where a variable is expected to be configured. Used only for error copy. */
export type EnvDeployment = "convex" | "vercel" | "eas" | "local";

const DASHBOARD_FOR: Record<EnvDeployment, string> = {
  convex:
    "Convex dashboard → your deployment → Settings → Environment Variables",
  vercel: "Vercel → project settings → Environment Variables",
  eas: "EAS → project → Environment variables",
  local: "your local .env.local file (git-ignored)",
};

/**
 * Normalize a raw env value: `undefined`, empty, whitespace-only, and the
 * scaffolding sentinel all count as absent. Returns the trimmed value
 * otherwise.
 */
export function normalizeEnvValue(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === ENV_SENTINEL) return undefined;
  return trimmed;
}

/**
 * Read a required environment variable.
 *
 * Throws {@link AiEnvError} naming the variable and the dashboard it belongs
 * on when the variable is missing, empty, whitespace-only, or still holds the
 * `__DUMMY_PASTE_ME__` scaffolding sentinel. The error never contains the
 * value.
 */
export function requireEnv(
  name: string,
  opts: { deployment?: EnvDeployment } = {},
): string {
  const value = normalizeEnvValue(process.env[name]);
  if (value === undefined) {
    const deployment = opts.deployment ?? "convex";
    throw new AiEnvError(
      `Environment variable ${name} is missing, empty, or still set to the scaffolding placeholder. Set a real value in the ${DASHBOARD_FOR[deployment]}.`,
      name,
    );
  }
  return value;
}

/**
 * Read an optional environment variable. Absent values (including the
 * sentinel and whitespace-only strings) fall back to `fallback`.
 */
export function optionalEnv(name: string): string | undefined;
export function optionalEnv(name: string, fallback: string): string;
export function optionalEnv(
  name: string,
  fallback?: string,
): string | undefined {
  return normalizeEnvValue(process.env[name]) ?? fallback;
}

/** True when the variable holds a real (non-sentinel, non-empty) value. */
export function isEnvConfigured(name: string): boolean {
  return normalizeEnvValue(process.env[name]) !== undefined;
}
