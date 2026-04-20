/**
 * @screen: template-run
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 23, §10
 * @source: docs/design/claude-export/design-system/screens-template-run.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: template-run.readModel
 * @navigate: /template-run
 * @prd: PRD §4 Screen 23, §10
 * @source: docs/design/claude-export/design-system/screens-template-run.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: template-run.primaryMutation
 * @convex-action-needed: template-run.primaryAction
 * @prd: PRD §4 Screen 23, §10
 * @source: docs/design/claude-export/design-system/screens-template-run.jsx
 */


type RouteParams = { id: string };

export default async function ScreenPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params;
  const fixture = getWebScreenFixture("template-run");

  return <TempoScreenScaffold fixture={fixture} routeParams={{ id }} />;
}
