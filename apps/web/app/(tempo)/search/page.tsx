/**
 * @screen: search
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 24, §11
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: search.readModel
 * @navigate: /search
 * @prd: PRD §4 Screen 24, §11
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: search.primaryMutation
 * @convex-action-needed: search.primaryAction
 * @prd: PRD §4 Screen 24, §11
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("search");

  return <TempoScreenScaffold fixture={fixture} />;
}
