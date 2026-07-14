import { PlaceholderScreen } from "../../components/shell/PlaceholderScreen";
import { getShellRoute } from "../../components/shell/routes";

export default function SettingsRoute() {
  return <PlaceholderScreen route={getShellRoute("/settings")} />;
}
