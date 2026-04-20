/**
 * @screen: brain-dump
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 11, §6
 * @source: docs/design/claude-export/design-system/screens-1.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: brain-dump.readModel
 * @navigate: /brain-dump
 * @prd: PRD §4 Screen 11, §6
 * @source: docs/design/claude-export/design-system/screens-1.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: brain-dump.primaryMutation
 * @convex-action-needed: brain-dump.primaryAction
 * @provider-needed: openrouter
 * @prd: PRD §4 Screen 11, §6
 * @source: docs/design/claude-export/design-system/screens-1.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("brain-dump");

  return <TempoScreenScaffold fixture={fixture} />;
}
