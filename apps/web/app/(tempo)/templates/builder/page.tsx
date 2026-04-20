/**
 * @screen: template-builder
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 23, §10
 * @source: docs/design/claude-export/design-system/screens-template-builder.jsx; docs/design/claude-export/design-system/screens-template-builder-ui.jsx; docs/design/claude-export/design-system/screens-template-builder-slash.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: template-builder.readModel
 * @navigate: /template-builder
 * @prd: PRD §4 Screen 23, §10
 * @source: docs/design/claude-export/design-system/screens-template-builder.jsx; docs/design/claude-export/design-system/screens-template-builder-ui.jsx; docs/design/claude-export/design-system/screens-template-builder-slash.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: template-builder.primaryMutation
 * @convex-action-needed: template-builder.primaryAction
 * @prd: PRD §4 Screen 23, §10
 * @source: docs/design/claude-export/design-system/screens-template-builder.jsx; docs/design/claude-export/design-system/screens-template-builder-ui.jsx; docs/design/claude-export/design-system/screens-template-builder-slash.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("template-builder");

  return <TempoScreenScaffold fixture={fixture} />;
}
