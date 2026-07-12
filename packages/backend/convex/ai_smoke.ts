// Dev-only smoke test. Safe to delete once an accept-reject coach action exists.
import { internalAction } from "./_generated/server";
import { type AiTier, callLLM } from "./lib/ai_router";

export const pingMistral = internalAction({
  args: {},
  handler: async () => {
    const tiers: AiTier[] = ["fast", "balanced", "deep"];
    const results = [];

    for (const tier of tiers) {
      try {
        const result = await callLLM({
          tier,
          messages: [{ role: "user", content: "Reply with exactly: pong" }],
          maxTokens: 10,
          temperature: 0,
        });
        results.push({
          requestedTier: result.requestedTier,
          tier: result.tier,
          model: result.model,
          content: result.content,
          totalTokens: result.usage.totalTokens,
          ok: true,
        });
      } catch (err) {
        const e = err as Error;
        results.push({
          requestedTier: tier,
          tier,
          model: "",
          content: "",
          totalTokens: 0,
          ok: false,
          error: `${e.name}: ${e.message}`,
        });
      }
    }

    return results;
  },
});
