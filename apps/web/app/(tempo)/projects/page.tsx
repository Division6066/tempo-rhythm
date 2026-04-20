/**
 * @screen: projects
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 17, §12
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: projects.readModel
 * @navigate: /projects
 * @prd: PRD §4 Screen 17, §12
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: projects.primaryMutation
 * @convex-action-needed: projects.primaryAction
 * @prd: PRD §4 Screen 17, §12
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("projects");

  return <TempoScreenScaffold fixture={fixture} />;
}
