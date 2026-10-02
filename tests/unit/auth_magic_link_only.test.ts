import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * apps/mobile still signs in with the password provider. That is pending
 * Amit's decision and is intentionally outside this scan.
 */
const REPO_ROOT = join(import.meta.dir, "../..");
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "coverage",
  ".turbo",
  "out",
  ".vercel",
  "_generated",
]);
const SOURCE_EXT = /\.(?:tsx|ts|jsx|js|mjs|cjs|html)$/;
const PASSWORD_PROVIDER_IMPORT =
  /["'][^"']*(?:@convex-dev\/auth\/providers\/Password|@auth\/core\/providers\/password|providers\/Password)[^"']*["']/i;
const PASSWORD_SIGN_IN = /\bsignIn\s*\(\s*["'`]password["'`]/i;
const PASSWORD_INPUT = /\btype\s*=\s*(?:\{\s*)?["']password["']/;
const PASSWORD_ROUTE_STRING = /["'`]\/(?:sign-in|sign-up|signin|signup)\/password\b/i;

function toPosix(path: string): string {
  return path.split("\\").join("/");
}

export function stripComments(source: string): string {
  let out = "";
  let i = 0;
  let quote: "'" | '"' | "`" | null = null;
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];
    if (quote) {
      out += ch;
      if (ch === "\\" && next !== undefined) {
        out += next;
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      out += ch;
      i += 1;
      continue;
    }
    if (ch === "/" && next === "/") {
      i += 2;
      while (i < source.length && source[i] !== "\n") i += 1;
      continue;
    }
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) i += 1;
      i += 2;
      out += " ";
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

function extractMatching(source: string, openIndex: number, open: string, close: string): string {
  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;
  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];
    if (quote) {
      if (ch === "\\" && next !== undefined) {
        i += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === open) depth += 1;
    else if (ch === close) {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex, i + 1);
    }
  }
  throw new Error(`Unterminated ${open} while reading Convex auth providers`);
}

function splitTopLevel(arrayInner: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  let quote: "'" | '"' | "`" | null = null;
  for (let i = 0; i < arrayInner.length; i += 1) {
    const ch = arrayInner[i];
    const next = arrayInner[i + 1];
    if (quote) {
      if (ch === "\\" && next !== undefined) {
        i += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") depth += 1;
    else if (ch === ")" || ch === "]" || ch === "}") depth -= 1;
    else if (ch === "," && depth === 0) {
      parts.push(arrayInner.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(arrayInner.slice(start));
  return parts.map((part) => part.trim()).filter((part) => part.length > 0);
}

function providerArrayText(source: string): string {
  const stripped = stripComments(source);
  const call = stripped.indexOf("convexAuth(");
  if (call < 0) {
    throw new Error("convex/auth.ts does not call convexAuth");
  }
  const openParen = stripped.indexOf("(", call);
  const args = extractMatching(stripped, openParen, "(", ")");
  const providersKey = args.search(/providers\s*:/);
  if (providersKey < 0) {
    throw new Error("convexAuth() has no providers list");
  }
  const after = args.slice(providersKey);
  const bracket = after.indexOf("[");
  if (bracket < 0) {
    throw new Error("convexAuth() providers list is not an inline array");
  }
  return extractMatching(after, bracket, "[", "]");
}

export function convexAuthProviderViolations(source: string): string[] {
  const violations: string[] = [];
  const stripped = stripComments(source);
  if (!/from\s+["']@auth\/core\/providers\/resend["']/.test(stripped)) {
    violations.push("convex/auth.ts must import the Resend provider from @auth/core/providers/resend");
  }
  if (PASSWORD_PROVIDER_IMPORT.test(stripped)) {
    violations.push("convex/auth.ts imports a Password provider");
  }
  const arrayText = providerArrayText(source);
  const entries = splitTopLevel(arrayText.slice(1, -1));
  if (entries.length === 0) {
    violations.push("convex/auth.ts registers no sign-in provider");
  }
  for (const entry of entries) {
    const root = entry.match(/^(?:await\s+)?([A-Za-z_$][\w$]*)\b/);
    const name = root?.[1];
    if (name !== "Resend") {
      violations.push(`convex/auth.ts registers ${name ?? "a non-Resend provider"} instead of Resend`);
    }
    if (PASSWORD_PROVIDER_IMPORT.test(entry) || /["']password["']/i.test(entry)) {
      violations.push("convex/auth.ts providers list includes a password provider id");
    }
  }
  return violations;
}

function pathSegments(relPath: string): string[] {
  return toPosix(relPath)
    .split("/")
    .map((part) => part.replace(/\.(?:tsx|ts|jsx|js|mjs|cjs|html)$/, "").replace(/[()]/g, ""));
}

export function isPasswordAuthRoute(relPath: string): boolean {
  const segments = pathSegments(relPath);
  const hasPassword = segments.some((part) => part === "password" || part === "passwords");
  if (!hasPassword) return false;
  const authish = segments.some((part) =>
    ["sign-in", "sign-up", "signin", "signup", "auth", "login", "register"].includes(part),
  );
  const routeFile = /(?:^|\/)(?:page|route)\.(?:tsx|ts|jsx|js)$/.test(toPosix(relPath));
  return authish || routeFile;
}

export function sourceViolations(relPath: string, source: string): string[] {
  const violations: string[] = [];
  const stripped = stripComments(source);
  const posix = toPosix(relPath);
  if (PASSWORD_PROVIDER_IMPORT.test(stripped)) {
    violations.push(`${posix} imports a Password provider`);
  }
  if (PASSWORD_SIGN_IN.test(stripped)) {
    violations.push(`${posix} calls signIn("password")`);
  }
  if (PASSWORD_INPUT.test(stripped)) {
    violations.push(`${posix} renders a password input`);
  }
  if (PASSWORD_ROUTE_STRING.test(stripped)) {
    violations.push(`${posix} links a password sign-in/sign-up route`);
  }
  if (isPasswordAuthRoute(posix)) {
    violations.push(`${posix} is a password sign-in/sign-up route`);
  }
  return violations;
}

function walkSource(dir: string, files: string[]) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSource(full, files);
      continue;
    }
    if (SOURCE_EXT.test(entry.name)) files.push(full);
  }
}

function scanTree(root: string, repoRoot: string): string[] {
  const files: string[] = [];
  walkSource(root, files);
  const violations: string[] = [];
  for (const file of files) {
    const relPath = toPosix(relative(repoRoot, file));
    const source = readFileSync(file, "utf8");
    violations.push(...sourceViolations(relPath, source));
  }
  return violations;
}

export function magicLinkOnlyViolations(repoRoot: string): string[] {
  const authPath = join(repoRoot, "convex/auth.ts");
  const authSource = readFileSync(authPath, "utf8");
  return [
    ...convexAuthProviderViolations(authSource).map((item) => `convex/auth.ts: ${item}`),
    ...scanTree(join(repoRoot, "convex"), repoRoot),
    ...scanTree(join(repoRoot, "apps/web"), repoRoot),
  ];
}

const RESEND_AUTH = `
import Resend from "@auth/core/providers/resend";
import { convexAuth } from "@convex-dev/auth/server";
export const { auth, signIn } = convexAuth({
  providers: [Resend({ from: "Tempo Flow <onboarding@resend.dev>" })],
});
`;

const PASSWORD_AUTH = `
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
export const { auth, signIn } = convexAuth({
  providers: [Password],
});
`;

describe("magic-link-only sign-in", () => {
  test("accepts the Resend provider and rejects a Password provider", () => {
    expect(convexAuthProviderViolations(RESEND_AUTH)).toEqual([]);
    expect(convexAuthProviderViolations(PASSWORD_AUTH).length).toBeGreaterThan(0);
  });

  test("rejects a second provider, a password input, and a password route", () => {
    const withGoogle = RESEND_AUTH.replace(
      "providers: [Resend({ from: \"Tempo Flow <onboarding@resend.dev>\" })]",
      "providers: [Resend({ from: \"Tempo Flow <onboarding@resend.dev>\" }), Google({})]",
    );
    expect(convexAuthProviderViolations(withGoogle).join("\n")).toContain("Google");

    const page = 'export function Page(){ return <input type="password" autoComplete="current-password" />; }';
    expect(sourceViolations("apps/web/app/sign-in/page.tsx", page).join("\n")).toContain(
      "password input",
    );
    expect(sourceViolations("apps/web/components/auth/SignInForm.tsx", 'await signIn("password", { email, password })')).toContain(
      'apps/web/components/auth/SignInForm.tsx calls signIn("password")',
    );
    expect(isPasswordAuthRoute("apps/web/app/sign-in/password/page.tsx")).toBe(true);
    expect(sourceViolations("apps/web/app/sign-up/password/page.tsx", "export default function Page(){ return null }")).toContain(
      "apps/web/app/sign-up/password/page.tsx is a password sign-in/sign-up route",
    );
  });

  test("does not treat magic-link copy or the passkeys page as password sign-in", () => {
    const copy = "Sign in without a password using your device biometrics.";
    expect(sourceViolations("apps/web/app/settings/passkeys/page.tsx", copy)).toEqual([]);
    expect(sourceViolations("apps/web/components/auth/SignInForm.tsx", 'await signIn("resend", { email })')).toEqual(
      [],
    );
  });

  test("web and convex have no password sign-in path", () => {
    const violations = magicLinkOnlyViolations(REPO_ROOT);
    expect(violations, violations.join("\n")).toEqual([]);
  });

  test("the scan stays off apps/mobile", () => {
    const scanned = [join(REPO_ROOT, "convex"), join(REPO_ROOT, "apps/web")].map((dir) =>
      toPosix(relative(REPO_ROOT, dir)),
    );
    expect(scanned).toEqual(["convex", "apps/web"]);
    expect(scanned.some((dir) => dir === "apps/mobile" || dir.startsWith("apps/mobile/"))).toBe(false);
  });
});
