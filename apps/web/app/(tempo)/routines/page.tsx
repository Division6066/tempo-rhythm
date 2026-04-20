/**
 * @screen: routines
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 42, §13
 * @source: docs/design/claude-export/design-system/screens-3.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: routines.readModel
 * @navigate: /routines
 * @prd: PRD §4 Screen 42, §13
 * @source: docs/design/claude-export/design-system/screens-3.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: routines.primaryMutation
 * @convex-action-needed: routines.primaryAction
 * @prd: PRD §4 Screen 42, §13
 * @source: docs/design/claude-export/design-system/screens-3.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("routines");

  return <TempoScreenScaffold fixture={fixture} />;
}
