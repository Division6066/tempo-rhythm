import { SettingsPreferencesScreen } from "@/components/tempo/screens/SettingsPreferencesScreen";

/**
 * @screen: settings-prefs
 * @category: Settings
 * @owner: cursor-cloud-3
 * @prd: PRD §4 Screen 33, §10
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @summary: Notifications, coach nudges, quiet hours, theme.
 * @queries:
 *   - profiles.getMyPreferences
 * @mutations:
 *   - profiles.setNotificationPreference
 *   - profiles.setCoachNudges
 *   - profiles.setQuietHours
 *   - profiles.setThemePreference
 *   - profiles.savePreferences
 * @auth: required
 */
export default function SettingsPreferencesPage() {
  return <SettingsPreferencesScreen />;
}
