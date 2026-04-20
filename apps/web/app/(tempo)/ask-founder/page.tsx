/**
 * @screen: ask-founder
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 35, §15
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: ask-founder.readModel
 * @navigate: /ask-founder
 * @prd: PRD §4 Screen 35, §15
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: ask-founder.primaryMutation
 * @convex-action-needed: ask-founder.primaryAction
 * @prd: PRD §4 Screen 35, §15
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("ask-founder");

  return <TempoScreenScaffold fixture={fixture} />;
}
