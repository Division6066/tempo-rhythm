export type PeriodType = "none" | "daily" | "weekly" | "monthly";
export type PeriodFilterValue = "all" | Exclude<PeriodType, "none">;

export function filterByPeriod<T extends { periodType: PeriodType }>(
  notes: readonly T[],
  type: PeriodFilterValue
): T[] {
  return notes.filter((note) => type === "all" || note.periodType === type);
}

// Lines that start like raw JSON (objects, arrays, strings) are never shown as a preview.
const JSON_START = new Set(["{", "[", "}", "]", '"']);

export function plainPreview(body: string): string {
  let fenced = false;
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (/^(?:```|~~~)/.test(trimmed)) {
      fenced = !fenced;
      continue;
    }
    if (fenced || !trimmed || JSON_START.has(trimmed[0] ?? "")) continue;
    const plain = trimmed
      .replace(/^\s*(?:#{1,6}\s+|>\s*|[-*+]\s+|\d+\.\s+)/, "")
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`~]/g, "");
    // Check again after removing list / quote / heading markers: `- {"a":1}` is still JSON.
    if (JSON_START.has(plain.trim()[0] ?? "")) continue;
    if (plain) return plain.length > 140 ? `${plain.slice(0, 140)}…` : plain;
  }
  return "No content yet.";
}
