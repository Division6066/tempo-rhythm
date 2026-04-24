/**
 * Heuristic, deterministic extraction + priority hints for raw brain-dump text.
 * No network — safe for fast preview before the user confirms task creation.
 */

export type BrainDumpPriority = "low" | "medium" | "high";

export type BrainDumpPreviewItem = {
  /** Stable id for UI list keys (index-based after dedupe). */
  id: string;
  title: string;
  priority: BrainDumpPriority;
};

const MAX_ITEMS = 8;
const MAX_TITLE_LEN = 200;

const HIGH_PATTERNS = [
  /\b(urgent|asap|today|tonight|this morning|this afternoon|right now|deadline|must|can't delay|cannot delay|important)\b/i,
  /\b(eod|eow|end of (day|week))\b/i,
  /!!!|‼/,
];

const LOW_PATTERNS = [
  /\b(maybe|someday|eventually|if i have time|low priority|nice to have|when i can|no rush|later|not urgent)\b/i,
  /\?$/,
];

function normalizeKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.!?…]+$/g, "")
    .trim();
}

function scorePriority(text: string): BrainDumpPriority {
  const t = text.trim();
  if (!t) return "medium";
  for (const re of HIGH_PATTERNS) {
    if (re.test(t)) return "high";
  }
  for (const re of LOW_PATTERNS) {
    if (re.test(t)) return "low";
  }
  return "medium";
}

function splitIntoChunks(text: string): string[] {
  const raw = text.replace(/\r\n/g, "\n");
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const chunks: string[] = [];
  for (const line of lines) {
    if (line.length > 180 && /[.!?;]/.test(line)) {
      const parts = line.split(/(?<=[.!?;])\s+/).map((p) => p.trim()).filter(Boolean);
      for (const p of parts) {
        if (p) chunks.push(p);
      }
    } else {
      chunks.push(line);
    }
  }
  return chunks;
}

function trimTitle(s: string): string {
  let t = s.replace(/\s+/g, " ").trim();
  if (t.length > MAX_TITLE_LEN) {
    t = `${t.slice(0, MAX_TITLE_LEN - 1)}…`;
  }
  return t;
}

export type PrioritizeBrainDumpResult =
  | { ok: true; items: BrainDumpPreviewItem[] }
  | { ok: false; error: string };

/**
 * Turn free-form text into a capped, de-duplicated list with priority hints.
 */
export function prioritizeBrainDumpText(text: string): PrioritizeBrainDumpResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, error: "Add a few words first — a messy list is fine." };
  }

  const chunks = splitIntoChunks(trimmed);
  if (chunks.length === 0) {
    return { ok: false, error: "Could not pull out any clear items. Try one thought per line." };
  }

  const seen = new Set<string>();
  const items: { title: string; priority: BrainDumpPriority; _orig: number }[] = [];

  for (let i = 0; i < chunks.length && items.length < MAX_ITEMS; i++) {
    const title = trimTitle(chunks[i] ?? "");
    if (title.length < 2) continue;
    const key = normalizeKey(title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const priority = scorePriority(title);
    items.push({ title, priority, _orig: i });
  }

  if (items.length === 0) {
    return { ok: false, error: "No usable items after cleanup. Try shorter lines or bullet points." };
  }

  // Stable sort: high first, then medium, then low; keep original order within the same band
  const rank: Record<BrainDumpPriority, number> = { high: 0, medium: 1, low: 2 };
  items.sort((a, b) => rank[a.priority] - rank[b.priority] || a._orig - b._orig);
  return {
    ok: true,
    items: items.map((it, i) => ({
      id: `item-${i}`,
      title: it.title,
      priority: it.priority,
    })),
  };
}
