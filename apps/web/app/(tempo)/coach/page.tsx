/**
 * @screen: coach
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 12, §8, §9
 * @source: docs/design/claude-export/design-system/screens-1.jsx; docs/design/claude-export/design-system/coach-dock.jsx; docs/design/claude-export/design-system/voice-chat.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: coach.readModel
 * @navigate: /coach
 * @prd: PRD §4 Screen 12, §8, §9
 * @source: docs/design/claude-export/design-system/screens-1.jsx; docs/design/claude-export/design-system/coach-dock.jsx; docs/design/claude-export/design-system/voice-chat.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: coach.primaryMutation
 * @convex-action-needed: coach.primaryAction
 * @provider-needed: openrouter
 * @schema-delta: voiceSessions.mode
 * @tier-caps: basic 30 min/day; pro 90 min/day; max 180 min/day
 * @prd: PRD §4 Screen 12, §8, §9
 * @source: docs/design/claude-export/design-system/screens-1.jsx; docs/design/claude-export/design-system/coach-dock.jsx; docs/design/claude-export/design-system/voice-chat.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("coach");

  return <TempoScreenScaffold fixture={fixture} />;
}
