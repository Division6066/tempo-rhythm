/**
 * @generated-by: T-F004 scaffold — replace with T-F005* port.
 * @screen: settings-integrations
 * @category: Settings
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @summary: Google Calendar & other integrations.
 * @queries: integrations.list, mcp.listTokens
 * @mutations: integrations.connect, integrations.disconnect, mcp.createToken, mcp.revokeToken
 * @auth: required
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { McpTokensCard } from "@/components/mcp/McpTokensCard";
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

export default function Page() {
  return (
    <>
      <ScaffoldScreen
        title="Integrations"
        category="Settings"
        source="screens-6.jsx"
        summary="Google Calendar & other integrations."
      />
      <div className="container mx-auto max-w-4xl px-6 pb-12">
        <McpTokensCard />
      </div>
    </>
  );
}
