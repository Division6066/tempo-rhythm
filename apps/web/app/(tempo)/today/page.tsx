/**
 * @screen: today
 * @category: Flow
 * @summary: Single-column daily canvas. Greeting + quick-add + today's tasks.
 * @queries: users.getProfile, tasks.listToday
 * @mutations: tasks.createQuick, tasks.toggleCompletion
 * @auth: required
 * @status: live
 */
import { TodayScreen } from "@/components/today/TodayScreen";

export default function Page() {
  return <TodayScreen />;
}
