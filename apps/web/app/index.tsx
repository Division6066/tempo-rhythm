import { PlaceholderScreen } from "../components/shell/PlaceholderScreen";
import { getShellRoute } from "../components/shell/routes";

export default function HomeRoute() {
  return <PlaceholderScreen route={getShellRoute("/")} />;
}
