/**
 * TF-OSS-00 — third-party notices gate.
 *
 * Fails (exit 1) when a runtime dependency exists in any workspace
 * `package.json` without a matching `### <package>` section in
 * `THIRD-PARTY-NOTICES.md`. Internal `@tempo/*` workspace packages are exempt.
 *
 * Run: `bun run check:notices`
 */
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "..");

function workspaceManifests(): string[] {
  const manifests = ["package.json", "apps/web/package.json", "apps/mobile/package.json"];
  const packagesDir = path.join(repoRoot, "packages");
  if (fs.existsSync(packagesDir)) {
    for (const entry of fs.readdirSync(packagesDir)) {
      const manifest = path.join("packages", entry, "package.json");
      if (fs.existsSync(path.join(repoRoot, manifest))) {
        manifests.push(manifest);
      }
    }
  }
  return manifests.filter((manifest) => fs.existsSync(path.join(repoRoot, manifest)));
}

const noticesPath = path.join(repoRoot, "THIRD-PARTY-NOTICES.md");
if (!fs.existsSync(noticesPath)) {
  console.error("check:notices FAILED — THIRD-PARTY-NOTICES.md is missing at the repo root.");
  process.exit(1);
}
const notices = fs.readFileSync(noticesPath, "utf8");
const documented = new Set(
  [...notices.matchAll(/^### (\S+)$/gm)].map((match) => match[1] as string),
);

const missing: Array<{ name: string; manifest: string }> = [];
for (const manifest of workspaceManifests()) {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, manifest), "utf8")) as {
    dependencies?: Record<string, string>;
  };
  for (const name of Object.keys(pkg.dependencies ?? {})) {
    if (name.startsWith("@tempo/")) continue;
    if (!documented.has(name)) {
      missing.push({ name, manifest });
    }
  }
}

if (missing.length > 0) {
  console.error("check:notices FAILED — runtime dependencies without a THIRD-PARTY-NOTICES.md entry:");
  for (const item of missing) {
    console.error(`  - ${item.name} (declared in ${item.manifest})`);
  }
  console.error("Add a `### <package>` section for each in THIRD-PARTY-NOTICES.md (same PR).");
  process.exit(1);
}

console.log(`check:notices OK — every runtime dependency has a notices entry (${documented.size} documented).`);
