import { describe, expect, mock, test } from "bun:test";
import type { AiResult } from "./lib/ai_router";
import { sendChat } from "./chat";

function modelResult(content = "One small step is to open the document."): AiResult {
  return {
    tier: "balanced",
    requestedTier: "balanced",
    model: "test-model",
    content,
    usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
    escalated: false,
  };
}

function dependencies(overrides: Record<string, unknown> = {}) {
  return {
    requireApproval: mock(async () => {}),
    loadContext: mock(async () => ({ history: [], memories: [] })),
    insertUserMessage: mock(async (_content: string) => {}),
    insertAssistantMessage: mock(async (_content: string, _model: string) => {}),
    callModel: mock(async () => modelResult()),
    now: () => 0,
    ...overrides,
  };
}

describe("sendChat", () => {
  test("refuses a pending user before loading context or calling the model", async () => {
    const deps = dependencies({
      requireApproval: mock(async () => {
        throw new Error("Your account is waiting for approval.");
      }),
    });

    expect(sendChat(deps, "Can you help?")).rejects.toThrow(/waiting for approval/i);
    await Promise.resolve();
    expect(deps.loadContext).not.toHaveBeenCalled();
    expect(deps.callModel).not.toHaveBeenCalled();
    expect(deps.insertUserMessage).not.toHaveBeenCalled();
  });

  test("stores the fixed crisis card without loading context or calling the model", async () => {
    const deps = dependencies();
    const result = await sendChat(deps, "I want to die");

    expect(result.crisis).toBe(true);
    expect(result.reply).toContain("You are not alone");
    expect(deps.loadContext).not.toHaveBeenCalled();
    expect(deps.callModel).not.toHaveBeenCalled();
    expect(deps.insertUserMessage).toHaveBeenCalledWith("I want to die");
    expect(deps.insertAssistantMessage).toHaveBeenCalledWith(result.reply, "crisis-card");
  });

  test("refuses another user's conversation before writing or calling the model", async () => {
    const deps = dependencies({
      loadContext: mock(async () => {
        throw new Error("Conversation not found or access denied");
      }),
    });

    expect(sendChat(deps, "Hello")).rejects.toThrow(/access denied/i);
    await Promise.resolve();
    expect(deps.insertUserMessage).not.toHaveBeenCalled();
    expect(deps.callModel).not.toHaveBeenCalled();
  });

  test("stores the real model reply and reported model", async () => {
    const deps = dependencies();
    const result = await sendChat(deps, "  Help me start  ");

    expect(result).toEqual({ reply: "One small step is to open the document." });
    expect(deps.callModel).toHaveBeenCalledWith(
      expect.objectContaining({ tier: "balanced", maxTokens: 600, temperature: 0.6 }),
    );
    expect(deps.insertUserMessage).toHaveBeenCalledWith("Help me start");
    expect(deps.insertAssistantMessage).toHaveBeenCalledWith(result.reply, "test-model");
  });
});
