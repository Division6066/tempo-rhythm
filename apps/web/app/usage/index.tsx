import { PlaceholderScreen } from "../../components/shell/PlaceholderScreen";
import { getShellRoute } from "../../components/shell/routes";

export default function UsageRoute() {
  return <PlaceholderScreen route={getShellRoute("/usage")} />;
}
