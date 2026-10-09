import { describe, expect, test } from "bun:test";
import { buildChatMessages } from "./chatPrompt";

describe("buildChatMessages", () => {
  test("includes memories between the instructions and history", () => {
    const messages = buildChatMessages({
      history: [{ role: "assistant", content: "Earlier reply" }],
      memories: [{ content: "Prefers short checklists" }],
      userText: "Help me start",
      now: 0,
    });

    expect(messages[1]?.content).toContain("What you know about this person:");
    expect(messages[1]?.content).toContain("Prefers short checklists");
    expect(messages.map((message) => message.content)).toEqual([
      expect.stringContaining("warm and calm"),
      expect.stringContaining("Prefers short checklists"),
      "Earlier reply",
      "Help me start",
    ]);
  });

  test("omits the memories block when there are no usable memories", () => {
    const messages = buildChatMessages({
      history: [],
      memories: [{ content: "   " }],
      userText: "Hello",
      now: 0,
    });
    expect(messages).toHaveLength(2);
    expect(messages[1]).toEqual({ role: "user", content: "Hello" });
  });

  test("preserves history order before the new user text", () => {
    const messages = buildChatMessages({
      history: [
        { role: "user", content: "first" },
        { role: "assistant", content: "second" },
        { role: "user", content: "third" },
      ],
      memories: [],
      userText: "fourth",
      now: 0,
    });
    expect(messages.slice(1).map((message) => message.content)).toEqual([
      "first",
      "second",
      "third",
      "fourth",
    ]);
  });

  test("caps memory text at 3000 characters", () => {
    const messages = buildChatMessages({
      history: [],
      memories: [{ content: "a".repeat(4000) }, { content: "must not appear" }],
      userText: "Hello",
      now: 0,
    });
    const block = messages[1]?.content ?? "";
    const memoryText = block.slice(block.indexOf("\n") + 1);
    expect(memoryText.length).toBeLessThanOrEqual(3000);
    expect(block).not.toContain("must not appear");
  });
});
