import { describe, expect, test } from "bun:test";
import { BLOCK_CODEC_LIMITS, parseTempoBlocks, serializeTempoBlocks } from "./blocks";

const ids = {
  meta: "blk_01K5F3Z8Q0A7M2N4P6R8T0V2X4",
  task: "blk_01K5F3Z8Q2C9P4Q6R8T0V2X4Z6",
  template: "blk_01K5F3Z8Q4E1N3P5R7T9V1X3Z5",
};

function fence(value: unknown, eol = "\n") {
  return `\`\`\`json tempo${eol}${JSON.stringify(value)}${eol}\`\`\`${eol}`;
}

function validSegments(body: string) {
  return parseTempoBlocks(body).filter((segment) => segment.kind === "valid");
}

function brokenCodes(body: string) {
  return parseTempoBlocks(body)
    .filter((segment) => segment.kind === "broken")
    .map((segment) => segment.errorCode);
}

const meta = {
  type: "page-meta",
  id: ids.meta,
  v: 1,
  data: { pageType: "daily", date: "2026-10-09", tags: ["uni", "שלום"] },
};
const task = {
  type: "task",
  id: ids.task,
  v: 1,
  data: { title: "Email supervisor", status: "now", order: 1, inelastic: false },
};
const template = {
  type: "template",
  id: ids.template,
  v: 1,
  data: {
    name: "Gentle day",
    forPageType: "daily",
    isDefault: true,
    tokens: ["date"],
    origin: "builtin",
    status: "live",
    enabled: true,
  },
};

describe("Tempo block codec", () => {
  test("validates all three types, defaults duration, and preserves arbitrary Markdown", () => {
    const body = `# Thursday 🌱\n\nBefore\n${fence(meta)}between\n${fence(task)}${fence(template)}after`;
    const parsed = parseTempoBlocks(body);
    const valid = validSegments(body);
    expect(valid).toHaveLength(3);
    expect(valid[1]?.block.type).toBe("task");
    if (valid[1]?.block.type === "task") expect(valid[1].block.data.durationMin).toBe(15);
    expect(serializeTempoBlocks(parsed)).toBe(body);
    expect(parsed.every((segment) => segment.source === body.slice(segment.start, segment.end))).toBe(true);
  });

  test("preserves CRLF, Unicode, adjacent fences, and ordinary or nested-looking fences", () => {
    const ordinary = "```json\r\n{not tempo}\r\n```\r\n";
    const nestedLooking = "````markdown\r\n```json tempo\r\nnot parsed by markdown nesting rules\r\n```\r\n````\r\n";
    const body = `${ordinary}${fence(meta, "\r\n")}${fence(task, "\r\n")}${nestedLooking}עברית`;
    expect(serializeTempoBlocks(parseTempoBlocks(body))).toBe(body);
    expect(validSegments(body)).toHaveLength(2);
    expect(parseTempoBlocks(ordinary)).toEqual([
      { kind: "markdown", source: ordinary, start: 0, end: ordinary.length },
    ]);
  });

  test("keeps malformed JSON and unclosed fences as broken source", () => {
    const malformed = "```json tempo\n{ nope }\n```\n";
    const unclosed = "tail\n```json tempo\n{}";
    expect(brokenCodes(malformed)).toEqual(["malformed_json"]);
    expect(brokenCodes(unclosed)).toEqual(["unclosed_fence"]);
    expect(serializeTempoBlocks(parseTempoBlocks(malformed + unclosed))).toBe(malformed + unclosed);
  });

  test("rejects invalid properties, types, versions, duplicate IDs and page-meta blocks", () => {
    expect(brokenCodes(fence({ ...task, data: { ...task.data, done: false } }))).toEqual([
      "invalid_data",
    ]);
    expect(brokenCodes(fence({ ...task, type: "event" }))).toEqual(["unsupported_type"]);
    expect(brokenCodes(fence({ ...task, v: 2 }))).toEqual(["unsupported_version"]);
    expect(brokenCodes(fence(task) + fence(task))).toEqual(["duplicate_id"]);
    expect(brokenCodes(fence(meta) + fence({ ...meta, id: ids.template }))).toEqual([
      "duplicate_page_meta",
    ]);
  });

  test("does not invent IDs for broken source but retains a syntactically valid source ID", () => {
    const noId = parseTempoBlocks(fence({ type: "task", v: 2, data: {} }))[0];
    const withId = parseTempoBlocks(fence({ ...task, v: 2 }))[0];
    expect(noId?.kind === "broken" && noId.blockId).toBeUndefined();
    expect(withId?.kind === "broken" && withId.blockId).toBe(ids.task);
  });

  test("fails safety bounds without truncating or rewriting source", () => {
    const hugeBody = "x".repeat(BLOCK_CODEC_LIMITS.maxBodyChars + 1);
    const hugeBlock = fence({ ...task, data: { ...task.data, title: "x".repeat(BLOCK_CODEC_LIMITS.maxBlockChars) } });
    let nested: unknown = "leaf";
    for (let index = 0; index <= BLOCK_CODEC_LIMITS.maxJsonDepth; index += 1) nested = [nested];
    const deep = fence({ ...task, data: nested });
    const repeated = Array.from({ length: BLOCK_CODEC_LIMITS.maxBlocks + 1 }, (_, index) =>
      fence({ ...task, id: `blk_${index.toString(32).toUpperCase().padStart(26, "0")}` }),
    ).join("");

    expect(brokenCodes(hugeBody)).toEqual(["body_too_large"]);
    expect(brokenCodes(hugeBlock)).toEqual(["block_too_large"]);
    expect(brokenCodes(deep)).toEqual(["nesting_too_deep"]);
    expect(brokenCodes(repeated).at(-1)).toBe("too_many_blocks");
    for (const body of [hugeBody, hugeBlock, deep, repeated]) {
      expect(serializeTempoBlocks(parseTempoBlocks(body))).toBe(body);
    }
  });
});
