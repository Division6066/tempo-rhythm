/**
 * @screen: daily-note
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 4, §11
 * @source: docs/design/claude-export/design-system/screens-1.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: daily-note.readModel
 * @navigate: /daily-note
 * @prd: PRD §4 Screen 4, §11
 * @source: docs/design/claude-export/design-system/screens-1.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: daily-note.primaryMutation
 * @convex-action-needed: daily-note.primaryAction
 * @prd: PRD §4 Screen 4, §11
 * @source: docs/design/claude-export/design-system/screens-1.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("daily-note");

  return <TempoScreenScaffold fixture={fixture} />;
}
