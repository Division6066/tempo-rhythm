/**
 * @screen: empty-states
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §1, §14
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: empty-states.readModel
 * @navigate: /empty-states
 * @prd: PRD §1, §14
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: empty-states.primaryMutation
 * @convex-action-needed: empty-states.primaryAction
 * @prd: PRD §1, §14
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("empty-states");

  return <TempoScreenScaffold fixture={fixture} />;
}
