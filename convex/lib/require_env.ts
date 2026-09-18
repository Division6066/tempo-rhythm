/**
 * Read Convex / process env vars with a fail-closed dummy sentinel.
 *
 * Dashboard cells were scaffolded with `__DUMMY_PASTE_ME__`. That string is
 * not a secret — treat it as absent so requireEnv cannot "succeed" on a
 * placeholder.
 */

export const ENV_DUMMY_SENTINEL = "__DUMMY_PASTE_ME__";

function isAbsent(raw: string | undefined): boolean {
  if (raw === undefined) {
    return true;
  }
  const trimmed = raw.trim();
  return trimmed.length === 0 || trimmed === ENV_DUMMY_SENTINEL;
}

/** Returns a trimmed value, or undefined when unset / blank / dummy. */
export function readEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (isAbsent(raw)) {
    return undefined;
  }
  return raw!.trim();
}

/** First defined non-dummy value in `names`, or undefined. */
export function readEnvFirst(names: readonly string[]): string | undefined {
  for (const name of names) {
    const value = readEnv(name);
    if (value !== undefined) {
      return value;
    }
  }
  return undefined;
}

/** Throws when the named var is unset, blank, or the dummy sentinel. */
export function requireEnv(name: string): string {
  const value = readEnv(name);
  if (value === undefined) {
    throw new Error(`${name} is not set`);
  }
  return value;
}
