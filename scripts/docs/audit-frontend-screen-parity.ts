import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type InventoryRow = {
  slug: string;
  route: string;
};

type FileAuditRow = {
  slug: string;
  path: string;
  exists: boolean;
  hasScreenTag: boolean;
  hasBehaviorTag: boolean;
  hasActionableTag: boolean;
};

const INVENTORY_PATH = resolve("docs/design/screen-inventory.md");
const REPORT_PATH = resolve("docs/design/frontend-parity-audit.md");

function sanitizeCell(value: string): string {
  return value.replaceAll("`", "").trim();
}

function normalizeRouteCell(value: string): string {
  const withoutTicks = sanitizeCell(value);
  return withoutTicks.replace(/\s+\(.*\)$/, "").trim();
}

function parseInventoryRows(
  markdown: string,
  sectionHeading: "## Web — 42 screens" | "## Mobile — 12 screens",
): InventoryRow[] {
  const rows: InventoryRow[] = [];
  const lines = markdown.split("\n");
  const sectionStart = lines.findIndex((line) => line.trim() === sectionHeading);
  if (sectionStart === -1) {
    return rows;
  }

  const nextSectionIndex = lines.findIndex(
    (line, idx) => idx > sectionStart && line.startsWith("## "),
  );
  const sectionEnd = nextSectionIndex === -1 ? lines.length : nextSectionIndex;
  for (const line of lines.slice(sectionStart + 1, sectionEnd)) {
    if (!line.startsWith("|") || line.includes("|---|")) {
      continue;
    }
    const parts = line.split("|").slice(1, -1).map((part) => part.trim());
    if (parts.length < 2) {
      continue;
    }
    const slug = sanitizeCell(parts[0] ?? "");
    const route = normalizeRouteCell(parts[1] ?? "");
    if (!slug || slug.toLowerCase() === "slug") {
      continue;
    }
    rows.push({ slug, route });
  }

  return rows;
}

function webRouteToFile(route: string): string {
  const normalizedRoute = route.trim();
  if (normalizedRoute.endsWith(".tsx")) {
    return resolve("apps/web/app", normalizedRoute);
  }
  if (normalizedRoute.startsWith("(tempo)/")) {
    return resolve("apps/web/app", normalizedRoute);
  }

  const publicRouteMap: Record<string, string> = {
    "/": "apps/web/app/page.tsx",
    "/about": "apps/web/app/about/page.tsx",
    "/changelog": "apps/web/app/changelog/page.tsx",
    "/sign-in": "apps/web/app/sign-in/page.tsx",
    "/onboarding": "apps/web/app/(bare)/onboarding/page.tsx",
  };

  const mapped = publicRouteMap[normalizedRoute];
  if (mapped) {
    return resolve(mapped);
  }

  return resolve("apps/web/app", normalizedRoute, "page.tsx");
}

function mobileRouteToFile(route: string): string {
  if (route.endsWith(".tsx")) {
    return resolve("apps/mobile/app", route.trim());
  }
  return resolve("apps/mobile/app", route.trim());
}

function slugToWebHtml(slug: string): string {
  return resolve("docs/design/generated-html/web", `${slug}.html`);
}

function slugToMobileHtml(slug: string): string {
  return resolve("docs/design/generated-html/mobile", `${slug}.html`);
}

const SCREEN_IMPORT_ROOTS = [
  resolve("apps/web"),
  resolve("apps/mobile"),
  resolve("packages/ui/src"),
];

/**
 * Resolve a `@/...` or `../something` import path used inside a Next.js or
 * Expo route file. Mirrors the behavior of `tsconfig.json` path aliases.
 */
function resolveImportSpecifier(fromFile: string, specifier: string): string | null {
  if (specifier.startsWith("@/")) {
    // Next.js default alias → apps/web/ for web, apps/mobile/ for mobile.
    const bareFrom = fromFile.includes("/apps/mobile/")
      ? resolve("apps/mobile")
      : resolve("apps/web");
    return `${resolve(bareFrom, specifier.slice(2))}.tsx`;
  }
  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    const abs = resolve(fromFile, "..", specifier);
    return `${abs}.tsx`;
  }
  return null;
}

