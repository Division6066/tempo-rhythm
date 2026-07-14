import { useLocalSearchParams } from "expo-router";
import { PlaceholderScreen } from "../../../components/shell/PlaceholderScreen";
import { getShellRoute } from "../../../components/shell/routes";

export default function SessionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <PlaceholderScreen detail={`Session id: ${id}`} route={getShellRoute("/sessions/demo-session")} />;
}
