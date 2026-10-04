/**
 * @screen: habits
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-3.jsx
 * @summary: Habit check-off with streak history.
 * @queries: habits.list
 * @mutations: habits.create, habits.completeToday
 * @auth: required (gentle sign-in card otherwise)
 */
import { HabitsScreen } from "@/components/habits/HabitsScreen";

export default function Page() {
  return <HabitsScreen />;
}
