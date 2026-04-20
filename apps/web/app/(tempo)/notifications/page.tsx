/**
 * @screen: notifications
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 36, §17
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: notifications.readModel
 * @navigate: /notifications
 * @prd: PRD §4 Screen 36, §17
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: notifications.primaryMutation
 * @convex-action-needed: notifications.primaryAction
 * @prd: PRD §4 Screen 36, §17
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("notifications");

  return <TempoScreenScaffold fixture={fixture} />;
}
