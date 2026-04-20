import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type WiringRow = {
  sourceFile: string;
  screen: string;
  component: string;
  tagType: string;
  slugOrValue: string;
  behaviorSummary: string;
  prdRef: string;
  schemaDelta: string;
  provider: string;
  notes: string;
};

type NormalizedRow = WiringRow & {
  featureArea: string;
  status: string;
};

const DOC_PATH = resolve("docs/design/backend-wiring-spec.md");
const SCHEMA_PATH = resolve("convex/schema.ts");

function normalizeCell(value: string): string {
  return value.replaceAll("`", "").trim();
}

function parseMarkdownRows(markdown: string): WiringRow[] {
  const rows: WiringRow[] = [];
  for (const line of markdown.split("\n")) {
    if (!line.startsWith("|")) {
      continue;
    }
    if (line.includes("|---|")) {
      continue;
    }
    const parts = line.split("|").slice(1, -1).map((part) => normalizeCell(part));
    if (parts.length !== 10) {
      continue;
    }
    const [sourceFile, screen, component, tagType, slugOrValue, behaviorSummary, prdRef, schemaDelta, provider, notes] = parts;
    if (sourceFile === "source_file" || sourceFile.length === 0) {
      continue;
    }
    if (notes.toLowerCase().includes("example row")) {
      continue;
    }
    rows.push({
      sourceFile,
      screen,
      component,
      tagType,
      slugOrValue,
      behaviorSummary,
      prdRef,
      schemaDelta,
      provider,
      notes,
    });
  }
  return rows;
}

function featureAreaForRow(row: WiringRow): string {
  if (row.sourceFile.includes("apps/mobile/")) {
    return "Mobile";
  }

  const flow = new Set(["daily-note", "today", "brain-dump", "coach", "plan"]);
  const library = new Set([
    "tasks",
    "notes",
    "note-detail",
    "journal",
    "calendar",
    "habits",
    "habit-detail",
    "routines",
    "routine-detail",
    "goals",
    "goal-detail",
    "goals-progress",
    "projects",
    "project-detail",
    "project-kanban",
  ]);
  const you = new Set([
    "analytics",
    "activity",
    "templates",
    "template-builder",
    "template-run",
    "template-editor",
    "template-sketch",
    "search",
    "command",
    "empty-states",
  ]);
  const settings = new Set([
    "settings",
    "settings-prefs",
    "settings-integrations",
    "billing",
    "trial-end",
    "ask-founder",
    "notifications",
  ]);

  if (flow.has(row.screen)) {
    return "Flow";
  }
  if (library.has(row.screen)) {
    return "Library";
  }
  if (you.has(row.screen)) {
    return "You";
  }
  if (settings.has(row.screen)) {
    return "Settings";
  }
  return "Marketing/Auth";
}

function dedupeRows(rows: WiringRow[]): NormalizedRow[] {
  const seen = new Map<string, NormalizedRow>();
  for (const row of rows) {
    const key = [
      row.screen.toLowerCase(),
      row.component.toLowerCase(),
      row.tagType.toLowerCase(),
      row.slugOrValue.toLowerCase(),
    ].join("|");
    if (!seen.has(key)) {
      seen.set(key, {
        ...row,
        featureArea: featureAreaForRow(row),
        status: "pending",
      });
    }
  }

  return [...seen.values()].sort((a, b) => {
    return (
      a.featureArea.localeCompare(b.featureArea) ||
      a.screen.localeCompare(b.screen) ||
      a.component.localeCompare(b.component) ||
      a.tagType.localeCompare(b.tagType) ||
      a.slugOrValue.localeCompare(b.slugOrValue)
    );
  });
}

