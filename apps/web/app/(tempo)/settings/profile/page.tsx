import { SettingsProfileScreen } from "@/components/tempo/screens/SettingsProfileScreen";

/**
 * @screen: settings
 * @category: Settings
 * @owner: cursor-cloud-3
 * @prd: PRD §4 Screen 32, §10
 * @source: docs/design/claude-export/design-system/screens-6.jsx (ScreenSettingsProfile)
 * @summary: Profile settings with name, email, timezone, OpenDyslexic toggle,
 * data export, sign-out, and account deletion.
 * @queries:
 *   - profiles.getMyProfile
 * @mutations:
 *   - profiles.updateDisplayName
 *   - profiles.setTimezone
 *   - profiles.setTypographyPreference
 *   - profiles.saveProfile
 * @actions:
 *   - auth.changeEmail
 *   - auth.signOut
 *   - account.exportAllData
 *   - account.requestDeletion
 * @providers:
 *   - convex-auth
 * @schema-deltas:
 *   - profiles.typographyPreference
 * @auth: required
 */
export default function SettingsProfilePage() {
  return <SettingsProfileScreen />;
}
