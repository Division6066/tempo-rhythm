/**
 * @generated-by: T-F004 scaffold — replace with T-F005* port.
 * @screen: coach
 * @category: Flow
 * @source: docs/design/claude-export/design-system/screens-1.jsx#ScreenCoach + coach-dock.jsx
 * @summary: Conversational AI coach surface. Accept / tweak / skip suggestions.
 * @queries: coach.thread
 * @mutations: coach.accept, coach.tweak, coach.skip
 * @auth: required
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

export default function Page() {
  return (
    <ScaffoldScreen
      title="Coach"
      category="Flow"
      source="screens-1.jsx#ScreenCoach + coach-dock.jsx"
      summary="Conversational AI coach surface. Accept / tweak / skip suggestions."
    />
  );
}
