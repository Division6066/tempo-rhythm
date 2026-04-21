import { ActivityScreen } from "@/components/tempo/screens/ActivityScreen";

/**
 * @screen: activity
 * @category: You
 * @owner: cursor-cloud-2
 * @prd: PRD §4 Screen 44, §17
 * @source: docs/design/claude-export/design-system/screens-5.jsx (ScreenActivity)
 * @summary: Chronological activity timeline with type filters.
 * @queries:
 *   - activity.listByType
 *   - activity.listRecent
 * @auth: required
 */
export default function ActivityPage() {
  return <ActivityScreen />;
}
