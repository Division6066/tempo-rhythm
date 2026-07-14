import { PlaceholderScreen } from "../../components/shell/PlaceholderScreen";
import { getShellRoute } from "../../components/shell/routes";

export default function TrashRoute() {
  return <PlaceholderScreen route={getShellRoute("/trash")} />;
}
