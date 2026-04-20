/**
 * @screen: templates
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 22, §10
 * @source: docs/design/claude-export/design-system/screens-templates.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: templates.readModel
 * @navigate: /templates
 * @prd: PRD §4 Screen 22, §10
 * @source: docs/design/claude-export/design-system/screens-templates.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: templates.primaryMutation
 * @convex-action-needed: templates.primaryAction
 * @prd: PRD §4 Screen 22, §10
 * @source: docs/design/claude-export/design-system/screens-templates.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("templates");

  return <TempoScreenScaffold fixture={fixture} />;
}
