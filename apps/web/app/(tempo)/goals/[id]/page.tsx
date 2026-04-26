/**
 * @generated-by: T-F004 scaffold — replace with T-F005* port.
 * @screen: goal-detail
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-3.jsx#ScreenGoalDetail
 * @summary: Goal detail view with milestones.
 * @queries: goals.get
 * @mutations: goals.update, goals.logMilestone
 * @auth: required
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

type Params = { id: string };

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return (
    <ScaffoldScreen
      title="Goal detail"
      category="Library"
      source="screens-3.jsx#ScreenGoalDetail"
      summary={`Goal detail view with milestones. (id: ${id})`}
    />
  );
}
