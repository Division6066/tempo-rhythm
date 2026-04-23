---
description: Escalate the current problem to an Opus advisor subagent without executing code.
---

The user is manually escalating to the advisor lane per `.claude/workflows/executor-advisor.md`. Follow these steps exactly:

1. **Extract the question from recent context.** Do not ask the user to restate — infer the decision-point from the last few turns. If you truly cannot identify one specific question, ask a one-sentence clarifier and stop; do not guess.

2. **Spawn an advisor via the `Agent` tool** with `model: "opus"` and `subagent_type: "general-purpose"`. The advisor must not write code. Use this prompt shape (fill in the `{braces}`):

   ```
   Role: advisor. Do not write or edit code. Return a decision, not an essay.

   Context:
   - Goal: {one sentence from the thread}
   - What's been tried: {1-3 bullets of concrete steps or decisions}
   - What is ambiguous: {the single decision the user wants advised}
   - Constraints that matter: {repo rules, deadline, budget, user preference, relevant HARD_RULES sections}

   Question:
   {exactly one question}

   Output shape:
   - Recommendation (one sentence)
   - Why (under 80 words)
   - What would change your mind (one bullet)
   - Risks you accept (one bullet)
   ```

3. **Do not interleave your own opinion with the advisor's.** When the advisor returns, quote the four-section output verbatim to the user, then add one line of your own: "Executor lane will implement this unless you say otherwise."

4. **If the user accepts the recommendation**, proceed with the executor lane per `.claude/workflows/executor-advisor.md` §2. If the user rejects or wants an alternative, do not re-advise without new evidence — ask which specific part they disagree with first.

5. **Budget:** one advisor call per decision. If the user asks for a second advisor after the first, push back: either they need to give the advisor new evidence, or they need to make the call themselves.
