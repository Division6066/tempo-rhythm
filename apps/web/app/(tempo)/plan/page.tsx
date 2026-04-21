import { PlanScreen } from "@/components/tempo/screens/PlanScreen";

/**
 * @screen: plan
 * @category: Flow
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 13, §6
 * @source: docs/design/claude-export/design-system/screens-1.jsx (ScreenPlan)
 * @summary: Staged planning flow. Drag-style intake → today's plan with
 * calendar context. Coach can draft a proposal with accept/reject cards.
 * @queries:
 *   - plans.getTodayPlan
 *   - tasks.listUnstaged
 *   - calendar.listToday
 * @mutations:
 *   - plans.stageTask
 *   - plans.unstageTask
 *   - plans.commitPlan
 * @actions:
 *   - coach.proposePlan
 * @providers:
 *   - openrouter (coach-drafted plans)
 * @auth: required
 */
export default function PlanPage() {
  return <PlanScreen />;
}
