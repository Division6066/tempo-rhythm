import { NotificationsScreen } from "@/components/tempo/screens/NotificationsScreen";

/**
 * @screen: notifications
 * @category: Settings
 * @owner: cursor-cloud-3
 * @prd: PRD §4 Screen 35
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @summary: Notification center with type chips + dismiss per row.
 * @queries:
 *   - notifications.listInbox
 * @mutations:
 *   - notifications.dismiss
 *   - notifications.markAllRead
 * @auth: required
 */
export default function NotificationsPage() {
  return <NotificationsScreen />;
}