function extractSchemaFields(schemaText: string): Set<string> {
  const fields = new Set<string>();
  const tableStart = /^(\s*)([a-zA-Z][a-zA-Z0-9_]*)\s*:\s*defineTable\(\s*\{/;
  const fieldLine = /^\s*([a-zA-Z][a-zA-Z0-9_]*)\s*:/;
  const lines = schemaText.split("\n");

  let currentTable = "";
  let inTable = false;
  let braceDepth = 0;

  for (const line of lines) {
    if (!inTable) {
      const match = line.match(tableStart);
      if (match) {
        currentTable = match[2] ?? "";
        inTable = true;
        braceDepth = 1;
      }
      continue;
    }

    for (const ch of line) {
      if (ch === "{") {
        braceDepth += 1;
      } else if (ch === "}") {
        braceDepth -= 1;
      }
    }

    const fieldMatch = line.match(fieldLine);
    if (fieldMatch && currentTable && braceDepth >= 1) {
      const fieldName = fieldMatch[1] ?? "";
      if (!["index", "searchIndex"].includes(fieldName)) {
        fields.add(`${currentTable}.${fieldName}`);
      }
    }

    if (braceDepth <= 0) {
      currentTable = "";
      inTable = false;
      braceDepth = 0;
    }
  }
  return fields;
}

function collectSchemaDeltaTokens(rows: NormalizedRow[]): string[] {
  const tokens = new Set<string>();
  for (const row of rows) {
    if (row.tagType !== "@schema-delta" && row.schemaDelta.length === 0) {
      continue;
    }
    const raw = row.schemaDelta.length > 0 ? row.schemaDelta : row.slugOrValue;
    for (const token of raw.split(",").map((part) => part.trim()).filter(Boolean)) {
      tokens.add(token);
    }
  }
  return [...tokens].sort((a, b) => a.localeCompare(b));
}

function renderRows(rows: NormalizedRow[]): string {
  const header =
    "| feature_area | source_file | screen | component | tag_type | slug_or_value | behavior_summary | prd_ref | schema_delta | provider | status | notes |\n" +
    "|---|---|---|---|---|---|---|---|---|---|---|---|";
  const lines = rows.map((row) => {
    return [
      row.featureArea,
      row.sourceFile,
      row.screen,
      row.component,
      row.tagType,
      row.slugOrValue,
      row.behaviorSummary,
      row.prdRef,
      row.schemaDelta,
      row.provider,
      row.status,
      row.notes,
    ]
      .map((value) => value.replaceAll("|", "\\|"))
      .join(" | ");
  });
  return `${header}\n| ${lines.join(" |\n| ")} |`;
}

function renderSchemaReview(schemaDeltas: string[], schemaFields: Set<string>): string {
  const header = "| schema_delta | present_in_convex_schema |\n|---|---|";
  const rows = schemaDeltas.map((token) => {
    const present = schemaFields.has(token) ? "yes" : "no";
    return `| \`${token}\` | ${present} |`;
  });
  return `${header}\n${rows.join("\n")}`;
}

function main() {
  const currentDoc = readFileSync(DOC_PATH, "utf8");
  const schemaText = readFileSync(SCHEMA_PATH, "utf8");

  const parsedRows = parseMarkdownRows(currentDoc);
  const dedupedRows = dedupeRows(parsedRows);
  const schemaFields = extractSchemaFields(schemaText);
  const schemaDeltas = collectSchemaDeltaTokens(dedupedRows);

  const output = `# Backend wiring spec (generated from UI labels)

This document captures backend wiring needs discovered during front-end labeling.

**Contract**
- During port tickets (\`T-0023-b\`, \`T-0023-c\`), contributors append rows as they add \`@convex-*-needed\`, \`@provider-needed\`, and \`@schema-delta\` tags.
- \`T-0023-d\` performs dedupe/normalization and groups by feature area.
- This is a map only. It does not authorize backend implementation in this run.

## Consolidated rows (deduped by screen + component + tag + slug)

${renderRows(dedupedRows)}

## Schema delta review (\`convex/schema.ts\` cross-check)

${renderSchemaReview(schemaDeltas, schemaFields)}

## Validation commands

- \`rg "@convex-(mutation|action|query)-needed:" apps/web/app apps/mobile/app\`
- \`rg "@provider-needed:" apps/web/app apps/mobile/app\`
- \`rg "@schema-delta:" apps/web/app apps/mobile/app\`
- \`rg "T-0023|feature_area|schema_delta" docs/design/backend-wiring-spec.md\`
`;

  writeFileSync(DOC_PATH, output, "utf8");
  console.log(`Consolidated ${dedupedRows.length} wiring rows and ${schemaDeltas.length} schema-delta checks.`);
}

main();
