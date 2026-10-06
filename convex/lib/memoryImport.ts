export type MemoryImportSource = "chatgpt" | "claude" | "grok" | "other";

const MAX_ITEMS = 300;
const MAX_ITEM_LENGTH = 1000;
const BULLET_PREFIX = /^\s*(?:[-*\u2022]|\d+[.)])\s+/;
const HEADING = /^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/;

function cleanItem(value: string): string | null {
	const cleaned = value
		.replace(BULLET_PREFIX, "")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, MAX_ITEM_LENGTH)
		.trim();
	if (cleaned.length < 3 || !/[\p{L}\p{N}]/u.test(cleaned)) return null;
	return cleaned;
}

function objectItem(value: unknown): string | null {
	if (typeof value === "string") return value;
	if (!value || typeof value !== "object") return null;
	const item = value as Record<string, unknown>;
	for (const key of ["content", "text", "memory"] as const) {
		if (typeof item[key] === "string") return item[key];
	}
	return null;
}

function jsonItems(value: unknown): string[] | null {
	const items = Array.isArray(value)
		? value
		: value && typeof value === "object"
			? ((value as Record<string, unknown>).memories ??
				(value as Record<string, unknown>).items)
			: null;
	if (!Array.isArray(items)) return null;
	return items.map(objectItem).filter((item): item is string => item !== null);
}

function lineItems(text: string): string[] {
	const items: string[] = [];
	let heading: string | null = null;
	for (const rawLine of text.split(/\r?\n/)) {
		const headingMatch = rawLine.match(HEADING);
		if (headingMatch) {
			heading = cleanItem(headingMatch[1] ?? "");
			continue;
		}
		const item = cleanItem(rawLine);
		if (item) items.push(heading ? `${heading}: ${item}` : item);
	}
	return items;
}

/** Parse a pasted memory export without making assumptions about its provider. */
export function parseMemoryExport(text: string, source: MemoryImportSource): string[] {
	// The source is stored with imported rows; parsing remains deliberately provider-agnostic.
	void source;
	if (!text.trim() || /\0/.test(text)) return [];

	let candidates: string[] | null = null;
	try {
		candidates = jsonItems(JSON.parse(text));
	} catch {
		// Export snippets are often incomplete JSON; treat those as ordinary pasted lines.
	}
	if (candidates === null) candidates = lineItems(text);

	const seen = new Set<string>();
	const result: string[] = [];
	for (const candidate of candidates) {
		const item = cleanItem(candidate);
		if (!item) continue;
		const key = item.toLocaleLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		result.push(item);
		if (result.length === MAX_ITEMS) break;
	}
	return result;
}
