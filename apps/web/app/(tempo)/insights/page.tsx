/**
 * @screen: analytics
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 43, §17
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: analytics.readModel
 * @navigate: /analytics
 * @prd: PRD §4 Screen 43, §17
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: analytics.primaryMutation
 * @convex-action-needed: analytics.primaryAction
 * @prd: PRD §4 Screen 43, §17
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("analytics");

  return <TempoScreenScaffold fixture={fixture} />;
}
