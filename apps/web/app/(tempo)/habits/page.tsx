/**
 * @screen: habits
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 14, §12
 * @source: docs/design/claude-export/design-system/screens-3.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: habits.readModel
 * @navigate: /habits
 * @prd: PRD §4 Screen 14, §12
 * @source: docs/design/claude-export/design-system/screens-3.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: habits.primaryMutation
 * @convex-action-needed: habits.primaryAction
 * @prd: PRD §4 Screen 14, §12
 * @source: docs/design/claude-export/design-system/screens-3.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("habits");

  return <TempoScreenScaffold fixture={fixture} />;
}
