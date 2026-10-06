/**
 * @screen: habit-detail
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-3.jsx
 * @summary: Single-habit detail with streak history.
 * @queries: habits.get, habitCheckIns.listForHabit
 * @mutations: habitCheckIns.check, habitCheckIns.undo, habits.update
 * @auth: required (gentle sign-in card otherwise)
 */
import { HabitDetail } from "@/components/habit-detail/HabitDetail";

type Params = { id: string };

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return (
    <div data-testid="habit-detail-route">
      <HabitDetail habitId={id} />
    </div>
  );
}
