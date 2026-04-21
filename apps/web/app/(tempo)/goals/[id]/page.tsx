import { GoalDetailScreen } from "@/components/tempo/screens/GoalDetailScreen";

type PageProps = { params: Promise<{ id: string }> };

/**
 * @screen: goal-detail
 * @category: Library
 * @owner: cursor-cloud-2
 * @prd: PRD §4 Screen 15, §7
 * @source: docs/design/claude-export/design-system/screens-4.jsx (ScreenGoalDetail)
 * @summary: Goal milestones with inline toggle + linked tasks + coach plan proposal.
 * @queries:
 *   - goals.byId
 *   - goals.listMilestones
 *   - goals.linkedTasks
 * @mutations:
 *   - goals.addMilestone
 *   - goals.toggleMilestoneDone
 * @actions:
 *   - coach.proposeGoalPlan
 * @providers:
 *   - openrouter
 * @auth: required
 */
export default async function GoalDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <GoalDetailScreen goalId={id} />;
}
