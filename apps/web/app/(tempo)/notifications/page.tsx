/**
 * @generated-by: T-F004 scaffold — replace with T-F005* port.
 * @screen: notifications
 * @category: Settings
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @summary: Quiet notification settings.
 * @queries: users.notificationPrefs
 * @mutations: users.updateNotificationPrefs
 * @auth: required
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

export default function Page() {
  return (
    <ScaffoldScreen
      title="Notifications"
      category="Settings"
      source="screens-6.jsx"
      summary="Quiet notification settings."
    />
  );
}
