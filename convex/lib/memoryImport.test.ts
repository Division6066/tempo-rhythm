import { describe, expect, test } from "bun:test";
import { parseMemoryExport } from "./memoryImport";

describe("parseMemoryExport", () => {
	test("parses plain, bulleted, and numbered lines", () => {
		expect(
			parseMemoryExport("Likes tea\n- Works remotely\n* Has a dog\n\u2022 Runs weekly\n1. Calls Mum", "chatgpt"),
		).toEqual(["Likes tea", "Works remotely", "Has a dog", "Runs weekly", "Calls Mum"]);
	});

	test("parses JSON strings and supported object fields", () => {
		expect(parseMemoryExport('["Likes tea", "Uses dark mode"]', "grok")).toEqual([
			"Likes tea",
			"Uses dark mode",
		]);
		expect(
			parseMemoryExport(
				JSON.stringify({
					memories: [{ content: "A" }, { text: "Enjoys jazz" }, { memory: "Lives in Haifa" }],
				}),
				"chatgpt",
			),
		).toEqual(["Enjoys jazz", "Lives in Haifa"]);
		expect(parseMemoryExport(JSON.stringify({ items: ["Reads nightly"] }), "other")).toEqual([
			"Reads nightly",
		]);
	});

	test("prefixes Claude-style markdown items with their heading", () => {
		expect(parseMemoryExport("# Work\n- Prefers focus time\n## Food\nVegetarian", "claude")).toEqual([
			"Work: Prefers focus time",
			"Food: Vegetarian",
		]);
	});

	test("cleans, truncates, deduplicates, and caps items", () => {
		const lines = ["  Likes   tea  ", "likes tea", "x", "z".repeat(1100)];
		for (let index = 0; index < 350; index++) lines.push(`memory ${index}`);
		const result = parseMemoryExport(lines.join("\n"), "other");
		expect(result).toHaveLength(300);
		expect(result[0]).toBe("Likes tea");
		expect(result[1]).toHaveLength(1000);
	});

	test("falls back from bad JSON and ignores empty or garbled input", () => {
		expect(parseMemoryExport('[not valid\n- Still usable', "chatgpt")).toEqual([
			"[not valid",
			"Still usable",
		]);
		expect(parseMemoryExport(" \n- --\n\u0000broken", "other")).toEqual([]);
	});
});
