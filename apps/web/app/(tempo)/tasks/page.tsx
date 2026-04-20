/**
 * @screen: tasks
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 2, §12
 * @source: docs/design/claude-export/design-system/screens-2.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: tasks.readModel
 * @navigate: /tasks
 * @prd: PRD §4 Screen 2, §12
 * @source: docs/design/claude-export/design-system/screens-2.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: tasks.primaryMutation
 * @convex-action-needed: tasks.primaryAction
 * @prd: PRD §4 Screen 2, §12
 * @source: docs/design/claude-export/design-system/screens-2.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("tasks");

  return <TempoScreenScaffold fixture={fixture} />;
}
