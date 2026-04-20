/**
 * @screen: template-editor
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
 * @convex-query-needed: template-editor.readModel
 * @navigate: /template-editor
 * @prd: PRD §4 Screen 23, §10
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: template-editor.primaryMutation
 * @convex-action-needed: template-editor.primaryAction
 * @prd: PRD §4 Screen 23, §10
 * @source: docs/design/claude-export/design-system/screens-5.jsx
 */


type RouteParams = { id: string };

export default async function ScreenPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params;
  const fixture = getWebScreenFixture("template-editor");

  return <TempoScreenScaffold fixture={fixture} routeParams={{ id }} />;
}
