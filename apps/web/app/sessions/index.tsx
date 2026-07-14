import { PlaceholderScreen } from "../../components/shell/PlaceholderScreen";
import { getShellRoute } from "../../components/shell/routes";

export default function SessionsRoute() {
  return <PlaceholderScreen route={getShellRoute("/sessions")} />;
}
