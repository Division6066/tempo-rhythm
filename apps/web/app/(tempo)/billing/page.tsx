/**
 * @screen: billing
 * @tier: A
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 27, §15
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @summary: Tier-A mock-data scaffold for backend handoff only.
 */

import { TempoScreenScaffold } from "@/components/tempo/TempoScreenScaffold";
import { getWebScreenFixture } from "@tempo/mock-data";

/*
 * @behavior: Render primary control state from @tempo/mock-data fixture metadata.
 * @convex-query-needed: billing.readModel
 * @navigate: /billing
 * @prd: PRD §4 Screen 27, §15
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 */
/*
 * @behavior: Trigger primary mutation/action placeholder from fixture control metadata.
 * @convex-mutation-needed: billing.primaryMutation
 * @convex-action-needed: billing.primaryAction
 * @provider-needed: revenuecat
 * @schema-delta: subscriptionStates.trialEndsAt
 * @prd: PRD §4 Screen 27, §15
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 */

export default function ScreenPage() {
  const fixture = getWebScreenFixture("billing");

  return <TempoScreenScaffold fixture={fixture} />;
}
