/**
 * @screen: template-sketch
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 23, §10
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: template-sketch.readModel
 * @navigate: /template-sketch
 * @prd: PRD §4 Screen 23, §10
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: template-sketch.primaryMutation
 * @convex-action-needed: template-sketch.primaryAction
 * @provider-needed: openrouter
 * @schema-delta: templates.sourceImageRef
 * @prd: PRD §4 Screen 23, §10
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("template-sketch");

  return <TempoScreenScaffold fixture={fixture} />;
}
