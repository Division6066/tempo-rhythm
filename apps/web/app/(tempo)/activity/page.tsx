/**
 * @screen: activity
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 44, §17
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: activity.readModel
 * @navigate: /activity
 * @prd: PRD §4 Screen 44, §17
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: activity.primaryMutation
 * @convex-action-needed: activity.primaryAction
 * @prd: PRD §4 Screen 44, §17
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("activity");

  return <TempoScreenScaffold fixture={fixture} />;
}