function gatherScreenSourceContent(filePath: string): string {
  if (!existsSync(filePath)) {
    return "";
  }
  const pageSource = readFileSync(filePath, "utf8");
  let aggregate = pageSource;
  // Find local imports whose specifier mentions a component under components/tempo/** or packages/ui/** .
  const importRegex = /from\s+["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex iteration
  while ((match = importRegex.exec(pageSource)) !== null) {
    const specifier = match[1];
    if (!specifier) continue;
    const resolved = resolveImportSpecifier(filePath, specifier);
    if (!resolved) continue;
    // Only include files under one of the app/package source roots.
    if (!SCREEN_IMPORT_ROOTS.some((root) => resolved.startsWith(root))) continue;
    if (existsSync(resolved)) {
      aggregate += "\n";
      aggregate += readFileSync(resolved, "utf8");
    }
  }
  return aggregate;
}

function auditFile(slug: string, filePath: string): FileAuditRow {
  if (!existsSync(filePath)) {
    return {
      slug,
      path: filePath,
      exists: false,
      hasScreenTag: false,
      hasBehaviorTag: false,
      hasActionableTag: false,
    };
  }

  // Include the route file plus any local screen component it imports so
  // we don't force duplicate tag blocks in thin page shells.
  const content = gatherScreenSourceContent(filePath);
  return {
    slug,
    path: filePath,
    exists: true,
    hasScreenTag: /@screen:\s*/.test(content),
    hasBehaviorTag: /@behavior:\s*/.test(content),
    hasActionableTag:
      /@convex-(mutation|action|query)-needed:\s*/.test(content) ||
      /@navigate:\s*/.test(content),
  };
}

function renderAuditTable(rows: FileAuditRow[]): string {
  const lines = [
    "| slug | file | exists | @screen | @behavior | actionable tag |",
    "|---|---|---|---|---|---|",
  ];
  for (const row of rows) {
    lines.push(
      `| ${row.slug} | \`${row.path.replace(`${process.cwd()}/`, "")}\` | ${row.exists ? "yes" : "no"} | ${row.hasScreenTag ? "yes" : "no"} | ${row.hasBehaviorTag ? "yes" : "no"} | ${row.hasActionableTag ? "yes" : "no"} |`,
    );
  }
  return lines.join("\n");
}

function renderMissingList(paths: string[]): string {
  if (paths.length === 0) {
    return "- none";
  }
  return paths.map((path) => `- \`${path.replace(`${process.cwd()}/`, "")}\``).join("\n");
}

function main(): void {
  const inventoryText = readFileSync(INVENTORY_PATH, "utf8");
  const webRows = parseInventoryRows(inventoryText, "## Web — 42 screens");
  const mobileRows = parseInventoryRows(inventoryText, "## Mobile — 12 screens");

  const webAudits = webRows.map((row) => auditFile(row.slug, webRouteToFile(row.route)));
  const mobileAudits = mobileRows.map((row) => auditFile(row.slug, mobileRouteToFile(row.route)));

  const missingWebHtml = webRows
    .map((row) => slugToWebHtml(row.slug))
    .filter((htmlPath) => !existsSync(htmlPath));
  const missingMobileHtml = mobileRows
    .map((row) => slugToMobileHtml(row.slug))
    .filter((htmlPath) => !existsSync(htmlPath));

  const webTagGaps = webAudits.filter(
    (row) => row.exists && (!row.hasScreenTag || !row.hasBehaviorTag || !row.hasActionableTag),
  );
  const mobileTagGaps = mobileAudits.filter(
    (row) => row.exists && (!row.hasScreenTag || !row.hasBehaviorTag || !row.hasActionableTag),
  );

  const missingRouteFiles = [...webAudits, ...mobileAudits]
    .filter((row) => !row.exists)
    .map((row) => row.path);

  const report = `# Frontend parity audit

Generated by \`scripts/docs/audit-frontend-screen-parity.ts\`.

## Summary

- Expected web screens: ${webRows.length}
- Expected mobile screens: ${mobileRows.length}
- Missing route files: ${missingRouteFiles.length}
- Missing generated web HTML files: ${missingWebHtml.length}
- Missing generated mobile HTML files: ${missingMobileHtml.length}
- Web route tag gaps: ${webTagGaps.length}
- Mobile route tag gaps: ${mobileTagGaps.length}

## Missing route files

${renderMissingList(missingRouteFiles)}

## Missing generated HTML (web)

${renderMissingList(missingWebHtml)}

## Missing generated HTML (mobile)

${renderMissingList(missingMobileHtml)}

## Web route audit

${renderAuditTable(webAudits)}

## Mobile route audit

${renderAuditTable(mobileAudits)}
`;

  const reportDir = resolve("docs/design");
  mkdirSync(reportDir, { recursive: true });
  writeFileSync(REPORT_PATH, report, "utf8");
  console.log(
    `Audited ${webRows.length} web + ${mobileRows.length} mobile screens. Missing files: ${missingRouteFiles.length}, missing HTML: ${
      missingWebHtml.length + missingMobileHtml.length
    }, tag gaps: ${webTagGaps.length + mobileTagGaps.length}.`,
  );
}

main();
