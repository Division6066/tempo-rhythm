/**
 * @screen: tracking
 * @category: You
 * @summary: Session tracking leftover from #205. Habit streak from streaks.getCurrent; focus-block chart from local session logs.
 * @queries: streaks.getCurrent
 * @mutations: (none)
 * @auth: required (gentle sign-in card otherwise)
 */
import { TrackingDashboard } from "@/components/tracking/TrackingDashboard";

export default function Page() {
  return <TrackingDashboard />;
}
