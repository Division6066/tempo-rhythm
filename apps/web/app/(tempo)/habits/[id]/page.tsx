/**
 * @generated-by: T-F004 scaffold — replace with T-F005* port.
 * @screen: habit-detail
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-3.jsx
 * @summary: Single-habit detail with streak history.
 * @queries: habits.get
 * @mutations: habits.logComplete, habits.update
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
      title="Habit detail"
      category="Library"
      source="screens-3.jsx"
      summary={`Single-habit detail with streak history. (id: ${id})`}
    />
  );
}
