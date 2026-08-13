/**
 * HARD_RULES §7 — design-token scan (ratchet).
 *
 * §7.1/§7.3: prefer semantic utilities; avoid arbitrary hex values and one-off
 * arbitrary sizing on new UI. Tokens live in `packages/ui` and
 * `apps/web/app/globals.css`.
 *
 * This scan counts, across `apps/web/app` and `apps/web/components`
 * (excluding `globals.css`):
 *   - arbitrary-hex Tailwind utilities, e.g. `bg-[#fff]`, `text-[#1a2b3c]`
 *   - raw 6/8-digit hex color literals in TS/TSX
 *
 * Counts are capped at the committed baseline in `scripts/scan-baselines.json`.
 * New violations fail; removing one should lower the baseline.
 *
 * Run: `bun run scan:design-tokens`
 */
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "..");
const baselines = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "scripts", "scan-baselines.json"), "utf8"),
) as { designTokens: { arbitraryHexUtilities: number; rawHexLiterals: number } };

const roots = ["apps/web/app", "apps/web/components"];
const extensions = new Set([".ts", ".tsx", ".css"]);
const skipFiles = new Set(["globals.css"]);

const arbitraryHexPattern = /-\[#[0-9a-fA-F]{3,8}\]/g;
const rawHexPattern = /#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?\b/g;

let arbitraryHexUtilities = 0;
let rawHexLiterals = 0;
const locations: string[] = [];

function walk(dir: string): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(abs);
    } else if (extensions.has(path.extname(entry.name)) && !skipFiles.has(entry.name)) {
      const rel = path.relative(repoRoot, abs);
      const content = fs.readFileSync(abs, "utf8");
      for (const [index, line] of content.split("\n").entries()) {
        const arbitrary = line.match(arbitraryHexPattern);
        if (arbitrary) {
          arbitraryHexUtilities += arbitrary.length;
          locations.push(`${rel}:${index + 1} (arbitrary hex utility)`);
          continue; // avoid double-counting the same hex as a raw literal
        }
        const raw = line.match(rawHexPattern);
        if (raw) {
          rawHexLiterals += raw.length;
          locations.push(`${rel}:${index + 1} (raw hex literal)`);
        }
      }
    }
  }
}

for (const root of roots) {
  const abs = path.join(repoRoot, root);
  if (fs.existsSync(abs)) walk(abs);
}

const failures: string[] = [];
if (arbitraryHexUtilities > baselines.designTokens.arbitraryHexUtilities) {
  failures.push(
    `arbitrary-hex Tailwind utilities rose from baseline ${baselines.designTokens.arbitraryHexUtilities} to ${arbitraryHexUtilities}`,
  );
}
if (rawHexLiterals > baselines.designTokens.rawHexLiterals) {
  failures.push(
    `raw hex color literals rose from baseline ${baselines.designTokens.rawHexLiterals} to ${rawHexLiterals}`,
  );
}

if (failures.length > 0) {
  console.error("scan:design-tokens FAILED — HARD_RULES §7 violations:");
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error("Use tokens from packages/ui / globals.css instead of one-off hex values. Occurrences:");
  for (const location of locations) console.error(`    ${location}`);
  process.exit(1);
}

console.log(
  `scan:design-tokens OK — arbitrary hex ${arbitraryHexUtilities}/${baselines.designTokens.arbitraryHexUtilities}, ` +
    `raw hex ${rawHexLiterals}/${baselines.designTokens.rawHexLiterals} (at or below baseline).`,
);
