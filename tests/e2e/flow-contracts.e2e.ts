import { test } from "@playwright/test";

const pendingFlowContracts = [
  {
    title: "signed-in user can create a task and mark it complete",
    reason:
      "Needs a deterministic Convex Auth test identity or browser-level Convex mocks before this can run headless.",
  },
  {
    title: "onboarding moves from welcome to first plan",
    reason:
      "The onboarding route is currently a protected scaffold shell; add step controls before enabling this GUI flow.",
  },
  {
    title: "panic flow proposes one small task",
    reason:
      "No dedicated panic-mode GUI seam exists yet. Enable once the mocked one-small-task proposal card is routable.",
  },
  {
    title: "calendar connection completes with mocked provider callback",
    reason:
      "Calendar and integrations routes are scaffold shells. Enable after mock OAuth callback handling exists in the UI.",
  },
  {
    title: "push-to-talk turn renders mocked STT and TTS output",
    reason:
      "Voice/PTT UI is not routable yet. Enable once mocked microphone, STT, and TTS adapters are injectable.",
  },
  {
    title: "capture webhook renders a candidate task",
    reason:
      "No test webhook capture surface exists yet. Enable when a mocked capture route or inbox card is available.",
  },
] as const;

test.describe("TEMPO-108 scripted GUI flow contracts", () => {
  for (const flow of pendingFlowContracts) {
    test(flow.title, async ({ page }, testInfo) => {
      testInfo.annotations.push({ type: "fixme", description: flow.reason });
      test.fixme(true, flow.reason);
      void page;
    });
  }
});
