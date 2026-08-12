/**
 * HARD_RULES §5 — RAM-only / soft-delete audit.
 *
 * Two checks:
 *
 * 1. Zero tolerance: `convex/schema.ts` must not define tables or fields that
 *    persist raw third-party scanned content (RAM-only scanner rule). Raw
 *    messages from email/WhatsApp/Telegram/chat-export scans never reach disk.
 *
 * 2. Ratchet: hard deletes (`ctx.db.delete(...)` / `.db.delete(...)`) in
 *    `convex/` are capped at the committed baseline in
 *    `scripts/scan-baselines.json`. §5 allows hard deletes only for RAM-only
 *    scanner staging rows, expired rate-limit buckets, and test fixtures —
 *    the existing calls are pre-existing debt tracked by the baseline.
 *    New hard deletes fail the scan; removing one should lower the baseline.
 *
 * Run: `bun run scan:ram-only-audit`
 */
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "..");
const baselines = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "scripts", "scan-baselines.json"), "utf8"),
) as { ramOnlyAudit: { hardDeleteCalls: number } };

const violations: string[] = [];

// 1. Raw scanned-content persistence markers in the schema.
const schemaPath = path.join(repoRoot, "convex", "schema.ts");
const schema = fs.readFileSync(schemaPath, "utf8");
const rawContentPattern = /\b(raw(Message|Messages|Content|Chat|Scan|Import)s?|scannedContent|chatExport)\b/;
for (const [index, line] of schema.split("\n").entries()) {
  if (rawContentPattern.test(line)) {
    violations.push(
      `convex/schema.ts:${index + 1} looks like it persists raw scanned content (RAM-only rule): ${line.trim()}`,
    );
  }
}

// 2. Hard-delete ratchet across convex/ (excluding _generated and tests).
let hardDeleteCalls = 0;
const hardDeleteLocations: string[] = [];
function walk(dir: string): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_generated" || entry.name === "node_modules") continue;
      walk(abs);
    } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      const content = fs.readFileSync(abs, "utf8");
      for (const [index, line] of content.split("\n").entries()) {
        if (/\.db\.delete\(/.test(line)) {
          hardDeleteCalls += 1;
          hardDeleteLocations.push(`${path.relative(repoRoot, abs)}:${index + 1}`);
        }
      }
    }
  }
}
walk(path.join(repoRoot, "convex"));

if (hardDeleteCalls > baselines.ramOnlyAudit.hardDeleteCalls) {
  violations.push(
    `hard-delete count in convex/ rose from the baseline ${baselines.ramOnlyAudit.hardDeleteCalls} to ${hardDeleteCalls}. ` +
      `HARD_RULES §5: user-visible data soft-deletes via deletedAt. Locations: ${hardDeleteLocations.join(", ")}`,
  );
}

if (violations.length > 0) {
  console.error("scan:ram-only-audit FAILED — HARD_RULES §5 violations:");
  for (const violation of violations) console.error(`  - ${violation}`);
  process.exit(1);
}

if (hardDeleteCalls < baselines.ramOnlyAudit.hardDeleteCalls) {
  console.log(
    `scan:ram-only-audit OK — hard deletes dropped to ${hardDeleteCalls} (baseline ${baselines.ramOnlyAudit.hardDeleteCalls}). ` +
      "Lower scripts/scan-baselines.json to lock in the improvement.",
  );
} else {
  console.log(
    `scan:ram-only-audit OK — no raw-content persistence; hard deletes at baseline (${hardDeleteCalls}).`,
  );
}
