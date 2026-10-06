export type PeriodType = "none" | "daily" | "weekly" | "monthly";
export type PeriodFilterValue = "all" | Exclude<PeriodType, "none">;

export function filterByPeriod<T extends { periodType: PeriodType }>(
  notes: readonly T[],
  type: PeriodFilterValue
): T[] {
  return notes.filter((note) => type === "all" || note.periodType === type);
}

export function plainPreview(body: string): string {
  let fenced = false;
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (/^(?:```|~~~)/.test(trimmed)) {
      fenced = !fenced;
      continue;
    }
    if (fenced || !trimmed || /^[{[}\]"]/.test(trimmed)) continue;
    const plain = trimmed
      .replace(/^\s*(?:#{1,6}\s+|>\s*|[-*+]\s+|\d+\.\s+)/, "")
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`~]/g, "");
    if (plain) return plain.length > 140 ? `${plain.slice(0, 140)}…` : plain;
  }
  return "No content yet.";
}
