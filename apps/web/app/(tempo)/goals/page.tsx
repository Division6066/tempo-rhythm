/**
 * @screen: goals
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 15, §7
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: goals.readModel
 * @navigate: /goals
 * @prd: PRD §4 Screen 15, §7
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: goals.primaryMutation
 * @convex-action-needed: goals.primaryAction
 * @prd: PRD §4 Screen 15, §7
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("goals");

  return <TempoScreenScaffold fixture={fixture} />;
}
