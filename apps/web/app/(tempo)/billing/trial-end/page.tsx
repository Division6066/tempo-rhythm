/**
 * @screen: trial-end
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §15, §1
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: trial-end.readModel
 * @navigate: /trial-end
 * @prd: PRD §15, §1
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: trial-end.primaryMutation
 * @convex-action-needed: trial-end.primaryAction
 * @prd: PRD §15, §1
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("trial-end");

  return <TempoScreenScaffold fixture={fixture} />;
}
