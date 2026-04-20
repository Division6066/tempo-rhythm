/**
 * @screen: goal-detail
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 15, §7
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: goal-detail.readModel
 * @navigate: /goal-detail
 * @prd: PRD §4 Screen 15, §7
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: goal-detail.primaryMutation
 * @convex-action-needed: goal-detail.primaryAction
 * @prd: PRD §4 Screen 15, §7
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 */


type RouteParams = { id: string };

export default async function ScreenPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params;
  const fixture = getWebScreenFixture("goal-detail");

  return <TempoScreenScaffold fixture={fixture} routeParams={{ id }} />;
}
