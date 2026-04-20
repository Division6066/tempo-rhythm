/**
 * @screen: project-kanban
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 18, §12
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: project-kanban.readModel
 * @navigate: /project-kanban
 * @prd: PRD §4 Screen 18, §12
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: project-kanban.primaryMutation
 * @convex-action-needed: project-kanban.primaryAction
 * @prd: PRD §4 Screen 18, §12
 * @source: docs/design/claude-export/design-system/screens-4.jsx
 */


type RouteParams = { id: string };

export default async function ScreenPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params;
  const fixture = getWebScreenFixture("project-kanban");

  return <TempoScreenScaffold fixture={fixture} routeParams={{ id }} />;
}
