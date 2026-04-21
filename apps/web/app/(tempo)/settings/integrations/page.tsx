import { SettingsIntegrationsScreen } from "@/components/tempo/screens/SettingsIntegrationsScreen";

/**
 * @screen: settings-integrations
 * @category: Settings
 * @owner: cursor-cloud-3
 * @prd: PRD §4 Screen 34
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @summary: Integrations list for calendars + RAM-only capture imports.
 * @queries:
 *   - integrations.listConnected
 * @actions:
 *   - integrations.connect
 * @mutations:
 *   - integrations.revoke
 * @providers:
 *   - google-calendar
 *   - apple-calendar
 *   - notion
 * @auth: required
 */
export default function SettingsIntegrationsPage() {
  return <SettingsIntegrationsScreen />;
}
