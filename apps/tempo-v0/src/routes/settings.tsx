import { createFileRoute } from "@/lib/tempo-graft/router";
import { SettingsView } from "@tempo-v0/components/tempo/settings-view";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  return <SettingsView />;
}
