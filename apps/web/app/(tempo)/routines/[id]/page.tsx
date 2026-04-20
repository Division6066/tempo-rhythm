/**
 * @screen: routine-detail
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 42, §13
 * @source: docs/design/claude-export/design-system/screens-3.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: routine-detail.readModel
 * @navigate: /routine-detail
 * @prd: PRD §4 Screen 42, §13
 * @source: docs/design/claude-export/design-system/screens-3.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: routine-detail.primaryMutation
 * @convex-action-needed: routine-detail.primaryAction
 * @prd: PRD §4 Screen 42, §13
 * @source: docs/design/claude-export/design-system/screens-3.jsx
 */


type RouteParams = { id: string };

export default async function ScreenPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params;
  const fixture = getWebScreenFixture("routine-detail");

  return <TempoScreenScaffold fixture={fixture} routeParams={{ id }} />;
}
