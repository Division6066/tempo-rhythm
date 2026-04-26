#!/usr/bin/env node
/**
 * inventory-doctor — sanity-check the UI implementation matrix.
 *
 * What it checks (all read-only; no writes):
 *   1. Every entry in screens.json has a matching `page.tsx` file at
 *      `currentRoute`, OR currentRoute is empty (status: missing).
 *   2. Every `page.tsx` under apps/web/app that carries a `@screen:` JSDoc
 *      tag is registered in screens.json.
 *   3. Every scaffold page's `@source:` comment matches sourceFiles[0]
 *      for that slug. Mismatch = warning.
 *   4. Every screen slug in screens.json that has !bare && !dynamic &&
 *      !deprecated && platform === "web" appears in tempo-nav.ts.
 *   5. tempo-nav.ts has no orphaned slugs (every entry maps back to
 *      screens.json).
 *
 * Usage:
 *   node scripts/inventory-doctor.mjs            # report
 *   node scripts/inventory-doctor.mjs --quiet    # only show errors
 *
 * Exit codes:
 *   0 — clean
 *   1 — at least one error
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(__filename, "..", "..");
const QUIET = process.argv.includes("--quiet");

const SCREENS_PATH = join(
  ROOT,
  "docs/design/implementation-matrix/screens.json",
);
const NAV_PATH = join(ROOT, "apps/web/lib/tempo-nav.ts");
const WEB_APP_DIR = join(ROOT, "apps/web/app");
const MOBILE_APP_DIR = join(ROOT, "apps/mobile/app");

const errors = [];
const warnings = [];
const info = [];

function err(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}
function note(msg) {
  if (!QUIET) info.push(msg);
}

// 1. Load matrix
let matrix;
try {
  matrix = JSON.parse(readFileSync(SCREENS_PATH, "utf8"));
} catch (e) {
  err(`Cannot read screens.json: ${e.message}`);
  console.error(format());
  process.exit(1);
}

const screens = matrix.screens;
note(`Loaded ${screens.length} screens from screens.json`);

// 2. Check route files exist
for (const s of screens) {
  if (!s.currentRoute) continue;
  const abs = join(ROOT, s.currentRoute);
  if (!existsSync(abs)) {
    err(`screens.json[${s.slug}].currentRoute points at missing file: ${s.currentRoute}`);
  }
}

// 3. Walk app dirs to find all page files
function walkPages(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) walkPages(abs, out);
    else if (
      entry === "page.tsx" ||
      entry === "page.ts" ||
      (dir.endsWith("(tabs)") || dir.includes("(tempo)") || dir.includes("(auth)") || dir.includes("(authenticated)"))
    ) {
      if (entry.endsWith(".tsx") || entry.endsWith(".ts")) out.push(abs);
    }
  }
  return out;
}

const webPages = walkPages(WEB_APP_DIR);
note(`Found ${webPages.length} web app files (page.tsx + grouped tabs)`);

// 4. For every page that declares @screen:, ensure it's registered.
const slugsInMatrix = new Set(screens.map((s) => s.slug));
for (const p of webPages) {
  const content = readFileSync(p, "utf8");
  const m = /@screen:\s*([a-z][a-z0-9-]*)/i.exec(content);
  if (!m) continue;
  const slug = m[1];
  if (!slugsInMatrix.has(slug)) {
    err(`page ${relative(ROOT, p)} declares @screen: ${slug} but slug is not in screens.json`);
  }
}

// 5. For every screen with currentRoute under apps/web, confirm @source
//    comment in the file matches sourceFiles[0].
for (const s of screens) {
  if (!s.currentRoute || !s.currentRoute.startsWith("apps/web/")) continue;
  const abs = join(ROOT, s.currentRoute);
  if (!existsSync(abs)) continue;
  const content = readFileSync(abs, "utf8");
  const sm = /@source:\s*(.+)/.exec(content);
  if (!sm) continue; // no @source — fine
  const declared = sm[1].trim();
  const expected = (s.sourceFiles?.[0] ?? "").trim();
  if (!expected) continue;
  // Loose match: the declared string should reference the expected
  // source-file basename.
  const expectedBase = expected.split("#")[0].trim();
  if (!declared.includes(expectedBase)) {
    warn(
      `${s.slug}: page @source "${declared}" does not reference matrix sourceFiles[0] "${expected}"`,
    );
  }
}

// 6. tempo-nav.ts coverage check.
const navContent = readFileSync(NAV_PATH, "utf8");
const navSlugs = new Set();
for (const m of navContent.matchAll(/slug:\s*"([a-z][a-z0-9-]*)"/g)) {
  navSlugs.add(m[1]);
}
note(`tempo-nav.ts declares ${navSlugs.size} slugs`);

// Web screens that should be in tempo-nav.
const webScreens = screens.filter((s) => s.platform === "web");
for (const s of webScreens) {
  if (s.deprecated) continue;
  if (!navSlugs.has(s.slug)) {
    warn(`web screen "${s.slug}" missing from apps/web/lib/tempo-nav.ts`);
  }
}
for (const slug of navSlugs) {
  if (!slugsInMatrix.has(slug)) {
    warn(`tempo-nav.ts has slug "${slug}" not registered in screens.json`);
  }
}

// 7. Sanity: each screen's owner must be one of ownerAgents keys.
const ownerKeys = new Set(Object.keys(matrix.ownerAgents ?? {}));
for (const s of screens) {
  if (!ownerKeys.has(s.owner)) {
    warn(`${s.slug}: owner "${s.owner}" not declared in screens.json#ownerAgents`);
  }
}

// 8. Mobile route files exist.
for (const s of screens.filter((x) => x.platform === "mobile")) {
  if (!s.currentRoute) continue;
  const abs = join(ROOT, s.currentRoute);
  if (!existsSync(abs)) {
    err(`mobile screen "${s.slug}" currentRoute "${s.currentRoute}" missing`);
  }
}

// ---- report ----
function format() {
  const lines = [];
  if (info.length && !QUIET) {
    lines.push("info:");
    info.forEach((m) => lines.push(`  · ${m}`));
  }
  if (warnings.length) {
    lines.push("warnings:");
    warnings.forEach((m) => lines.push(`  ⚠ ${m}`));
  }
  if (errors.length) {
    lines.push("errors:");
    errors.forEach((m) => lines.push(`  ✗ ${m}`));
  }
  if (!warnings.length && !errors.length) {
    lines.push("✓ inventory-doctor: clean");
  } else {
    lines.push(`summary: ${errors.length} error(s), ${warnings.length} warning(s)`);
  }
  return lines.join("\n");
}

console.log(format());
process.exit(errors.length ? 1 : 0);
