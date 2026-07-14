import { PlaceholderScreen } from "../../components/shell/PlaceholderScreen";
import { getShellRoute } from "../../components/shell/routes";

export default function AgentsRoute() {
  return <PlaceholderScreen route={getShellRoute("/agents")} />;
}
